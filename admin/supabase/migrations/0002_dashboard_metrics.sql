-- ============================================================
-- Dashboard analytics support — additive, no existing objects touched.
-- ============================================================

-- Total bytes stored in a given Storage bucket (default 'logos'),
-- used for the Dashboard's Storage Usage card. storage.objects isn't
-- exposed over PostgREST by default, so this is called via .rpc().
create or replace function public.admin_storage_usage_bytes(bucket text default 'logos')
returns bigint
language sql
security definer
set search_path = public, storage
stable
as $$
  select coalesce(sum((metadata->>'size')::bigint), 0)
  from storage.objects
  where bucket_id = bucket;
$$;
