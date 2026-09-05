-- Enums matching src/types.ts
create type public.user_role as enum ('client', 'lawyer', 'admin');
create type public.case_category as enum ('oturtma', 'calisma', 'sirket', 'aile', 'vatandasilik', 'danismanlik');
create type public.case_status as enum ('received', 'assigned', 'in_review', 'pending_docs', 'submitted', 'completed', 'rejected');
create type public.urgency_level as enum ('normal', 'urgent', 'critical');
create type public.document_status as enum ('pending', 'approved', 'rejected');
create type public.timeline_status as enum ('completed', 'current', 'upcoming');
create type public.message_sender_role as enum ('client', 'lawyer', 'system');

-- Profiles: 1:1 extension of auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  role public.user_role not null default 'client',
  avatar_url text,
  language_pref text not null default 'TR',
  rodo_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Security definer helper to avoid recursive RLS lookups on profiles
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "profiles_select_own_or_staff" on public.profiles
  for select using (
    id = auth.uid() or public.current_user_role() in ('lawyer', 'admin')
  );

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role, rodo_accepted_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'client',
    case when (new.raw_user_meta_data->>'rodo_accepted')::boolean is true then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
