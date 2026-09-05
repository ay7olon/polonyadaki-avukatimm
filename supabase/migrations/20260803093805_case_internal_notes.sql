create table public.case_internal_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.legal_cases(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.case_internal_notes enable row level security;
create index case_internal_notes_case_id_idx on public.case_internal_notes(case_id);

-- Only lawyer/admin staff can ever see or write internal notes; clients never have access.
create policy "case_internal_notes_staff_only" on public.case_internal_notes
  for all using (
    public.current_user_role() in ('lawyer', 'admin')
  ) with check (
    public.current_user_role() in ('lawyer', 'admin')
  );
