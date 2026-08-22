import React, { useState, useMemo } from "react";

/* ============================================================
   OWL VISION PM PORTAL — Tasks screen v0.1

   Production Scope decides which tasks exist. The PM decides
   how many hands and how long — there is no formula, because a
   small LED wall takes nearly as long as a big one.

   The thing to watch: the capacity bar. Labor already said how
   many people are called and for how long. Tasks says how much
   work there is. The two numbers have never been compared
   before, and that comparison is the whole point of this screen.
   ============================================================ */

const THEMES = {
  light: { mode:"light", shell:"#DDE2DD", paper:"#EFF2EF", card:"#FFFFFF", ink:"#0C0F0C", hero:"#0F4A20",
    deep:"#0F4A20", deepInk:"#FFFFFF", green:"#1B7A33", bright:"#2DCC52", line:"#DCE1DC", empty:"#E6EAE6",
    ash:"#79817A", amber:"#9A5510", red:"#A32B22", inputBg:"#FFFFFF", waiting:"#F2F4F2" },
  dark: { mode:"dark", shell:"#050705", paper:"#0E110F", card:"#171B18", ink:"#EDF1EE", hero:"#0D3A19",
    deep:"#1B7A33", deepInk:"#E6F7EB", green:"#4FD973", bright:"#2DCC52", line:"#262D27", empty:"#212721",
    ash:"#8A938C", amber:"#D79A4A", red:"#D9584C", inputBg:"#101410", waiting:"#1A1F1B" },
};
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const SANS = "'Archivo', -apple-system, system-ui, sans-serif";

/* ticked in Production Scope on this job */
const SCOPE = ["Always","Power / Generator","Rigging / Truss","Staging","Audio","Lighting","LED Wall","Cameras / IMAG"];

/* the library, filtered to what this job ticked */
const LIBRARY = [
  ["G-01","Truck dump, cases staged in the room","GENERAL","Always","","Both",""],
  ["G-03","Mark stage, FOH and video village from the plot","GENERAL","Always","PM","Load-in","G-02"],
  ["G-04","Dead cases to storage","GENERAL","Always","","Both","G-01"],
  ["G-05","Crew meal break","GENERAL","Always","PM","Both",""],
  ["G-06","Safety walk — cable, ramps, edges, exits","GENERAL","Always","PM","Load-in",""],
  ["G-09","Truck load and strap","GENERAL","Always","","Load-out","G-08"],

  ["P-03","Distro build and feeder runs","POWER","Power / Generator","","Load-in","P-01"],
  ["P-04","Power up and load check per department","POWER","Power / Generator","","Load-in","P-03"],
  ["P-06","Power down, distro and feeder strike","POWER","Power / Generator","","Load-out",""],

  ["R-02","Motors and chain set out","RIGGING","Rigging / Truss","RIG","Load-in","R-01"],
  ["R-03","Truss build on deck","RIGGING","Rigging / Truss","RIG","Load-in","R-02"],
  ["R-05","Trim check and lift to height","RIGGING","Rigging / Truss","RIG","Load-in","R-04"],
  ["R-06","Secondaries, safeties and sign-off","RIGGING","Rigging / Truss","RIG","Load-in","R-05"],
  ["R-07","Lower, strip truss, pack motors","RIGGING","Rigging / Truss","RIG","Load-out",""],

  ["S-01","Deck layout and level","STAGING","Staging","SL","Load-in","G-03"],
  ["S-02","Legs, skirting and stair units","STAGING","Staging","SL","Load-in","S-01"],
  ["S-03","Guardrails on every open edge","STAGING","Staging","SL","Load-in","S-02"],
  ["S-05","Stage strike and pack","STAGING","Staging","","Load-out",""],

  ["A-01","PA fly or stack","AUDIO","Audio","A1","Load-in","R-06"],
  ["A-03","Amp and drive rack build, network up","AUDIO","Audio","A1","Load-in","P-04"],
  ["A-04","FOH console build and patch","AUDIO","Audio","A1","Load-in","A-03"],
  ["A-06","Mics, DIs, stands and stage cable","AUDIO","Audio","","Load-in","A-04"],
  ["A-08","System tune and time align","AUDIO","Audio","A1","Load-in","A-06"],
  ["A-11","Audio strike and case out","AUDIO","Audio","","Load-out",""],

  ["L-03","Truss fixture hang","LIGHTING","Lighting","LX","Load-in","R-03"],
  ["L-04","Data and power patch","LIGHTING","Lighting","LX","Load-in","L-03"],
  ["L-05","Console build and patch to plot","LIGHTING","Lighting","LD","Load-in","L-04"],
  ["L-06","Focus","LIGHTING","Lighting","LD","Load-in","R-06"],
  ["L-07","Programming and cue build","LIGHTING","Lighting","LD","Load-in","L-06"],
  ["L-09","Lighting strike and case out","LIGHTING","Lighting","","Load-out","R-07"],

  ["E-01","Stage carts and unpack panels","LED WALL","LED Wall","","Load-in","G-01"],
  ["E-02","Ground support build","LED WALL","LED Wall","SL","Load-in","E-01"],
  ["E-03","Panel hang or stack","LED WALL","LED Wall","","Load-in","E-02"],
  ["E-04","Data and power cabling","LED WALL","LED Wall","","Load-in","E-03"],
  ["E-05","Processor build and panel mapping","LED WALL","LED Wall","V1","Load-in","E-04"],
  ["E-06","Power up, colour match, dead pixel check","LED WALL","LED Wall","V1","Load-in","E-05"],
  ["E-08","Wall strike, panel count and pack","LED WALL","LED Wall","","Load-out",""],

  ["C-01","Camera positions — risers, tripods, cable","CAMERAS","Cameras / IMAG","","Load-in","G-03"],
  ["C-02","Fibre or SDI runs to video village","CAMERAS","Cameras / IMAG","","Load-in","C-01"],
  ["C-05","Camera strike and pack","CAMERAS","Cameras / IMAG","","Load-out",""],
];

/* what Labor already said about this day */
const CALLS = [
  { label: "Install Crew", phase: "Load-in",  people: 8, hours: 13 },
  { label: "Show / Operators", phase: "Show day", people: 5, hours: 10 },
  { label: "Strike Crew", phase: "Load-out", people: 6, hours: 4 },
];

const MIN_CHIPS = [15, 30, 45, 60, 90, 120, 180];
const PHASES = ["Load-in", "Load-out", "Show day"];

/* a few pre-filled so the screen is not empty on open */
const PREFILL = { "G-01":[8,30], "G-03":[2,20], "R-02":[3,30], "R-03":[4,60], "S-01":[4,45],
  "S-02":[3,40], "E-01":[4,30], "E-02":[3,45], "E-03":[4,60], "E-04":[2,30], "A-01":[3,45],
  "L-03":[3,45], "P-03":[2,45], "P-04":[2,30] };

export default function Tasks() {
  const [mode, setMode] = useState("light");
  const [phase, setPhase] = useState("Load-in");
  const [editing, setEditing] = useState(null);
  const T = THEMES[mode];

  const [tasks, setTasks] = useState(() =>
    LIBRARY.filter((t) => SCOPE.includes(t[3])).map((t) => ({
      id: t[0], name: t[1], dept: t[2], trigger: t[3], lead: t[4], phase: t[5], deps: t[6],
      crew: PREFILL[t[0]]?.[0] ?? null,
      mins: PREFILL[t[0]]?.[1] ?? null,
    }))
  );

  const inPhase = useMemo(
    () => tasks.filter((t) => t.phase === phase || (t.phase === "Both" && phase !== "Show day")),
    [tasks, phase]
  );

  const set = (id, patch) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const assigned = inPhase.reduce((n, t) => n + (t.crew && t.mins ? (t.crew * t.mins) / 60 : 0), 0);
  const call = CALLS.find((c) => c.phase === phase);
  const capacity = call ? call.people * call.hours : 0;
  const unset = inPhase.filter((t) => !t.crew || !t.mins).length;
  const pct = capacity ? Math.min(assigned / capacity, 1.35) : 0;
  const over = capacity && assigned > capacity;

  const depts = [...new Set(inPhase.map((t) => t.dept))];
  const active = editing ? tasks.find((t) => t.id === editing) : null;

  return (
    <div style={{ background: T.shell, minHeight: "100vh", fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        button:focus-visible { outline: 2px solid ${T.bright}; outline-offset: 2px; }`}</style>

      <div style={{ maxWidth: 460, margin: "0 auto", background: T.paper, minHeight: "100vh" }}>

        <div style={{ background: T.hero, color: "#FFF", padding: "13px 14px 15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "#9FD8AF" }}>← LALLY EVENTS</div>
            <button onClick={() => setMode(mode === "light" ? "dark" : "light")}
              style={{ width: 30, height: 30, borderRadius: 2, border: "1px solid rgba(255,255,255,.25)", background: "transparent", color: "#FFF", cursor: "pointer", fontFamily: MONO, fontSize: 12 }}>
              {mode === "dark" ? "☀" : "☾"}
            </button>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700 }}>Tasks</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#B9D6C2", marginTop: 4 }}>
            DAY 1 · FRI SEP 18 · {SCOPE.length - 1} SERVICES IN SCOPE
          </div>
        </div>

        {/* phase */}
        <div style={{ display: "flex", margin: "14px 14px 0", border: `1px solid ${T.line}`, background: T.card }}>
          {PHASES.map((p) => (
            <button key={p} onClick={() => setPhase(p)}
              style={{ flex: 1, border: "none", background: phase === p ? T.deep : "transparent",
                color: phase === p ? T.deepInk : T.ash, fontFamily: MONO, fontSize: 10.5,
                letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 0", cursor: "pointer" }}>
              {p}
            </button>
          ))}
        </div>

        {/* ---- the comparison that has never existed before ---- */}
        <div style={{ margin: "12px 14px 0", background: T.card, border: `1px solid ${over ? T.red : T.line}`, padding: "12px 13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash }}>
              Work vs crew called
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: over ? T.red : T.green }}>
              {assigned.toFixed(1)} / {capacity} hrs
            </div>
          </div>

          <div style={{ height: 8, background: T.empty, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${Math.min(pct, 1) * 100}%`,
              background: over ? T.red : pct > 0.85 ? T.amber : T.deep }} />
            {over && <div style={{ position: "absolute", top: 0, bottom: 0, left: "100%", width: 2, background: T.red }} />}
          </div>

          <div style={{ fontFamily: SANS, fontSize: 12, color: T.ash, marginTop: 9, lineHeight: 1.5 }}>
            {call
              ? <>{call.label}: {call.people} people × {call.hours} hrs. {" "}
                  {over
                    ? <span style={{ color: T.red }}>Tasks need {(assigned - capacity).toFixed(1)} hrs more than the call covers.</span>
                    : `${(capacity - assigned).toFixed(1)} hrs of slack.`}
                </>
              : "No call for this phase yet."}
            {unset > 0 && ` ${unset} task${unset > 1 ? "s" : ""} still unset — the real number is higher.`}
          </div>
        </div>

        {/* ---- tasks by department ---- */}
        <div style={{ padding: "14px 14px 40px" }}>
          {depts.map((d) => {
            const list = inPhase.filter((t) => t.dept === d);
            const dh = list.reduce((n, t) => n + (t.crew && t.mins ? (t.crew * t.mins) / 60 : 0), 0);
            return (
              <div key={d} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.green }}>{d}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash }}>{dh.toFixed(1)} hrs</div>
                </div>

                {list.map((t) => {
                  const done = t.crew && t.mins;
                  return (
                    <button key={t.id} onClick={() => setEditing(t.id)}
                      style={{ display: "block", width: "100%", textAlign: "left", background: T.card,
                        border: `1px solid ${T.line}`, borderLeft: `3px solid ${done ? T.deep : T.amber}`,
                        padding: "10px 11px", marginBottom: 5, cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: T.ink, lineHeight: 1.3 }}>{t.name}</div>
                          <div style={{ fontFamily: MONO, fontSize: 9.5, color: T.ash, marginTop: 4 }}>
                            {t.id}{t.lead ? ` · ${t.lead} leads` : ""}{t.deps ? ` · after ${t.deps}` : ""}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {done ? (
                            <>
                              <div style={{ fontFamily: MONO, fontSize: 13, color: T.ink }}>{t.crew}×{t.mins}m</div>
                              <div style={{ fontFamily: MONO, fontSize: 9.5, color: T.ash, marginTop: 3 }}>
                                {((t.crew * t.mins) / 60).toFixed(1)} hrs
                              </div>
                            </>
                          ) : (
                            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.05em", color: T.amber, textTransform: "uppercase" }}>
                              Set crew<br />and time
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}

          <button
            style={{ width: "100%", background: "transparent", border: `1px dashed ${T.line}`, color: T.green,
              fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "12px 0", cursor: "pointer" }}>
            + Add a task
          </button>
          <div style={{ fontFamily: SANS, fontSize: 12, color: T.ash, marginTop: 10, lineHeight: 1.5 }}>
            Tasks appear from what was ticked in Production Scope. Add anything this job needs that the library does not
            have — one-offs stay on this event.
          </div>
        </div>

        {active && (
          <Editor T={T} task={active} onClose={() => setEditing(null)}
            onChange={(patch) => set(active.id, patch)} />
        )}
      </div>
    </div>
  );
}

/* ---------- crew and time, one-handed ----------------------- */
function Editor({ T, task, onClose, onChange }) {
  const crew = task.crew ?? 0;
  const mins = task.mins ?? 0;
  const step = (d) => onChange({ crew: Math.max(0, crew + d) });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: T.paper, borderTop: `2px solid ${T.bright}`, padding: "16px 14px 22px", maxHeight: "88vh", overflowY: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>{task.name}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.ash, fontFamily: MONO, fontSize: 17, cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash, marginBottom: 18 }}>
          {task.id} · {task.dept}{task.lead ? ` · ${task.lead} leads` : " · any hand"}
        </div>

        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, marginBottom: 8 }}>
          How many hands
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <StepBtn T={T} onClick={() => step(-1)}>−</StepBtn>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 34, lineHeight: 1, color: crew ? T.ink : T.ash }}>{crew || "—"}</div>
          </div>
          <StepBtn T={T} onClick={() => step(1)}>+</StepBtn>
        </div>

        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, marginBottom: 8 }}>
          How long
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {MIN_CHIPS.map((m) => {
            const on = mins === m;
            return (
              <button key={m} onClick={() => onChange({ mins: m })}
                style={{ fontFamily: MONO, fontSize: 12, padding: "9px 12px", borderRadius: 2, cursor: "pointer",
                  border: `1px solid ${on ? T.green : T.line}`, background: on ? `${T.bright}22` : T.card,
                  color: on ? T.green : T.ash }}>
                {m < 60 ? `${m}m` : `${m / 60}h`}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <input type="number" value={mins || ""} placeholder="Exact minutes"
            onChange={(e) => onChange({ mins: Number(e.target.value) || null })}
            style={{ flex: 1, boxSizing: "border-box", border: `1px solid ${T.line}`, background: T.inputBg,
              padding: "10px 11px", fontFamily: MONO, fontSize: 14, color: T.ink }} />
          <div style={{ fontFamily: MONO, fontSize: 12, color: T.ash, minWidth: 74, textAlign: "right" }}>
            {crew && mins ? `${((crew * mins) / 60).toFixed(1)} hrs` : "—"}
          </div>
        </div>

        {task.deps && (
          <div style={{ background: `${T.bright}12`, border: `1px solid ${T.line}`, padding: "10px 11px", marginBottom: 14 }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.green, marginBottom: 5 }}>
              Cannot start until
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: T.ink }}>{task.deps} is finished</div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: T.ash, marginTop: 5, lineHeight: 1.45 }}>
              The schedule places this task from that, not from the order in this list.
            </div>
          </div>
        )}

        <button onClick={onClose}
          style={{ width: "100%", border: "none", background: T.deep, color: T.deepInk, fontFamily: MONO,
            fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", padding: "13px 0", cursor: "pointer" }}>
          Done
        </button>
        <button onClick={() => { onChange({ crew: null, mins: null }); onClose(); }}
          style={{ width: "100%", marginTop: 7, border: "none", background: "transparent", color: T.ash,
            fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", padding: "9px 0", cursor: "pointer" }}>
          Clear this task
        </button>
      </div>
    </div>
  );
}

function StepBtn({ T, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ width: 58, height: 52, border: `1px solid ${T.line}`, background: T.card, color: T.ink,
        fontFamily: MONO, fontSize: 22, cursor: "pointer", borderRadius: 2 }}>
      {children}
    </button>
  );
}
