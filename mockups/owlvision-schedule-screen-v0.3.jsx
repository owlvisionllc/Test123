import React, { useState, useMemo } from "react";

/* ============================================================
   OWL VISION PM PORTAL — Schedule screen v0.3

   v0.3 adds load-out, and it is NOT load-in reversed.

   Load-in schedules FORWARD from the call: you know when crew
   arrive, you find out when the room is done.

   Load-out schedules BACKWARD from the curfew: the truck has to
   be gone at a fixed time, so the question is when work has to
   START — and whether that is before the crew were even called.

   That inversion is the whole reason strike goes wrong. Nobody
   works out the latest safe start until they are already late.
   ============================================================ */

const THEMES = {
  light: { mode:"light", shell:"#DDE2DD", paper:"#EFF2EF", card:"#FFFFFF", ink:"#0C0F0C", hero:"#0F4A20",
    deep:"#0F4A20", deepInk:"#FFFFFF", green:"#1B7A33", bright:"#2DCC52", line:"#DCE1DC", empty:"#E6EAE6",
    ash:"#79817A", amber:"#9A5510", red:"#A32B22", inputBg:"#FFFFFF" },
  dark: { mode:"dark", shell:"#050705", paper:"#0E110F", card:"#171B18", ink:"#EDF1EE", hero:"#0D3A19",
    deep:"#1B7A33", deepInk:"#E6F7EB", green:"#4FD973", bright:"#2DCC52", line:"#262D27", empty:"#212721",
    ash:"#8A938C", amber:"#D79A4A", red:"#D9584C", inputBg:"#101410" },
};
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const SANS = "'Archivo', -apple-system, system-ui, sans-serif";
const SNAP = 5;

const DEPT_COLOR = {
  GENERAL:"#79817A", POWER:"#9A5510", RIGGING:"#6B4FA8", STAGING:"#1B7A33",
  AUDIO:"#166C8C", LIGHTING:"#B0871A", "LED WALL":"#0F4A20", CAMERAS:"#8C4A6B",
};

/* ---------- the two days ------------------------------------ */
const PHASES = {
  "Load-in": {
    direction: "forward",
    anchorLabel: "Call",
    start: 7 * 60,
    end: 20 * 60,
    crew: 8,
    callLabel: "Install crew · 8 hands",
    tasks: [
      { id:"G-01", name:"Truck dump, cases staged", dept:"GENERAL", lead:"", crew:8, mins:30, deps:[] },
      { id:"G-03", name:"Mark stage and FOH from the plot", dept:"GENERAL", lead:"PM", crew:2, mins:20, deps:["G-01"] },
      { id:"P-03", name:"Distro build and feeder runs", dept:"POWER", lead:"", crew:2, mins:45, deps:["G-01"] },
      { id:"P-04", name:"Power up and load check", dept:"POWER", lead:"", crew:2, mins:30, deps:["P-03"] },
      { id:"R-02", name:"Motors and chain set out", dept:"RIGGING", lead:"RIG", crew:3, mins:30, deps:["G-03"] },
      { id:"R-03", name:"Truss build on deck", dept:"RIGGING", lead:"RIG", crew:4, mins:60, deps:["R-02"] },
      { id:"L-03", name:"Truss fixture hang", dept:"LIGHTING", lead:"LX", crew:3, mins:45, deps:["R-03"] },
      { id:"R-05", name:"Trim check and lift to height", dept:"RIGGING", lead:"RIG", crew:4, mins:30, deps:["L-03"] },
      { id:"R-06", name:"Secondaries, safeties, sign-off", dept:"RIGGING", lead:"RIG", crew:2, mins:20, deps:["R-05"] },
      { id:"S-01", name:"Deck layout and level", dept:"STAGING", lead:"SL", crew:4, mins:45, deps:["G-03"] },
      { id:"S-02", name:"Legs, skirting, stair units", dept:"STAGING", lead:"SL", crew:3, mins:40, deps:["S-01"] },
      { id:"S-03", name:"Guardrails on every open edge", dept:"STAGING", lead:"SL", crew:2, mins:30, deps:["S-02"] },
      { id:"E-01", name:"Stage carts, unpack panels", dept:"LED WALL", lead:"", crew:4, mins:30, deps:["G-01"] },
      { id:"E-02", name:"Ground support build", dept:"LED WALL", lead:"SL", crew:3, mins:45, deps:["E-01"] },
      { id:"E-03", name:"Panel hang or stack", dept:"LED WALL", lead:"", crew:4, mins:60, deps:["E-02"] },
      { id:"E-04", name:"Data and power cabling", dept:"LED WALL", lead:"", crew:2, mins:30, deps:["E-03"] },
      { id:"E-05", name:"Processor build and mapping", dept:"LED WALL", lead:"V1", crew:1, mins:45, deps:["E-04"] },
      { id:"E-06", name:"Colour match and pixel check", dept:"LED WALL", lead:"V1", crew:2, mins:30, deps:["E-05"] },
      { id:"A-01", name:"PA fly or stack", dept:"AUDIO", lead:"A1", crew:3, mins:45, deps:["R-06"] },
      { id:"A-03", name:"Amp and drive rack, network up", dept:"AUDIO", lead:"A1", crew:2, mins:40, deps:["P-04"] },
      { id:"A-04", name:"FOH console build and patch", dept:"AUDIO", lead:"A1", crew:2, mins:45, deps:["A-03"] },
      { id:"A-06", name:"Mics, DIs, stands, stage cable", dept:"AUDIO", lead:"", crew:2, mins:35, deps:["A-04"] },
      { id:"A-08", name:"System tune and time align", dept:"AUDIO", lead:"A1", crew:1, mins:45, deps:["A-06"] },
      { id:"L-05", name:"Console build and patch to plot", dept:"LIGHTING", lead:"LD", crew:1, mins:40, deps:["L-03"] },
      { id:"L-06", name:"Focus", dept:"LIGHTING", lead:"LD", crew:2, mins:60, deps:["R-06"] },
      { id:"C-01", name:"Camera positions and cable", dept:"CAMERAS", lead:"", crew:2, mins:40, deps:["G-03"] },
      { id:"C-02", name:"Fibre runs to video village", dept:"CAMERAS", lead:"", crew:2, mins:40, deps:["C-01"] },
      { id:"G-06", name:"Safety walk before doors", dept:"GENERAL", lead:"PM", crew:2, mins:20, deps:["A-08","L-06","E-06","S-03"] },
    ],
  },
  "Load-out": {
    direction: "backward",
    anchorLabel: "Curfew",
    start: 22 * 60,        // strike call
    end: 26 * 60,          // 2:00 AM, next day
    crew: 6,
    callLabel: "Strike crew · 6 hands",
    tasks: [
      { id:"R-07", name:"Lower, strip truss, pack motors", dept:"RIGGING", lead:"RIG", crew:4, mins:45, deps:[] },
      { id:"E-08", name:"Wall strike, panel count and pack", dept:"LED WALL", lead:"", crew:4, mins:60, deps:[] },
      { id:"C-05", name:"Camera strike and pack", dept:"CAMERAS", lead:"", crew:2, mins:30, deps:[] },
      { id:"L-09", name:"Lighting strike and case out", dept:"LIGHTING", lead:"", crew:3, mins:45, deps:["R-07"] },
      { id:"A-11", name:"Audio strike and case out", dept:"AUDIO", lead:"", crew:3, mins:50, deps:["R-07"] },
      { id:"S-05", name:"Stage strike and pack", dept:"STAGING", lead:"", crew:4, mins:40, deps:["A-11"] },
      { id:"P-06", name:"Power down, distro and feeder strike", dept:"POWER", lead:"", crew:2, mins:40, deps:["E-08","L-09","A-11","C-05"] },
      { id:"G-08", name:"Trash, sweep and venue handback", dept:"GENERAL", lead:"", crew:3, mins:25, deps:["S-05","P-06"] },
      { id:"G-09", name:"Truck load and strap", dept:"GENERAL", lead:"", crew:6, mins:45, deps:["G-08"] },
    ],
  },
};

const fmt = (m) => {
  const h24 = Math.floor(m / 60) % 24, mm = m % 60;
  const ap = h24 >= 12 ? "PM" : "AM", h = h24 % 12 || 12;
  return `${h}:${String(mm).padStart(2, "0")} ${ap}`;
};

/* ---------- weights -----------------------------------------
   Forward: how much work waits AFTER this task.
   Backward: how much work must happen BEFORE it.
   Same idea, opposite direction — whichever chain is longest
   sets the day, so it goes first.
------------------------------------------------------------- */
function weights(tasks, direction) {
  const byId = (id) => tasks.find((t) => t.id === id);
  const succ = {};
  tasks.forEach((t) => (succ[t.id] = []));
  tasks.forEach((t) => t.deps.forEach((d) => succ[d] && succ[d].push(t.id)));

  const memo = {};
  const weigh = (id) => {
    if (memo[id] !== undefined) return memo[id];
    memo[id] = 0;                                     // guards a circular chain
    const t = byId(id);
    if (!t) return 0;
    const links = direction === "forward" ? succ[id] : t.deps;
    const tail = links.length ? Math.max(...links.map(weigh)) : 0;
    return (memo[id] = t.mins + tail);
  };
  tasks.forEach((t) => weigh(t.id));
  return memo;
}

function drafter(cfg, pins) {
  const { tasks, direction, start: A, end: B, crew: CAP } = cfg;
  const byId = (id) => tasks.find((t) => t.id === id);
  const W = weights(tasks, direction);
  const succ = {};
  tasks.forEach((t) => (succ[t.id] = []));
  tasks.forEach((t) => t.deps.forEach((d) => succ[d] && succ[d].push(t.id)));

  const load = {};
  const placed = {};
  const add = (s, m, c) => { for (let x = s; x < s + m; x += SNAP) load[x] = (load[x] || 0) + c; };
  const fits = (s, m, c) => { for (let x = s; x < s + m; x += SNAP) if ((load[x] || 0) + c > CAP) return false; return true; };

  Object.entries(pins).forEach(([id, s]) => {
    const t = byId(id);
    if (t) { placed[id] = s; add(s, t.mins, t.crew); }
  });

  const queue = tasks.filter((t) => placed[t.id] === undefined);
  let guard = 0;

  while (queue.length && guard++ < 400) {
    const ready = queue.filter((t) =>
      direction === "forward"
        ? t.deps.every((d) => placed[d] !== undefined)
        : succ[t.id].every((s) => placed[s] !== undefined)
    );
    if (!ready.length) break;
    ready.sort((a, b) => W[b.id] - W[a.id] || b.crew * b.mins - a.crew * a.mins);
    const t = ready[0];

    let s;
    if (direction === "forward") {
      let earliest = A;
      t.deps.forEach((d) => { const dep = byId(d); if (dep) earliest = Math.max(earliest, placed[d] + dep.mins); });
      s = Math.ceil(earliest / SNAP) * SNAP;
      while (s + t.mins <= B + 240 && !fits(s, t.mins, t.crew)) s += SNAP;
    } else {
      let latest = B;
      succ[t.id].forEach((x) => { latest = Math.min(latest, placed[x]); });
      s = Math.floor((latest - t.mins) / SNAP) * SNAP;
      while (s > A - 480 && !fits(s, t.mins, t.crew)) s -= SNAP;
    }

    placed[t.id] = s;
    add(s, t.mins, t.crew);
    queue.splice(queue.indexOf(t), 1);
  }
  return placed;
}

export default function Schedule() {
  const [mode, setMode] = useState("light");
  const [phase, setPhase] = useState("Load-in");
  const [howBuilt, setHowBuilt] = useState("auto");
  const [pins, setPins] = useState({ "Load-in": {}, "Load-out": {} });
  const [manual, setManual] = useState({ "Load-in": {}, "Load-out": {} });
  const [editing, setEditing] = useState(null);
  const T = THEMES[mode];

  const cfg = PHASES[phase];
  const byId = (id) => cfg.tasks.find((t) => t.id === id);
  const P = pins[phase], M = manual[phase];

  const placed = useMemo(
    () => (howBuilt === "auto" ? drafter(cfg, P) : { ...M, ...P }),
    [phase, howBuilt, P, M]
  );

  const W = useMemo(() => weights(cfg.tasks, cfg.direction), [phase]);

  const onPath = useMemo(() => {
    const set = new Set();
    let cur = cfg.tasks.reduce((a, b) => (!a || W[b.id] > W[a.id] ? b : a), null);
    while (cur) {
      set.add(cur.id);
      const links = cfg.direction === "forward"
        ? cfg.tasks.filter((t) => t.deps.includes(cur.id))
        : cur.deps.map(byId).filter(Boolean);
      cur = links.sort((a, b) => W[b.id] - W[a.id])[0];
    }
    return set;
  }, [phase, W]);

  const problems = useMemo(() => {
    const out = [];
    cfg.tasks.forEach((t) => {
      const s = placed[t.id];
      if (s === undefined) return;
      t.deps.forEach((d) => {
        const dep = byId(d), ds = placed[d];
        if (!dep || ds === undefined) return;
        if (ds + dep.mins > s) out.push({ id: t.id, text: `starts before ${d} finishes` });
      });
    });
    return out;
  }, [placed, phase]);

  const load = useMemo(() => {
    const map = {};
    cfg.tasks.forEach((t) => {
      const s = placed[t.id];
      if (s === undefined) return;
      for (let x = s; x < s + t.mins; x += SNAP) map[x] = (map[x] || 0) + t.crew;
    });
    return map;
  }, [placed, phase]);

  const times = cfg.tasks.map((t) => placed[t.id]).filter((x) => x !== undefined);
  const firstStart = times.length ? Math.min(...times) : cfg.start;
  const lastEnd = cfg.tasks.reduce((m, t) => Math.max(m, (placed[t.id] ?? cfg.start) + t.mins), cfg.start);
  const peak = Math.max(0, ...Object.values(load));
  const backward = cfg.direction === "backward";
  const slack = backward ? firstStart - cfg.start : cfg.end - lastEnd;
  const late = slack < 0;

  const barSlots = [];
  for (let x = cfg.start - 60; x < cfg.end + 30; x += SNAP) barSlots.push(x);

  const groups = useMemo(() => {
    const m = new Map();
    cfg.tasks.forEach((t) => {
      const s = placed[t.id];
      if (s === undefined) return;
      if (!m.has(s)) m.set(s, []);
      m.get(s).push(t);
    });
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [placed, phase]);

  const place = (id, s) => {
    setPins((p) => ({ ...p, [phase]: { ...p[phase], [id]: s } }));
    if (howBuilt === "manual") setManual((p) => ({ ...p, [phase]: { ...p[phase], [id]: s } }));
  };
  const release = (id) => {
    setPins((p) => { const n = { ...p[phase] }; delete n[id]; return { ...p, [phase]: n }; });
    setManual((p) => { const n = { ...p[phase] }; delete n[id]; return { ...p, [phase]: n }; });
  };

  const active = editing ? byId(editing) : null;

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
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700 }}>{phase} schedule</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#B9D6C2", marginTop: 4 }}>
            {backward ? `CURFEW ${fmt(cfg.end)} · CALL ${fmt(cfg.start)}` : `CALL ${fmt(cfg.start)}`} · {cfg.callLabel.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", margin: "14px 14px 0", border: `1px solid ${T.line}`, background: T.card }}>
          {Object.keys(PHASES).map((p) => (
            <button key={p} onClick={() => setPhase(p)}
              style={{ flex: 1, border: "none", background: phase === p ? T.deep : "transparent",
                color: phase === p ? T.deepInk : T.ash, fontFamily: MONO, fontSize: 10.5,
                letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 0", cursor: "pointer" }}>
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", margin: "8px 14px 0", border: `1px solid ${T.line}`, background: T.card }}>
          {[["auto","Auto draft"],["manual","I'll place them"]].map(([k, l]) => (
            <button key={k} onClick={() => {
                if (k === "manual" && Object.keys(M).length === 0)
                  setManual((p) => ({ ...p, [phase]: drafter(cfg, P) }));
                setHowBuilt(k);
              }}
              style={{ flex: 1, border: "none", background: howBuilt === k ? T.green : "transparent",
                color: howBuilt === k ? "#FFF" : T.ash, fontFamily: MONO, fontSize: 10,
                letterSpacing: "0.06em", textTransform: "uppercase", padding: "9px 0", cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {/* ---- the verdict ---- */}
        <div style={{ margin: "13px 14px 0", background: T.card, border: `1px solid ${late ? T.red : T.line}`, padding: "12px 13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash }}>
              {backward ? "Working back from the curfew" : "Working forward from the call"}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: peak > cfg.crew ? T.red : T.green }}>
              peak {peak} of {cfg.crew}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 40 }}>
            {barSlots.map((x) => {
              const n = load[x] || 0;
              const outside = backward ? x < cfg.start : x > cfg.end;
              return (
                <div key={x} style={{ flex: 1, height: `${Math.min(n / cfg.crew, 1) * 100}%`, minHeight: n ? 2 : 0,
                  background: n > cfg.crew || (n && outside) ? T.red : n === cfg.crew ? T.deep : n ? T.bright : "transparent" }} />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, color: T.ash, marginTop: 5 }}>
            <span>{fmt(cfg.start - 60)}</span><span>{fmt(cfg.end)}</span>
          </div>

          <div style={{ fontFamily: SANS, fontSize: 13, color: T.ink, marginTop: 10, lineHeight: 1.5 }}>
            {backward ? (
              late ? (
                <>Work has to start <strong>{fmt(firstStart)}</strong> — that is{" "}
                  <span style={{ color: T.red }}>{Math.abs(slack)} minutes before the {fmt(cfg.start)} call</span>.
                  The curfew is not reachable as staffed.</>
              ) : (
                <>Latest safe start is <strong>{fmt(firstStart)}</strong>, {slack} minutes after the call. Truck out {fmt(cfg.end)}.</>
              )
            ) : (
              <>Room is done <strong>{fmt(lastEnd)}</strong>. {slack >= 0 ? `${Math.floor(slack / 60)}h ${slack % 60}m before the call ends.` : "Past the call — somebody is into overtime."}</>
            )}
          </div>

          {backward && late && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.line}` }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: T.amber, marginBottom: 6 }}>
                Three ways out
              </div>
              {["Pull the strike call earlier", "Add hands to the strike crew", "Negotiate the curfew with the venue"].map((x) => (
                <div key={x} style={{ fontFamily: SANS, fontSize: 12.5, color: T.ash, padding: "2px 0" }}>· {x}</div>
              ))}
            </div>
          )}
        </div>

        {problems.length > 0 && (
          <div style={{ margin: "12px 14px 0", background: `${T.red}12`, border: `1px solid ${T.red}44`, padding: "11px 12px" }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: T.red, marginBottom: 7 }}>
              Out of order — {problems.length}
            </div>
            {problems.map((p, i) => (
              <div key={i} style={{ fontFamily: SANS, fontSize: 13, color: T.ink, padding: "3px 0" }}>
                <span style={{ fontFamily: MONO, fontSize: 11 }}>{p.id}</span> {p.text}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "16px 14px 40px" }}>
          {groups.map(([start, list]) => {
            const before = backward && start < cfg.start;
            return (
              <div key={start} style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                <div style={{ width: 66, flexShrink: 0, paddingTop: 10 }}>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: before ? T.red : T.ink }}>{fmt(start)}</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: T.ash, marginTop: 2 }}>
                    {list.reduce((n, t) => n + t.crew, 0)} hands
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0, borderLeft: `2px solid ${before ? T.red : T.line}`, paddingLeft: 10 }}>
                  {list.map((t) => {
                    const bad = problems.some((p) => p.id === t.id);
                    const pinned = P[t.id] !== undefined;
                    return (
                      <button key={t.id} onClick={() => setEditing(t.id)}
                        style={{ display: "block", width: "100%", textAlign: "left", background: T.card,
                          border: `1px solid ${bad ? T.red : T.line}`,
                          borderLeft: `3px solid ${DEPT_COLOR[t.dept] || T.line}`,
                          padding: "9px 10px", marginBottom: 5, cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 500, color: T.ink, lineHeight: 1.3 }}>{t.name}</div>
                            <div style={{ fontFamily: MONO, fontSize: 9.5, color: T.ash, marginTop: 4 }}>
                              {t.dept}{t.lead ? ` · ${t.lead}` : ""} · {t.crew} hand{t.crew > 1 ? "s" : ""} · {t.mins}m
                            </div>
                            {onPath.has(t.id) && (
                              <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.06em", color: T.amber, marginTop: 4 }}>
                                CRITICAL PATH — SLIPS HERE SLIP THE {backward ? "CURFEW" : "DAY"}
                              </div>
                            )}
                          </div>
                          <div style={{ flexShrink: 0, textAlign: "right" }}>
                            <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash }}>{fmt(start + t.mins)}</div>
                            {pinned && <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.05em", color: T.green, marginTop: 4 }}>PINNED</div>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {active && (
          <Mover T={T} task={active} start={placed[active.id]} pinned={P[active.id] !== undefined}
            cfg={cfg} backward={backward}
            onClose={() => setEditing(null)}
            onPlace={(s) => place(active.id, s)}
            onRelease={() => { release(active.id); setEditing(null); }} />
        )}
      </div>
    </div>
  );
}

function Mover({ T, task, start, pinned, cfg, backward, onClose, onPlace, onRelease }) {
  const cur = start ?? cfg.start;
  const nudge = (d) => onPlace(cur + d);
  const hours = [];
  for (let h = Math.floor((cfg.start - 60) / 60); h <= Math.floor(cfg.end / 60); h++) hours.push(h * 60);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: T.paper, borderTop: `2px solid ${T.bright}`, padding: "16px 14px 22px", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>{task.name}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.ash, fontFamily: MONO, fontSize: 17, cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash, marginBottom: 18 }}>
          {task.id} · {task.crew} hands · {task.mins} minutes
          {task.deps.length ? ` · after ${task.deps.join(", ")}` : ""}
        </div>

        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, marginBottom: 8 }}>
          Starts at
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Step T={T} onClick={() => nudge(-15)}>−15</Step>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 26, lineHeight: 1, color: T.ink }}>{fmt(cur)}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash, marginTop: 5 }}>ends {fmt(cur + task.mins)}</div>
          </div>
          <Step T={T} onClick={() => nudge(15)}>+15</Step>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {hours.map((h) => (
            <button key={h} onClick={() => onPlace(h)}
              style={{ fontFamily: MONO, fontSize: 11.5, padding: "8px 10px", borderRadius: 2, cursor: "pointer",
                border: `1px solid ${cur === h ? T.green : T.line}`,
                background: cur === h ? `${T.bright}22` : T.card, color: cur === h ? T.green : T.ash }}>
              {fmt(h)}
            </button>
          ))}
        </div>

        <div style={{ background: `${T.bright}12`, border: `1px solid ${T.line}`, padding: "10px 11px", marginBottom: 14 }}>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.ink, lineHeight: 1.5 }}>
            {pinned
              ? "Pinned. The drafter works around this task instead of moving it."
              : backward
                ? "Set a time and this becomes pinned. Everything else re-drafts backward from the curfew around it."
                : "Set a time and this becomes pinned. Everything else re-drafts around it."}
          </div>
        </div>

        <button onClick={onClose}
          style={{ width: "100%", border: "none", background: T.deep, color: T.deepInk, fontFamily: MONO,
            fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", padding: "13px 0", cursor: "pointer" }}>
          Done
        </button>
        {pinned && (
          <button onClick={onRelease}
            style={{ width: "100%", marginTop: 7, border: "none", background: "transparent", color: T.ash,
              fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", padding: "9px 0", cursor: "pointer" }}>
            Let the drafter decide again
          </button>
        )}
      </div>
    </div>
  );
}

function Step({ T, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ width: 66, height: 50, border: `1px solid ${T.line}`, background: T.card, color: T.ink,
        fontFamily: MONO, fontSize: 14, cursor: "pointer", borderRadius: 2 }}>
      {children}
    </button>
  );
}
