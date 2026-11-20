-- Run once in Supabase: SQL Editor, paste all of this, press Run. Safe to run more than once.

-- WhatsApp number on each profile, visible only to friends (same rules as the name)
alter table public.profiles add column if not exists phone text not null default '' check (char_length(phone) <= 20);
grant update (name, home, phone) on public.profiles to authenticated;

-- Update 4: notes on trips, private trips, friends you can switch off.
-- Run once in Supabase: SQL Editor, paste all of this, press Run.

-- a short note on a trip ("for Marta's wedding"), and trips only you can see
alter table public.trips add column if not exists note text check (char_length(note) <= 200);
alter table public.trips add column if not exists private boolean not null default false;

-- friends never see your private trips
drop policy if exists "see my and friends trips" on public.trips;
create policy "see my and friends trips" on public.trips for select
  using (user_id = auth.uid() or (is_friend(user_id) and not private));

-- private trips never count for overlaps or alerts
create or replace function public.city_on(u uuid, d date) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select city from trips where user_id = u and not private and d between start_date and end_date order by created_at desc limit 1),
    nullif((select home from profiles where id = u), '')
  );
$$;

create or replace function public.scan_pair(u uuid, f uuid, d0 date, d1 date) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if u = f then return; end if;
  for r in
    with days as (
      select g::date as d
      from generate_series(greatest(d0, current_date), least(d1, current_date + 400), interval '1 day') g
    ), w as (
      select d, city_on(u, d) as cu, city_on(f, d) as cf,
        exists (select 1 from trips t where t.user_id = u and not t.private and d between t.start_date and t.end_date) as tu,
        exists (select 1 from trips t where t.user_id = f and not t.private and d between t.start_date and t.end_date) as tf
      from days
    ), hits as (
      select d, cu from w where cu is not null and lower(trim(cu)) = lower(trim(cf)) and (tu or tf)
    ), grp as (
      select d, cu, d - (row_number() over (partition by lower(trim(cu)) order by d))::int as g from hits
    )
    select min(d) as a, max(d) as b, min(cu) as city from grp group by lower(trim(cu)), g
  loop
    perform queue_overlap(u, f, r.city, r.a, r.b);
    perform queue_overlap(f, u, r.city, r.a, r.b);
  end loop;
end;
$$;

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
