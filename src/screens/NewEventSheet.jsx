// New event sheet — v0.7
// v0.7: save is off. The list behind it is real now, so a sheet that added a
// card to local state would show an event that quietly disappears on refresh —
// worse than not saving at all. Task 4 points this at createEvent() and turns
// the hardcoded PM list into listPMs().

import { useState } from "react";
import { Field, Sheet } from "../ui";
import { MONO, SANS, useT } from "../theme";

export default function NewEventSheet({ onClose }) {
  const T = useT();
  const [d, setD] = useState({ name: "", venue: "", date: "", pm: "Barry G.", flexQ: "" });
  return (
    <Sheet title="New event" onClose={onClose} onSave={() => {}} canSave={false} saveLabel="Saving arrives in task 4">
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
