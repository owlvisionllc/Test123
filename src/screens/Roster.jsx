// Roster — v0.6
// Still the mock array. Task 5 swaps it for listCrew() and addCrewMember().

import { useState } from "react";
import { Field, Label, Sheet } from "../ui";
import { MONO, SANS, useT } from "../theme";
import { POSITION_CODES } from "../mockData";

export default function Roster({ roster, onAdd, canEdit }) {
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
      {canEdit && (
        <button onClick={() => setAdding(true)}
          style={{ width: "100%", background: "transparent", border: `1px dashed ${T.line}`, color: T.green, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 0", marginBottom: 12, cursor: "pointer" }}>
          + Add person
        </button>
      )}
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
