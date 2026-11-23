-- Update 13: see the people you blocked and unblock them
create or replace function public.my_blocks() returns table (id uuid, name text)
language sql security definer set search_path = public stable as $$
  select p.id, p.name from blocks b join profiles p on p.id = b.blocked where b.blocker = auth.uid() order by p.name;
$$;
grant execute on function public.my_blocks() to authenticated;

-- unblocking lets you add each other again (it does not make you friends by itself)
create or replace function public.unblock_user(other uuid) returns void
language sql security definer set search_path = public as $$
  delete from blocks where blocker = auth.uid() and blocked = other;
$$;
grant execute on function public.unblock_user(uuid) to authenticated;

-- one-off: Bianca blocked Ghigo by mistake. Remove the block and make them friends again.
delete from blocks b using profiles a, profiles g
 where a.username = 'bianca' and g.name = 'Ghigo'
   and ((b.blocker = a.id and b.blocked = g.id) or (b.blocker = g.id and b.blocked = a.id));
insert into friendships (user_a, user_b)
select least(a.id, g.id), greatest(a.id, g.id) from profiles a, profiles g
 where a.username = 'bianca' and g.name = 'Ghigo'
on conflict do nothing;

select (select count(*) from blocks b join profiles a on a.id = b.blocker join profiles g on g.id = b.blocked where a.username = 'bianca' and g.name = 'Ghigo') as blocks_left,
       (select count(*) from friendships f join profiles a on a.username = 'bianca' join profiles g on g.name = 'Ghigo' where f.user_a = least(a.id, g.id) and f.user_b = greatest(a.id, g.id)) as friends_again;
