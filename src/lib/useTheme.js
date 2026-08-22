import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

/** Light or dark, persisted to the user's profile.
 *
 *  localStorage is a cache, not the record. It exists only so the splash and
 *  the login screen do not flash the wrong theme in the half second before the
 *  profile arrives. The profile is what actually follows someone between
 *  their phone and their laptop.
 */

const KEY = "ov.theme";
const valid = (t) => t === "light" || t === "dark";

function remembered() {
  try {
    const t = localStorage.getItem(KEY);
    return valid(t) ? t : null;
  } catch {
    return null; // private window, or storage turned off
  }
}

export function useTheme(profile) {
  const [mode, setMode] = useState(() => remembered() ?? "light");
  const [adoptedFor, setAdoptedFor] = useState(null);
  const [themeError, setThemeError] = useState(null);

  // Take the profile's choice once, when we first see that person, and then
  // leave it alone. Done during render rather than in an effect so there is no
  // pass with the wrong theme on screen.
  //
  // Keyed on WHO, not on the theme value. Keying on the value means the moment
  // someone toggles, the profile row still holds the old one and this reverts
  // them on the very next render. Signing in as someone else re-adopts,
  // which is the only time it should.
  if (profile?.id && adoptedFor !== profile.id) {
    setAdoptedFor(profile.id);
    if (valid(profile.theme)) setMode(profile.theme);
  }

  // Mirror to the cache. An external system, so an effect is the right place.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* nothing to do — the profile is still the record */
    }
  }, [mode]);

  const toggle = useCallback(async () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    if (!profile) return;

    const { data, error } = await supabase
      .from("profiles")
      .update({ theme: next })
      .eq("id", profile.id)
      .select("id");

    // A denied update under RLS is not an error — it matches no rows and
    // reports success. Trusting `error` alone would hide a missing policy.
    if (error) {
      setThemeError(`Theme did not save. ${error.message}`);
    } else if (!data?.length) {
      setThemeError("Theme did not save. profiles has no update policy — run 0003_theme.sql.");
    } else {
      setThemeError(null);
    }
  }, [mode, profile]);

  return { mode, toggle, themeError };
}
