-- Update 5: usernames and finding people by name or @username, like Instagram.

alter table public.profiles add column if not exists username citext unique
  check (username ~ '^[a-z0-9._]{3,20}$');
grant update (name, home, phone, username) on public.profiles to authenticated;

-- search everyone on Overlap by @username or name (at least 2 letters); shows only name and username
create or replace function public.search_people(q text)
returns table(id uuid, name text, username text, status text)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.username::text,
    case
      when is_friend(p.id) then 'friend'
      when exists (select 1 from friend_requests r where r.from_user = auth.uid()
                   and r.to_email = (select lower(email) from auth.users where id = p.id)) then 'sent'
      when exists (select 1 from friend_requests r where r.from_user = p.id
                   and r.to_email = lower(auth.jwt() ->> 'email')) then 'asked you'
      else 'none' end
  from profiles p
  where auth.uid() is not null and p.id <> auth.uid()
    and char_length(trim(q)) >= 2
    and (p.username ilike ltrim(trim(q), '@') || '%' or p.name ilike '%' || trim(q) || '%')
  order by (p.username ilike ltrim(trim(q), '@') || '%') desc, p.name
  limit 20;
$$;

-- ask someone found in search to share plans; if they already asked you, you become friends at once
create or replace function public.request_user(other uuid) returns text
language plpgsql security definer set search_path = public as $$
declare em text;
begin
  if auth.uid() is null or other is null or other = auth.uid() then raise exception 'invalid'; end if;
  if is_friend(other) then return 'friend'; end if;
  if exists (select 1 from friend_requests where from_user = other and to_email = lower(auth.jwt() ->> 'email')) then
    perform make_friends(other); return 'friend';
  end if;
  if (select count(*) from friend_requests where from_user = auth.uid()) >= 100 then raise exception 'too many'; end if;
  select lower(email) into em from auth.users where id = other;
  insert into friend_requests(from_user, to_email) values (auth.uid(), em) on conflict do nothing;
  return 'sent';
end;
$$;

revoke execute on function public.search_people(text) from public, anon;
revoke execute on function public.request_user(uuid) from public, anon;
grant execute on function public.search_people(text) to authenticated;
grant execute on function public.request_user(uuid) to authenticated;
