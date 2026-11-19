-- Run this once if you already ran schema.sql before the iPhone app existed.
-- (A new project only needs schema.sql, which already includes it.)

create or replace function public.delete_me() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from friend_requests where to_email = lower(auth.jwt() ->> 'email');
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
