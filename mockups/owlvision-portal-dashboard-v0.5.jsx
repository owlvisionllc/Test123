import React, { useState, useContext, createContext, useMemo } from "react";

/* ============================================================
   OWL VISION PM PORTAL — dashboard mockup v0.5
   v0.5: sign-in gate, new event (sales only), roster editor.
   Phase 1 UI is now complete end to end.

   The mark only ever sits on the near-black bar, which is dark in
   both themes, so the white artwork works as-is. If it ever lands
   on a light surface, pass invert to OwlMark.
   ============================================================ */

const LOGO_SRC = "data:image/png;base64,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";

const THEMES = {
  light: {
    mode: "light",
    shell: "#DDE2DD",
    paper: "#EFF2EF",
    card: "#FFFFFF",
    ink: "#0C0F0C",
    bar: "#0C0F0C",
    barInk: "#FFFFFF",
    hero: "#0F4A20",
    heroInk: "#FFFFFF",
    heroSub: "#B9D6C2",
    heroBack: "#9FD8AF",
    deep: "#0F4A20",
    deepInk: "#FFFFFF",
    green: "#1B7A33",
    bright: "#2DCC52",
    brightInk: "#08130B",
    line: "#DCE1DC",
    empty: "#E6EAE6",
    ash: "#79817A",
    amber: "#9A5510",
    red: "#A32B22",
    inputBg: "#FFFFFF",
    waiting: "#F2F4F2",
  },
  dark: {
    mode: "dark",
    shell: "#050705",
    paper: "#0E110F",
    card: "#171B18",
    ink: "#EDF1EE",
    bar: "#060806",
    barInk: "#EDF1EE",
    hero: "#0D3A19",
    heroInk: "#FFFFFF",
    heroSub: "#9CBFA6",
    heroBack: "#7EC993",
    deep: "#1B7A33",
    deepInk: "#E6F7EB",
    green: "#4FD973",
    bright: "#2DCC52",
    brightInk: "#08130B",
    line: "#262D27",
    empty: "#212721",
    ash: "#8A938C",
    amber: "#D79A4A",
    red: "#D9584C",
    inputBg: "#101410",
    waiting: "#1A1F1B",
  },
};

const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const SANS = "'Archivo', -apple-system, system-ui, sans-serif";

const ThemeCtx = createContext(THEMES.light);
const useT = () => useContext(ThemeCtx);

const STAGES = ["Intake", "Labor", "Positions", "Tasks", "Schedule"];

const STAGE_BLURB = {
  Intake: "Scope, billing, walkthrough answers and photos.",
  Labor: "Days, shifts, call times. Produces the quote you type into Flex.",
  Positions: "Every slot on every shift gets a name and a position.",
  Tasks: "Scope becomes work. Leads take their departments.",
  Schedule: "Call times crossed with tasks. Load-in forward, load-out reverse.",
};

const STAGE_FEEDS = {
  Intake: "Feeds Labor: how many days, what departments, what hours.",
  Labor: "Feeds Positions: one row per person, per shift.",
  Positions: "Feeds Tasks: leads own departments, hands get assigned.",
  Tasks: "Feeds Schedule: durations and dependencies become a running order.",
  Schedule: "The last piece of paper. Nothing downstream.",
};

const EVENTS = [
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

const ROSTER = [
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

/* ---------- the mark ---------------------------------------- */
function OwlMark({ size = 26, color, invert = false }) {
  if (LOGO_SRC)
    return (
      <img
        src={LOGO_SRC}
        alt="Owl Vision"
        style={{ height: size, width: "auto", display: "block", filter: invert ? "invert(1)" : "none" }}
      />
    );
  // Fallback trace, kept so the header never renders empty.
  return (
    <svg viewBox="0 0 100 47" height={size} width={(size * 100) / 47} fill="none" stroke={color}
      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Owl Vision"
      style={{ display: "block", overflow: "visible" }}>
      <path d="M24 4.5 C21.5 13 29 16.5 36 20.5 C42 24 46 29.5 48 34" />
      <path d="M72.5 4.5 C75 13 67 16.5 60 20.5 C54 24 50 29.5 48 34" />
      <circle cx="30" cy="27" r="11.6" />
      <circle cx="66" cy="27" r="11.6" />
      <path d="M22.2 28.3 L38.3 32.4" />
      <path d="M57.2 32.2 L74.2 28.3" />
      <path d="M48 34.6 L51.6 38.6 L48 42.6 L44.4 38.6 Z" />
    </svg>
  );
}

function ThemeToggle({ mode, onToggle }) {
  const T = useT();
  return (
    <button
      onClick={onToggle}
      aria-label={mode === "dark" ? "Switch to light" : "Switch to dark"}
      style={{
        width: 30, height: 30, borderRadius: 2, cursor: "pointer",
        border: `1px solid ${T.mode === "dark" ? "#2E362F" : "#2A302B"}`,
        background: "transparent", color: T.barInk,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {mode === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M19.1 4.9l-1.5 1.5M6.4 17.6l-1.5 1.5" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.8 6.8 0 0 0 11 11z" />
        </svg>
      )}
    </button>
  );
}


/* ---------- small building blocks ---------------------------- */
function Field({ label, value, onChange, placeholder, type = "text" }) {
  const T = useT();
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, marginBottom: 5 }}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${T.line}`, background: T.inputBg, padding: "10px 11px", fontFamily: SANS, fontSize: 14.5, color: T.ink }}
      />
    </div>
  );
}

function Sheet({ title, children, onClose, onSave, saveLabel = "Save", canSave = true }) {
  const T = useT();
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: T.paper, borderTop: `2px solid ${T.bright}`, padding: "16px 14px 20px", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ash }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.ash, fontFamily: MONO, fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
        </div>
        {children}
        <button
          onClick={onSave}
          disabled={!canSave}
          style={{ width: "100%", marginTop: 6, border: "none", background: canSave ? T.deep : T.waiting, color: canSave ? T.deepInk : T.ash, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", padding: "13px 0", cursor: canSave ? "pointer" : "not-allowed" }}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

/* ---------- the signature element ---------------------------
   Five links, physically connected. A blocked link goes red and
   everything after it dims, because it genuinely cannot start.
------------------------------------------------------------- */
function Chain({ stages, compact }) {
  const T = useT();
  const firstBlockIdx = STAGES.findIndex((s) => stages[s] === "blocked");
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 2 }}>
      {STAGES.map((s, i) => {
        const st = stages[s];
        const stalled = firstBlockIdx > -1 && i > firstBlockIdx;
        let bg = T.empty, fg = T.ash;
        if (st === "complete") { bg = T.deep; fg = T.deepInk; }
        else if (st === "in_progress") { bg = T.bright; fg = T.brightInk; }
        else if (st === "blocked") { bg = T.red; fg = "#FFFFFF"; }
        return (
          <div
            key={s}
            style={{
              flex: 1, background: bg, color: fg,
              padding: compact ? "5px 3px" : "7px 4px",
              fontFamily: MONO, fontSize: compact ? 8.5 : 9.5,
              letterSpacing: "0.06em", textAlign: "center", textTransform: "uppercase",
              clipPath:
                i === 0
                  ? "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%)"
                  : i === STAGES.length - 1
                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 6px 50%)"
                  : "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%, 6px 50%)",
              opacity: stalled ? 0.4 : 1,
            }}
          >
            {compact ? s.slice(0, 3) : s}
          </div>
        );
      })}
    </div>
  );
}

function Pill({ children, tone = "ash" }) {
  const T = useT();
  const c = { ash: T.ash, red: T.red, green: T.green, amber: T.amber }[tone];
  return (
    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", color: c, border: `1px solid ${c}44`, background: `${c}14`, padding: "3px 7px", borderRadius: 2, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Label({ children }) {
  const T = useT();
  return <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ash, marginBottom: 8 }}>{children}</div>;
}

/* ---------- dashboard --------------------------------------- */
function Dashboard({ events, onOpen, filter, setFilter, onNew, canCreate }) {
  const T = useT();
  const list = useMemo(() => (filter === "mine" ? events.filter((e) => e.pm === "Barry G.") : events), [filter, events]);
  const blocked = events.filter((e) => e.blockers.length).length;
  const unfiled = events.filter((e) => !e.filed && e.stages.Schedule === "complete").length;
  const noFlex = events.filter((e) => !e.flexOpen).length;

  return (
    <div style={{ padding: "16px 14px 90px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{ n: blocked, l: "blocked", tone: T.red }, { n: noFlex, l: "no Flex quote", tone: T.amber }, { n: unfiled, l: "unfiled", tone: T.ash }].map((s) => (
          <div key={s.l} style={{ flex: 1, background: T.card, border: `1px solid ${T.line}`, padding: "10px 10px 9px" }}>
            <div style={{ fontFamily: MONO, fontSize: 24, lineHeight: 1, color: s.n ? s.tone : T.line }}>{s.n}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em", color: T.ash, marginTop: 5 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", marginBottom: 14, border: `1px solid ${T.line}`, background: T.card }}>
        {[["mine", "My events"], ["all", "All events"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ flex: 1, border: "none", background: filter === k ? T.deep : "transparent", color: filter === k ? T.deepInk : T.ash, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 0", cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {canCreate && (
        <button onClick={onNew}
          style={{ width: "100%", background: "transparent", border: `1px dashed ${T.line}`, color: T.green, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 0", marginBottom: 10, cursor: "pointer" }}>
          + New event
        </button>
      )}

      {list.map((e) => (
        <button key={e.id} onClick={() => onOpen(e)}
          style={{ display: "block", width: "100%", textAlign: "left", background: T.card, border: `1px solid ${T.line}`, borderLeft: `3px solid ${e.blockers.length ? T.red : e.filed ? T.deep : T.line}`, padding: "13px 13px 12px", marginBottom: 10, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: T.green, letterSpacing: "0.06em" }}>{e.date.toUpperCase()}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash }}>{e.pm}</div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: T.ink, margin: "3px 0 2px", lineHeight: 1.25 }}>{e.name.split(" — ")[0]}</div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.ash, marginBottom: 11 }}>{e.venue}</div>
          <Chain stages={e.stages} compact />
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {e.blockers.length > 0 && <Pill tone="red">{e.blockers.length} show-stoppers</Pill>}
            {e.flexQ ? <Pill tone={e.flexOpen ? "green" : "amber"}>{e.flexQ}</Pill> : <Pill tone="amber">No Flex quote</Pill>}
            {e.filed && <Pill tone="green">Filed</Pill>}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------- event detail ------------------------------------ */
function EventView({ event, onBack, mode, onToggle }) {
  const T = useT();
  const [open, setOpen] = useState("Labor");
  const [flexOpen, setFlexOpen] = useState(event.flexOpen);

  return (
    <div style={{ padding: "0 0 90px" }}>
      <div style={{ background: T.hero, color: T.heroInk, padding: "13px 14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: T.heroBack, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", padding: 0, cursor: "pointer" }}>← ALL EVENTS</button>
          <ThemeToggle mode={mode} onToggle={onToggle} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: T.bright, letterSpacing: "0.08em" }}>{event.dateFull.toUpperCase()}</div>
        <div style={{ fontFamily: SANS, fontSize: 21, fontWeight: 700, lineHeight: 1.2, margin: "5px 0 4px" }}>{event.name.split(" — ")[0]}</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: T.heroSub }}>{event.venue} · PM {event.pm}</div>
      </div>

      <div style={{ padding: "14px 14px 0" }}><Chain stages={event.stages} /></div>

      <div style={{ margin: "14px 14px 0", background: T.card, border: `1px solid ${T.line}`, padding: "12px 13px" }}>
        <Label>Flex Rental Solutions</Label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontFamily: MONO, fontSize: 15, color: event.flexQ ? T.ink : T.ash }}>{event.flexQ || "No Q number yet"}</div>
          <button onClick={() => setFlexOpen(!flexOpen)}
            style={{ border: `1px solid ${flexOpen ? T.green : T.line}`, background: flexOpen ? `${T.bright}1F` : "transparent", color: flexOpen ? T.green : T.ash, fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", padding: "7px 10px", cursor: "pointer", borderRadius: 2 }}>
            {flexOpen ? "✓ Quote opened" : "Mark quote opened"}
          </button>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: T.ash, marginTop: 9, lineHeight: 1.45 }}>
          Labor totals are built here and typed into Flex by hand. Copy the day-by-day lines when the labor stage is done.
        </div>
      </div>

      <div style={{ padding: "16px 14px 0" }}>
        <Label>The five stages</Label>
        {STAGES.map((s, i) => {
          const st = event.stages[s];
          const isOpen = open === s;
          const dot = st === "complete" ? T.deep : st === "in_progress" ? T.bright : st === "blocked" ? T.red : T.line;
          return (
            <div key={s} style={{ borderLeft: `2px solid ${T.line}`, paddingLeft: 16, position: "relative", paddingBottom: i === STAGES.length - 1 ? 0 : 4 }}>
              <div style={{ position: "absolute", left: -6, top: 14, width: 10, height: 10, borderRadius: "50%", background: dot, border: `2px solid ${T.paper}` }} />
              <button onClick={() => setOpen(isOpen ? null : s)}
                style={{ display: "block", width: "100%", textAlign: "left", background: T.card, border: `1px solid ${T.line}`, padding: "11px 12px", marginBottom: 6, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: st === "not_started" ? T.ash : T.ink }}>{s}</div>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", color: dot === T.line ? T.ash : dot }}>{st.replace("_", " ")}</div>
                </div>
                {event.detail[s] && <div style={{ fontFamily: MONO, fontSize: 11, color: T.ash, marginTop: 5 }}>{event.detail[s]}</div>}
                {isOpen && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
                    <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.ink, lineHeight: 1.5 }}>{STAGE_BLURB[s]}</div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: T.green, marginTop: 7, lineHeight: 1.5 }}>↳ {STAGE_FEEDS[s]}</div>
                    {s === "Intake" && event.blockers.length > 0 && (
                      <div style={{ marginTop: 10, background: `${T.red}14`, border: `1px solid ${T.red}44`, padding: "9px 10px" }}>
                        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: T.red, textTransform: "uppercase", marginBottom: 6 }}>Missing — show stopper</div>
                        {event.blockers.map((b) => <div key={b} style={{ fontFamily: SANS, fontSize: 13, color: T.ink, padding: "3px 0" }}>{b}</div>)}
                      </div>
                    )}
                    <div style={{ marginTop: 11, background: st === "not_started" ? T.waiting : T.deep, color: st === "not_started" ? T.ash : T.deepInk, textAlign: "center", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 0" }}>
                      {st === "not_started" ? `Waiting on ${STAGES[STAGES.indexOf(s) - 1] || "setup"}` : `Open ${s.toLowerCase()}`}
                    </div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- roster ------------------------------------------ */
const POSITION_CODES = ["PM", "OM", "A1", "A2", "LD", "LX", "V1", "V2", "LEDT", "CAM", "RIG", "SL", "HAND", "DRV"];

function Roster({ roster, onAdd }) {
  const T = useT();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", email: "", pos: [], staff: false });
  const list = roster.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const togglePos = (c) =>
    setDraft((d) => ({ ...d, pos: d.pos.includes(c) ? d.pos.filter((x) => x !== c) : [...d.pos, c] }));

  const save = () => {
    onAdd({ ...draft, name: draft.name.trim() });
    setDraft({ name: "", phone: "", email: "", pos: [], staff: false });
    setAdding(false);
  };

  return (
    <div style={{ padding: "16px 14px 90px" }}>
      <Label>Crew roster · {roster.length} people</Label>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the roster"
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${T.line}`, background: T.inputBg, padding: "11px 12px", fontFamily: SANS, fontSize: 14, color: T.ink, marginBottom: 10 }} />
      <button onClick={() => setAdding(true)}
        style={{ width: "100%", background: "transparent", border: `1px dashed ${T.line}`, color: T.green, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 0", marginBottom: 12, cursor: "pointer" }}>
        + Add person
      </button>
      {list.map((p) => (
        <div key={p.name} style={{ background: T.card, border: `1px solid ${T.line}`, padding: "11px 12px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{p.name}</div>
            <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
              {p.pos.map((c) => <span key={c} style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.05em", color: T.green, background: `${T.bright}22`, padding: "2px 6px", borderRadius: 2 }}>{c}</span>)}
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: T.ash, letterSpacing: "0.05em" }}>{p.staff ? "STAFF" : "FREELANCE"}</div>
        </div>
      ))}
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.ash, marginTop: 14, lineHeight: 1.5 }}>
        Positions here are what someone can be booked as. They become the dropdown when a labor slot gets a name.
      </div>

      {adding && (
        <Sheet title="Add to roster" onClose={() => setAdding(false)} onSave={save} canSave={draft.name.trim().length > 1} saveLabel="Add person">
          <Field label="Full name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="First Last" />
          <Field label="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} placeholder="(650) 555-0000" />
          <Field label="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} placeholder="name@example.com" />

          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, margin: "4px 0 7px" }}>
            Can be booked as
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 13 }}>
            {POSITION_CODES.map((c) => {
              const on = draft.pos.includes(c);
              return (
                <button key={c} onClick={() => togglePos(c)}
                  style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.05em", padding: "7px 10px", borderRadius: 2, cursor: "pointer",
                    border: `1px solid ${on ? T.green : T.line}`, background: on ? `${T.bright}22` : "transparent", color: on ? T.green : T.ash }}>
                  {c}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", border: `1px solid ${T.line}`, marginBottom: 4 }}>
            {[[false, "Freelance"], [true, "Staff"]].map(([v, l]) => (
              <button key={l} onClick={() => setDraft({ ...draft, staff: v })}
                style={{ flex: 1, border: "none", background: draft.staff === v ? T.deep : "transparent", color: draft.staff === v ? T.deepInk : T.ash, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "11px 0", cursor: "pointer" }}>
                {l}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}


/* ---------- sign in -----------------------------------------
   Google only, locked to the company domain in Supabase Auth.
   No password to reset, and removing someone from Workspace
   removes them from the portal at the same time.
------------------------------------------------------------- */
function Login({ onSignIn, mode, onToggle }) {
  const T = useT();
  return (
    <div style={{ minHeight: "100vh", background: T.bar, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 14px" }}>
        <ThemeToggle mode={mode} onToggle={onToggle} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px 60px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <OwlMark size={72} color="#FFFFFF" />
        </div>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.2em", color: T.bright, marginBottom: 8 }}>PM PORTAL</div>
        <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 14, color: "#8A938C", lineHeight: 1.5, marginBottom: 30 }}>
          Intake, labor, positions, tasks and the schedule — one record per event.
        </div>
        <button onClick={onSignIn}
          style={{ width: "100%", border: "none", background: "#FFFFFF", color: "#0C0F0C", fontFamily: SANS, fontWeight: 600, fontSize: 15, padding: "14px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z"/>
            <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.4 7.5 24 12 24z"/>
            <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6l3.8-3z"/>
            <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.2-3.2C17.7 1.5 15.1.4 12 .4 7.5.4 3.7 3 1.8 6.9l3.8 3C6.5 7.1 9 4.8 12 4.8z"/>
          </svg>
          Sign in with Google
        </button>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10, letterSpacing: "0.05em", color: "#5E665F", marginTop: 16, lineHeight: 1.6 }}>
          @owlvisionllc.com accounts only
        </div>
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", color: "#3D443E", padding: "0 0 20px" }}>
        OWL VISION LLC · INTERNAL
      </div>
    </div>
  );
}

function NewEventSheet({ onClose, onCreate }) {
  const T = useT();
  const [d, setD] = useState({ name: "", venue: "", date: "", pm: "Barry G.", flexQ: "" });
  const ok = d.name.trim().length > 2 && d.venue.trim().length > 1;
  return (
    <Sheet title="New event" onClose={onClose} onSave={() => onCreate(d)} canSave={ok} saveLabel="Create and assign">
      <Field label="Event name" value={d.name} onChange={(v) => setD({ ...d, name: v })} placeholder="Client — Venue" />
      <Field label="Venue" value={d.venue} onChange={(v) => setD({ ...d, venue: v })} placeholder="Menlo Circus Club" />
      <Field label="Event date" value={d.date} onChange={(v) => setD({ ...d, date: v })} placeholder="Nov 12" />
      <Field label="Flex Q number (optional)" value={d.flexQ} onChange={(v) => setD({ ...d, flexQ: v })} placeholder="Q-40200" />
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, margin: "4px 0 7px" }}>Assign to</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["Barry G.", "Teddy B."].map((n) => (
          <button key={n} onClick={() => setD({ ...d, pm: n })}
            style={{ fontFamily: MONO, fontSize: 11, padding: "8px 12px", borderRadius: 2, cursor: "pointer",
              border: `1px solid ${d.pm === n ? T.green : T.line}`, background: d.pm === n ? `${T.bright}22` : "transparent", color: d.pm === n ? T.green : T.ash }}>
            {n}
          </button>
        ))}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: T.ash, lineHeight: 1.5, marginBottom: 4 }}>
        Creating an event opens Intake for that PM. Everything downstream stays locked until Intake has no show-stoppers.
      </div>
    </Sheet>
  );
}

/* ---------- shell ------------------------------------------- */
export default function Portal() {
  const [mode, setMode] = useState("light");
  const [signedIn, setSignedIn] = useState(false);
  const [tab, setTab] = useState("events");
  const [event, setEvent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState(EVENTS);
  const [roster, setRoster] = useState(ROSTER);
  const [creating, setCreating] = useState(false);
  const T = THEMES[mode];
  const toggle = () => setMode(mode === "light" ? "dark" : "light");

  // In the shipped app this comes from the profiles table.
  const role = "admin";
  const canCreate = role === "admin" || role === "sales";

  const createEvent = (d) => {
    setEvents([
      {
        id: Date.now(),
        name: d.name,
        venue: d.venue,
        date: d.date || "TBD",
        dateFull: d.date ? `${d.date}, 2026` : "Date to be set",
        pm: d.pm,
        flexQ: d.flexQ || null,
        flexOpen: false,
        filed: false,
        stages: { Intake: "in_progress", Labor: "not_started", Positions: "not_started", Tasks: "not_started", Schedule: "not_started" },
        blockers: [],
        detail: { Intake: "0 of 18 sections · just assigned" },
      },
      ...events,
    ]);
    setCreating(false);
  };

  return (
    <ThemeCtx.Provider value={T}>
      <div style={{ background: T.shell, minHeight: "100vh", fontFamily: SANS, transition: "background 180ms ease" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
          * { -webkit-tap-highlight-color: transparent; }
          button:focus-visible, input:focus-visible { outline: 2px solid ${T.bright}; outline-offset: 2px; }
          input::placeholder { color: ${T.ash}; }
          @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }`}</style>

        <div style={{ maxWidth: 460, margin: "0 auto", background: T.paper, minHeight: "100vh", boxShadow: mode === "dark" ? "none" : "0 0 40px rgba(0,0,0,.08)" }}>
          {!signedIn && <Login onSignIn={() => setSignedIn(true)} mode={mode} onToggle={toggle} />}

          {signedIn && !event && (
            <div style={{ background: T.bar, color: T.barInk, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <OwlMark size={24} color={T.barInk} />
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", color: T.bright }}>PM PORTAL</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ThemeToggle mode={mode} onToggle={toggle} />
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.deep, color: T.deepInk, fontFamily: MONO, fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "center" }}>BG</div>
              </div>
            </div>
          )}

          {signedIn && (event ? (
            <EventView event={event} onBack={() => setEvent(null)} mode={mode} onToggle={toggle} />
          ) : tab === "events" ? (
            <Dashboard events={events} onOpen={setEvent} filter={filter} setFilter={setFilter} onNew={() => setCreating(true)} canCreate={canCreate} />
          ) : (
            <Roster roster={roster} onAdd={(p) => setRoster([{ ...p, pos: p.pos.length ? p.pos : ["HAND"] }, ...roster])} />
          ))}

          {signedIn && creating && <NewEventSheet onClose={() => setCreating(false)} onCreate={createEvent} />}

          {signedIn && !event && (
            <div style={{ position: "sticky", bottom: 0, display: "flex", background: T.card, borderTop: `1px solid ${T.line}` }}>
              {[["events", "Events"], ["roster", "Roster"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)}
                  style={{ flex: 1, border: "none", background: "transparent", borderTop: `2px solid ${tab === k ? T.green : "transparent"}`, color: tab === k ? T.green : T.ash, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 0", cursor: "pointer" }}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
