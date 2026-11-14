import {savePortal} from '../partners/portal-save-data.js';
import { hasSupabase, supabase, withTimeout, friendlyBackendError } from "../portal/supabase.js";
import { createRecordSync } from "./sync-patches.js";
const operatorSync = createRecordSync(async (id, changes, expected) => {
  const { error } = await withTimeout(supabase.rpc('patch_crm_record', { record_kind:'operator', record_id:id, changes, expected }), 12000, 'Operator save');
  if (error) throw new Error(error.message || 'Operator save failed. Your changes remain on this device.');
});

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
    const [overlayResult, partnerResult] = await Promise.all([
      withTimeout(supabase.from("crm_operator_overlays").select("operator_id,overlay"), 12000, "Operator CRM"),
      withTimeout(supabase.from("operators").select("*"), 12000, "Active partners"),
    ]);
    if (overlayResult.error) throw overlayResult.error;
    if (partnerResult.error) throw partnerResult.error;
    const partners = Object.fromEntries((partnerResult.data || []).map((row) => [row.id, {
      custom: true,
      name: row.name,
      type: row.type || "tours",
      stage: row.status === "active" ? "Active partner" : "In talks",
      email: row.email || "",
      phone: row.phone || "",
      whatsapp: row.whatsapp || "",
      website: row.website || "",
      regions: row.regions || "",
      destinations: row.destinations || "",
      categories: row.categories || [],
      takeRate: row.referral_fee ?? null,
      meetingPoint: {
        name: row.meeting_point_name || "",
        lat: row.meeting_point_lat ?? "",
        lng: row.meeting_point_lng ?? "",
        instructions: row.meeting_instructions || "",
      },
    }]));
    const remote = { ...partners };
    for (const row of overlayResult.data || []) remote[row.operator_id] = { ...(remote[row.operator_id] || {}), ...(row.overlay || {}) };
    operatorSync.seed(remote, Object.fromEntries((overlayResult.data || []).map(row => [row.operator_id, row.overlay])));
    if (Object.keys(local).length) localStorage.setItem('ticowild_operator_recovery_' + Date.now(), JSON.stringify(local));
    return { connected: true, overlay: { ...local, ...remote } };
  } catch (error) {
    throw friendlyBackendError(error, "The operator CRM could not sync.");
  }
}

export async function saveConnectedOperatorOverlay(overlay) {
  await operatorSync.save(overlay);
}

export async function loadConnectedOperatorPortal(operatorId, fallback) {
  try {
    if (!(await isTeamMember())) return { connected: false, portal: fallback };
    const { data, error } = await withTimeout(supabase.from("operator_portal_state").select("state,updated_at").eq("operator_id", operatorId).maybeSingle(), 12000, "Partner workspace");
    if (error) throw error;
    return { connected: true, portal: data?.state || fallback, updatedAt:data?.updated_at||null };
  } catch (error) {
    throw friendlyBackendError(error, "The partner workspace could not load.");
  }
}

export async function saveConnectedOperatorPortal(operatorId,portal,version){return savePortal(operatorId,portal,version);}
