#!/bin/bash
D=${PGTESTHOST:-/var/lib/postgresql/ovcheck}
DAVID=11111111-1111-1111-1111-111111111111
BARRY=22222222-2222-2222-2222-222222222222
SHOP=44444444-4444-4444-4444-444444444444
pass=0; fail=0

run() { # who, sql -> exit code
  psql "host=$D user=postgres dbname=ov" -v ON_ERROR_STOP=1 -q >/dev/null 2>&1 <<SQL
set role authenticated;
select set_config('request.jwt.claim.sub','$1',false);
$2
SQL
}

expect() { # description, who, sql, allow|deny
  run "$2" "$3"; local rc=$?
  local got="allow"; [ $rc -ne 0 ] && got="deny"
  if [ "$got" = "$4" ]; then printf '  ok    %s\n' "$1"; pass=$((pass+1))
  else printf '  FAIL  %s (wanted %s, got %s)\n' "$1" "$4" "$got"; fail=$((fail+1)); fi
}

rows() { # description, who, sql, expected count
  local n err
  err=$(mktemp)
  n=$(psql "host=$D user=postgres dbname=ov" -At -v ON_ERROR_STOP=1 2>"$err" <<SQL
set role authenticated;
select set_config('request.jwt.claim.sub','$2',false) \\g /dev/null
$3
SQL
)
  if [ -s "$err" ]; then
    printf '  ERROR %s -- %s\n' "$1" "$(head -1 "$err")"; fail=$((fail+1)); rm -f "$err"; return
  fi
  rm -f "$err"
  n=$(echo "$n" | tail -1)
  if [ "$n" = "$4" ]; then printf '  ok    %s\n' "$1"; pass=$((pass+1))
  else printf '  FAIL  %s (wanted %s rows, got %s)\n' "$1" "$4" "$n"; fail=$((fail+1)); fi
}

echo "READS — any signed-in employee sees everything"
rows "Barry reads both events"                 $BARRY "select count(*) from events;" 2
rows "Barry reads Teddy's shifts"              $BARRY "select count(*) from shifts;" 2
rows "Shop reads the roster"                   $SHOP  "select count(*) from crew_members;" 1
rows "Shop reads positions (14 seeded)"         $SHOP  "select count(*) from positions;" 14

echo
echo "INTAKE CHILDREN — event_id checked directly"
expect "Barry writes a note on his own event"  $BARRY "insert into intake_notes (event_id, section_key, body) values ('aaaaaaaa-0000-0000-0000-000000000001','power','x');" allow
expect "Barry writes a note on Teddy's event"  $BARRY "insert into intake_notes (event_id, section_key, body) values ('bbbbbbbb-0000-0000-0000-000000000002','power','x');" deny
expect "Barry adds a contact to his own"       $BARRY "insert into event_contacts (event_id, full_name) values ('aaaaaaaa-0000-0000-0000-000000000001','A Person');" allow
expect "Barry adds a contact to Teddy's"       $BARRY "insert into event_contacts (event_id, full_name) values ('bbbbbbbb-0000-0000-0000-000000000002','A Person');" deny
expect "Barry files a follow-up on Teddy's"    $BARRY "insert into follow_up_items (event_id, body, owner_label) values ('bbbbbbbb-0000-0000-0000-000000000002','x','PM');" deny
expect "Barry adds a photo row to Teddy's"     $BARRY "insert into intake_photos (event_id, storage_path) values ('bbbbbbbb-0000-0000-0000-000000000002','k');" deny

echo
echo "LABOR — the walk up through parents"
expect "Barry adds a day to his own quote"     $BARRY "insert into labor_days (labor_quote_id, day_index, day_date) values ('a1111111-0000-0000-0000-000000000001',2,'2026-10-05');" allow
expect "Barry adds a day to Teddy's quote"     $BARRY "insert into labor_days (labor_quote_id, day_index, day_date) values ('b1111111-0000-0000-0000-000000000002',2,'2026-10-05');" deny
expect "Barry adds a shift to his own day"     $BARRY "insert into shifts (labor_day_id, label) values ('a2222222-0000-0000-0000-000000000001','Strike');" allow
expect "Barry adds a shift to Teddy's day"     $BARRY "insert into shifts (labor_day_id, label) values ('b2222222-0000-0000-0000-000000000002','Strike');" deny
expect "Barry adds a slot to his own shift"    $BARRY "insert into shift_slots (shift_id, slot_index) values ('a3333333-0000-0000-0000-000000000001',1);" allow
expect "Barry adds a slot to Teddy's shift"    $BARRY "insert into shift_slots (shift_id, slot_index) values ('b3333333-0000-0000-0000-000000000002',1);" deny
expect "An UNNAMED slot still writes"          $BARRY "insert into shift_slots (shift_id, slot_index, crew_member_id) values ('a3333333-0000-0000-0000-000000000001',2,null);" allow
expect "Barry names a slot on his own shift"   $BARRY "insert into shift_slots (shift_id, slot_index, crew_member_id) values ('a3333333-0000-0000-0000-000000000001',3,'c0000000-0000-0000-0000-000000000001');" allow

echo
echo "UPDATE and DELETE — these do NOT error when denied, they touch 0 rows"
rows "Barry confirms a slot on his own shift"  $BARRY "with x as (update shift_slots set confirmed=true where shift_id='a3333333-0000-0000-0000-000000000001' returning 1) select count(*) from x;" 3
rows "Barry confirms a slot on Teddy's shift"  $BARRY "with x as (update shift_slots set confirmed=true where shift_id='b3333333-0000-0000-0000-000000000002' returning 1) select count(*) from x;" 0
rows "Barry deletes his own shift"             $BARRY "with x as (delete from shifts where label='Strike' returning 1) select count(*) from x;" 1
rows "Barry deletes Teddy's install shift"     $BARRY "with x as (delete from shifts where id='b3333333-0000-0000-0000-000000000002' returning 1) select count(*) from x;" 0

echo
echo "ROSTER — admin and sales only"
expect "Barry (pm) qualifies a crew member"    $BARRY "insert into crew_member_positions (crew_member_id, position_id) select 'c0000000-0000-0000-0000-000000000001', id from positions where short_code='A1';" deny
expect "David (admin) qualifies a crew member" $DAVID "insert into crew_member_positions (crew_member_id, position_id) select 'c0000000-0000-0000-0000-000000000001', id from positions where short_code='A1';" allow

echo
echo "EVENT_STAGES — what task 4 depends on"
expect "Barry writes stages on his own event"  $BARRY "insert into event_stages (event_id, stage, status) values ('aaaaaaaa-0000-0000-0000-000000000001','intake','in_progress');" allow
expect "Barry writes stages on Teddy's event"  $BARRY "insert into event_stages (event_id, stage, status) values ('bbbbbbbb-0000-0000-0000-000000000002','intake','in_progress');" deny

echo
echo "SHOP — read-only everywhere"
expect "Shop writes a note"                    $SHOP "insert into intake_notes (event_id, section_key, body) values ('aaaaaaaa-0000-0000-0000-000000000001','power','x');" deny
expect "Shop adds a slot"                      $SHOP "insert into shift_slots (shift_id, slot_index) values ('a3333333-0000-0000-0000-000000000001',9);" deny

echo
echo "$pass passed, $fail failed"
exit $fail
