import { supabase } from "./supabase";

const STAGES = ["intake", "labor", "positions", "tasks", "schedule"];

/* ---------------- events ---------------- */

/** Shapes a database row into what the dashboard component already expects,
 *  so the UI does not change when the data starts being real. */
function toCard(row) {
  const stages = {};
  STAGES.forEach((s) => {
    const found = (row.event_stages || []).find((x) => x.stage === s);
    stages[cap(s)] = found?.status ?? "not_started";
  });
  return {
    id: row.id,
    name: row.name,
    venue: row.venue_name || "",
    client: row.client_name || "",
    date: fmtShort(row.event_date),
    dateFull: fmtLong(row.event_date),
    pm: row.assigned_pm?.full_name || "Unassigned",
    pmId: row.assigned_pm?.id || null,
    flexQ: row.flex_q_number,
    flexOpen: row.flex_quote_opened,
    filed: !!row.filed_at,
    stages,
    blockers: [],
    detail: {},
  };
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const fmtShort = (d) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";
const fmtLong = (d) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Date to be set";

export async function listEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*, event_stages(*), assigned_pm:profiles!events_assigned_pm_fkey(id, full_name)")
    .neq("status", "cancelled")
    .order("event_date", { ascending: true });
  if (error) throw error;
  return (data || []).map(toCard);
}

export async function createEvent({ name, clientName, venue, eventDate, flexQ, assignedPm }) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("events")
    .insert({
      name,
      client_name: clientName || null,
      venue_name: venue || null,
      event_date: eventDate || null,
      flex_q_number: flexQ || null,
      assigned_pm: assignedPm || null,
      created_by: user?.id ?? null,
    })
    .select()
    .single();
  if (error) throw error;

  // Every event starts with five stage rows so the chain has something to read.
  const { error: e2 } = await supabase.from("event_stages").insert(
    STAGES.map((stage) => ({
      event_id: data.id,
      stage,
      status: stage === "intake" ? "in_progress" : "not_started",
    }))
  );
  if (e2) throw e2;

  return data;
}

export async function setFlexOpened(eventId, opened) {
  const { error } = await supabase
    .from("events")
    .update({ flex_quote_opened: opened })
    .eq("id", eventId);
  if (error) throw error;
}

/* ---------------- roster ---------------- */

export async function listCrew() {
  const { data, error } = await supabase
    .from("crew_members")
    .select("*, crew_member_positions(position_id, positions(short_code))")
    .eq("active", true)
    .order("full_name");
  if (error) throw error;
  return (data || []).map((c) => ({
    id: c.id,
    name: c.full_name,
    phone: c.phone,
    email: c.email,
    staff: c.is_staff,
    pos: (c.crew_member_positions || []).map((p) => p.positions?.short_code).filter(Boolean),
  }));
}

export async function listPositions() {
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function addCrewMember({ name, phone, email, staff, positionCodes }) {
  const { data, error } = await supabase
    .from("crew_members")
    .insert({ full_name: name, phone: phone || null, email: email || null, is_staff: !!staff })
    .select()
    .single();
  if (error) throw error;

  if (positionCodes?.length) {
    const all = await listPositions();
    const rows = positionCodes
      .map((code) => all.find((p) => p.short_code === code))
      .filter(Boolean)
      .map((p) => ({ crew_member_id: data.id, position_id: p.id }));
    if (rows.length) {
      const { error: e2 } = await supabase.from("crew_member_positions").insert(rows);
      if (e2) throw e2;
    }
  }
  return data;
}

export async function listPMs() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["pm", "admin"])
    .eq("active", true)
    .order("full_name");
  if (error) throw error;
  return data || [];
}
