# Build order

Work top to bottom. Each task ends with something David can open and check. Stop and report after each numbered task rather than running the whole list unattended — he wants to see it working before you move on.

**Say so plainly when a task needs him.** Anything in the Supabase dashboard, Google Cloud or Netlify settings is his to click; write the SQL or config into a file and tell him exactly where to paste it.

---

## 0 · Scaffold

Vite + React (JavaScript). Install `@supabase/supabase-js`. Drop `src/lib/` in as-is. Add `.env.local` with the two `VITE_` vars — ask David for the values, do not invent them.

**Done when:** `npm run dev` serves a blank app and `supabase.from("positions").select("*")` logs 14 rows in the console. If it logs an empty array, the schema has not been run — say so rather than working around it.

---

## 1 · Finish the RLS policies

`supabase/migrations/0001_schema.sql` has policies for `events` and `intake_sections` and a comment marking where the rest go. The remaining tables have RLS **enabled with no policies**, which denies everything. Safe, but it will read as a bug the moment anyone opens Labor.

Write `0002_rls_policies.sql` covering `intake_notes`, `event_contacts`, `intake_photos`, `follow_up_items`, `labor_quotes`, `labor_days`, `shifts`, `shift_slots`, `crew_member_positions`.

Pattern: read for any signed-in user; write for the assigned PM plus admin and sales. The child tables have no `event_id`, so join up through their parents — `shift_slots` → `shifts` → `labor_days` → `labor_quotes` → `events`. A security-definer helper that resolves a `shift_slot_id` to an `event_id` will keep the policies readable.

**Done when:** the file is written and David has pasted it into the SQL editor. Tell him it is ready and what to do with it.

---

## 2 · Real sign-in

Replace the `signedIn` boolean in the dashboard mockup with `useSession`. Login screen takes an email and calls `sendMagicLink`.

Three things to get right:

- While `loading` is true, render a splash with the owl on it — **not** the login screen. Otherwise every refresh flashes a sign-in prompt at someone already signed in.
- After sending, the screen says *check your email* regardless of the address. Supabase reports success even for an address the domain trigger will refuse, deliberately, so it cannot be used to discover who works there.
- Persist the theme choice to `profiles`. Add a `theme` column in `0003_theme.sql` if one is needed.

**Done when:** David signs in on his phone and stays signed in through a refresh.

---

## 3 · Real events

`listEvents` behind the dashboard. Empty state for when there are none — the owl, one line of copy, and the New Event button if the user can create.

**Done when:** the dashboard reads from the database and shows nothing without pretending to be broken.

---

## 4 · Create an event  ← this is Test 1

Wire the New Event sheet to `createEvent`. It writes the five `event_stages` rows; the chain reads those.

**Done when:** David creates a real event, refreshes, and it is still there. Then Barry Givney signs in on his own phone and sees the same event.

This is the milestone. The spine is real after this and everything else is filling in screens.

---

## 5 · Roster

`listCrew` and `addCrewMember`. This is a small screen but nothing in Positions works without it, and David has about 30 people to enter by hand.

**Done when:** real crew are in the table with their position codes.

---

## 6 · Permission check

Not a feature — a test, and the one that proves the model.

- Barry can edit an event assigned to him.
- Barry **cannot** edit one assigned to Teddy.
- Barry cannot create events at all.

**Done when:** all three behave correctly. If a write silently succeeds where it should fail, stop and fix the policy before building anything further.

---

## 7 · Port Intake

Only after 1–6. The PM app's 18 sections onto `intake_sections`, one jsonb blob per section. Keep the existing form order, the blue box on every page, and the nine show-stoppers.

Offline is the hard part and it is deliberately last. Build online-only first. The walkthrough sections are the ones that genuinely need to work in a basement; the desk sections do not.

---

## Later, in this order

8. Port Labor onto `labor_quotes` / `labor_days` / `shifts` / `shift_slots` — headcount becomes slots.
9. Positions screen, from `mockups/owlvision-positions-screen-v0.3.jsx`.
10. Task templates seeded from `supabase/seed/task-library.json`. **No durations, no crew sizes** — those live on `event_tasks` and the PM fills them in.
11. Schedule, as a view over task assignments and shift times.

---

## Two known gaps to raise before they bite

**Dependencies have no "one of" type.** `E-03` in the task library depends on `E-02 / E-09` — ground support *or* flown header, never both. The schema models dependencies as a plain list. Needs a real answer before the scheduler is built or it will guess.

**Event stage status is recomputed by the app, not by database triggers.** Deliberate — the rules stay in one place. But it means anything that changes an event must remember to update `event_stages`. Put that in one function and call it from everywhere.
