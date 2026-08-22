# Owl Vision PM Portal — standing up Phase 1

Everything here is one-time setup. Twenty minutes if nothing fights you.

---

## 1. Create the project

Supabase → New project. Region **West US (North California)** — closest to Sunnyvale, and it matters for the walkthrough sync round trip.

Save the two values it gives you:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

These go in Netlify under Site settings → Environment variables. The anon key is safe in the browser — row level security is what actually protects the data, which is why the policies in the schema are not optional.

---

## 2. Lock sign-in to the company domain

Two layers, because either one alone leaks.

**Layer one — Google Cloud.** Create an OAuth client, set the consent screen user type to **Internal**. Only accounts on your Workspace org can even reach the consent screen. Paste the client ID and secret into Supabase → Authentication → Providers → Google.

**Layer two — the database.** Belt and braces, in case the provider config ever gets loosened:

```sql
create or replace function block_outside_domain()
returns trigger language plpgsql security definer as $$
begin
  if new.email not like '%@owlvisionllc.com' then
    raise exception 'Only Owl Vision accounts can sign in';
  end if;
  return new;
end $$;

create trigger enforce_domain
  before insert on auth.users
  for each row execute function block_outside_domain();
```

---

## 3. Run the schema

Paste `owlvision-portal-schema-v0.1.sql` into the SQL editor and run it top to bottom. Then add the profile bootstrap so a first sign-in creates the row the app expects:

```sql
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    'pm'                                   -- everyone lands as PM
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

Everyone lands as `pm`. You promote yourself to `admin` by hand, once:

```sql
update profiles set role = 'admin' where email = 'davidb@owlvisionllc.com';
```

---

## 4. Storage for walkthrough photos

Storage → New bucket → `walkthrough-photos`, **private**. Path convention:

```
{event_id}/{photo_id}.jpg
```

Photos are served through signed URLs, so a link that leaks stops working. Convert HEIC to JPEG client-side before upload, same as the PM app does today.

---

## 5. Wire the client

```bash
npm i @supabase/supabase-js
```

```js
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const signIn = () =>
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: { queryParams: { hd: "owlvisionllc.com" } },
  });
```

```js
// src/lib/useProfile.js
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (!session) { setProfile(null); setLoading(false); return; }
      const { data } = await supabase
        .from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(data);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { profile, loading };
}
```

That replaces the `signedIn` and `role` placeholders in the mockup — everything else in the component tree stays as it is.

---

## 6. First real query

Proves auth, RLS and the schema all work together:

```js
const { data: events } = await supabase
  .from("events")
  .select("*, event_stages(*), assigned_pm:profiles(full_name)")
  .order("event_date", { ascending: true });
```

If this comes back empty while rows exist in the table, RLS is doing its job and your policy is too tight — check `my_role()` returns something for your user.

---

## Order of operations

1. Project + env vars
2. Google provider + both domain layers
3. Schema + both triggers
4. Promote yourself to admin
5. Storage bucket
6. Client wiring, then the first query above

Do not port the PM app's 18 sections until step 6 returns real rows. Debugging auth through a form with a hundred and fifty fields in front of it is miserable.
