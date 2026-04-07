-- ============================================================
-- BILL AM — Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- Extends auth.users — created automatically on signup via trigger
-- ============================================================
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text not null default '',
  business_name    text not null default '',
  business_tagline text not null default '',
  phone            text not null default '',
  logo_url         text,
  brand_colour     text not null default '#111827',
  accent_colour    text not null default '#6366f1',
  bank_name        text not null default '',
  account_number   text not null default '',
  account_name     text not null default '',
  default_currency text not null default 'NGN',
  created_at       timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, business_name, business_tagline, phone, bank_name, account_number, account_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'business_name', ''),
    coalesce(new.raw_user_meta_data->>'business_tagline', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'bank_name', ''),
    coalesce(new.raw_user_meta_data->>'account_number', ''),
    coalesce(new.raw_user_meta_data->>'account_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CLIENTS
-- ============================================================
create table public.clients (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  email      text,
  phone      text,
  address    text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users can manage own clients"
  on public.clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index clients_user_id_idx on public.clients(user_id);

-- ============================================================
-- INVOICES
-- ============================================================
create table public.invoices (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  invoice_number   text not null,
  client_id        uuid references public.clients(id) on delete set null,
  client_snapshot  jsonb not null default '{}',  -- client data frozen at creation time
  line_items       jsonb not null default '[]',  -- [{description, quantity, unit_price, total}]
  currency         text not null default 'NGN',
  subtotal         numeric(12,2) not null default 0,
  vat_enabled      boolean not null default false,
  vat_amount       numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  deposit_paid     numeric(12,2) not null default 0,
  balance_due      numeric(12,2) not null default 0,
  status           text not null default 'unpaid' check (status in ('unpaid', 'part_payment', 'paid')),
  template         text not null default 'classic' check (template in ('classic', 'clean', 'modern')),
  invoice_date     date not null default current_date,
  due_date         date,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "Users can manage own invoices"
  on public.invoices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_status_idx  on public.invoices(status);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- STORAGE — logos bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Users can upload own logo"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own logo"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own logo"
  on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public logo read access"
  on storage.objects for select
  using (bucket_id = 'logos');
