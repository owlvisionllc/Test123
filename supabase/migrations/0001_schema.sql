-- ============================================================
-- OWL VISION PM PORTAL — PHASE 1 SCHEMA  (v0.1)
-- Postgres / Supabase. Run in the SQL editor top to bottom.
--
-- Phase 1 covers: auth + roles, crew roster, event record,
-- intake (PM app), labor quote with NAMED PERSON SLOTS.
-- Phase 3+ tables (tasks, assignments, schedule) are sketched
-- at the bottom, commented out, so the shape is on record.
-- ============================================================


-- ---------- 0. extensions -----------------------------------
create extension if not exists "pgcrypto";


-- ---------- 1. enums ----------------------------------------
create type app_role as enum ('admin', 'sales', 'pm', 'shop');

create type event_stage_status as enum ('not_started', 'in_progress', 'blocked', 'complete');

create type event_status as enum ('lead', 'active', 'closed', 'cancelled');

create type department as enum ('audio','lighting','video','led','staging','rigging','power','drape','sfx','streaming','general');

-- shift kinds map to how the labor tool already thinks
create type shift_kind as enum ('install','show','strike','other');


-- ---------- 2. people ---------------------------------------

-- Mirrors auth.users. Google sign-in restricted to the company
-- domain in Supabase Auth settings; this table holds the role.
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  email         text not null unique,
  role          app_role not null default 'pm',
  phone         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- The position library. Show positions live here.
-- Seeded below; admins can add.
create table positions (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  short_code    text not null,               -- A1, V1, LD, LEDT
  dept          department not null,
  is_lead       boolean not null default false,
  sort_order    int not null default 100
);

-- THE ROSTER. Not everyone here has a login — most crew never
-- sign in. profile_id is null for anyone who is only ever staffed.
create table crew_members (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references profiles(id) on delete set null,
  full_name     text not null,
  phone         text,
  email         text,
  is_staff      boolean not null default false,   -- W2 vs freelance
  notes         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Which positions a person can actually hold. Drives the
-- dropdown when a PM fills a slot on the positions list.
create table crew_member_positions (
  crew_member_id uuid not null references crew_members(id) on delete cascade,
  position_id    uuid not null references positions(id) on delete cascade,
  is_primary     boolean not null default false,
  primary key (crew_member_id, position_id)
);


-- ---------- 3. the event ------------------------------------

create table events (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,            -- "Lally Events — Menlo Circus Club"
  client_name       text,
  venue_name        text,

  event_date        date,                     -- first show day, drives folder name
  load_in_at        timestamptz,
  load_out_at       timestamptz,
  prep_date         date,                     -- show-stopper
  return_date       date,                     -- show-stopper

  -- Flex lives OUTSIDE this system. We store the pointer only.
  flex_q_number     text,
  flex_quote_opened boolean not null default false,

  dropbox_folder    text,                     -- "10-4-26 SVN West Lally Events"
  filed_at          timestamptz,              -- set by "I have filed this"

  assigned_pm       uuid references profiles(id) on delete set null,
  created_by        uuid references profiles(id) on delete set null,
  status            event_status not null default 'active',

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index on events (assigned_pm);
create index on events (event_date);

-- One row per stage, per event. This is what the dashboard
-- chain reads. Recomputed by the app, not by triggers, so the
-- rules stay in one place (TypeScript) instead of two.
create table event_stages (
  event_id      uuid not null references events(id) on delete cascade,
  stage         text not null check (stage in ('intake','labor','positions','tasks','schedule')),
  status        event_stage_status not null default 'not_started',
  blocker_count int not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (event_id, stage)
);


-- ---------- 4. intake (the PM app) --------------------------

-- 18 sections + Production Scope. Stored as jsonb per section
-- so the form can change without a migration every time.
create table intake_sections (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  section_key   text not null,                -- 'job_setup', 'power', ...
  data          jsonb not null default '{}'::jsonb,
  answered      int not null default 0,
  total         int not null default 0,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references profiles(id) on delete set null,
  unique (event_id, section_key)
);

-- The blue box. Every page can write one; the report collects
-- them and tags them with where they came from.
create table intake_notes (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  section_key   text not null,
  body          text not null,
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- Everyone who walked the building, with a number and an email.
-- Also used for "who do we email about their power?".
create table event_contacts (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  full_name     text not null,
  company       text,
  phone         text,
  email         text,
  kind          text not null default 'walkthrough'
                  check (kind in ('walkthrough','power_vendor','billing')),
  created_at    timestamptz not null default now()
);

create table intake_photos (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  storage_path  text not null,                -- supabase storage bucket key
  area_tag      text,                         -- null = Unsorted
  width         int,
  height        int,
  created_at    timestamptz not null default now()
);

-- Written by the app from the answers given. Owner is a role,
-- not always a person: PM, Office, Shop, Kelton.
create table follow_up_items (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  body          text not null,
  owner_label   text not null,                -- 'PM → Kelton'
  urgent        boolean not null default false,
  source_key    text,                         -- which answer raised it
  done_at       timestamptz,
  created_at    timestamptz not null default now()
);


-- ---------- 5. labor ----------------------------------------

create table labor_quotes (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references events(id) on delete cascade,
  calculator         text not null default 'ov' check (calculator in ('ov','iatse')),
  pricing_mode       text not null default 'split'
                       check (pricing_mode in ('split','all_crew')),
  min_hours_per_call numeric not null default 4,
  prior_flat_rate    numeric,                 -- internal comparison only
  show_prior_rate    boolean not null default false,  -- Owl eyes only
  total              numeric,                 -- cached, recomputed on save
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table labor_days (
  id                 uuid primary key default gen_random_uuid(),
  labor_quote_id     uuid not null references labor_quotes(id) on delete cascade,
  day_index          int not null,            -- 1-based
  day_date           date not null,
  base_rate_override numeric,                 -- needs approval
  override_approved_by uuid references profiles(id) on delete set null,
  sixth_seventh_day  boolean,                 -- null = auto
  day_total          numeric,
  unique (labor_quote_id, day_index)
);

create table shifts (
  id             uuid primary key default gen_random_uuid(),
  labor_day_id   uuid not null references labor_days(id) on delete cascade,
  label          text not null,               -- 'Install Crew'
  kind           shift_kind not null default 'install',
  call_time      time,
  out_time       time,                        -- earlier than call = overnight
  dept           department not null default 'general',
  sixth_seventh_day_override boolean,         -- null = follows day
  sort_order     int not null default 100
);

-- ============================================================
-- THE KEY TABLE.
-- The old app stored "crew = 8" on a shift. Here a shift has 8
-- rows. An empty row still prices; a filled row is a line on
-- the positions list. Because a person can only occupy one slot
-- at a time, headcount for the day is a distinct count of
-- crew_member_id — which retires the "crew count doesn't match
-- its shifts" warning entirely.
-- ============================================================
create table shift_slots (
  id             uuid primary key default gen_random_uuid(),
  shift_id       uuid not null references shifts(id) on delete cascade,
  slot_index     int not null,
  position_id    uuid references positions(id) on delete set null,
  crew_member_id uuid references crew_members(id) on delete set null,
  confirmed      boolean not null default false,
  note           text,
  unique (shift_id, slot_index)
);

create index on shift_slots (crew_member_id);


-- ---------- 6. row level security ---------------------------
-- Everyone signed in can read events; only the assigned PM,
-- sales and admin can write. Shop is read-only everywhere.

alter table profiles              enable row level security;
alter table positions             enable row level security;
alter table crew_members          enable row level security;
alter table crew_member_positions enable row level security;
alter table events                enable row level security;
alter table event_stages          enable row level security;
alter table intake_sections       enable row level security;
alter table intake_notes          enable row level security;
alter table event_contacts        enable row level security;
alter table intake_photos         enable row level security;
alter table follow_up_items       enable row level security;
alter table labor_quotes          enable row level security;
alter table labor_days            enable row level security;
alter table shifts                enable row level security;
alter table shift_slots           enable row level security;

create or replace function my_role() returns app_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function can_write_event(e uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from events
    where id = e
      and (assigned_pm = auth.uid() or my_role() in ('admin','sales'))
  )
$$;

-- read: any signed-in employee
create policy read_all on events        for select using (auth.uid() is not null);
create policy read_all on profiles      for select using (auth.uid() is not null);
create policy read_all on positions     for select using (auth.uid() is not null);
create policy read_all on crew_members  for select using (auth.uid() is not null);
create policy read_all on event_stages  for select using (auth.uid() is not null);

-- write: assigned PM, sales, admin
create policy write_event on events
  for update using (can_write_event(id));
create policy insert_event on events
  for insert with check (my_role() in ('admin','sales'));

create policy write_intake on intake_sections
  for all using (can_write_event(event_id)) with check (can_write_event(event_id));
create policy read_intake on intake_sections
  for select using (auth.uid() is not null);

-- (repeat the two policies above for intake_notes, event_contacts,
--  intake_photos, follow_up_items, labor_quotes, and — joined
--  through their parents — labor_days, shifts, shift_slots.)

create policy write_roster on crew_members
  for all using (my_role() in ('admin','sales')) with check (my_role() in ('admin','sales'));


-- ---------- 7. seed the positions ---------------------------
insert into positions (name, short_code, dept, is_lead, sort_order) values
  ('Project Manager',        'PM',    'general',   true,  10),
  ('Onsite Manager',         'OM',    'general',   true,  20),
  ('Audio Lead / A1',        'A1',    'audio',     true,  30),
  ('Audio 2 / A2',           'A2',    'audio',     false, 31),
  ('Lighting Lead / LD',     'LD',    'lighting',  true,  40),
  ('Lighting Tech',          'LX',    'lighting',  false, 41),
  ('Video Lead / V1',        'V1',    'video',     true,  50),
  ('Video 2 / V2',           'V2',    'video',     false, 51),
  ('LED Tech',               'LEDT',  'led',       false, 55),
  ('Camera Operator',        'CAM',   'video',     false, 56),
  ('Rigger',                 'RIG',   'rigging',   false, 60),
  ('Stage Lead',             'SL',    'staging',   true,  70),
  ('Stagehand',              'HAND',  'general',   false, 90),
  ('Driver',                 'DRV',   'general',   false, 95);


-- ============================================================
-- PHASE 3+ — shape only, do not create yet.
--
-- task_templates   id, name, dept, crew_size, duration_min,
--                  requires_lead_position, trigger_scope_key,
--                  reverse_for_load_out
-- event_tasks      event_id, template_id, name, dept, crew_size,
--                  duration_min, depends_on_task_id, phase
-- task_assignments event_task_id, shift_slot_id, start_at, end_at
--
-- The schedule is a VIEW over task_assignments joined to shifts:
-- no fourth document to keep in sync, just a different read of
-- the same rows.
-- ============================================================
