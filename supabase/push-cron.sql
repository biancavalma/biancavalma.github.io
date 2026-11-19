-- Run this second, after the app is live on Vercel.
-- Replace the two values in capitals, then paste into Supabase > SQL Editor and press Run.
-- It asks the app to send any waiting notifications every 2 minutes.

select cron.schedule(
  'overlap-push',
  '*/2 * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR-APP-ADDRESS/api/send',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-CRON-SECRET')
  )
  where exists (select 1 from public.notifications where sent_at is null);
  $$
);
