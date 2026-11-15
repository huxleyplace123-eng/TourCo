-- Requires portal_email_dispatch_secret to be provisioned through the Vault UI.
-- The function is private; cron owns invocation. No credential is embedded in SQL history.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create or replace function public.dispatch_portal_email_job()
returns bigint language plpgsql security definer set search_path='' as $$
declare token text; request_id bigint;
begin
 if not exists(select 1 from public.email_notification_settings where mode<>'off') then return null;end if;
 select decrypted_secret into token from vault.decrypted_secrets where name='portal_email_dispatch_secret';
 if token is null then raise exception 'Notification scheduler secret is missing';end if;
 select net.http_post(
   url:='https://shfdttsjlesarepmehnu.supabase.co/functions/v1/portal-email/dispatch',
   headers:=jsonb_build_object('Content-Type','application/json','x-dispatch-secret',token),
   body:='{}'::jsonb,timeout_milliseconds:=60000
 ) into request_id;
 return request_id;
end $$;
revoke all on function public.dispatch_portal_email_job() from public,anon,authenticated;
select cron.schedule('ticowild-portal-email','* * * * *','select public.dispatch_portal_email_job();');
