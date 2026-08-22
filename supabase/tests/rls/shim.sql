-- Minimal stand-in for the parts of Supabase the schema leans on.
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then
    create role authenticated nologin;
  end if;
end $$;

create schema if not exists auth;
create table auth.users (
  id    uuid primary key,
  email text unique
);

-- Supabase reads the subject out of the request JWT. Here it comes
-- from a GUC so a test can say "now I am Barry".
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
