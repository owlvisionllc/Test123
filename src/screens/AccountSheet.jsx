// Account sheet — v0.1
//
// Not in the mockup. Added because task 6 needs two people signing in on the
// same phone, and without a way out you cannot swap accounts. It is also the
// only place the app states plainly what role you are, which is worth having
// when a permission behaves unexpectedly.

import { Sheet } from "../ui";
import { MONO, SANS, useT } from "../theme";

export default function AccountSheet({ profile, role, onSignOut, onClose }) {
  const T = useT();
  return (
    <Sheet title="Signed in" onClose={onClose}>
      <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, color: T.ink }}>
        {profile?.full_name || "Unnamed"}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 12, color: T.ash, marginTop: 4 }}>{profile?.email}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.green, marginTop: 10 }}>
        {role || "no role"}
      </div>

      <button
        onClick={onSignOut}
        style={{ width: "100%", marginTop: 18, border: `1px solid ${T.line}`, background: "transparent", color: T.red, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", padding: "13px 0", cursor: "pointer" }}
      >
        Sign out
      </button>
    </Sheet>
  );
}
