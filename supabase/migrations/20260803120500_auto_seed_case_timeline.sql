create or replace function public.seed_case_timeline()
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

create trigger on_legal_case_created
  after insert on public.legal_cases
  for each row execute procedure public.seed_case_timeline();

revoke execute on function public.seed_case_timeline() from public, anon, authenticated;
