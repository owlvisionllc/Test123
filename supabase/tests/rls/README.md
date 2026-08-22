# RLS checks

`run.sh` stands up a throwaway Postgres, applies `0001_schema.sql` and
`0002_rls_policies.sql`, and asserts that the policies allow and deny the
right things. No credentials, no network, nothing touches the real project.

```
./supabase/tests/rls/run.sh
```

`shim.sql` stands in for the pieces of Supabase the schema leans on — the
`auth` schema, `auth.users`, `auth.uid()` and the `anon` / `authenticated`
roles. `auth.uid()` reads a GUC so a test can say "now I am Barry".

## The one thing to know about the results

A denied **insert** raises an error. A denied **update or delete** does not —
it matches zero rows and reports success. That is Postgres behaviour, not a
gap in these policies, and it is why the assertions count rows touched rather
than trusting an exit code. Application code has to do the same.
