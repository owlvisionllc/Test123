-- Supabase grants these to the authenticated role when a project is created,
-- long before any migration runs. Applied here in the same order so that
-- 0003's revoke lands on top of them, exactly as it will in the real project.
grant usage on schema public to authenticated, anon;
grant all on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
