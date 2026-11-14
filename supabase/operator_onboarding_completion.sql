begin;
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
 if company_status<>'active' and invitation.role<>'owner' then raise exception 'The owner must complete onboarding before additional staff can join';end if;
 if exists(select 1 from public.operator_memberships where user_id=auth.uid() and (operator_id<>invitation.operator_id or status='suspended')) then raise exception 'An existing operator membership needs staff review before accepting this invitation';end if;
 if invitation.role='owner' and exists(select 1 from public.operator_memberships where operator_id=invitation.operator_id and role='owner' and status='active' and user_id<>auth.uid()) then raise exception 'This operator already has an owner. Contact TicoWild';end if;
 insert into public.operator_memberships(operator_id,user_id,role,status) values(invitation.operator_id,auth.uid(),invitation.role,'active') on conflict(operator_id,user_id) do nothing;
 insert into public.operator_portal_state(operator_id) values(invitation.operator_id) on conflict do nothing;
 update public.operator_invites set accepted_at=now() where id=invitation.id;
 update public.operators set status='onboarding',updated_at=now() where id=invitation.operator_id and status='invited';
 if company_status in ('invited','onboarding') then
  insert into public.operator_applications(user_id,email,company_name) select auth.uid(),verified_email,name from public.operators where id=invitation.operator_id on conflict(user_id) do nothing;
 end if;
 return invitation.operator_id;
end; $$;
revoke all on function public.accept_operator_invitation() from public,anon;
grant execute on function public.accept_operator_invitation() to authenticated;

create or replace function public.approve_operator_application(application_id uuid, notes text default '')
returns text language plpgsql security definer set search_path = public as $$
declare
  app public.operator_applications%rowtype;
  new_operator_id text; linked_id text;
begin
  if not public.is_team_member() then raise exception 'Not authorized'; end if;
  select * into app from public.operator_applications where id = application_id for update;
  if not found then raise exception 'Application not found'; end if;
  select operator_id into linked_id from public.operator_memberships where user_id=app.user_id and status='active' and role='owner' order by created_at limit 1;
  if app.status='approved' and linked_id is not null and exists(select 1 from public.operators where id=linked_id and status='active') then return linked_id;end if;
  if app.status<>'pending' then raise exception 'The operator must submit the application before approval';end if;
  if not exists(select 1 from auth.users where id=app.user_id and email_confirmed_at is not null) then raise exception 'Verified operator email required';end if;
  if length(trim(app.company_name))<2 then raise exception 'Company name required';end if;
  if app.agreement_accepted_at is null or coalesce(app.agreement_signature,'') not like 'data:image/png;base64,%' then
    raise exception 'Signed operator agreement required';
  end if;
  if app.meeting_point_lat is null or app.meeting_point_lng is null or not (app.meeting_point_lat between -90 and 90) or not (app.meeting_point_lng between -180 and 180) then
    raise exception 'Exact guest meeting point required';
  end if;

  if linked_id is not null and not exists(select 1 from public.operators where id=linked_id and status in ('onboarding','invited','active')) then raise exception 'Linked company requires staff access review';end if;
  new_operator_id := coalesce(linked_id,regexp_replace(lower(app.company_name), '[^a-z0-9]+', '-', 'g') || '-' || substr(app.id::text, 1, 8));
  insert into public.operators (id,name,status,email,phone,whatsapp,website,regions,categories,meeting_point_name,meeting_point_lat,meeting_point_lng,meeting_instructions)
  values (new_operator_id,app.company_name,'active',app.email,app.phone,app.whatsapp,app.website,array_to_string(app.regions,', '),app.categories,app.meeting_point_name,app.meeting_point_lat,app.meeting_point_lng,app.meeting_instructions)
  on conflict (id) do update set status='active',meeting_point_name=excluded.meeting_point_name,meeting_point_lat=excluded.meeting_point_lat,meeting_point_lng=excluded.meeting_point_lng,meeting_instructions=excluded.meeting_instructions,updated_at=now();
  insert into public.operator_memberships (operator_id,user_id,role) values (new_operator_id,app.user_id,'owner') on conflict do nothing;
  insert into public.operator_portal_state (operator_id,state) values (new_operator_id,jsonb_build_object('profile',jsonb_build_object('name',app.company_name,'email',app.email,'phone',app.phone,'whatsapp',app.whatsapp,'website',app.website,'blurb',app.description))) on conflict do nothing;
  update public.operator_applications set status='approved',review_notes=coalesce(notes,''),reviewed_at=now(),reviewed_by=auth.uid(),updated_at=now() where id=application_id;
  return new_operator_id;
end; $$;

grant execute on function public.approve_operator_application(uuid,text) to authenticated;


commit;
