-- Exact guest rendezvous points for the operator map. These are intentionally
-- separate from office addresses: they describe where a traveler meets a tour.
alter table public.operator_applications add column if not exists meeting_point_name text default '';
alter table public.operator_applications add column if not exists meeting_point_lat double precision;
alter table public.operator_applications add column if not exists meeting_point_lng double precision;
alter table public.operator_applications add column if not exists meeting_instructions text default '';

alter table public.operators add column if not exists meeting_point_name text default '';
alter table public.operators add column if not exists meeting_point_lat double precision;
alter table public.operators add column if not exists meeting_point_lng double precision;
alter table public.operators add column if not exists meeting_instructions text default '';

alter table public.operator_applications drop constraint if exists operator_application_meeting_coordinates;
alter table public.operator_applications add constraint operator_application_meeting_coordinates check (
  (meeting_point_lat is null and meeting_point_lng is null)
  or (meeting_point_lat between -90 and 90 and meeting_point_lng between -180 and 180)
);

alter table public.operators drop constraint if exists operator_meeting_coordinates;
alter table public.operators add constraint operator_meeting_coordinates check (
  (meeting_point_lat is null and meeting_point_lng is null)
  or (meeting_point_lat between -90 and 90 and meeting_point_lng between -180 and 180)
);

drop function if exists public.approve_operator_application(uuid);
create or replace function public.approve_operator_application(application_id uuid, notes text default '')
returns text language plpgsql security definer set search_path = public as $$
declare
  app public.operator_applications%rowtype;
  new_operator_id text;
begin
  if not public.is_team_member() then raise exception 'Not authorized'; end if;
  select * into app from public.operator_applications where id = application_id for update;
  if not found then raise exception 'Application not found'; end if;
  if app.agreement_accepted_at is null or app.agreement_signature not like 'data:image/png;base64,%' then
    raise exception 'Signed operator agreement required';
  end if;
  if app.meeting_point_lat is null or app.meeting_point_lng is null then
    raise exception 'Exact guest meeting point required';
  end if;

  new_operator_id := regexp_replace(lower(app.company_name), '[^a-z0-9]+', '-', 'g') || '-' || substr(app.id::text, 1, 8);
  insert into public.operators (
    id,name,status,email,phone,whatsapp,website,regions,categories,
    meeting_point_name,meeting_point_lat,meeting_point_lng,meeting_instructions
  ) values (
    new_operator_id,app.company_name,'active',app.email,app.phone,app.whatsapp,app.website,array_to_string(app.regions,', '),app.categories,
    app.meeting_point_name,app.meeting_point_lat,app.meeting_point_lng,app.meeting_instructions
  )
  on conflict (id) do update set
    status='active',
    meeting_point_name=excluded.meeting_point_name,
    meeting_point_lat=excluded.meeting_point_lat,
    meeting_point_lng=excluded.meeting_point_lng,
    meeting_instructions=excluded.meeting_instructions,
    updated_at=now();
  insert into public.operator_memberships (operator_id,user_id,role) values (new_operator_id,app.user_id,'owner') on conflict do nothing;
  insert into public.operator_portal_state (operator_id,state) values (new_operator_id,jsonb_build_object('profile',jsonb_build_object('name',app.company_name,'email',app.email,'phone',app.phone,'whatsapp',app.whatsapp,'website',app.website,'blurb',app.description))) on conflict do nothing;
  update public.operator_applications set status='approved',review_notes=coalesce(notes,''),reviewed_at=now(),reviewed_by=auth.uid(),updated_at=now() where id=application_id;
  return new_operator_id;
end; $$;

grant execute on function public.approve_operator_application(uuid,text) to authenticated;
