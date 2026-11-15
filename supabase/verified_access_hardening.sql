-- Run after unified_crm.sql. No records are deleted or existing team roles changed.
begin;
drop policy if exists "public can create inquiries" on public.public_inquiries;
create policy "public can create inquiries" on public.public_inquiries
  for insert with check (status = 'new' or public.is_team_member());

create or replace function public.handle_ticowild_team_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(new.email, '')) = 'ticowildtours@gmail.com'
     and new.email_confirmed_at is not null then
    insert into public.team_members (user_id, role) values (new.id, 'admin')
    on conflict (user_id) do update set role = 'admin';
  end if;
  return new;
end; $$;
drop trigger if exists on_ticowild_team_user_created on auth.users;
create trigger on_ticowild_team_user_created
  after insert or update of email, email_confirmed_at on auth.users
  for each row execute function public.handle_ticowild_team_user();
commit;
