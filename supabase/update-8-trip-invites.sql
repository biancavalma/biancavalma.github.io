-- Update 8: invite friends to one of your trips. They get an alert, and when they tap Join the trip is added to their own calendar.
create table if not exists public.trip_invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (trip_id, to_user)
);
alter table public.trip_invites enable row level security;
drop policy if exists "see my trip invites" on public.trip_invites;
create policy "see my trip invites" on public.trip_invites for select using (auth.uid() in (from_user, to_user));

-- send invites for one of my trips, only to friends
create or replace function public.invite_to_trip(t uuid, people uuid[]) returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; p uuid; tr trips; nm text; k int;
begin
  select * into tr from trips where id = t and user_id = auth.uid();
  if not found then raise exception 'not your trip'; end if;
  select coalesce(nullif(split_part(name, ' ', 1), ''), 'A friend') into nm from profiles where id = auth.uid();
  foreach p in array coalesce(people, '{}') loop
    if p <> auth.uid() and is_friend(p) then
      insert into trip_invites (trip_id, from_user, to_user) values (t, auth.uid(), p) on conflict (trip_id, to_user) do nothing;
      get diagnostics k = row_count;
      if k > 0 then
        n := n + 1;
        insert into notifications (user_id, title, body, url)
        values (p, nm || ' invites you to ' || tr.city, 'Open Overlap and tap Join to add it to your calendar.', '/');
      end if;
    end if;
  end loop;
  return n;
end;
$$;

-- invites waiting for me
create or replace function public.my_trip_invites()
returns table (id uuid, from_user uuid, from_name text, city text, start_date date, end_date date, emoji text, note text)
language sql stable security definer set search_path = public as $$
  select i.id, i.from_user, pr.name, tr.city, tr.start_date, tr.end_date, tr.emoji, tr.note
  from trip_invites i join trips tr on tr.id = i.trip_id join profiles pr on pr.id = i.from_user
  where i.to_user = auth.uid() and i.status = 'pending' and tr.end_date >= current_date
  order by tr.start_date;
$$;

-- who I invited to my trips, and whether they joined
create or replace function public.my_trip_guests()
returns table (trip_id uuid, to_user uuid, status text)
language sql stable security definer set search_path = public as $$
  select i.trip_id, i.to_user, i.status from trip_invites i where i.from_user = auth.uid();
$$;

-- Join or Not now
create or replace function public.answer_trip_invite(i uuid, yes boolean) returns void
language plpgsql security definer set search_path = public as $$
declare inv trip_invites; tr trips; nm text;
begin
  select * into inv from trip_invites where id = i and to_user = auth.uid() and status = 'pending';
  if not found then return; end if;
  update trip_invites set status = case when yes then 'accepted' else 'declined' end where id = i;
  if yes then
    select * into tr from trips where id = inv.trip_id;
    insert into trips (user_id, city, start_date, end_date, emoji, note)
    values (auth.uid(), tr.city, tr.start_date, tr.end_date, tr.emoji, tr.note);
    select coalesce(nullif(split_part(name, ' ', 1), ''), 'Your friend') into nm from profiles where id = auth.uid();
    insert into notifications (user_id, title, body, url)
    values (inv.from_user, nm || ' joined your ' || tr.city || ' trip', 'You will see it on both calendars.', '/');
  end if;
end;
$$;
grant execute on function public.invite_to_trip(uuid, uuid[]) to authenticated;
grant execute on function public.my_trip_invites() to authenticated;
grant execute on function public.my_trip_guests() to authenticated;
grant execute on function public.answer_trip_invite(uuid, boolean) to authenticated;
