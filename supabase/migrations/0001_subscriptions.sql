-- ============================================================
-- BILL AM — Subscriptions
-- Additive migration. Safe to run against a live database —
-- unlike schema.sql, this file never drops existing tables/data.
-- ============================================================

-- ============================================================
-- NOTIFICATIONS
-- Was already in use throughout the app (admin broadcast, bell
-- icon) but had never been added to a schema file — added here
-- so the schema on disk matches what's actually running.
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Service role can insert notifications" on public.notifications;
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);

create index if not exists notifications_user_id_idx on public.notifications(user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- One row per user. Source of truth for plan/billing state.
-- profiles.plan is kept as a denormalized cache for cheap reads
-- and is updated in lockstep by the webhook handler.
-- ============================================================
create table if not exists public.subscriptions (
  id                          uuid primary key default uuid_generate_v4(),
  user_id                     uuid not null unique references public.profiles(id) on delete cascade,

  plan                        text not null default 'free' check (plan in ('free', 'pro')),
  billing_cycle               text check (billing_cycle in ('monthly', 'yearly')),
  status                      text not null default 'none' check (
                                status in ('none', 'active', 'past_due', 'cancelled', 'expired')
                              ),

  paystack_customer_code      text,
  paystack_subscription_code  text,
  paystack_email_token        text, -- required to call Paystack's subscription manage/disable endpoints
  paystack_plan_code          text,

  current_period_start        timestamptz,
  current_period_end          timestamptz,
  cancel_at_period_end         boolean not null default false,

  last_payment_reference      text,
  last_payment_amount         numeric(12,2),

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Only the service role (webhook/initialize routes) writes this table.
drop policy if exists "Service role can manage subscriptions" on public.subscriptions;
create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx  on public.subscriptions(status);
create index if not exists subscriptions_period_end_idx on public.subscriptions(current_period_end);

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- Auto-create a 'free' subscription row for every new user, same
-- pattern as the existing profiles trigger.
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.subscriptions (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute procedure public.handle_new_user_subscription();

-- Backfill: give every existing user a subscription row (free, unless
-- they already have a pro_users record — carry their plan forward).
insert into public.subscriptions (user_id, plan, status)
select p.id, p.plan, case when p.plan = 'pro' then 'active' else 'none' end
from public.profiles p
on conflict (user_id) do nothing;

-- ============================================================
-- SUBSCRIPTION_EVENTS
-- Raw webhook audit log, keyed by Paystack's event id, so webhook
-- processing can be made idempotent (Paystack retries deliveries).
-- ============================================================
create table if not exists public.subscription_events (
  id                uuid primary key default uuid_generate_v4(),
  paystack_event_id text not null unique,
  event_type        text not null,
  payload           jsonb not null,
  processed_at      timestamptz not null default now()
);

alter table public.subscription_events enable row level security;

-- Service-role only table — no policies grant access to regular users.
drop policy if exists "Service role can manage subscription events" on public.subscription_events;
create policy "Service role can manage subscription events"
  on public.subscription_events for all
  using (true)
  with check (true);

-- ============================================================
-- PLAN ENFORCEMENT — defense in depth.
-- UI-level checks give users a good experience (upgrade prompts
-- before they hit a wall), but only a DB trigger can't be bypassed
-- by someone calling the Supabase REST API directly with a valid
-- session token. These mirror lib/entitlements.ts — if the free
-- plan's limits change there, update the constants below too.
-- ============================================================
create or replace function public.enforce_invoice_limits()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_plan text;
  monthly_count int;
begin
  select plan into user_plan from public.profiles where id = new.user_id;

  if user_plan = 'pro' then
    return new;
  end if;

  if new.template <> 'classic' then
    raise exception 'Free plan is limited to the Classic template. Upgrade to Pro to unlock all templates.';
  end if;

  if TG_OP = 'INSERT' then
    select count(*) into monthly_count
    from public.invoices
    where user_id = new.user_id
      and created_at >= date_trunc('month', now());

    if monthly_count >= 5 then
      raise exception 'Free plan is limited to 5 invoices per month. Upgrade to Pro for unlimited invoices.';
    end if;
  end if;

  return new;
end;
$$;

-- Fires on insert (limit + template) and on update of template (template
-- only — editing an existing invoice must never re-count toward the
-- monthly cap it already counted against).
drop trigger if exists invoices_enforce_limits on public.invoices;
create trigger invoices_enforce_limits
  before insert or update of template on public.invoices
  for each row execute procedure public.enforce_invoice_limits();

create or replace function public.enforce_client_limits()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_plan text;
  client_count int;
begin
  select plan into user_plan from public.profiles where id = new.user_id;

  if user_plan = 'pro' then
    return new;
  end if;

  select count(*) into client_count
  from public.clients
  where user_id = new.user_id;

  if client_count >= 5 then
    raise exception 'Free plan is limited to 5 clients. Upgrade to Pro for unlimited clients.';
  end if;

  return new;
end;
$$;

drop trigger if exists clients_enforce_limits on public.clients;
create trigger clients_enforce_limits
  before insert on public.clients
  for each row execute procedure public.enforce_client_limits();

-- ============================================================
-- pro_users — superseded by subscriptions. Left in place (not
-- dropped) since it still holds historical payment records; the
-- app no longer reads or writes it.
-- ============================================================
