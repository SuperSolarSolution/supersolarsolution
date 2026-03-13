
SELECT cron.schedule(
  'process-sips-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://wtjxsmagzqpmjftvvcki.supabase.co/functions/v1/process-sips',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0anhzbWFnenFwbWpmdHZ2Y2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMDQwMDgsImV4cCI6MjA4Mjc4MDAwOH0.eiJwN3fU4cR6yy8iacRIssqPKjEDcaQsMz79royaxC0"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
