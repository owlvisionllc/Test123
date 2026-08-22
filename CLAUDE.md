# Owl Vision PM Portal

Internal tool for Owl Vision LLC, a Bay Area AV and event production company. About 20 people. Built for project managers, used on phones, often in a venue basement with no signal.

## What it is

One record per event, moving through five stages. Each stage is built from the one before it — that is the entire product thesis, and the UI shows it as a connected chain:

**Intake → Labor → Positions → Tasks → Schedule**

- **Intake** — the existing PM Event Intake app. 18 sections, scope, billing, walkthrough answers, photos.
- **Labor** — the existing labor calculator. Days, shifts, call times, duration-tiered rates.
- **Positions** — every slot on every shift gets a name and a position.
- **Tasks** — scope becomes work, owned by department leads.
- **Schedule** — task times crossed with call times. Load-in forward, load-out reverse.

Two apps already exist as separate localStorage-only Netlify sites. This project merges them onto a shared cloud backend and adds the last three stages.

## Stack

Vite + React (JavaScript, not TypeScript — match the existing apps) · Supabase (Postgres, Auth, Storage) · Netlify · plain CSS-in-JS via inline styles, no Tailwind, no component library.

Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## The data model, and the one thing not to get wrong

`shift_slots` is the load-bearing table. The old labor app stored `crew = 8` on a shift. Here a shift has **8 rows**, each optionally carrying a `position_id` and a `crew_member_id`.

Consequences, all intentional:

- Headcount for a day is `count(distinct crew_member_id)`, never a sum of shift lines. Someone on install and strike is **one person**. This retires the old app's most common error and it must not be reintroduced.
- An **unnamed slot still prices**. Quotes go out long before the job is staffed. Never require a name to compute a total.
- Two slots for the same person are legal unless their shifts **overlap in time**. Overlap is blocked; doubling is not.

## Domain rules that are not preferences

These come from the business and appear in the UI as hard rules, not defaults:

- **Guardrails on any stage 29 inches or higher.** Mandatory, goes in the quote. Not the planner's call and not ours.
- **Pixel pitch: the company owns 2.6mm and 3.9mm only.** Anything else is a sub-rental off margin and raises an urgent item before it can be promised.
- **Nine show-stoppers block a report**: client contact name, company, billing email, billing phone, billing address, shipping address / venue, prep date, return date, production scope.
- **Unknown beats blank.** Unknown generates a follow-up task with an owner; blank generates silence.

## Design

Light and dark, toggled in the top bar, persisted to the user's profile.

```
green   #2DCC52   accent, sparingly
deep    #0F4A20   complete states, primary buttons
line    #DCE1DC   light   /  #262D27  dark
paper   #EFF2EF   light   /  #0E110F  dark
card    #FFFFFF   light   /  #171B18  dark
ink     #0C0F0C   light   /  #EDF1EE  dark
red     #A32B22   blockers      amber #9A5510  warnings
```

Type: **Archivo** for text, **IBM Plex Mono** for data, labels, times, counts and IDs. Numbers are always mono.

The owl mark is in `public/`. It sits on the near-black bar, which is dark in both themes, so the white version works everywhere. Never stretch it or add the wordmark next to "PM PORTAL".

The mockups in `mockups/` are the reference for layout and interaction. Follow their structure closely; they have been reviewed. They use hardcoded arrays for data — that is the part being replaced, not the design.

## Conventions

- Mobile first. 460px max width, centred. Everything must work one-handed.
- Version in a comment at the top of each screen file. **Bump the minor by 0.1 on every revision** (0.3 → 0.4). New major only when told "this is now version 2".
- Prefer incremental, reversible edits. Small diffs over rewrites.
- Copy is plain and direct. No exclamation marks, no "Oops!", no emoji. Error text says what happened and what to do.

## What is out of scope

- **Flex Rental Solutions is not integrated.** It is a separate product the team uses by hand. The portal stores a Q number and an "opened in Flex" flag, nothing more. Do not attempt an API.
- Durations and crew sizes are **not** properties of a task template. The PM sets them per job. A small LED wall takes nearly as long as a big one, so no formula is correct.

## Things only David can do

Claude Code cannot reach the Supabase dashboard, Google Cloud, or Netlify settings. Anything requiring a click in those consoles is David's job — write the SQL or the config into a file and tell him plainly what to paste where.

Auth is already working: magic links, with a database trigger blocking any address not on the company domain.
