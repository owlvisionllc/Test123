// Placeholder data — from the mockup, still hardcoded.
//
// EVENTS is replaced by listEvents() in task 3.
// ROSTER is replaced by listCrew() in task 5.
//
// Kept exactly as reviewed so the screens can be ported and checked before
// the data behind them changes. Delete this file when both are real.

export const EVENTS = [
  {
    id: 1,
    name: "Lally Events — Menlo Circus Club",
    venue: "Menlo Circus Club",
    date: "Sep 17",
    dateFull: "September 17, 2026",
    pm: "Barry G.",
    flexQ: "Q-40099",
    flexOpen: true,
    filed: false,
    stages: { Intake: "complete", Labor: "in_progress", Positions: "not_started", Tasks: "not_started", Schedule: "not_started" },
    blockers: [],
    detail: { Intake: "18 of 18 sections · 8 photos · 0 show-stoppers", Labor: "3 days · 2 shifts on day 1 · no crew named yet" },
  },
  {
    id: 2,
    name: "Augeo Experience — Marriott Marquis",
    venue: "Marriott Marquis SF",
    date: "Oct 4",
    dateFull: "October 4, 2026",
    pm: "Teddy B.",
    flexQ: "Q-40145",
    flexOpen: false,
    filed: false,
    stages: { Intake: "blocked", Labor: "not_started", Positions: "not_started", Tasks: "not_started", Schedule: "not_started" },
    blockers: ["Billing address", "Return date"],
    detail: { Intake: "14 of 18 sections · 2 show-stoppers open" },
  },
  {
    id: 3,
    name: "Hearts in SF — Pier 48",
    venue: "Pier 48",
    date: "Aug 29",
    dateFull: "August 29, 2026",
    pm: "Barry G.",
    flexQ: "Q-39980",
    flexOpen: true,
    filed: true,
    stages: { Intake: "complete", Labor: "complete", Positions: "complete", Tasks: "complete", Schedule: "complete" },
    blockers: [],
    detail: {
      Intake: "18 of 18 sections · 22 photos",
      Labor: "2 days · $41,220 · split shifts",
      Positions: "19 named · 5 leads",
      Tasks: "34 tasks across 5 departments",
      Schedule: "Load-in 6:00 AM · load-out 11:30 PM",
    },
  },
  {
    id: 4,
    name: "Northgate Bio — Investor Day",
    venue: "Westfield Centre",
    date: "Oct 22",
    dateFull: "October 22, 2026",
    pm: "Teddy B.",
    flexQ: null,
    flexOpen: false,
    filed: false,
    stages: { Intake: "in_progress", Labor: "not_started", Positions: "not_started", Tasks: "not_started", Schedule: "not_started" },
    blockers: [],
    detail: { Intake: "2 of 18 sections · assigned 3 days ago" },
  },
];

export const ROSTER = [
  { name: "Eddie Olivares", pos: ["A1", "PM"], staff: true },
  { name: "Marco Cobian", pos: ["V1", "LEDT"], staff: true },
  { name: "Barry Givney", pos: ["PM", "V1"], staff: true },
  { name: "Kelton Pelot", pos: ["SL", "DRV"], staff: true },
  { name: "Van Bong", pos: ["V2", "CAM"], staff: true },
  { name: "Teddy Battle", pos: ["PM", "OM"], staff: true },
  { name: "R. Alvarez", pos: ["HAND"], staff: false },
  { name: "J. Nakamura", pos: ["LX", "HAND"], staff: false },
  { name: "D. Whitfield", pos: ["RIG"], staff: false },
];

export const POSITION_CODES = ["PM", "OM", "A1", "A2", "LD", "LX", "V1", "V2", "LEDT", "CAM", "RIG", "SL", "HAND", "DRV"];
