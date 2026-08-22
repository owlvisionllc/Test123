#!/bin/bash
# Applies 0001 + 0002 to a throwaway local Postgres and checks the policies
# actually allow and deny what they are meant to. Nothing here touches the
# real project — it needs no credentials and no network.
#
#   ./supabase/tests/rls/run.sh
#
# Requires postgresql-16 installed locally. Exits non-zero on any failure.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../../.." && pwd)
PG=${PG_BIN:-/usr/lib/postgresql/16/bin}
D=${PG_TESTDIR:-/var/lib/postgresql/ovcheck}

cleanup() { su postgres -c "$PG/pg_ctl -D $D/data stop" >/dev/null 2>&1; rm -rf "$D"; }
trap cleanup EXIT

rm -rf "$D"; mkdir -p "$D"; chown postgres:postgres "$D"
su postgres -c "$PG/initdb -D $D/data -A trust -U postgres" >/dev/null 2>&1
su postgres -c "$PG/pg_ctl -D $D/data -o '-k $D -h \"\"' -l $D/pg.log start" >/dev/null 2>&1
sleep 1

psql "host=$D user=postgres dbname=postgres" -q -c "create database ov" >/dev/null 2>&1
for f in "$HERE/shim.sql" \
         "$ROOT/supabase/migrations/0001_schema.sql" \
         "$ROOT/supabase/migrations/0002_rls_policies.sql" \
         "$HERE/seed.sql"; do
  if ! psql "host=$D user=postgres dbname=ov" -v ON_ERROR_STOP=1 -q -f "$f" 2>&1 | grep -v NOTICE; then :; fi
done

PGTESTHOST=$D "$HERE/assertions.sh"
