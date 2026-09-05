insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

-- Storage object paths are expected as: <case_id>/<filename> or <case_id>/messages/<filename>
create policy "case_documents_storage_select" on storage.objects
  for select using (
    bucket_id = 'case-documents' and
    exists (
      select 1 from public.legal_cases c
      where c.id::text = (storage.foldername(name))[1]
        and (c.client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin'))
    )
  );

create policy "case_documents_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'case-documents' and
    exists (
      select 1 from public.legal_cases c
      where c.id::text = (storage.foldername(name))[1]
        and (c.client_id = auth.uid() or public.current_user_role() in ('lawyer', 'admin'))
    )
  );

create policy "case_documents_storage_update_staff" on storage.objects
  for update using (
    bucket_id = 'case-documents' and
    public.current_user_role() in ('lawyer', 'admin')
  );

create policy "case_documents_storage_delete_staff" on storage.objects
  for delete using (
    bucket_id = 'case-documents' and
    public.current_user_role() in ('lawyer', 'admin')
  );
