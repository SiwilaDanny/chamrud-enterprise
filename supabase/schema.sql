-- =============================================================
-- Chamrud Enterprise — Supabase Schema
-- Fully idempotent: safe to run multiple times on any project.
-- Run this in the Supabase SQL Editor.
-- =============================================================

-- ─── PROFILES & USER MANAGEMENT ──────────────────────────────
-- Defined at the top so that subsequent table policies can use public.is_admin()
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Drop function and policies before recreating
drop function if exists public.is_admin() cascade;
drop policy if exists "users_read_own_profile" on profiles;
drop policy if exists "users_update_own_profile" on profiles;
drop policy if exists "admins_manage_all_profiles" on profiles;

-- Security helper function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- RLS policies for profiles
create policy "users_read_own_profile"
  on profiles for select
  using (auth.uid() = id);

create policy "users_update_own_profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admins_manage_all_profiles"
  on profiles for all
  using (public.is_admin());

-- Trigger function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
begin
  -- Check if this is the very first user in profiles
  select not exists (select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when is_first_user then 'admin' else 'member' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute function on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── PRODUCTS ────────────────────────────────────────────────
create table if not exists products (
  id              text primary key,
  name            text not null,
  sku             text,
  price           text,
  unit            text,
  category        text,
  badge           text,
  image           text,
  hidden          boolean not null default false,
  featured        boolean not null default false,
  description     text,
  source          text,
  source_url      text,
  source_category text
);

alter table products enable row level security;

-- Drop ALL known policy names (old and new) before recreating
drop policy if exists "public_read_products"   on products;
drop policy if exists "anon_write_products"    on products;
drop policy if exists "authed_write_products"  on products;

create policy "public_read_products"
  on products for select
  using (true);

create policy "authed_write_products"
  on products for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── POSTS ───────────────────────────────────────────────────
create table if not exists posts (
  id         text primary key,
  title      text not null,
  body       text,
  image_url  text,
  category   text,
  created_at timestamptz not null default now()
);

alter table posts enable row level security;

drop policy if exists "public_read_posts"   on posts;
drop policy if exists "anon_write_posts"    on posts;
drop policy if exists "authed_write_posts"  on posts;

create policy "public_read_posts"
  on posts for select
  using (true);

create policy "authed_write_posts"
  on posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── INQUIRIES ───────────────────────────────────────────────
create table if not exists inquiries (
  id          text primary key default gen_random_uuid()::text,
  name        text,
  email       text,
  subject     text,
  message     text,
  received_at timestamptz not null default now()
);

alter table inquiries enable row level security;

drop policy if exists "anon_insert_inquiries"   on inquiries;
drop policy if exists "public_read_inquiries"   on inquiries;
drop policy if exists "authed_read_inquiries"   on inquiries;
drop policy if exists "authed_delete_inquiries" on inquiries;

-- Anyone can submit an inquiry (contact form)
create policy "anon_insert_inquiries"
  on inquiries for insert
  with check (true);

-- Only authenticated admins can read/delete inquiries
create policy "authed_read_inquiries"
  on inquiries for select
  using (public.is_admin());

create policy "authed_delete_inquiries"
  on inquiries for delete
  using (public.is_admin());

-- ─── SITE SETTINGS ───────────────────────────────────────────
create table if not exists site_settings (
  key   text primary key,
  value jsonb not null
);

alter table site_settings enable row level security;

drop policy if exists "public_read_settings"  on site_settings;
drop policy if exists "authed_write_settings" on site_settings;

-- Public can read settings (frontend loads contact info on page load)
create policy "public_read_settings"
  on site_settings for select
  using (true);

-- Only authenticated admins can write settings
create policy "authed_write_settings"
  on site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── SEED DEFAULT SETTINGS ───────────────────────────────────
-- Uses ON CONFLICT DO NOTHING — will not overwrite existing values.
insert into site_settings (key, value)
values
  ('company', '{
    "phone":   "+260772071404",
    "phone2":  "+260966669767",
    "email":   "sales@chamrud.com",
    "whatsapp":"260772071404",
    "address": "15 Enock Kavu Road",
    "city":    "Rhodes Park, Lusaka",
    "country": "Zambia",
    "hours":   "Mon–Fri 08:00–17:00 CAT"
  }'::jsonb)
on conflict (key) do nothing;

insert into site_settings (key, value)
values
  ('brands', '["Thermo Fisher Scientific","Eppendorf","Bio-Rad","RapidLabs","Accurate","Viva Test","Beckman Coulter"]'::jsonb)
on conflict (key) do nothing;

insert into site_settings (key, value)
values
  ('testimonials', '[
    {"name":"Fairview Hospital","role":"Procurement — Lusaka, Zambia","rating":5,"text":"Chamrud Enterprise consistently delivers quality reagents on time. Their dedicated service and attention to our supply needs makes them our preferred supplier."},
    {"name":"Kanyama General Hospital","role":"Medical Supplies — Lusaka, Zambia","rating":5,"text":"We have been sourcing medical consumables and diagnostic kits from Chamrud for several years. Competitive pricing and a reliable supply chain every time."},
    {"name":"Royal Hospital","role":"Laboratory Department — Lusaka, Zambia","rating":5,"text":"The breadth of their catalogue is excellent. From basic lab supplies to pharmaceuticals — Chamrud Enterprise is our single-source supplier of choice in Zambia."}
  ]'::jsonb)
on conflict (key) do nothing;

-- ─── STORAGE BUCKET ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('chamrud-images', 'chamrud-images', true)
  on conflict (id) do update set public = true;
