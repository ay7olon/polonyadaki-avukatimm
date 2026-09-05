alter table public.profiles add column email text not null default '';

create or replace function public.handle_new_user()
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
