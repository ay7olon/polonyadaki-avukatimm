create table public.case_timeline_steps (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.legal_cases(id) on delete cascade,
  title text not null,
  description text not null default '',
  step_date date,
  status public.timeline_status not null default 'upcoming',
  actor text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.case_timeline_steps enable row level security;
create index case_timeline_steps_case_id_idx on public.case_timeline_steps(case_id);

create policy "case_timeline_steps_select" on public.case_timeline_steps
  for select using (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_timeline_steps.case_id
        and (c.client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin'))
    )
  );

create policy "case_timeline_steps_write_staff" on public.case_timeline_steps
  for insert with check (public.current_user_role() in ('lawyer', 'admin'));

create policy "case_timeline_steps_update_staff" on public.case_timeline_steps
  for update using (public.current_user_role() in ('lawyer', 'admin'));
