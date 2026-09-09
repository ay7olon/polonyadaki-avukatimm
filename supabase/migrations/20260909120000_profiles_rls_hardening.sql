-- P0: Close profiles privilege escalation; move SECURITY DEFINER helpers to private;
-- wrap role lookups as (select ...) in policies for initplan-friendly evaluation.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to postgres, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Helpers in private schema
-- ---------------------------------------------------------------------------

create or replace function private.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

revoke all on function private.current_user_role() from public;
grant execute on function private.current_user_role() to anon, authenticated, service_role;

-- Keep a thin public wrapper so older SQL / tooling still resolves the name.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
set search_path = public, private
as $$
  select private.current_user_role()
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to anon, authenticated, service_role;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role, rodo_accepted_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'client',
    case when (new.raw_user_meta_data->>'rodo_accepted')::boolean is true then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Drop old public handle_new_user if present (trigger now points at private).
drop function if exists public.handle_new_user();

create or replace function private.seed_case_timeline()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.case_timeline_steps (case_id, title, description, status, sort_order)
  values
    (new.id, 'Başvuru Alındı ve Avukata İletildi', 'Sistem üzerinden yeni dosyanız oluşturuldu.', 'completed', 0),
    (new.id, 'Hukuki Ön İnceleme Yapılıyor', 'Sorumlu avukatınız dosyayı inceliyor.', 'current', 1);
  return new;
end;
$$;

revoke all on function private.seed_case_timeline() from public;

drop trigger if exists on_legal_case_created on public.legal_cases;
create trigger on_legal_case_created
  after insert on public.legal_cases
  for each row execute function private.seed_case_timeline();

drop function if exists public.seed_case_timeline();

-- ---------------------------------------------------------------------------
-- Immutable role / id for client updates
-- ---------------------------------------------------------------------------

create or replace function private.enforce_profile_immutable_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id then
      raise exception 'profiles.id is immutable';
    end if;
    if new.role is distinct from old.role then
      raise exception 'profiles.role can only be changed by service role';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_profile_immutable_fields() from public;

drop trigger if exists profiles_enforce_immutable_fields on public.profiles;
create trigger profiles_enforce_immutable_fields
  before update on public.profiles
  for each row execute function private.enforce_profile_immutable_fields();

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff" on public.profiles
  for select using (
    id = (select auth.uid())
    or (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Re-create data policies with (select ...) wraps
-- ---------------------------------------------------------------------------

drop policy if exists "legal_cases_select" on public.legal_cases;
create policy "legal_cases_select" on public.legal_cases
  for select using (
    client_id = (select auth.uid())
    or (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "legal_cases_insert" on public.legal_cases;
create policy "legal_cases_insert" on public.legal_cases
  for insert with check (
    client_id = (select auth.uid())
    or (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "legal_cases_update_staff" on public.legal_cases;
create policy "legal_cases_update_staff" on public.legal_cases
  for update using (
    (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "case_documents_select" on public.case_documents;
create policy "case_documents_select" on public.case_documents
  for select using (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_id
        and (
          c.client_id = (select auth.uid())
          or (select private.current_user_role()) in ('lawyer', 'admin')
        )
    )
  );

drop policy if exists "case_documents_insert" on public.case_documents;
create policy "case_documents_insert" on public.case_documents
  for insert with check (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_id
        and (
          c.client_id = (select auth.uid())
          or (select private.current_user_role()) in ('lawyer', 'admin')
        )
    )
  );

drop policy if exists "case_documents_update_staff" on public.case_documents;
create policy "case_documents_update_staff" on public.case_documents
  for update using (
    (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "case_timeline_steps_select" on public.case_timeline_steps;
create policy "case_timeline_steps_select" on public.case_timeline_steps
  for select using (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_id
        and (
          c.client_id = (select auth.uid())
          or (select private.current_user_role()) in ('lawyer', 'admin')
        )
    )
  );

drop policy if exists "case_timeline_steps_write_staff" on public.case_timeline_steps;
create policy "case_timeline_steps_write_staff" on public.case_timeline_steps
  for insert with check (
    (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "case_timeline_steps_update_staff" on public.case_timeline_steps;
create policy "case_timeline_steps_update_staff" on public.case_timeline_steps
  for update using (
    (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "case_internal_notes_staff_only" on public.case_internal_notes;
create policy "case_internal_notes_staff_only" on public.case_internal_notes
  for all using (
    (select private.current_user_role()) in ('lawyer', 'admin')
  )
  with check (
    (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "case_messages_select" on public.case_messages;
create policy "case_messages_select" on public.case_messages
  for select using (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_id
        and (
          c.client_id = (select auth.uid())
          or (select private.current_user_role()) in ('lawyer', 'admin')
        )
    )
  );

drop policy if exists "case_messages_insert" on public.case_messages;
create policy "case_messages_insert" on public.case_messages
  for insert with check (
    exists (
      select 1 from public.legal_cases c
      where c.id = case_id
        and (
          c.client_id = (select auth.uid())
          or (select private.current_user_role()) in ('lawyer', 'admin')
        )
    )
  );

-- Storage policies
drop policy if exists "case_documents_storage_select" on storage.objects;
create policy "case_documents_storage_select" on storage.objects
  for select using (
    bucket_id = 'case-documents' and
    exists (
      select 1 from public.legal_cases c
      where c.id::text = (storage.foldername(name))[1]
        and (
          c.client_id = (select auth.uid())
          or (select private.current_user_role()) in ('lawyer', 'admin')
        )
    )
  );

drop policy if exists "case_documents_storage_insert" on storage.objects;
create policy "case_documents_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'case-documents' and
    exists (
      select 1 from public.legal_cases c
      where c.id::text = (storage.foldername(name))[1]
        and (
          c.client_id = (select auth.uid())
          or (select private.current_user_role()) in ('lawyer', 'admin')
        )
    )
  );

drop policy if exists "case_documents_storage_update_staff" on storage.objects;
create policy "case_documents_storage_update_staff" on storage.objects
  for update using (
    bucket_id = 'case-documents' and
    (select private.current_user_role()) in ('lawyer', 'admin')
  );

drop policy if exists "case_documents_storage_delete_staff" on storage.objects;
create policy "case_documents_storage_delete_staff" on storage.objects
  for delete using (
    bucket_id = 'case-documents' and
    (select private.current_user_role()) in ('lawyer', 'admin')
  );

-- Soft size limit on case-documents bucket (20 MiB)
update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
where id = 'case-documents';
