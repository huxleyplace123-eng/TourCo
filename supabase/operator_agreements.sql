begin;
create table if not exists public.operator_agreement_requests (
 id uuid primary key default gen_random_uuid(), operator_id text not null, company_name text not null,
 recipient_email text not null, version text not null, sections jsonb not null,
 created_at timestamptz not null default now(),created_by uuid references auth.users(id),
 expires_at timestamptz not null default now()+interval '30 days', opened_at timestamptz,
 signed_at timestamptz,signed_by uuid references auth.users(id), signed_data jsonb,
 events jsonb not null default '[]'
);
alter table public.operator_agreement_requests enable row level security;
revoke all on public.operator_agreement_requests from anon,authenticated;
grant select on public.operator_agreement_requests to authenticated;
drop policy if exists "agreement parties read" on public.operator_agreement_requests;
create policy "agreement parties read" on public.operator_agreement_requests for select to authenticated using(
 public.is_team_member() or exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and lower(u.email)=recipient_email)
);
-- Avoid granting direct access to auth.users in a policy.
create or replace function public.agreement_recipient(address text) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and lower(email)=address)
$$;
drop policy "agreement parties read" on public.operator_agreement_requests;
create policy "agreement parties read" on public.operator_agreement_requests for select to authenticated using(is_team_member() or agreement_recipient(recipient_email));
create or replace function public.prepare_operator_agreement(op_id text,company text,recipient text,doc_version text,doc_sections jsonb) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare result uuid;
begin
 if not is_team_member() then raise exception 'Team access required';end if;
 recipient:=lower(trim(recipient));
 if length(trim(company))<2 or length(op_id)<1 or recipient !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or jsonb_typeof(doc_sections)<>'array' or jsonb_array_length(doc_sections)<1 or length(doc_sections::text)>100000 then raise exception 'Valid operator, recipient and agreement required';end if;
 perform pg_advisory_xact_lock(hashtext(op_id||recipient));
 select id into result from operator_agreement_requests where operator_id=op_id and recipient_email=recipient and version=doc_version and sections=doc_sections and (signed_at is not null or expires_at>now()) order by created_at desc limit 1;
 if result is not null then return result;end if;
 if not exists(select 1 from operators where id=op_id and status='active') and not exists(select 1 from operator_memberships where operator_id=op_id and status='active' and role='owner') then
 perform invite_operator(op_id,company,recipient,'owner');
 end if;
 insert into operator_agreement_requests(operator_id,company_name,recipient_email,version,sections,created_by) values(op_id,company,recipient,doc_version,doc_sections,auth.uid()) returning id into result;
 return result;
end $$;
create or replace function public.record_agreement_event(request_id uuid,event_kind text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not is_team_member() then raise exception 'Team access required';end if;
 if event_kind not in ('email_accepted','email_unknown','whatsapp_opened','link_copied') then raise exception 'Invalid event';end if;
 update operator_agreement_requests set events=events||jsonb_build_array(jsonb_build_object('kind',event_kind,'at',now(),'by',auth.uid())) where id=request_id;
 if not found then raise exception 'Agreement not found';end if;
end $$;
create or replace function public.open_operator_agreement(request_id uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update operator_agreement_requests set opened_at=coalesce(opened_at,now()) where id=request_id and agreement_recipient(recipient_email) and (expires_at>now() or signed_at is not null);
 if not found then raise exception 'Use the invited, verified email to open this agreement, or request a fresh link';end if;
end $$;
create or replace function public.sign_operator_agreement(request_id uuid,details jsonb) returns public.operator_agreement_requests language plpgsql security definer set search_path=public,pg_temp as $$
declare req public.operator_agreement_requests;begin
 select * into req from operator_agreement_requests where id=request_id for update;
 if not found or not agreement_recipient(req.recipient_email) then raise exception 'Only the verified recipient may sign';end if;
 if req.signed_at is not null then return req;end if;
 if req.expires_at<=now() then raise exception 'Agreement expired. Ask TicoWild for a new link';end if;
 if length(trim(coalesce(details->>'legalName','')))<2 or length(trim(coalesce(details->>'signerName','')))<2 or length(trim(coalesce(details->>'title','')))<1 or coalesce(details->>'signature','') !~ '^data:image/png;base64,[A-Za-z0-9+/=]+$' or length(details->>'signature')>500000 then raise exception 'Name, title and drawn signature required';end if;
 update operator_agreement_requests set signed_at=now(),signed_by=auth.uid(),signed_data=jsonb_build_object('legalName',details->>'legalName','signerName',details->>'signerName','title',details->>'title','phone',details->>'phone','category',details->>'category','location',details->>'location','email',req.recipient_email,'signature',details->>'signature','acceptedAt',now(),'agreementVersion',req.version) where id=request_id returning * into req;
 return req;
end $$;
revoke all on function public.agreement_recipient(text),public.prepare_operator_agreement(text,text,text,text,jsonb),public.record_agreement_event(uuid,text),public.open_operator_agreement(uuid),public.sign_operator_agreement(uuid,jsonb) from public,anon;
grant execute on function public.agreement_recipient(text),public.prepare_operator_agreement(text,text,text,text,jsonb),public.record_agreement_event(uuid,text),public.open_operator_agreement(uuid),public.sign_operator_agreement(uuid,jsonb) to authenticated;
commit;
