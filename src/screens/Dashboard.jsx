// Dashboard — v0.8
// v0.8: the blocked tile counts blocked stages, not just named show-stoppers.
// v0.7: events come from listEvents(). Loading, failed and genuinely-empty are
// three different screens, because an empty list is the one thing that looks
// the same whether it is true or a policy problem.
// v0.6: "My events" means the signed-in person.

import { useMemo } from "react";
import { Chain, OwlMark, Pill } from "../ui";
import { MONO, SANS, useT } from "../theme";

export default function Dashboard({
  events, loading, error, onReload,
  profile, onOpen, filter, setFilter, onNew, canCreate,
}) {
  const T = useT();

  const list = useMemo(
    () => (filter === "mine" ? events.filter((e) => e.pmId && e.pmId === profile?.id) : events),
    [filter, events, profile]
  );

  const blocked = events.filter(isBlocked).length;
  const unfiled = events.filter((e) => !e.filed && e.stages.Schedule === "complete").length;
  const noFlex = events.filter((e) => !e.flexOpen).length;

  return (
    <div style={{ padding: "16px 14px 90px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{ n: blocked, l: "blocked", tone: T.red }, { n: noFlex, l: "no Flex quote", tone: T.amber }, { n: unfiled, l: "unfiled", tone: T.ash }].map((s) => (
          <div key={s.l} style={{ flex: 1, background: T.card, border: `1px solid ${T.line}`, padding: "10px 10px 9px" }}>
            <div style={{ fontFamily: MONO, fontSize: 24, lineHeight: 1, color: s.n ? s.tone : T.line }}>{loading ? "·" : s.n}</div>
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

      {loading && <Waiting />}

      {!loading && error && <Failed message={error} onRetry={onReload} />}

      {!loading && !error && list.length === 0 && (
        <Empty
          mine={filter === "mine"}
          anyAtAll={events.length > 0}
          canCreate={canCreate}
          onNew={onNew}
          onShowAll={() => setFilter("all")}
        />
      )}

      {!loading && !error && list.map((e) => (
        <button key={e.id} onClick={() => onOpen(e)}
          style={{ display: "block", width: "100%", textAlign: "left", background: T.card, border: `1px solid ${T.line}`, borderLeft: `3px solid ${isBlocked(e) ? T.red : e.filed ? T.deep : T.line}`, padding: "13px 13px 12px", marginBottom: 10, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: T.green, letterSpacing: "0.06em" }}>{e.date.toUpperCase()}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.ash }}>{e.pm}</div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: T.ink, margin: "3px 0 2px", lineHeight: 1.25 }}>{e.name.split(" — ")[0]}</div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: T.ash, marginBottom: 11 }}>{e.venue || "Venue to be set"}</div>
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

// A stage can be blocked before anyone has written down which show-stopper did
// it — blockers stays empty until intake is ported in task 7. Counting only
// named blockers would leave the tile reading 0 next to a red link in the
// chain, which reads as a broken tile rather than a clear board.
function isBlocked(e) {
  return e.blockers.length > 0 || Object.values(e.stages).includes("blocked");
}

/* ---------- the three states -------------------------------- */

function Waiting() {
  const T = useT();
  return (
    <div style={{ padding: "40px 0", textAlign: "center", fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ash }}>
      Loading events
    </div>
  );
}

function Failed({ message, onRetry }) {
  const T = useT();
  return (
    <div style={{ background: `${T.red}14`, border: `1px solid ${T.red}44`, padding: "14px 13px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: T.red, marginBottom: 7 }}>
        Events did not load
      </div>
      <div style={{ fontFamily: SANS, fontSize: 13.5, color: T.ink, lineHeight: 1.5 }}>{message}</div>
      <button onClick={onRetry}
        style={{ marginTop: 12, border: `1px solid ${T.line}`, background: "transparent", color: T.ink, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", padding: "9px 14px", cursor: "pointer" }}>
        Try again
      </button>
    </div>
  );
}

// Nothing to show. Says which kind of nothing it is, because "no events yet"
// and "none of these are yours" want completely different next steps.
function Empty({ mine, anyAtAll, canCreate, onNew, onShowAll }) {
  const T = useT();
  const minesEmpty = mine && anyAtAll;
  return (
    <div style={{ padding: "44px 20px 40px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, color: T.line }}>
        <OwlMark size={54} />
      </div>
      <div style={{ fontFamily: SANS, fontSize: 14, color: T.ash, lineHeight: 1.55, maxWidth: 300, margin: "0 auto" }}>
        {minesEmpty
          ? "No events are assigned to you."
          : "No events yet. The first one starts the chain."}
      </div>
      {minesEmpty ? (
        <button onClick={onShowAll}
          style={{ marginTop: 18, border: `1px solid ${T.line}`, background: "transparent", color: T.green, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "11px 18px", cursor: "pointer" }}>
          Show all events
        </button>
      ) : canCreate ? (
        <button onClick={onNew}
          style={{ marginTop: 18, border: "none", background: T.deep, color: T.deepInk, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 20px", cursor: "pointer" }}>
          + New event
        </button>
      ) : null}
    </div>
  );
}
