// Shared building blocks — v0.6
// From the dashboard mockup. The mark, the theme toggle, and the small
// pieces every screen is assembled out of.

import { useT, MONO, SANS, STAGES } from "./theme";

/* ---------- the mark ----------------------------------------
   Drawn inline rather than loaded from public/ so it inherits
   currentColor. The artwork is identical to owl-vision-mark.svg;
   as an <img> that file cannot pick up the colour it sits on.
------------------------------------------------------------- */
export function OwlMark({ size = 26, color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 100 47"
      height={size}
      width={(size * 100) / 47}
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Owl Vision"
      style={{ display: "block", overflow: "visible" }}
    >
      <path d="M24 4.5 C21.5 13 29 16.5 36 20.5 C42 24 46 29.5 48 34" />
      <path d="M72.5 4.5 C75 13 67 16.5 60 20.5 C54 24 50 29.5 48 34" />
      <circle cx="30" cy="27" r="11.6" />
      <circle cx="66" cy="27" r="11.6" />
      <path d="M22.2 28.3 L38.3 32.4" />
      <path d="M57.2 32.2 L74.2 28.3" />
      <path d="M48 34.6 L51.6 38.6 L48 42.6 L44.4 38.6 Z" />
    </svg>
  );
}

export function ThemeToggle({ mode, onToggle }) {
  const T = useT();
  return (
    <button
      onClick={onToggle}
      aria-label={mode === "dark" ? "Switch to light" : "Switch to dark"}
      style={{
        width: 30, height: 30, borderRadius: 2, cursor: "pointer",
        border: `1px solid ${T.mode === "dark" ? "#2E362F" : "#2A302B"}`,
        background: "transparent", color: T.barInk,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {mode === "dark" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M19.1 4.9l-1.5 1.5M6.4 17.6l-1.5 1.5" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.8 6.8 0 0 0 11 11z" />
        </svg>
      )}
    </button>
  );
}

export function Field({ label, value, onChange, placeholder, type = "text", ...rest }) {
  const T = useT();
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ash, marginBottom: 5 }}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${T.line}`, background: T.inputBg, padding: "10px 11px", fontFamily: SANS, fontSize: 14.5, color: T.ink }}
        {...rest}
      />
    </div>
  );
}

export function Sheet({ title, children, onClose, onSave, saveLabel = "Save", canSave = true }) {
  const T = useT();
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: T.paper, borderTop: `2px solid ${T.bright}`, padding: "16px 14px 20px", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ash }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: T.ash, fontFamily: MONO, fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
        </div>
        {children}
        {onSave && (
          <button
            onClick={onSave}
            disabled={!canSave}
            style={{ width: "100%", marginTop: 6, border: "none", background: canSave ? T.deep : T.waiting, color: canSave ? T.deepInk : T.ash, fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", padding: "13px 0", cursor: canSave ? "pointer" : "not-allowed" }}
          >
            {saveLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- the signature element ---------------------------
   Five links, physically connected. A blocked link goes red and
   everything after it dims, because it genuinely cannot start.
------------------------------------------------------------- */
export function Chain({ stages, compact }) {
  const T = useT();
  const firstBlockIdx = STAGES.findIndex((s) => stages[s] === "blocked");
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 2 }}>
      {STAGES.map((s, i) => {
        const st = stages[s];
        const stalled = firstBlockIdx > -1 && i > firstBlockIdx;
        let bg = T.empty, fg = T.ash;
        if (st === "complete") { bg = T.deep; fg = T.deepInk; }
        else if (st === "in_progress") { bg = T.bright; fg = T.brightInk; }
        else if (st === "blocked") { bg = T.red; fg = "#FFFFFF"; }
        return (
          <div
            key={s}
            style={{
              flex: 1, background: bg, color: fg,
              padding: compact ? "5px 3px" : "7px 4px",
              fontFamily: MONO, fontSize: compact ? 8.5 : 9.5,
              letterSpacing: "0.06em", textAlign: "center", textTransform: "uppercase",
              clipPath:
                i === 0
                  ? "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%)"
                  : i === STAGES.length - 1
                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 6px 50%)"
                  : "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%, 6px 50%)",
              opacity: stalled ? 0.4 : 1,
            }}
          >
            {compact ? s.slice(0, 3) : s}
          </div>
        );
      })}
    </div>
  );
}

export function Pill({ children, tone = "ash" }) {
  const T = useT();
  const c = { ash: T.ash, red: T.red, green: T.green, amber: T.amber }[tone];
  return (
    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", color: c, border: `1px solid ${c}44`, background: `${c}14`, padding: "3px 7px", borderRadius: 2, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function Label({ children }) {
  const T = useT();
  return <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ash, marginBottom: 8 }}>{children}</div>;
}
