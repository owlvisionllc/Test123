// Event view — v0.6
// Unchanged from the mockup apart from being its own file. The Flex toggle is
// still local state; task 6 in WIRING.md points it at setFlexOpened.

import { useState } from "react";
import { Chain, Label, ThemeToggle } from "../ui";
import { MONO, SANS, STAGES, STAGE_BLURB, STAGE_FEEDS, useT } from "../theme";

export default function EventView({ event, onBack, mode, onToggle }) {
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
