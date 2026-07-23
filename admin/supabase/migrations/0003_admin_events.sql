-- ============================================================
-- Admin-facing event feed — e.g. "so-and-so upgraded to Pro".
-- Distinct from admin_audit_logs (which records what admins DID) and
-- from the customer app's own `notifications` table (which is admins
-- broadcasting TO customers) — this is the platform notifying admins
-- of things customers did.
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists public.admin_events (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null,
  title       text not null,
  body        text,
  metadata    jsonb not null default '{}',
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.admin_events enable row level security;

drop policy if exists "Admins can view admin events" on public.admin_events;
create policy "Admins can view admin events"
  on public.admin_events for select
  using (public.is_active_admin(auth.uid()));

drop policy if exists "Admins can mark admin events read" on public.admin_events;
create policy "Admins can mark admin events read"
  on public.admin_events for update
  using (public.is_active_admin(auth.uid()))
  with check (public.is_active_admin(auth.uid()));

-- Deliberately no insert policy — only the service role (the Paystack
-- webhook, and future triggers like this) writes these.

create index if not exists admin_events_read_idx on public.admin_events(read);
create index if not exists admin_events_created_at_idx on public.admin_events(created_at);
