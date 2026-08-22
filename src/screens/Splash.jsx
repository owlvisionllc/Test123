// Splash — v0.1
//
// What you see while Supabase restores the session. This exists so a refresh
// does not flash a sign-in prompt at someone who is already signed in. It sits
// on the near-black bar colour, which is dark in both themes, so it does not
// flash a colour change either.

import { OwlMark } from "../ui";
import { MONO } from "../theme";

export default function Splash() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0C0F0C",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
      }}
    >
      <OwlMark size={64} color="#FFFFFF" />
      <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.2em", color: "#2DCC52" }}>
        PM PORTAL
      </div>
    </div>
  );
}
