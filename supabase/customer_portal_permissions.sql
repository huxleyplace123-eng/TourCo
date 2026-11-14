-- Pending live application and role-based verification.
-- Preserve existing team/operator policies; narrow only customer self-service.
begin;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and lower(email) = lower(auth.jwt() ->> 'email'));
drop policy if exists "own trips" on public.trips;
drop policy if exists "own bookings" on public.bookings;
drop policy if exists "own messages" on public.messages;
drop policy if exists "customer reads own trips" on public.trips;
create policy "customer reads own trips" on public.trips for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists "customer reads own bookings" on public.bookings;
create policy "customer reads own bookings" on public.bookings for select to authenticated
  using (auth.uid() = user_id and exists (
    select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()
  ));
drop policy if exists "customer reads own messages" on public.messages;
create policy "customer reads own messages" on public.messages for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists "customer sends own messages" on public.messages;
create policy "customer sends own messages" on public.messages for insert to authenticated
  with check (auth.uid() = user_id and "from" = 'customer' and length(trim(text)) between 1 and 5000);
commit;
