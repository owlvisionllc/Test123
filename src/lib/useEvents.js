import { useCallback, useEffect, useState } from "react";
import { listEvents } from "./api";

/** The event list, from the database.
 *
 *  Three states worth telling apart, because they look identical if you only
 *  check whether the array came back empty:
 *
 *    loading  we have not heard back yet
 *    error    the request failed and we should say so
 *    []       there genuinely are no events
 *
 *  A too-tight RLS policy returns [] rather than an error, so an empty list is
 *  never proof of an empty table. That is why the empty state says which kind
 *  of nothing it is instead of just showing nothing.
 *
 *  `loading` is derived rather than stored: it simply means we are switched on
 *  and have neither rows nor an error yet.
 */
export function useEvents(enabled) {
  const [rows, setRows] = useState(null); // null = nothing back yet
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    listEvents()
      .then((data) => {
        if (!alive) return;
        setRows(data);
        setError(null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message || "The event list could not be loaded.");
      });
    return () => { alive = false; };
  }, [enabled, attempt]);

  const reload = useCallback(() => {
    setRows(null);
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return {
    events: rows ?? [],
    loading: !!enabled && rows === null && !error,
    error,
    reload,
  };
}
