// Owl Vision PM Portal — shell  v0.7
//
// v0.7: the dashboard reads real events.
// v0.6: real sign-in. The mockup's signedIn boolean is now useSession, the
// login screen sends a magic link, and the theme follows the profile rather
// than the tab.
//
// Roster is still the mock array — task 5.

import { useEffect, useState } from "react";
import { sendMagicLink, signOut } from "./lib/supabase";
import { useSession } from "./lib/useSession";
import { useTheme } from "./lib/useTheme";
import { useEvents } from "./lib/useEvents";
import { THEMES, ThemeCtx, MONO, SANS } from "./theme";
import { OwlMark, ThemeToggle } from "./ui";
import { ROSTER } from "./mockData";
import Splash from "./screens/Splash";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import EventView from "./screens/EventView";
import Roster from "./screens/Roster";
import NewEventSheet from "./screens/NewEventSheet";
import AccountSheet from "./screens/AccountSheet";

export default function App() {
  const { profile, loading, role, canCreateEvents, canEditRoster } = useSession();
  const { mode, toggle, themeError } = useTheme(profile);
  const { events, loading: eventsLoading, error: eventsError, reload } = useEvents(!!profile);
  const T = THEMES[mode];

  const [tab, setTab] = useState("events");
  const [event, setEvent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [roster, setRoster] = useState(ROSTER);
  const [creating, setCreating] = useState(false);
  const [account, setAccount] = useState(false);

  // The viewport behind the 460px column, so the phone's overscroll and the
  // status bar area match the theme instead of flashing white.
  useEffect(() => {
    document.body.style.background = T.shell;
    document.documentElement.style.colorScheme = mode;
  }, [T.shell, mode]);

  const shell = (children) => (
    <ThemeCtx.Provider value={T}>
      <div style={{ background: T.shell, minHeight: "100vh", fontFamily: SANS, transition: "background 180ms ease" }}>
        <style>{`
          * { -webkit-tap-highlight-color: transparent; }
          button:focus-visible, input:focus-visible { outline: 2px solid ${T.bright}; outline-offset: 2px; }
          input::placeholder { color: ${T.ash}; }
          @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }`}</style>
        <div style={{ maxWidth: 460, margin: "0 auto", background: T.paper, minHeight: "100vh", display: "flex", flexDirection: "column", boxShadow: mode === "dark" ? "none" : "0 0 40px rgba(0,0,0,.08)" }}>
          {children}
        </div>
      </div>
    </ThemeCtx.Provider>
  );

  // Supabase restores the session asynchronously. Show the owl, not the login
  // screen, or every refresh flashes a sign-in prompt at someone already in.
  if (loading) return shell(<Splash />);

  if (!profile) return shell(<Login onSend={sendMagicLink} mode={mode} onToggle={toggle} />);

  return shell(
    <>
      {!event && (
        <div style={{ background: T.bar, color: T.barInk, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <OwlMark size={24} color={T.barInk} />
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", color: T.bright }}>PM PORTAL</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle mode={mode} onToggle={toggle} />
            <button
              onClick={() => setAccount(true)}
              aria-label="Account"
              style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: T.deep, color: T.deepInk, fontFamily: MONO, fontSize: 10.5, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              {initials(profile.full_name)}
            </button>
          </div>
        </div>
      )}

      {themeError && (
        <div style={{ background: `${T.amber}1F`, borderBottom: `1px solid ${T.amber}55`, color: T.amber, fontFamily: MONO, fontSize: 10.5, lineHeight: 1.5, padding: "8px 14px" }}>
          {themeError}
        </div>
      )}

      <div style={{ flex: 1 }}>
      {event ? (
        <EventView event={event} onBack={() => setEvent(null)} mode={mode} onToggle={toggle} />
      ) : tab === "events" ? (
        <Dashboard
          events={events}
          loading={eventsLoading}
          error={eventsError}
          onReload={reload}
          profile={profile}
          onOpen={setEvent}
          filter={filter}
          setFilter={setFilter}
          onNew={() => setCreating(true)}
          canCreate={canCreateEvents}
        />
      ) : (
        <Roster
          roster={roster}
          canEdit={canEditRoster}
          onAdd={(p) => setRoster([{ ...p, pos: p.pos.length ? p.pos : ["HAND"] }, ...roster])}
        />
      )}
      </div>

      {creating && <NewEventSheet onClose={() => setCreating(false)} />}

      {account && (
        <AccountSheet
          profile={profile}
          role={role}
          onClose={() => setAccount(false)}
          onSignOut={signOut}
        />
      )}

      {!event && (
        <div style={{ position: "sticky", bottom: 0, display: "flex", background: T.card, borderTop: `1px solid ${T.line}` }}>
          {[["events", "Events"], ["roster", "Roster"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ flex: 1, border: "none", background: "transparent", borderTop: `2px solid ${tab === k ? T.green : "transparent"}`, color: tab === k ? T.green : T.ash, fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 0", cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function initials(name) {
  if (!name) return "··";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "··";
}
