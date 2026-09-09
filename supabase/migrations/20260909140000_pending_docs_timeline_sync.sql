-- When a client (or anyone) uploads a case document while the case is pending_docs,
-- complete the "Ek belge bekleniyor" timeline step and open a review step.
-- Also move case status back to in_review so dashboard reminders clear after upload.

create or replace function private.complete_pending_docs_on_document_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.case_status;
  v_max_order integer;
begin
  select status into v_status from public.legal_cases where id = new.case_id;
  if v_status is distinct from 'pending_docs' then
    return new;
  end if;

  -- Lawyer-shared files should not clear the client's pending-docs request.
  if new.type = 'lawyer_share' then
    return new;
  end if;

  update public.case_timeline_steps
  set status = 'completed'
  where case_id = new.case_id
    and title = 'Ek belge bekleniyor'
    and status in ('current', 'upcoming');

  update public.case_timeline_steps
  set status = 'completed'
  where case_id = new.case_id
    and status = 'current';

  select coalesce(max(sort_order), -1) into v_max_order
  from public.case_timeline_steps
  where case_id = new.case_id;

  insert into public.case_timeline_steps (case_id, title, description, status, sort_order, step_date)
  values (
    new.case_id,
    'Yüklenen evrak incelenecek',
    'Müşteri yeni belge yükledi; avukat incelemesi bekleniyor.',
    'current',
    v_max_order + 1,
    current_date
  );

  update public.legal_cases
  set status = 'in_review'
  where id = new.case_id
    and status = 'pending_docs';

  return new;
end;
$$;

revoke all on function private.complete_pending_docs_on_document_insert() from public;

drop trigger if exists case_documents_complete_pending_docs on public.case_documents;
create trigger case_documents_complete_pending_docs
  after insert on public.case_documents
  for each row
  execute function private.complete_pending_docs_on_document_insert();
