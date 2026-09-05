create table public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.legal_cases(id) on delete cascade,
  name text not null,
  storage_path text,
  size text not null default '',
  type text not null default '',
  status public.document_status not null default 'pending',
  rejection_reason text,
  uploaded_at timestamptz not null default now()
);

alter table public.case_documents enable row level security;
create index case_documents_case_id_idx on public.case_documents(case_id);

create policy "case_documents_select" on public.case_documents
  for select using (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_documents.case_id
        and (c.client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin'))
    )
  );

create policy "case_documents_insert" on public.case_documents
  for insert with check (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_documents.case_id
        and (c.client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin'))
    )
  );

create policy "case_documents_update_staff" on public.case_documents
  for update using (
    public.current_user_role() in ('lawyer', 'admin')
  );
