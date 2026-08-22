insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111','david@owlvisionllc.com'),
  ('22222222-2222-2222-2222-222222222222','barry@owlvisionllc.com'),
  ('33333333-3333-3333-3333-333333333333','teddy@owlvisionllc.com'),
  ('44444444-4444-4444-4444-444444444444','shop@owlvisionllc.com');

insert into profiles (id, full_name, email, role) values
  ('11111111-1111-1111-1111-111111111111','David','david@owlvisionllc.com','admin'),
  ('22222222-2222-2222-2222-222222222222','Barry Givney','barry@owlvisionllc.com','pm'),
  ('33333333-3333-3333-3333-333333333333','Teddy','teddy@owlvisionllc.com','pm'),
  ('44444444-4444-4444-4444-444444444444','Shop','shop@owlvisionllc.com','shop');

-- A is Barry's, B is Teddy's.
insert into events (id, name, assigned_pm) values
  ('aaaaaaaa-0000-0000-0000-000000000001','Event A — Barry','22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-0000-0000-0000-000000000002','Event B — Teddy','33333333-3333-3333-3333-333333333333');

-- A labor chain under each, so the walk-up has something to walk.
insert into labor_quotes (id, event_id) values
  ('a1111111-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001'),
  ('b1111111-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000002');
insert into labor_days (id, labor_quote_id, day_index, day_date) values
  ('a2222222-0000-0000-0000-000000000001','a1111111-0000-0000-0000-000000000001',1,'2026-10-04'),
  ('b2222222-0000-0000-0000-000000000002','b1111111-0000-0000-0000-000000000002',1,'2026-10-04');
insert into shifts (id, labor_day_id, label) values
  ('a3333333-0000-0000-0000-000000000001','a2222222-0000-0000-0000-000000000001','Install Crew'),
  ('b3333333-0000-0000-0000-000000000002','b2222222-0000-0000-0000-000000000002','Install Crew');

insert into crew_members (id, full_name) values
  ('c0000000-0000-0000-0000-000000000001','Jane Hand');
