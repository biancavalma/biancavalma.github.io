-- Update 9: ready for the App Store. Block and report people, and a test account for Apple's reviewers.

-- blocking: no friendship, no requests, no invites between the two people
create table if not exists public.blocks (
  blocker uuid not null references public.profiles(id) on delete cascade,
  blocked uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);
alter table public.blocks enable row level security;
drop policy if exists "see my blocks" on public.blocks;
create policy "see my blocks" on public.blocks for select using (auth.uid() = blocker);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid references public.profiles(id) on delete set null,
  reported uuid references public.profiles(id) on delete set null,
  reason text check (char_length(reason) <= 500),
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;

create or replace function public.is_blocked(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from blocks where (blocker = a and blocked = b) or (blocker = b and blocked = a));
$$;

create or replace function public.block_user(other uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or other is null or other = auth.uid() then raise exception 'invalid'; end if;
  insert into blocks (blocker, blocked) values (auth.uid(), other) on conflict do nothing;
  delete from friendships where user_a = least(auth.uid(), other) and user_b = greatest(auth.uid(), other);
  delete from friend_requests where (from_user = other and to_email = (select lower(email) from auth.users where id = auth.uid()))
    or (from_user = auth.uid() and to_email = (select lower(email) from auth.users where id = other));
  delete from trip_invites where (from_user = other and to_user = auth.uid()) or (from_user = auth.uid() and to_user = other);
end;
$$;

-- a report also blocks, and tells the person who runs Overlap
create or replace function public.report_user(other uuid, why text) returns void
language plpgsql security definer set search_path = public as $$
declare admin uuid;
begin
  if auth.uid() is null or other is null or other = auth.uid() then raise exception 'invalid'; end if;
  insert into reports (reporter, reported, reason) values (auth.uid(), other, left(coalesce(why, ''), 500));
  perform block_user(other);
  select id into admin from auth.users where lower(email) = 'bianca.valmarana@gmail.com';
  if admin is not null then
    insert into notifications (user_id, title, body, url) values (admin, 'Overlap: someone was reported', 'Open Supabase, table reports, to see it.', '/');
  end if;
end;
$$;
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.report_user(uuid, text) to authenticated;

-- blocked people cannot send requests or become friends again
create or replace function public.stop_blocked_request() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from auth.users u where lower(u.email) = new.to_email and is_blocked(new.from_user, u.id)) then return null; end if;
  return new;
end;
$$;
drop trigger if exists friend_request_blocked on public.friend_requests;
create trigger friend_request_blocked before insert on public.friend_requests for each row execute function public.stop_blocked_request();

create or replace function public.stop_blocked_friendship() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if is_blocked(new.user_a, new.user_b) then return null; end if;
  return new;
end;
$$;
drop trigger if exists friendship_blocked on public.friendships;
create trigger friendship_blocked before insert on public.friendships for each row execute function public.stop_blocked_friendship();

-- test account for Apple's reviewers (signs in with a password, no email code), with one friend and a few trips
do $$
declare rid uuid := '0f0e0d0c-0b0a-4000-8000-000000000001'; fid uuid := '0f0e0d0c-0b0a-4000-8000-000000000002'; u record;
begin
  for u in select * from (values (rid, 'review.overlap@example.com', '$2a$10$2dZPv/ROwguVpxOoX2CNtuwQ2KkAm/JWu8sVb11q6yWJm2T/AeXOu'), (fid, 'sam.overlap@example.com', '$2a$10$abcdefghijklmnopqrstuuJ0F1nT7vZ3WkWnq0b8l0aZbEo8m6q2W')) as t(id, email, pw) loop
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    values ('00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email, u.pw, now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
    on conflict (id) do update set encrypted_password = excluded.encrypted_password;
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now())
    on conflict do nothing;
  end loop;
  insert into profiles (id) values (rid), (fid) on conflict do nothing;
  update profiles set name = 'Alex Review', home = 'Florence' where id = rid;
  update profiles set name = 'Sam Example', home = 'London' where id = fid;
  begin
    update profiles set username = 'alex_review', phone = '+39 333 000 0001' where id = rid;
    update profiles set username = 'sam_example', phone = '+44 7700 900001' where id = fid;
  exception when others then null;
  end;
  insert into friendships (user_a, user_b) values (least(rid, fid), greatest(rid, fid)) on conflict do nothing;
  delete from trips where user_id in (rid, fid);
  insert into trips (user_id, city, start_date, end_date) values
    (rid, 'Paris', current_date + 10, current_date + 14),
    (rid, 'London', current_date + 30, current_date + 33),
    (fid, 'Florence', current_date + 3, current_date + 6),
    (fid, 'Paris', current_date + 12, current_date + 16);
end;
$$;
