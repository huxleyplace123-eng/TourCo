import { hasSupabase, supabase, withTimeout, friendlyBackendError } from "../portal/supabase.js";

async function isTeamMember() {
  if (!hasSupabase) return false;
  const { data: { session }, error: sessionError } = await withTimeout(supabase.auth.getSession(), 8000, "Team session");
  if (sessionError || !session) return false;
  const { data, error } = await withTimeout(supabase.from("team_members").select("user_id").eq("user_id", session.user.id).maybeSingle(), 8000, "Team access");
  if (error) throw error;
  return Boolean(data);
}

export async function loadConnectedOperatorOverlay(local = {}) {
  try {
    if (!(await isTeamMember())) return { connected: false, overlay: local };
    const { data, error } = await withTimeout(supabase.from("crm_operator_overlays").select("operator_id,overlay"), 12000, "Operator CRM");
    if (error) throw error;
    const remote = Object.fromEntries((data || []).map((row) => [row.operator_id, row.overlay || {}]));
    return { connected: true, overlay: { ...local, ...remote } };
  } catch (error) {
    throw friendlyBackendError(error, "The operator CRM could not sync.");
  }
}

export async function saveConnectedOperatorOverlay(overlay) {
  const rows = Object.entries(overlay).map(([operator_id, value]) => ({ operator_id, overlay: value, updated_at: new Date().toISOString() }));
  if (!rows.length) return;
  const { error } = await withTimeout(supabase.from("crm_operator_overlays").upsert(rows, { onConflict: "operator_id" }), 12000, "Operator CRM");
  if (error) throw friendlyBackendError(error, "The operator CRM could not save.");
}

export async function loadConnectedOperatorPortal(operatorId, fallback) {
  try {
    if (!(await isTeamMember())) return { connected: false, portal: fallback };
    const { data, error } = await withTimeout(supabase.from("operator_portal_state").select("state").eq("operator_id", operatorId).maybeSingle(), 12000, "Partner workspace");
    if (error) throw error;
    return { connected: true, portal: data?.state || fallback };
  } catch (error) {
    throw friendlyBackendError(error, "The partner workspace could not load.");
  }
}

export async function saveConnectedOperatorPortal(operatorId, portal) {
  const { error } = await withTimeout(supabase.from("operator_portal_state").upsert({ operator_id: operatorId, state: portal, updated_at: new Date().toISOString() }, { onConflict: "operator_id" }), 12000, "Partner workspace");
  if (error) throw friendlyBackendError(error, "The partner workspace could not save.");
}
