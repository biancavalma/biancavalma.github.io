-- Update 12: send notifications to iPhones straight from the database, every minute (no other server needed)
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

create or replace function public.send_pushes() returns void
language plpgsql security definer set search_path = public as $$
declare ids bigint[]; msgs jsonb;
begin
  -- anything older than a day is no longer news: mark it done without sending
  update notifications set sent_at = now() where sent_at is null and created_at < now() - interval '1 day';
  select array_agg(id) into ids from (select id from notifications where sent_at is null order by id limit 30) x;
  if ids is null then return; end if;
  select jsonb_agg(jsonb_build_object('to', s.endpoint, 'title', n.title, 'body', n.body, 'sound', 'default',
           'data', jsonb_build_object('url', n.url)))
    into msgs
    from notifications n join push_subscriptions s on s.user_id = n.user_id and s.endpoint like 'ExponentPushToken%'
   where n.id = any(ids);
  update notifications set sent_at = now() where id = any(ids);
  if msgs is not null then
    perform net.http_post(url := 'https://exp.host/--/api/v2/push/send', body := msgs,
      headers := '{"Content-Type":"application/json","Accept":"application/json"}'::jsonb);
  end if;
end $$;
revoke execute on function public.send_pushes() from public, anon, authenticated;

-- replace the old job that waited for a server we never used
select cron.unschedule(jobid) from cron.job where jobname = 'overlap-push';
select cron.schedule('overlap-push', '* * * * *', 'select public.send_pushes()');

select 'Update 12 done' as result;
