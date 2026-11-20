-- Overlap: full database setup.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run. Safe to run once on a new project.

create extension if not exists citext;
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------- tables ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '' check (char_length(name) <= 40),
  home text not null default '' check (char_length(home) <= 40),
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  last_reminder timestamptz,
  created_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  city text not null check (char_length(city) between 1 and 40),
  start_date date not null,
  end_date date not null,
  emoji text check (char_length(emoji) <= 8),
  note text check (char_length(note) <= 200),
  private boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_date >= start_date and end_date - start_date <= 400)
);
create index trips_user_idx on public.trips(user_id, end_date);

-- one row per pair of friends, smaller id first, so a friendship is always mutual
create table public.friendships (
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);
create index friendships_b_idx on public.friendships(user_b);

-- a friend request waits for the other person to accept
create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_email citext not null,
  created_at timestamptz not null default now(),
  unique (from_user, to_email)
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  url text not null default '/',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index notifications_unsent_idx on public.notifications(created_at) where sent_at is null;

-- remembers which overlaps were already announced, so nobody is told twice
create table public.overlap_seen (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  city_key text not null,
  first_day date not null,
  primary key (user_id, friend_id, city_key, first_day)
);

-- ---------- helpers ----------

create or replace function public.is_friend(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from friendships
    where user_a = least(auth.uid(), other) and user_b = greatest(auth.uid(), other)
  );
$$;

create or replace function public.friend_ids(u uuid) returns setof uuid
language sql stable security definer set search_path = public as $$
  select user_b from friendships where user_a = u
  union all
  select user_a from friendships where user_b = u;
$$;

-- where a person is on a day: a trip covering that day, otherwise their home city
create or replace function public.city_on(u uuid, d date) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select city from trips where user_id = u and not private and d between start_date and end_date order by created_at desc limit 1),
    nullif((select home from profiles where id = u), '')
  );
$$;

create or replace function public.first_name(u uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(nullif(split_part(trim(name), ' ', 1), ''), 'A friend') from profiles where id = u;
$$;

create or replace function public.fmt_range(a date, b date) returns text
language sql immutable as $$
  select case
    when a = b then to_char(a, 'FMDD Mon')
    when date_trunc('month', a) = date_trunc('month', b) then to_char(a, 'FMDD') || ' to ' || to_char(b, 'FMDD Mon')
    else to_char(a, 'FMDD Mon') || ' to ' || to_char(b, 'FMDD Mon')
  end;
$$;

create or replace function public.queue_overlap(to_user uuid, friend uuid, city text, a date, b date) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into overlap_seen(user_id, friend_id, city_key, first_day)
  values (to_user, friend, lower(trim(city)), a)
  on conflict do nothing;
  if found then
    insert into notifications(user_id, title, body, url)
    values (to_user, 'You overlap with ' || first_name(friend),
            'You and ' || first_name(friend) || ' will both be in ' || city || ', ' || fmt_range(a, b) || '.',
            '/?d=' || a::text);
  end if;
end;
$$;

-- find every run of days where two friends are in the same city and at least one of them travelled
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

create or replace function public.scan_user(u uuid, d0 date, d1 date) returns void
language plpgsql security definer set search_path = public as $$
declare f uuid;
begin
  for f in select friend_ids(u) loop
    perform scan_pair(u, f, d0, d1);
  end loop;
end;
$$;

-- ---------- triggers ----------

create or replace function public.on_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id) values (new.id) on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.on_new_user();

create or replace function public.on_trip_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform scan_user(old.user_id, old.start_date, old.end_date);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform scan_user(new.user_id, new.start_date, new.end_date);
  end if;
  return null;
end;
$$;
create trigger trips_scan after insert or update or delete on public.trips
  for each row execute function public.on_trip_change();

create or replace function public.on_home_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.home, '') <> coalesce(old.home, '') then
    perform scan_user(new.id, current_date, current_date + 365);
  end if;
  return null;
end;
$$;
create trigger profiles_scan after update of home on public.profiles
  for each row execute function public.on_home_change();

create or replace function public.on_friendship() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform scan_pair(new.user_a, new.user_b, current_date, current_date + 365);
  return null;
end;
$$;
create trigger friendships_scan after insert on public.friendships
  for each row execute function public.on_friendship();

-- ---------- what the app may call ----------

-- name shown on an invite link, before the friend has an account
create or replace function public.invite_info(code text) returns text
language sql stable security definer set search_path = public as $$
  select first_name(id) from profiles where invite_code = code;
$$;

-- someone opening an invite link leaves their email, so the request waits for them inside the app
create or replace function public.request_by_code(code text, email text) returns void
language plpgsql security definer set search_path = public as $$
declare inviter uuid;
begin
  select id into inviter from profiles where invite_code = code;
  if inviter is null or email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid'; end if;
  if (select count(*) from friend_requests where from_user = inviter) >= 100 then raise exception 'too many'; end if;
  insert into friend_requests(from_user, to_email) values (inviter, lower(trim(email))) on conflict do nothing;
end;
$$;

create or replace function public.request_by_email(email text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid'; end if;
  if lower(trim(email)) = lower(auth.jwt() ->> 'email') then raise exception 'self'; end if;
  if (select count(*) from friend_requests where from_user = auth.uid()) >= 100 then raise exception 'too many'; end if;
  insert into friend_requests(from_user, to_email) values (auth.uid(), lower(trim(email))) on conflict do nothing;
end;
$$;

create or replace function public.make_friends(other uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or other is null or other = auth.uid() then return; end if;
  insert into friendships(user_a, user_b) values (least(auth.uid(), other), greatest(auth.uid(), other))
  on conflict do nothing;
  delete from friend_requests
  where (from_user = other and to_email = lower(auth.jwt() ->> 'email'))
     or (from_user = auth.uid() and to_email = (select lower(email) from auth.users where id = other));
end;
$$;
revoke execute on function public.make_friends(uuid) from public, anon, authenticated;

create or replace function public.accept_request(req uuid) returns void
language plpgsql security definer set search_path = public as $$
declare who uuid;
begin
  select from_user into who from friend_requests
  where id = req and to_email = lower(auth.jwt() ->> 'email');
  if who is null then raise exception 'not found'; end if;
  perform make_friends(who);
end;
$$;

-- a signed-in person who opens a friend's invite link and taps Accept
create or replace function public.accept_code(code text) returns void
language plpgsql security definer set search_path = public as $$
declare who uuid;
begin
  select id into who from profiles where invite_code = code;
  if who is null then raise exception 'not found'; end if;
  perform make_friends(who);
end;
$$;

create or replace function public.unfriend(other uuid) returns void
language sql security definer set search_path = public as $$
  delete from friendships where user_a = least(auth.uid(), other) and user_b = greatest(auth.uid(), other);
$$;

-- names of the people who sent me requests (their profile is otherwise private until we are friends)
create or replace function public.my_requests() returns table(id uuid, from_name text)
language sql stable security definer set search_path = public as $$
  select r.id, first_name(r.from_user) from friend_requests r
  where r.to_email = lower(auth.jwt() ->> 'email') order by r.created_at;
$$;

-- Apple requires that people can delete their account from inside the app; this removes them and everything they shared
create or replace function public.delete_me() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from friend_requests where to_email = lower(auth.jwt() ->> 'email');
  delete from auth.users where id = auth.uid();
end;
$$;

-- every two weeks, ask people with alerts on whether they have trips coming up
create or replace function public.queue_reminders() returns void
language plpgsql security definer set search_path = public as $$
begin
  with due as (
    update profiles p set last_reminder = now()
    where exists (select 1 from push_subscriptions s where s.user_id = p.id)
      and (p.last_reminder is null or p.last_reminder < now() - interval '13 days')
      and not exists (select 1 from trips t where t.user_id = p.id and t.created_at > now() - interval '13 days')
      and p.created_at < now() - interval '3 days'
    returning p.id
  )
  insert into notifications(user_id, title, body, url)
  select id, 'Any trips coming up?', 'Add them so you know who you will overlap with.', '/?add=1' from due;
end;
$$;

-- internal functions are not for the app
revoke execute on function public.city_on(uuid, date) from public, anon, authenticated;
revoke execute on function public.queue_overlap(uuid, uuid, text, date, date) from public, anon, authenticated;
revoke execute on function public.scan_pair(uuid, uuid, date, date) from public, anon, authenticated;
revoke execute on function public.scan_user(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.queue_reminders() from public, anon, authenticated;
revoke execute on function public.friend_ids(uuid) from public, anon, authenticated;
revoke execute on function public.first_name(uuid) from public, anon, authenticated;
grant execute on function public.invite_info(text) to anon, authenticated;
grant execute on function public.request_by_code(text, text) to anon, authenticated;

-- ---------- privacy rules ----------

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.friendships enable row level security;
alter table public.friend_requests enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.overlap_seen enable row level security;

-- you see yourself and your friends, nobody else
create policy "see me and friends" on public.profiles for select using (id = auth.uid() or is_friend(id));
create policy "edit me" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "see my and friends trips" on public.trips for select using (user_id = auth.uid() or (is_friend(user_id) and not private));
create policy "add my trips" on public.trips for insert with check (user_id = auth.uid());
create policy "edit my trips" on public.trips for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "remove my trips" on public.trips for delete using (user_id = auth.uid());

create policy "see my friendships" on public.friendships for select using (auth.uid() in (user_a, user_b));

create policy "see my requests" on public.friend_requests for select
  using (from_user = auth.uid() or to_email = lower(auth.jwt() ->> 'email'));
create policy "drop my requests" on public.friend_requests for delete
  using (from_user = auth.uid() or to_email = lower(auth.jwt() ->> 'email'));

create policy "my devices" on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "my notifications" on public.notifications for select using (user_id = auth.uid());

-- column limits on what people can change about themselves
revoke update on public.profiles from authenticated;
grant update (name, home) on public.profiles to authenticated;

-- live updates in the app
alter publication supabase_realtime add table public.trips, public.profiles, public.friendships, public.friend_requests;

-- reminders: every day at 17:31 UTC, the database checks who is due one
select cron.schedule('overlap-reminders', '31 17 * * *', $$select public.queue_reminders()$$);

revoke execute on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;

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
