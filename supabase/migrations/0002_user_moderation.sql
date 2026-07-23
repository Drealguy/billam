-- ============================================================
-- BILL AM — User moderation support (for the admin dashboard)
-- Additive migration. Never drops existing tables/data.
-- ============================================================

-- ============================================================
-- PROFILES — status + email
-- ============================================================
alter table public.profiles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended', 'banned', 'deleted'));

alter table public.profiles
  add column if not exists status_reason text;

alter table public.profiles
  add column if not exists email text;

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_email_idx on public.profiles(email);

-- Backfill email for existing profiles from auth.users.
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Extend the signup trigger to also store email, so the admin app can
-- search/filter customers without calling the Auth Admin API on every
-- page load. Recreated in full since Postgres can't ALTER a function
-- body in place.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;

-- ============================================================
-- LOGIN_EVENTS — one row per successful sign-in, for the admin
-- dashboard's "login history" feature. Starts accumulating from the
-- moment this ships — no retroactive data exists.
-- ============================================================
create table if not exists public.login_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

alter table public.login_events enable row level security;

drop policy if exists "Users can view own login events" on public.login_events;
create policy "Users can view own login events"
  on public.login_events for select
  using (auth.uid() = user_id);

-- Deliberately no insert policy — only the service role (the
-- log-login API route) writes these, never the client directly.

create index if not exists login_events_user_id_idx on public.login_events(user_id);
create index if not exists login_events_created_at_idx on public.login_events(created_at);
