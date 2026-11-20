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
