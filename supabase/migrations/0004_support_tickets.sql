-- ============================================================
-- Support tickets — backs the customer-facing chat widget's
-- "talk to a live agent" escalation, and the admin Support module.
-- Additive migration.
-- ============================================================

create table if not exists public.support_tickets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  subject     text not null,
  status      text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

drop policy if exists "Users can view own tickets" on public.support_tickets;
create policy "Users can view own tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own tickets" on public.support_tickets;
create policy "Users can create own tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

-- No update policy for the customer — only the service role (admin
-- replies/status changes) touches a ticket after it's created.

create index if not exists support_tickets_user_id_idx on public.support_tickets(user_id);
create index if not exists support_tickets_status_idx on public.support_tickets(status);

drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at
  before update on public.support_tickets
  for each row execute procedure public.set_updated_at();

create table if not exists public.support_messages (
  id          uuid primary key default uuid_generate_v4(),
  ticket_id   uuid not null references public.support_tickets(id) on delete cascade,
  sender      text not null check (sender in ('customer', 'admin')),
  body        text not null,
  created_at  timestamptz not null default now()
);

alter table public.support_messages enable row level security;

drop policy if exists "Users can view messages on own tickets" on public.support_messages;
create policy "Users can view messages on own tickets"
  on public.support_messages for select
  using (exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id and t.user_id = auth.uid()
  ));

drop policy if exists "Users can send messages on own tickets" on public.support_messages;
create policy "Users can send messages on own tickets"
  on public.support_messages for insert
  with check (
    sender = 'customer'
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

-- Admin replies go through the service role (bypasses RLS entirely),
-- since the insert policy above only permits the ticket's own owner
-- to insert, and only as sender = 'customer'.

create index if not exists support_messages_ticket_id_idx on public.support_messages(ticket_id);
