-- ============================================================
-- OWL VISION PM PORTAL — RLS POLICIES  (0002, v0.1)
-- Postgres / Supabase. Run in the SQL editor top to bottom.
--
-- 0001 enabled row level security on every table but only wrote
-- policies for events, intake_sections and crew_members. RLS with
-- no policy denies everything, so the rest of the tables currently
-- read as empty and refuse every write.
--
-- This file finishes the job. Same rule throughout:
--
--     read   any signed-in employee
--     write  the assigned PM, plus admin and sales
--
-- Safe to run more than once — every policy is dropped first.
-- ============================================================


-- ---------- 1. walking up to the event ----------------------
-- labor_days, shifts and shift_slots have no event_id. Each one
-- knows only its parent, so the chain is
--
--     shift_slots -> shifts -> labor_days -> labor_quotes -> events
--
-- These helpers walk it. They are security definer so the lookup
-- itself is not subject to the policies being defined here, which
-- would otherwise recurse.
--
-- Each takes the PARENT key, not the row's own id. That matters on
-- insert: a new row is not in the table yet, so resolving through
-- its own id would return null and deny every insert.

create or replace function event_of_labor_quote(q uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select event_id from labor_quotes where id = q
$$;

create or replace function event_of_labor_day(d uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select lq.event_id
    from labor_days ld
    join labor_quotes lq on lq.id = ld.labor_quote_id
   where ld.id = d
$$;

create or replace function event_of_shift(s uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select lq.event_id
    from shifts sh
    join labor_days   ld on ld.id = sh.labor_day_id
    join labor_quotes lq on lq.id = ld.labor_quote_id
   where sh.id = s
$$;

-- Resolves a slot straight to its event. Not used by the policies
-- below, which go through shift_id, but phase 3 needs it:
-- task_assignments references shift_slot_id and nothing else.
create or replace function event_of_shift_slot(sl uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select lq.event_id
    from shift_slots ss
    join shifts       sh on sh.id = ss.shift_id
    join labor_days   ld on ld.id = sh.labor_day_id
    join labor_quotes lq on lq.id = ld.labor_quote_id
   where ss.id = sl
$$;


-- ---------- 2. intake children ------------------------------
-- All four carry event_id, so they check it directly.

drop policy if exists read_all    on intake_notes;
drop policy if exists write_notes on intake_notes;
create policy read_all on intake_notes
  for select using (auth.uid() is not null);
create policy write_notes on intake_notes
  for all using (can_write_event(event_id))
  with check (can_write_event(event_id));

drop policy if exists read_all       on event_contacts;
drop policy if exists write_contacts on event_contacts;
create policy read_all on event_contacts
  for select using (auth.uid() is not null);
create policy write_contacts on event_contacts
  for all using (can_write_event(event_id))
  with check (can_write_event(event_id));

-- Note: this governs the ROW only. The photo itself lives in a
-- storage bucket with its own policies on storage.objects, which
-- are not written yet. Task 7.
drop policy if exists read_all     on intake_photos;
drop policy if exists write_photos on intake_photos;
create policy read_all on intake_photos
  for select using (auth.uid() is not null);
create policy write_photos on intake_photos
  for all using (can_write_event(event_id))
  with check (can_write_event(event_id));

drop policy if exists read_all         on follow_up_items;
drop policy if exists write_follow_ups on follow_up_items;
create policy read_all on follow_up_items
  for select using (auth.uid() is not null);
create policy write_follow_ups on follow_up_items
  for all using (can_write_event(event_id))
  with check (can_write_event(event_id));


-- ---------- 3. labor ----------------------------------------
-- labor_quotes has event_id. The three below it walk up.

drop policy if exists read_all     on labor_quotes;
drop policy if exists write_quotes on labor_quotes;
create policy read_all on labor_quotes
  for select using (auth.uid() is not null);
create policy write_quotes on labor_quotes
  for all using (can_write_event(event_id))
  with check (can_write_event(event_id));

drop policy if exists read_all   on labor_days;
drop policy if exists write_days on labor_days;
create policy read_all on labor_days
  for select using (auth.uid() is not null);
create policy write_days on labor_days
  for all using (can_write_event(event_of_labor_quote(labor_quote_id)))
  with check (can_write_event(event_of_labor_quote(labor_quote_id)));

drop policy if exists read_all     on shifts;
drop policy if exists write_shifts on shifts;
create policy read_all on shifts
  for select using (auth.uid() is not null);
create policy write_shifts on shifts
  for all using (can_write_event(event_of_labor_day(labor_day_id)))
  with check (can_write_event(event_of_labor_day(labor_day_id)));

-- The load-bearing one. A slot with no crew_member_id is a real,
-- writable row — quotes go out long before the job is staffed, so
-- nothing here may require a name.
drop policy if exists read_all    on shift_slots;
drop policy if exists write_slots on shift_slots;
create policy read_all on shift_slots
  for select using (auth.uid() is not null);
create policy write_slots on shift_slots
  for all using (can_write_event(event_of_shift(shift_id)))
  with check (can_write_event(event_of_shift(shift_id)));


-- ---------- 4. roster ---------------------------------------
-- crew_member_positions is the odd one out: it belongs to a person,
-- not an event, so there is no event to check. It follows the rule
-- already on crew_members in 0001 — admin and sales maintain the
-- roster, everyone else reads it.

drop policy if exists read_all           on crew_member_positions;
drop policy if exists write_crew_positions on crew_member_positions;
create policy read_all on crew_member_positions
  for select using (auth.uid() is not null);
create policy write_crew_positions on crew_member_positions
  for all using (my_role() in ('admin','sales'))
  with check (my_role() in ('admin','sales'));


-- ---------- 5. event_stages ---------------------------------
-- NOT on the task 1 list, but included deliberately.
--
-- event_stages has a read policy in 0001 and no write policy, and
-- createEvent() in src/lib/api.js inserts the five stage rows right
-- after inserting the event. Without this, task 4 fails: the event
-- saves, the stages do not, and the dashboard chain has nothing to
-- read. Cheaper to fix here than to debug there.

drop policy if exists write_stages on event_stages;
create policy write_stages on event_stages
  for all using (can_write_event(event_id))
  with check (can_write_event(event_id));


-- ---------- 6. what is still deliberately closed ------------
-- profiles      read only. Task 2 adds a theme column and needs a
--               self-update policy — see the note in that task, it
--               must not let anyone change their own role.
-- positions     read only. Nobody can add a position yet. Fine for
--               phase 1; the 14 seeded rows are the whole library.
-- events        no delete policy. Cancelling sets status, which is
--               what listEvents already filters on.
