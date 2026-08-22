-- ============================================================
-- OWL VISION PM PORTAL — THEME ON THE PROFILE  (0003, v0.1)
-- Postgres / Supabase. Run in the SQL editor top to bottom.
--
-- Light or dark follows the person, not the device, so it lives
-- on profiles rather than in the browser.
--
-- Safe to run more than once.
-- ============================================================

alter table profiles
  add column if not exists theme text not null default 'light';

do $$ begin
  alter table profiles add constraint profiles_theme_check
    check (theme in ('light','dark'));
exception when duplicate_object then null;
end $$;


-- ---------- letting someone edit their own row --------------
-- profiles was read-only until now. This opens it up, and the
-- interesting part is what it must NOT open up.
--
-- A policy alone would be a privilege escalation: any PM could
-- set their own role to admin and walk straight through every
-- policy in 0002. RLS decides which ROWS you may write, not
-- which COLUMNS, so the column list is the actual lock and the
-- grant below is doing the security work.
--
-- role and active stay changeable only from the Supabase
-- dashboard, which is the right amount of friction for a
-- twenty person company.

drop policy if exists update_own_profile on profiles;
create policy update_own_profile on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

revoke update on profiles from authenticated;
grant update (full_name, phone, theme) on profiles to authenticated;

-- A warning worth keeping. This lock is a GRANT, and a blanket
--   grant all on all tables in schema public to authenticated;
-- silently puts the role column back within reach. Supabase issues
-- exactly that grant when a project is created, and some tooling
-- reissues it. If you ever run one, run the two lines above again
-- afterwards. supabase/tests/rls checks this and catches it.
