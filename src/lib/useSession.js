import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/** One hook for "who is this and what may they do".
 *  loading stays true until we know — render a spinner, not the login screen,
 *  or everyone sees a flash of sign-in on every refresh. */
export function useSession() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async (session) => {
      if (!session) {
        if (alive) { setProfile(null); setLoading(false); }
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (!alive) return;
      if (error) console.error("profile load failed", error);
      setProfile(data ?? null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => load(s));

    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const role = profile?.role ?? null;
  return {
    profile,
    loading,
    role,
    canCreateEvents: role === "admin" || role === "sales",
    canEditRoster: role === "admin" || role === "sales",
  };
}
