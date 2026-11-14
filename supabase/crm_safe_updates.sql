-- Atomic field updates. RLS remains enforced, and conflicting edits are rejected.
create or replace function public.patch_crm_record(record_kind text, record_id text, changes jsonb, expected jsonb)
returns void language plpgsql security invoker set search_path = public as $$
declare current_record jsonb; field_name text;
begin
  if not public.is_team_member() then raise exception 'Team sign-in required'; end if;
  if jsonb_typeof(changes) <> 'object' or jsonb_typeof(expected) <> 'object' then
    raise exception 'Invalid CRM update';
  end if;
  if record_kind = 'operator' then
    insert into public.crm_operator_overlays(operator_id, overlay) values(record_id, '{}') on conflict do nothing;
    select overlay into current_record from public.crm_operator_overlays where operator_id=record_id for update;
  elsif record_kind = 'customer' then
    insert into public.crm_customers(id, record) values(record_id, '{}') on conflict do nothing;
    select record into current_record from public.crm_customers where id=record_id for update;
  else raise exception 'Invalid CRM record kind'; end if;
  for field_name in select jsonb_object_keys(changes) loop
    if coalesce(current_record->field_name, 'null'::jsonb) is distinct from coalesce(expected->field_name, 'null'::jsonb)
      and coalesce(current_record->field_name, 'null'::jsonb) is distinct from changes->field_name then
      raise exception 'Another teammate changed %. Your edit was not overwritten. Export your local changes, then refresh and review this record.', field_name;
    end if;
  end loop;
  if record_kind = 'operator' then
    update public.crm_operator_overlays set overlay=current_record || changes, updated_at=now() where operator_id=record_id;
  else
    update public.crm_customers set record=current_record || changes || jsonb_build_object('updatedAt',now()), updated_at=now() where id=record_id;
  end if;
end; $$;
