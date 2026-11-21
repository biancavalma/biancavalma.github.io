-- Update 6: a phone alert when someone asks to share plans with you, and when they accept.

create or replace function public.notify_request() returns trigger
language plpgsql security definer set search_path = public as $$
declare who uuid; nm text;
begin
  select id into who from auth.users where lower(email) = lower(new.to_email) limit 1;
  if who is null then return new; end if;
  select coalesce(nullif(split_part(name, ' ', 1), ''), 'A friend') into nm from profiles where id = new.from_user;
  insert into notifications(user_id, title, body, url)
  values (who, nm || ' wants to share plans', 'Open Overlap and tap Accept to see each other''s trips.', '/');
  return new;
end;
$$;
drop trigger if exists friend_request_alert on public.friend_requests;
create trigger friend_request_alert after insert on public.friend_requests
  for each row execute function public.notify_request();

create or replace function public.notify_friends() returns trigger
language plpgsql security definer set search_path = public as $$
declare other uuid; nm text;
begin
  -- tell the person who did not just accept
  other := case when new.user_a = auth.uid() then new.user_b else new.user_a end;
  if auth.uid() is null or other = auth.uid() then return new; end if;
  select coalesce(nullif(split_part(name, ' ', 1), ''), 'Your friend') into nm from profiles where id = auth.uid();
  insert into notifications(user_id, title, body, url)
  values (other, nm || ' accepted', 'You now see each other''s trips on Overlap.', '/');
  return new;
end;
$$;
drop trigger if exists friendship_alert on public.friendships;
create trigger friendship_alert after insert on public.friendships
  for each row execute function public.notify_friends();
