import React, { useState, useMemo } from "react";

/* ============================================================
   OWL VISION PM PORTAL — Positions screen v0.3
   The stage where a labor quote stops being headcount and
   becomes people. Tap any slot to name it.

   The thing to watch: "on site today" at the top. It is a
   distinct count of humans, not a sum of shift lines, so the
   install crew coming back as strike crew counts once. That
   number can no longer be wrong, which retires the red warning
   the labor tool has today.
   ============================================================ */

const THEMES = {
  light: { mode:"light", shell:"#DDE2DD", paper:"#EFF2EF", card:"#FFFFFF", ink:"#0C0F0C", bar:"#0C0F0C", barInk:"#FFFFFF",
    hero:"#0F4A20", deep:"#0F4A20", deepInk:"#FFFFFF", green:"#1B7A33", bright:"#2DCC52", line:"#DCE1DC", empty:"#E6EAE6",
    ash:"#79817A", amber:"#9A5510", red:"#A32B22", inputBg:"#FFFFFF", waiting:"#F2F4F2" },
  dark: { mode:"dark", shell:"#050705", paper:"#0E110F", card:"#171B18", ink:"#EDF1EE", bar:"#060806", barInk:"#EDF1EE",
    hero:"#0D3A19", deep:"#1B7A33", deepInk:"#E6F7EB", green:"#4FD973", bright:"#2DCC52", line:"#262D27", empty:"#212721",
    ash:"#8A938C", amber:"#D79A4A", red:"#D9584C", inputBg:"#101410", waiting:"#1A1F1B" },
};
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const SANS = "'Archivo', -apple-system, system-ui, sans-serif";

const CREW = [
  { id: 1, name: "Eddie Olivares", pos: ["A1","PM"], staff: true },
  { id: 2, name: "Marco Cobian", pos: ["V1","LEDT"], staff: true },
  { id: 3, name: "Barry Givney", pos: ["PM","V1"], staff: true },
  { id: 4, name: "Kelton Pelot", pos: ["SL","DRV","HAND"], staff: true },
  { id: 5, name: "Van Bong", pos: ["V2","CAM","LEDT"], staff: true },
  { id: 6, name: "Teddy Battle", pos: ["PM","OM"], staff: true },
  { id: 7, name: "R. Alvarez", pos: ["HAND"], staff: false },
  { id: 8, name: "J. Nakamura", pos: ["LX","HAND"], staff: false },
  { id: 9, name: "D. Whitfield", pos: ["RIG","HAND"], staff: false },
  { id:10, name: "S. Obi", pos: ["LD","LX"], staff: false },
  { id:11, name: "M. Ferrante", pos: ["A2","HAND"], staff: false },
  { id:12, name: "C. Duarte", pos: ["HAND","DRV"], staff: false },
  { id:13, name: "P. Rangel", pos: ["HAND"], staff: false },
  { id:14, name: "T. Vo", pos: ["LEDT","HAND"], staff: false },
];

const POS = {
  PM:"Project Manager", OM:"Onsite Manager", A1:"Audio Lead / A1", A2:"Audio 2",
  LD:"Lighting Lead / LD", LX:"Lighting Tech", V1:"Video Lead / V1", V2:"Video 2",
  LEDT:"LED Tech", CAM:"Camera Op", RIG:"Rigger", SL:"Stage Lead", HAND:"Stagehand", DRV:"Driver",
};
const LEADS = ["PM","OM","A1","LD","V1","SL"];

const INITIAL = [
  { id:"s1", label:"Install Crew", kind:"install", call:"07:00", out:"20:00",
    slots:[
      { i:0, pos:"SL",   crew:4 }, { i:1, pos:"V1", crew:2 }, { i:2, pos:"LEDT", crew:14 },
      { i:3, pos:"RIG",  crew:9 }, { i:4, pos:"HAND", crew:7 }, { i:5, pos:"HAND", crew:13 },
      { i:6, pos:"HAND", crew:null }, { i:7, pos:null, crew:null },
    ]},
  { id:"s2", label:"Show / Operators", kind:"show", call:"12:00", out:"22:00",
    slots:[
      { i:0, pos:"PM", crew:3 }, { i:1, pos:"A1", crew:1 }, { i:2, pos:"LD", crew:10 },
      { i:3, pos:"V2", crew:5 }, { i:4, pos:"A2", crew:null },
    ]},
  { id:"s3", label:"Strike Crew", kind:"strike", call:"22:00", out:"02:00",
    slots:[
      { i:0, pos:"SL", crew:4 }, { i:1, pos:"HAND", crew:7 }, { i:2, pos:"HAND", crew:13 },
      { i:3, pos:"HAND", crew:null }, { i:4, pos:"HAND", crew:null }, { i:5, pos:"DRV", crew:12 },
    ]},
];

const mins = (t) => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const span = (s) => { const a = mins(s.call), b = mins(s.out); return [a, b <= a ? b + 1440 : b]; };
const overlaps = (a, b) => { const [a1,a2]=span(a), [b1,b2]=span(b); return a1 < b2 && b1 < a2; };
const fmt = (t) => { let [h,m]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; h=h%12||12; return `${h}:${String(m).padStart(2,"0")} ${ap}`; };
const crewById = (id) => CREW.find((c) => c.id === id);

export default function Positions() {
  const [mode, setMode] = useState("light");
  const [shifts, setShifts] = useState(INITIAL);
  const [picking, setPicking] = useState(null);   // { shiftId, slotIndex }
  const [view, setView] = useState("slots");
  const T = THEMES[mode];

  const totalSlots = shifts.reduce((n, s) => n + s.slots.length, 0);
  const named = shifts.reduce((n, s) => n + s.slots.filter((x) => x.crew).length, 0);

  // distinct humans — the number that used to be typed by hand
  const onSite = useMemo(() => {
    const set = new Set();
    shifts.forEach((s) => s.slots.forEach((x) => x.crew && set.add(x.crew)));
    return set.size;
  }, [shifts]);

  const doubles = useMemo(() => {
    const counts = {};
    shifts.forEach((s) => s.slots.forEach((x) => x.crew && (counts[x.crew] = (counts[x.crew] || 0) + 1)));
    return Object.entries(counts).filter(([, n]) => n > 1).map(([id]) => Number(id));
  }, [shifts]);

  const setSlot = (shiftId, slotIndex, patch) =>
    setShifts((prev) => prev.map((s) =>
      s.id !== shiftId ? s : { ...s, slots: s.slots.map((x) => (x.i !== slotIndex ? x : { ...x, ...patch })) }
    ));

  const autoFillLeads = () =>
    setShifts((prev) => {
      const used = new Set();
      return prev.map((s) => ({ ...s, slots: s.slots.map((x) => {
        if (x.crew || !x.pos || !LEADS.includes(x.pos)) return x;
        const pick = CREW.find((c) => c.pos.includes(x.pos) && c.staff && !used.has(c.id));
        if (!pick) return x;
        used.add(pick.id);
        return { ...x, crew: pick.id };
      })}));
    });

  const active = picking ? shifts.find((s) => s.id === picking.shiftId) : null;
  const activeSlot = active ? active.slots.find((x) => x.i === picking.slotIndex) : null;

  return (
    <div style={{ background: T.shell, minHeight: "100vh", fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        button:focus-visible { outline: 2px solid ${T.bright}; outline-offset: 2px; }`}</style>

      <div style={{ maxWidth: 460, margin: "0 auto", background: T.paper, minHeight: "100vh" }}>

        {/* header */}
        <div style={{ background: T.hero, color: "#FFF", padding: "13px 14px 15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "#9FD8AF" }}>← LALLY EVENTS</div>
            <button onClick={() => setMode(mode === "light" ? "dark" : "light")}
              style={{ width: 30, height: 30, borderRadius: 2, border: "1px solid rgba(255,255,255,.25)", background: "transparent", color: "#FFF", cursor: "pointer", fontFamily: MONO, fontSize: 12 }}>
              {mode === "dark" ? "☀" : "☾"}
            </button>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700 }}>Positions</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#B9D6C2", marginTop: 4 }}>
            DAY 1 · FRI SEP 18 · WINDOW 19 HRS @ $85/HR
          </div>
        </div>

        {/* the count that can no longer be wrong */}
        <div style={{ display: "flex", gap: 8, padding: "14px 14px 0" }}>
          <div style={{ flex: 1, background: T.card, border: `1px solid ${T.line}`, padding: "11px 12px" }}>
            <div style={{ fontFamily: MONO, fontSize: 26, lineHeight: 1, color: T.deep }}>{onSite}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em", color: T.ash, marginTop: 5 }}>on site today</div>
          </div>
          <div style={{ flex: 1, background: T.card, border: `1px solid ${T.line}`, padding: "11px 12px" }}>
            <div style={{ fontFamily: MONO, fontSize: 26, lineHeight: 1, color: named === totalSlots ? T.deep : T.amber }}>
              {named}<span style={{ fontSize: 14, color: T.ash }}>/{totalSlots}</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em", color: T.ash, marginTop: 5 }}>slots named</div>
          </div>
        </div>

        <div style={{ padding: "9px 14px 0", fontFamily: SANS, fontSize: 12, color: T.ash, lineHeight: 1.5 }}>
          {totalSlots} shift lines, {onSite} people.
          {doubles.length > 0 && ` ${doubles.length} working more than one call — counted once.`}
        </div>

        {/* view toggle */}
        <div style={{ display: "flex", margin: "13px 14px 0", border: `1px solid ${T.line}`, background: T.card }}>
          {[["slots","Fill"],["list","By person"],["call","By call"]].map(([k,l]) => (
            <button key={k} onClick={() => setView(k)}
              style={{ flex:1, border:"none", background: view===k ? T.deep : "transparent", color: view===k ? T.deepInk : T.ash,
                fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", padding: "10px 0", cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {view === "slots" ? (
          <div style={{ padding: "14px 14px 40px" }}>
            {named < totalSlots && (
              <button onClick={autoFillLeads}
                style={{ width: "100%", background: "transparent", border: `1px dashed ${T.line}`, color: T.green,
                  fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "11px 0", marginBottom: 12, cursor: "pointer" }}>
                Auto-fill the lead positions
              </button>
            )}

            {shifts.map((s) => {
              const filled = s.slots.filter((x) => x.crew).length;
              return (
                <div key={s.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: T.ink }}>{s.label}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10.5, color: T.ash, marginTop: 3 }}>
                        {fmt(s.call)} → {fmt(s.out)}{mins(s.out) <= mins(s.call) ? " (+1)" : ""}
                      </div>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, color: filled === s.slots.length ? T.green : T.amber }}>
                      {filled}/{s.slots.length}
                    </div>
                  </div>

                  {s.slots.map((x) => {
                    const person = x.crew ? crewById(x.crew) : null;
                    const lead = x.pos && LEADS.includes(x.pos);
                    return (
                      <button key={x.i} onClick={() => setPicking({ shiftId: s.id, slotIndex: x.i })}
                        style={{ display: "flex", width: "100%", textAlign: "left", alignItems: "center", gap: 10,
                          background: T.card, border: `1px solid ${T.line}`,
                          borderLeft: `3px solid ${person ? (lead ? T.deep : T.line) : T.amber}`,
                          padding: "10px 11px", marginBottom: 5, cursor: "pointer" }}>
                        <div style={{ width: 46, flexShrink: 0, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.04em",
                          color: x.pos ? (lead ? T.green : T.ash) : T.amber }}>
                          {x.pos || "—"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: person ? 600 : 400,
                            color: person ? T.ink : T.ash, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {person ? person.name : "Unnamed — still prices"}
                          </div>
                          {x.pos && <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.ash, marginTop: 2 }}>{POS[x.pos]}</div>}
                        </div>
                        {person && doubles.includes(person.id) && (
                          <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.05em", color: T.green,
                            border: `1px solid ${T.green}44`, padding: "2px 5px", borderRadius: 2, flexShrink: 0 }}>2 CALLS</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : view === "list" ? (
          <PositionsList shifts={shifts} T={T} />
        ) : (
          <CallSheet shifts={shifts} T={T} />
        )}

        {picking && (
          <Picker T={T} shift={active} slot={activeSlot} shifts={shifts}
            onClose={() => setPicking(null)}
            onPick={(patch) => { setSlot(picking.shiftId, picking.slotIndex, patch); setPicking(null); }} />
        )}
      </div>
    </div>
  );
}

/* ---------- the paper output --------------------------------
   One row per person. Two calls stack under one name — the list
   is as long as the headcount, which is the point.
------------------------------------------------------------- */
function PositionsList({ shifts, T }) {
  const byPerson = new Map();
  shifts.forEach((s) =>
    s.slots.forEach((x) => {
      if (!x.crew) return;
      if (!byPerson.has(x.crew)) byPerson.set(x.crew, { id: x.crew, name: crewById(x.crew).name, calls: [] });
      byPerson.get(x.crew).calls.push({ pos: x.pos, shift: s.label, call: s.call, out: s.out });
    })
  );

  const rank = (p) => (p.calls.some((c) => LEADS.includes(c.pos)) ? 0 : 1);
  const rows = [...byPerson.values()].sort(
    (a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)
  );
  const totalCalls = rows.reduce((n, r) => n + r.calls.length, 0);

  return (
    <div style={{ padding: "14px 14px 40px" }}>
      <div style={{ background: T.card, border: `1px solid ${T.line}` }}>
        <div style={{ padding: "12px 13px", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ash }}>Positions list</div>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: T.ink, marginTop: 4 }}>Lally Events — Menlo Circus Club</div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: T.ash, marginTop: 3 }}>
            DAY 1 · FRI SEP 18 · {rows.length} PEOPLE · {totalCalls} CALLS
          </div>
        </div>

        {rows.map((r, i) => {
          const isLead = rank(r) === 0;
          const dbl = r.calls.length > 1;
          return (
            <div key={r.id} style={{ padding: "9px 13px",
              borderBottom: i === rows.length - 1 ? "none" : `1px solid ${T.line}`,
              background: isLead ? `${T.bright}0F` : "transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, flexShrink: 0, fontFamily: MONO, fontSize: 10.5, color: isLead ? T.green : T.ash }}>
                  {r.calls[0].pos}
                </div>
                <div style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, fontWeight: isLead ? 600 : 400, color: T.ink }}>
                  {r.name}
                </div>
                {dbl ? (
                  <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.05em", color: T.green,
                    border: `1px solid ${T.green}44`, padding: "2px 5px", borderRadius: 2, flexShrink: 0 }}>
                    {r.calls.length} CALLS
                  </span>
                ) : (
                  <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash, flexShrink: 0 }}>
                    {fmt(r.calls[0].call)}–{fmt(r.calls[0].out)}
                  </div>
                )}
              </div>

              {dbl && (
                <div style={{ marginTop: 5, paddingLeft: 54 }}>
                  {r.calls.map((c, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "2px 0" }}>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: T.ash }}>
                        {c.shift}{c.pos !== r.calls[0].pos ? ` · ${c.pos}` : ""}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash, flexShrink: 0 }}>
                        {fmt(c.call)}–{fmt(c.out)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.ash, marginTop: 12, lineHeight: 1.5 }}>
        Leads shaded. Anyone on more than one call is listed once with both times under their name, so the length of this
        list is the headcount — {rows.length} people, {totalCalls} calls. This is what the task sheet builds from.
      </div>
    </div>
  );
}

/* ---------- the same list, by call ---------------------------
   What a crew chief actually reads on the day: one block per
   call, leads at the top of each. Same rows, different cut.
------------------------------------------------------------- */
function CallSheet({ shifts, T }) {
  return (
    <div style={{ padding: "14px 14px 40px" }}>
      {shifts.map((s) => {
        const people = s.slots
          .filter((x) => x.crew)
          .map((x) => ({ ...crewById(x.crew), pos: x.pos }))
          .sort((a, b) => (LEADS.includes(b.pos) ? 1 : 0) - (LEADS.includes(a.pos) ? 1 : 0) || a.name.localeCompare(b.name));
        const open = s.slots.length - people.length;
        return (
          <div key={s.id} style={{ background: T.card, border: `1px solid ${T.line}`, marginBottom: 12 }}>
            <div style={{ padding: "11px 13px", borderBottom: `1px solid ${T.line}`, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: T.ink }}>{s.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: T.ash, marginTop: 3 }}>
                  {fmt(s.call)} → {fmt(s.out)}{mins(s.out) <= mins(s.call) ? " (+1)" : ""}
                </div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: open ? T.amber : T.green, flexShrink: 0 }}>
                {people.length} called{open ? ` · ${open} open` : ""}
              </div>
            </div>

            {people.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 13px",
                borderBottom: i === people.length - 1 && !open ? "none" : `1px solid ${T.line}`,
                background: LEADS.includes(p.pos) ? `${T.bright}0F` : "transparent" }}>
                <div style={{ width: 44, flexShrink: 0, fontFamily: MONO, fontSize: 10.5, color: LEADS.includes(p.pos) ? T.green : T.ash }}>{p.pos}</div>
                <div style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, fontWeight: LEADS.includes(p.pos) ? 600 : 400, color: T.ink }}>{p.name}</div>
              </div>
            ))}

            {open > 0 && (
              <div style={{ padding: "9px 13px", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.05em", color: T.amber }}>
                {open} SLOT{open > 1 ? "S" : ""} STILL UNNAMED
              </div>
            )}
          </div>
        );
      })}
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.ash, marginTop: 2, lineHeight: 1.5 }}>
        Same people as the by-person list — anyone on two calls appears in both blocks here, which is what you want when
        you are looking up who is on strike at ten.
      </div>
    </div>
  );
}

/* ---------- picker ------------------------------------------ */
function Picker({ T, shift, slot, shifts, onClose, onPick }) {
  const [pos, setPos] = useState(slot.pos);

  const conflictFor = (crewId) => {
    for (const s of shifts) {
      if (s.id === shift.id) continue;
      if (s.slots.some((x) => x.crew === crewId) && overlaps(s, shift)) return s.label;
    }
    return null;
  };

  const eligible = CREW
    .filter((c) => !pos || c.pos.includes(pos))
    .sort((a, b) => Number(b.staff) - Number(a.staff) || a.name.localeCompare(b.name));

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: T.paper, borderTop: `2px solid ${T.bright}`, padding: "16px 14px 22px", maxHeight: "86vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ash }}>
            {shift.label} · {fmt(shift.call)}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.ash, fontFamily: MONO, fontSize: 17, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, marginBottom: 8 }}>Position</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {Object.keys(POS).map((c) => {
            const on = pos === c;
            return (
              <button key={c} onClick={() => setPos(on ? null : c)}
                style={{ fontFamily: MONO, fontSize: 11, padding: "7px 10px", borderRadius: 2, cursor: "pointer",
                  border: `1px solid ${on ? T.green : T.line}`, background: on ? `${T.bright}22` : "transparent",
                  color: on ? T.green : LEADS.includes(c) ? T.ink : T.ash }}>
                {c}
              </button>
            );
          })}
        </div>

        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, marginBottom: 8 }}>
          {pos ? `Who can work ${pos}` : "Anyone on the roster"}
        </div>

        {slot.crew && (
          <button onClick={() => onPick({ pos, crew: null })}
            style={{ width: "100%", textAlign: "left", background: "transparent", border: `1px dashed ${T.line}`,
              color: T.amber, fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "11px 12px", marginBottom: 6, cursor: "pointer" }}>
            Clear this slot
          </button>
        )}

        {eligible.map((c) => {
          const clash = conflictFor(c.id);
          return (
            <button key={c.id} disabled={!!clash} onClick={() => onPick({ pos, crew: c.id })}
              style={{ display: "flex", width: "100%", textAlign: "left", alignItems: "center", gap: 10,
                background: slot.crew === c.id ? `${T.bright}18` : T.card,
                border: `1px solid ${slot.crew === c.id ? T.green : T.line}`,
                padding: "11px 12px", marginBottom: 5, cursor: clash ? "not-allowed" : "pointer", opacity: clash ? 0.5 : 1 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: T.ink }}>{c.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash, marginTop: 3 }}>
                  {c.pos.join(" · ")} {c.staff ? "· STAFF" : ""}
                </div>
              </div>
              {clash && (
                <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.04em", color: T.red, textAlign: "right", flexShrink: 0, lineHeight: 1.4 }}>
                  ON {clash.toUpperCase()}<br />AT THIS HOUR
                </span>
              )}
            </button>
          );
        })}

        {eligible.length === 0 && (
          <div style={{ fontFamily: SANS, fontSize: 13, color: T.ash, padding: "14px 0", lineHeight: 1.5 }}>
            Nobody on the roster is marked for {pos}. Add the position to someone in Roster, or leave the slot unnamed — it still prices.
          </div>
        )}
      </div>
    </div>
  );
}
