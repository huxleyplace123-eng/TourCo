import { hasSupabase, supabase, withTimeout, friendlyBackendError } from "../portal/supabase.js";

const redirectUrl = () => new URL("/admin/", window.location.origin).toString();

export async function getTeamAccess() {
  if (!hasSupabase) return { configured: false, session: null, member: null };
  const { data: { session }, error: sessionError } = await withTimeout(supabase.auth.getSession(), 10000, "Team session");
  if (sessionError) throw sessionError;
  if (!session) return { configured: true, session: null, member: null };
  const { data: member, error } = await withTimeout(supabase
    .from("team_members")
    .select("user_id, role, created_at")
    .eq("user_id", session.user.id)
    .maybeSingle(), 10000, "Team access");
  if (error) throw friendlyBackendError(error, "The CRM could not verify team access.");
  return { configured: true, session, member };
}

export async function sendTeamMagicLink(email) {
  if (!hasSupabase) throw new Error("Supabase is not configured.");
  const { error } = await withTimeout(supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectUrl(), shouldCreateUser: true },
  }), 12000, "Team sign-in email");
  if (error) throw error;
}

export async function signOutTeam() {
  if (supabase) await supabase.auth.signOut();
}

export async function loadApplications() {
  const { data, error } = await withTimeout(supabase
    .from("operator_applications")
    .select("*")
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false }), 12000, "Partner applications");
  if (error) throw error;
  return data || [];
}

export async function approveApplication(applicationId, notes) {
  const { data, error } = await withTimeout(supabase.rpc("approve_operator_application", {
    application_id: applicationId,
    notes: notes || "",
  }), 15000, "Partner approval");
  if (error) throw error;
  return data;
}

export async function reviewApplication(applicationId, status, notes) {
  const { data, error } = await withTimeout(supabase.rpc("review_operator_application", {
    application_id: applicationId,
    next_status: status,
    notes: notes || "",
  }), 15000, "Application review");
  if (error) throw error;
  return data;
}

export async function inviteExistingOperator({ operatorId, companyName, email, role }) {
  const { data, error } = await withTimeout(supabase.rpc("invite_operator", {
    requested_operator_id: operatorId,
    company_name: companyName,
    invite_email: email,
    member_role: role,
  }), 15000, "Operator invitation");
  if (error) throw error;
  return data;
}
