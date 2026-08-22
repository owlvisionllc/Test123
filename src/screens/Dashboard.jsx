// Dashboard — v0.6
// v0.6: "My events" now means the signed-in person rather than a hardcoded
// name. Events themselves are still the mock array until task 3.

import { useMemo } from "react";
import { Chain, Pill } from "../ui";
import { MONO, SANS, useT } from "../theme";

export default function Dashboard({ events, profile, onOpen, filter, setFilter, onNew, canCreate }) {
  const T = useT();

  const list = useMemo(() => {
    if (filter !== "mine") return events;
    // Task 3 switches this to e.pmId === profile.id once events are real.
    return events.filter((e) => e.pmId ? e.pmId === profile?.id : sameName(e.pm, profile?.full_name));
  }, [filter, events, profile]);

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

// The mock data abbreviates ("Barry G."), real profiles do not ("Barry
// Givney"). Match on the first name and surname initial so the filter is not
// simply broken while the data is still placeholder.
function sameName(mockName, fullName) {
  if (!mockName || !fullName) return false;
  const [aFirst, aLast = ""] = mockName.replace(".", "").split(" ");
  const [bFirst, bLast = ""] = fullName.split(" ");
  return aFirst === bFirst && (!aLast || bLast.startsWith(aLast));
}
