create table public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.legal_cases(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_role public.message_sender_role not null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.case_messages enable row level security;
create index case_messages_case_id_idx on public.case_messages(case_id, created_at);

create policy "case_messages_select" on public.case_messages
  for select using (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_messages.case_id
        and (c.client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin'))
    )
  );

create policy "case_messages_insert" on public.case_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.legal_cases c
      where c.id = case_messages.case_id
        and (c.client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin'))
    )
  );

alter publication supabase_realtime add table public.case_messages;
