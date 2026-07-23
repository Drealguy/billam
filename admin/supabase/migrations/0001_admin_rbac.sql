-- ============================================================
-- BILL AM ADMIN — RBAC + audit log schema
-- Additive migration, safe to run against the same Supabase
-- project the customer app uses. Runs entirely independently of
-- supabase/migrations/0001_subscriptions.sql in the main app repo.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ADMIN_USERS
-- Being a Bill Am customer (a row in public.profiles) grants zero
-- admin access on its own. Admin access exists only for people
-- with an active row here — no email is ever hardcoded in code.
-- ============================================================
create table if not exists public.admin_users (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text not null default '',
  is_active      boolean not null default true,
  last_login_at  timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Every admin can read their own row via plain RLS. Listing every admin
-- (Team Management) goes through the service-role client behind a
-- team.manage permission check at the application layer — not RLS —
-- to avoid a self-referential policy on this table.
drop policy if exists "Admins can view own row" on public.admin_users;
create policy "Admins can view own row"
  on public.admin_users for select
  using (auth.uid() = id);

-- security definer: safe to reference from other tables' policies
-- without recursing back through admin_users' own RLS.
create or replace function public.is_active_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where id = uid and is_active
  );
$$;

-- ============================================================
-- ADMIN_ROLES / ADMIN_PERMISSIONS
-- ============================================================
create table if not exists public.admin_roles (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  description text not null default ''
);

create table if not exists public.admin_permissions (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  description text not null default ''
);

create table if not exists public.admin_role_permissions (
  role_id       uuid not null references public.admin_roles(id) on delete cascade,
  permission_id uuid not null references public.admin_permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.admin_user_roles (
  user_id uuid not null references public.admin_users(id) on delete cascade,
  role_id uuid not null references public.admin_roles(id) on delete cascade,
  primary key (user_id, role_id)
);

alter table public.admin_roles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.admin_user_roles enable row level security;

drop policy if exists "Admins can view roles" on public.admin_roles;
create policy "Admins can view roles" on public.admin_roles for select
  using (public.is_active_admin(auth.uid()));

drop policy if exists "Admins can view permissions" on public.admin_permissions;
create policy "Admins can view permissions" on public.admin_permissions for select
  using (public.is_active_admin(auth.uid()));

drop policy if exists "Admins can view role_permissions" on public.admin_role_permissions;
create policy "Admins can view role_permissions" on public.admin_role_permissions for select
  using (public.is_active_admin(auth.uid()));

drop policy if exists "Admins can view user_roles" on public.admin_user_roles;
create policy "Admins can view user_roles" on public.admin_user_roles for select
  using (public.is_active_admin(auth.uid()));

-- ============================================================
-- SEED: baseline roles + permissions
-- ============================================================
insert into public.admin_permissions (key, description) values
  ('users.manage',         'View, search, suspend, and adjust Bill Am customer accounts'),
  ('subscriptions.manage', 'View and override subscription/billing state'),
  ('team.manage',          'Invite admins and assign roles'),
  ('notifications.manage', 'Send and manage in-app broadcast notifications'),
  ('audit_logs.view',      'View the admin audit log'),
  ('moderation.manage',    'Review and act on flagged accounts/invoices'),
  ('support.manage',       'View and respond to support tickets'),
  ('settings.manage',      'Change admin-app-level settings')
on conflict (key) do nothing;

insert into public.admin_roles (name, description) values
  ('super_admin', 'Full access to every module, including team management'),
  ('admin',       'Operational access — users, subscriptions, moderation, support'),
  ('support',     'Support tickets and read-only user lookup'),
  ('moderator',   'Moderation queue only')
on conflict (name) do nothing;

-- super_admin: every permission
insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id
from public.admin_roles r, public.admin_permissions p
where r.name = 'super_admin'
on conflict do nothing;

-- admin: everything except team.manage and settings.manage
insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id
from public.admin_roles r, public.admin_permissions p
where r.name = 'admin'
  and p.key in ('users.manage', 'subscriptions.manage', 'notifications.manage',
                'audit_logs.view', 'moderation.manage', 'support.manage')
on conflict do nothing;

-- support: support tickets + read-only user lookup
insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id
from public.admin_roles r, public.admin_permissions p
where r.name = 'support'
  and p.key in ('support.manage', 'users.manage')
on conflict do nothing;

-- moderator: moderation queue only
insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id
from public.admin_roles r, public.admin_permissions p
where r.name = 'moderator'
  and p.key in ('moderation.manage')
on conflict do nothing;

-- ============================================================
-- AUDIT LOGS
-- Every sensitive admin write (suspend a user, override a
-- subscription, change a role, etc.) records a row here.
-- ============================================================
create table if not exists public.admin_audit_logs (
  id             uuid primary key default uuid_generate_v4(),
  admin_user_id  uuid references public.admin_users(id) on delete set null,
  action         text not null,
  target_type    text,
  target_id      text,
  metadata       jsonb not null default '{}',
  ip_address     text,
  created_at     timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "Admins can view audit logs" on public.admin_audit_logs;
create policy "Admins can view audit logs" on public.admin_audit_logs for select
  using (public.is_active_admin(auth.uid()));

-- Deliberately no insert policy: the service role bypasses RLS
-- entirely, and audit rows must only ever be written by trusted
-- server-side code — never by an authenticated admin's own session.

create index if not exists admin_audit_logs_admin_user_id_idx on public.admin_audit_logs(admin_user_id);
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs(created_at);

-- ============================================================
-- BOOTSTRAP — run manually, once, to create your first admin.
-- Replace the email with your own Bill Am / Supabase Auth account.
-- ============================================================
-- insert into public.admin_users (id, full_name)
-- select id, coalesce(raw_user_meta_data->>'full_name', '')
-- from auth.users where email = 'you@example.com'
-- on conflict (id) do nothing;
--
-- insert into public.admin_user_roles (user_id, role_id)
-- select au.id, r.id
-- from public.admin_users au, public.admin_roles r
-- where au.id = (select id from auth.users where email = 'you@example.com')
--   and r.name = 'super_admin'
-- on conflict do nothing;
