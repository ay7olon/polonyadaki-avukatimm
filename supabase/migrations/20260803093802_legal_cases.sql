create table public.legal_cases (
  id uuid primary key default gen_random_uuid(),
  case_number text not null unique,
  client_id uuid not null references public.profiles(id) on delete cascade,
  case_type text not null,
  case_category public.case_category not null,
  city text not null default '',
  status public.case_status not null default 'received',
  urgency public.urgency_level not null default 'normal',
  assigned_lawyer_id uuid references public.profiles(id) on delete set null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  form_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.legal_cases enable row level security;

create index legal_cases_client_id_idx on public.legal_cases(client_id);
create index legal_cases_assigned_lawyer_id_idx on public.legal_cases(assigned_lawyer_id);
create index legal_cases_status_idx on public.legal_cases(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger legal_cases_set_updated_at
  before update on public.legal_cases
  for each row execute procedure public.set_updated_at();

create policy "legal_cases_select" on public.legal_cases
  for select using (
    client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin')
  );

create policy "legal_cases_insert" on public.legal_cases
  for insert with check (
    client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin')
  );

create policy "legal_cases_update_staff" on public.legal_cases
  for update using (
    public.current_user_role() in ('lawyer', 'admin')
  );
