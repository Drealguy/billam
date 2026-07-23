-- ============================================================
-- Platform settings — generic key/value store backing the admin
-- Settings module. Starts with one flag (Pro payments kill switch);
-- more settings (maintenance mode, registration, limits, etc.) get
-- added as rows here later, not new columns/tables.
-- ============================================================

create table if not exists public.platform_settings (
  key          text primary key,
  value        jsonb not null,
  description  text,
  updated_at   timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

drop policy if exists "Admins can view platform settings" on public.platform_settings;
create policy "Admins can view platform settings"
  on public.platform_settings for select
  using (public.is_active_admin(auth.uid()));

-- No policy for the customer app — it reads this via its own
-- service-role client (same pattern as admin_events, in reverse).
-- No update/insert policy for regular admins either — writes go
-- through the service role from a permission-gated server action.

insert into public.platform_settings (key, value, description) values
  (
    'pro_payments_enabled',
    'true'::jsonb,
    'When false, new Pro upgrade checkouts are blocked with a friendly message. Existing Pro subscriptions keep working either way — this only stops new checkouts, e.g. while Paystack is still in test mode.'
  )
on conflict (key) do nothing;
