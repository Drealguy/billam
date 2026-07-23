-- ============================================================
-- Team module support — additive.
-- ============================================================

-- admin_users gets its own email column (mirrors what we did for the
-- customer app's profiles) so the Team page can list/search admins
-- without an Auth Admin API round trip per row.
alter table public.admin_users add column if not exists email text;

update public.admin_users au
set email = u.email
from auth.users u
where au.id = u.id and au.email is null;

create index if not exists admin_users_email_idx on public.admin_users(email);

-- Two more roles named in the spec: Finance and Developer.
insert into public.admin_roles (name, description) values
  ('finance',   'Billing and subscription oversight'),
  ('developer', 'Technical/system access — settings, audit logs, moderation')
on conflict (name) do nothing;

-- Reasonable defaults — adjustable afterward via the Team role editor.
insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id
from public.admin_roles r, public.admin_permissions p
where r.name = 'finance'
  and p.key in ('subscriptions.manage', 'audit_logs.view')
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id
from public.admin_roles r, public.admin_permissions p
where r.name = 'developer'
  and p.key in ('settings.manage', 'audit_logs.view', 'moderation.manage')
on conflict do nothing;
