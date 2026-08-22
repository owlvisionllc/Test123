# Owl Vision PM Portal — handoff bundle

Everything Claude Code needs to build the portal.

## How to use this

1. Unzip into an empty folder.
2. `git init && git add -A && git commit -m "handoff bundle"` — so you can undo anything.
3. Open the folder in Claude Code and say:

   > Read CLAUDE.md and TASKS.md, then start on task 0. Stop and show me
   > when it's done — don't run ahead to the next task.

Claude Code reads `CLAUDE.md` automatically at the start of every session, so
the project context, design tokens and domain rules come along for free.

## What's in here

```
CLAUDE.md                 project context — read on every session
TASKS.md                  the build order, with acceptance criteria

src/lib/                  data layer, ready to use
  supabase.js             client + magic link sign-in
  useSession.js           who is signed in, and what they may do
  api.js                  events, roster, positions

supabase/
  migrations/0001_schema.sql    the tables. ALREADY RUN in the project.
  seed/task-library.json        82 tasks, 12 departments, no durations

mockups/                  reviewed UI, hardcoded data. Follow the design,
                          replace the arrays.
  owlvision-portal-dashboard-v0.5.jsx
  owlvision-positions-screen-v0.3.jsx

public/                   the owl mark, white, for the dark bar
docs/                     setup walkthroughs and the task library workbook
```

## Already done — don't redo these

- Supabase project exists, schema is run
- Magic link sign-in works, tested
- Domain trigger blocks non-company addresses, tested
- Netlify env vars set

## Still David's job

Claude Code can't reach the Supabase dashboard, Google Cloud or Netlify
settings. When a task needs a click in one of those, it'll write the SQL or
config into a file and tell you where to paste it.

## The one thing to check first

In the Supabase Table Editor, confirm `profiles`, `events` and `crew_members`
exist. If they don't, the schema hasn't been run — paste
`supabase/migrations/0001_schema.sql` into the SQL editor before starting.
