-- Fix mutable search_path warning
alter function public.set_updated_at() set search_path = public;

-- handle_new_user is only meant to run via the auth.users trigger, never as a direct RPC call
revoke execute on function public.handle_new_user() from public, anon, authenticated;
