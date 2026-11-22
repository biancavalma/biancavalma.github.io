-- Update 10: "Let's meet?" proposals between friends, and Close friends (trips only they can see).

-- close friends: each person keeps their own list
create table if not exists public.close_friends (
  owner uuid not null references public.profiles(id) on delete cascade,
  friend uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner, friend)
);
alter table public.close_friends enable row level security;
drop policy if exists "my close friends" on public.close_friends;
create policy "my close friends" on public.close_friends for all using (owner = auth.uid()) with check (owner = auth.uid() and is_friend(friend));

alter table public.trips add column if not exists close boolean not null default false;

create or replace function public.is_close_to(owner uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from close_friends where close_friends.owner = is_close_to.owner and friend = auth.uid());
$$;

-- friends see trips that are not private; trips for close friends only if you are on that list
drop policy if exists "see my and friends trips" on public.trips;
create policy "see my and friends trips" on public.trips for select
  using (user_id = auth.uid() or (is_friend(user_id) and not private and (not close or is_close_to(user_id))));

-- phone alerts only use trips everyone can see, so a close-friends trip is never told to the others
create or replace function public.city_on(u uuid, d date) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select city from trips where user_id = u and not private and not close and d between start_date and end_date order by created_at desc limit 1),
    nullif((select home from profiles where id = u), '')
  );
$$;

-- "Let's meet?": a day and a place proposed to a friend, who answers yes or no
create table if not exists public.meetups (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  city text not null check (char_length(city) between 1 and 40),
  note text check (char_length(note) <= 200),
  status text not null default 'pending' check (status in ('pending', 'yes', 'no')),
  created_at timestamptz not null default now()
);
alter table public.meetups enable row level security;
drop policy if exists "see my meetups" on public.meetups;
create policy "see my meetups" on public.meetups for select using (auth.uid() in (from_user, to_user));

create or replace function public.propose_meetup(other uuid, d date, place text, msg text) returns uuid
language plpgsql security definer set search_path = public as $$
declare nid uuid; nm text;
begin
  if auth.uid() is null or other = auth.uid() or not is_friend(other) then raise exception 'not a friend'; end if;
  if d < current_date then raise exception 'past day'; end if;
  if (select count(*) from meetups where from_user = auth.uid() and created_at > now() - interval '1 day') >= 30 then raise exception 'too many'; end if;
  insert into meetups (from_user, to_user, day, city, note) values (auth.uid(), other, d, left(place, 40), left(coalesce(msg, ''), 200)) returning id into nid;
  select coalesce(nullif(split_part(name, ' ', 1), ''), 'A friend') into nm from profiles where id = auth.uid();
  insert into notifications (user_id, title, body, url)
  values (other, nm || ': let''s meet in ' || left(place, 40) || '?', to_char(d, 'Dy DD Mon') || '. Open Overlap to answer.', '/');
  return nid;
end;
$$;

create or replace function public.answer_meetup(m uuid, yes boolean) returns void
language plpgsql security definer set search_path = public as $$
declare r meetups; nm text;
begin
  select * into r from meetups where id = m and to_user = auth.uid() and status = 'pending';
  if not found then return; end if;
  update meetups set status = case when yes then 'yes' else 'no' end where id = m;
  select coalesce(nullif(split_part(name, ' ', 1), ''), 'Your friend') into nm from profiles where id = auth.uid();
  insert into notifications (user_id, title, body, url)
  values (r.from_user, case when yes then nm || ' said yes 🎉' else nm || ' can''t make it' end,
          r.city || ', ' || to_char(r.day, 'Dy DD Mon'), '/');
end;
$$;

-- my proposals and answers from today on
create or replace function public.my_meetups()
returns table (id uuid, from_user uuid, to_user uuid, day date, city text, note text, status text)
language sql stable security definer set search_path = public as $$
  select id, from_user, to_user, day, city, note, status from meetups
  where auth.uid() in (from_user, to_user) and day >= current_date and status <> 'no'
  order by day;
$$;

revoke execute on function public.propose_meetup(uuid, date, text, text) from public, anon;
revoke execute on function public.answer_meetup(uuid, boolean) from public, anon;
revoke execute on function public.my_meetups() from public, anon;
grant execute on function public.propose_meetup(uuid, date, text, text) to authenticated;
grant execute on function public.answer_meetup(uuid, boolean) to authenticated;
grant execute on function public.my_meetups() to authenticated;
