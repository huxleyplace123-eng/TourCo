begin;
-- Linking happens only after verified sign-in, including accounts created before the invite.
create or replace function public.handle_new_operator_user()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if coalesce(new.raw_user_meta_data->>'account_type','')='operator' then
  insert into public.operator_applications(user_id,email,company_name)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'company_name','')) on conflict(user_id) do nothing;
 end if;
 return new;
end; $$;
create or replace function public.accept_operator_invitation()
returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare verified_email text; invitation public.operator_invites%rowtype; company_status text;
begin
 select lower(trim(email)) into verified_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if verified_email is null then raise exception 'Verify your email before connecting an operator account';end if;
 perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
 select * into invitation from public.operator_invites where lower(trim(email))=verified_email and accepted_at is null and expires_at>now() order by created_at desc limit 1 for update;
 if not found then return null;end if;
 select status into company_status from public.operators where id=invitation.operator_id for update;
 if company_status not in ('invited','onboarding','active') then raise exception 'This operator account is unavailable. Contact TicoWild';end if;
 if exists(select 1 from public.operator_memberships where user_id=auth.uid() and (operator_id<>invitation.operator_id or status='suspended')) then raise exception 'An existing operator membership needs staff review before accepting this invitation';end if;
 if invitation.role='owner' and exists(select 1 from public.operator_memberships where operator_id=invitation.operator_id and role='owner' and status='active' and user_id<>auth.uid()) then raise exception 'This operator already has an owner. Contact TicoWild';end if;
 insert into public.operator_memberships(operator_id,user_id,role,status) values(invitation.operator_id,auth.uid(),invitation.role,'active') on conflict(operator_id,user_id) do nothing;
 insert into public.operator_portal_state(operator_id) values(invitation.operator_id) on conflict do nothing;
 update public.operator_invites set accepted_at=now() where id=invitation.id;
 update public.operators set status='onboarding',updated_at=now() where id=invitation.operator_id and status='invited';
 return invitation.operator_id;
end; $$;
revoke all on function public.accept_operator_invitation() from public,anon;
grant execute on function public.accept_operator_invitation() to authenticated;
commit;
