# Wiring the mockup to real data

Six steps. Each one leaves the app working, so you can stop after any of them.

Run `npm i @supabase/supabase-js` first.

Drop the three files into `src/lib/`.

---

## 1 · Prove the connection before touching the UI

In your app's entry file, temporarily:

```js
import { supabase } from "./lib/supabase";
supabase.from("positions").select("*").then(console.log);
```

Open the console. You should see the 14 seeded positions.

- **Empty array** → the schema hasn't been run, or RLS is blocking. Check the Table Editor first.
- **Invalid API key** → the Netlify env vars didn't reach the build. They only apply to builds *after* you added them, so trigger a fresh deploy.
- **Works locally, fails on Netlify** → the vars are set locally in `.env` but not in Netlify, or vice versa.

Delete the test line once it works.

---

## 2 · Real sign-in

Swap the `signedIn` boolean in the mockup for the hook:

```js
import { useSession } from "./lib/useSession";
import { sendMagicLink } from "./lib/supabase";

const { profile, loading, role, canCreateEvents } = useSession();

if (loading) return <Splash />;          // not the login screen — see below
if (!profile) return <Login onSubmit={sendMagicLink} />;
```

The login screen needs one change: it takes an email address now, and after sending it says *check your email* rather than logging anyone in.

**Why `loading` matters.** Supabase restores the session asynchronously. Render the login screen while that's happening and every refresh flashes a sign-in prompt at someone who's already signed in. A blank screen with the owl on it is the right thing to show for that half second.

**Expect one confusing moment.** `sendMagicLink` succeeds even for an address the domain trigger will refuse. That's deliberate on Supabase's part — it won't tell a stranger whether an address exists. So a gmail address gets *check your email* and then simply never receives one. Not broken.

---

## 3 · Real events on the dashboard

```js
const [events, setEvents] = useState([]);
useEffect(() => { listEvents().then(setEvents).catch(console.error); }, []);
```

The list will be empty. That's correct — you have no events yet. Worth adding an empty state before step 4 so the screen isn't blank.

`toCard` in `api.js` shapes rows into exactly what the card component already expects, so nothing in the UI changes.

---

## 4 · Create an event for real

Point the New Event sheet at `createEvent`, then reload the list. It writes the five `event_stages` rows too, which is what the chain reads.

**This is Test 1.** Sign in, create an event, see it on the dashboard, refresh, still there. Once that works the spine is real and everything after it is filling in screens.

Have Barry sign in on his own phone at this point. Two accounts is where role and RLS problems surface, and they surface cheaply now rather than in week six.

---

## 5 · Real roster

`listCrew` and `addCrewMember` replace the ROSTER array. Add your actual people — it takes twenty minutes and it's what Positions needs to work at all.

---

## 6 · Flex flag

`setFlexOpened` on the toggle in the event view. Small, but it's the first thing a PM changes that another person sees, so it's a good test of whether writes are actually landing.

---

## Two things that will bite

**RLS returns empty rather than erroring.** A too-tight policy looks exactly like an empty table. If a query comes back `[]` and you can see rows in the Table Editor, it's the policy. Check `select my_role();` returns something for your user.

**The schema's policy block is deliberately incomplete.** I wrote out the pattern for `events` and `intake_sections` and left a comment where the rest go. Until you add them, the tables underneath — `labor_days`, `shifts`, `shift_slots` — have RLS enabled with no policies, which denies everything. That's the safe failure, but it will look like a bug when you get to Labor.

---

## Order of testing

1. positions query returns 14 rows
2. you sign in with a magic link
3. a gmail address never receives one
4. you create an event and it survives a refresh
5. Barry signs in and sees the same event
6. Barry can edit his own event; an event assigned to someone else, he can't

Step 6 is the one that proves the whole permission model. Don't skip it.
