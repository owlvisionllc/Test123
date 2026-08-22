// Login — v0.6
//
// v0.6: email and a magic link, replacing the mockup's Sign in with Google.
// Google is Route B in docs/AUTH-WALKTHROUGH.md and is not set up yet; the
// mockup was drawn ahead of that decision.
//
// The important behaviour: after sending, this says CHECK YOUR EMAIL for any
// address at all. Supabase reports success even for an address the domain
// trigger will refuse, deliberately, so the screen cannot be used to work out
// who does and does not work here. A gmail address gets this same message and
// then simply never receives anything. That is not a fault.

import { useState } from "react";
import { OwlMark, ThemeToggle } from "../ui";
import { MONO, SANS, useT } from "../theme";

export default function Login({ onSend, mode, onToggle }) {
  const T = useT();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const ok = /\S+@\S+\.\S+/.test(email.trim());

  const submit = async (e) => {
    e.preventDefault();
    if (!ok || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(email);
      setSent(true);
    } catch (err) {
      // Real failures only — a rate limit or no connection. A refused address
      // does not land here, by design.
      setError(
        err?.message?.includes("rate")
          ? "Too many links requested. Wait a few minutes and try again."
          : `The link could not be sent. ${err?.message || "Check your connection."}`
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bar, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 14px" }}>
        <ThemeToggle mode={mode} onToggle={onToggle} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px 60px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <OwlMark size={72} color="#FFFFFF" />
        </div>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.2em", color: T.bright, marginBottom: 8 }}>
          PM PORTAL
        </div>
        <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 14, color: "#8A938C", lineHeight: 1.5, marginBottom: 30 }}>
          Intake, labor, positions, tasks and the schedule — one record per event.
        </div>

        {sent ? (
          <div style={{ border: "1px solid #2E362F", background: "#101410", padding: "18px 16px" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.bright, marginBottom: 9 }}>
              Check your email
            </div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: "#C7CFC8", lineHeight: 1.55 }}>
              If <span style={{ fontFamily: MONO, fontSize: 13 }}>{email.trim().toLowerCase()}</span> is an
              Owl Vision account, a sign-in link is on its way. It works once and expires in an hour.
            </div>
            <button
              onClick={() => { setSent(false); setError(null); }}
              style={{ marginTop: 14, background: "none", border: "none", padding: 0, color: "#8A938C", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Use a different address
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A938C", marginBottom: 6 }}>
              Work email
            </div>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@owlvisionllc.com"
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #2E362F", background: "#101410", padding: "13px 12px", fontFamily: SANS, fontSize: 15.5, color: "#EDF1EE", marginBottom: 10 }}
            />
            <button
              type="submit"
              disabled={!ok || sending}
              style={{ width: "100%", border: "none", background: ok && !sending ? "#FFFFFF" : "#1A1F1B", color: ok && !sending ? "#0C0F0C" : "#5E665F", fontFamily: SANS, fontWeight: 600, fontSize: 15, padding: "14px 0", cursor: ok && !sending ? "pointer" : "not-allowed" }}
            >
              {sending ? "Sending" : "Send sign-in link"}
            </button>
          </form>
        )}

        {error && (
          <div style={{ marginTop: 12, background: `${T.red}1F`, border: `1px solid ${T.red}55`, padding: "10px 11px", fontFamily: SANS, fontSize: 13, color: "#E8B3AD", lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10, letterSpacing: "0.05em", color: "#5E665F", marginTop: 16, lineHeight: 1.6 }}>
          @owlvisionllc.com accounts only
        </div>
      </div>

      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", color: "#3D443E", padding: "0 0 20px" }}>
        OWL VISION LLC · INTERNAL
      </div>
    </div>
  );
}
