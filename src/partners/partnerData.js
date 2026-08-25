import { hasSupabase, supabase } from "../portal/supabase.js";
import { mergedOperators } from "../admin/operators-store.js";
import { loadPortal } from "../admin/portal-store.js";

const DEMO_EMAIL = "partner@ticowild.demo";

export { hasSupabase };

export function demoSession(intent = "signin", profile = {}) {
  return {
    user: { id: "demo-operator", email: profile.email || DEMO_EMAIL },
    demo: true,
    demoIntent: intent,
    demoCompany: profile.companyName || "",
  };
}

export async function getSession() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function watchSession(callback) {
  if (!hasSupabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/partners/`,
      data: { account_type: "operator" },
    },
  });
  if (error) throw error;
}

export async function createAccount({ companyName, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/partners/`,
      data: { account_type: "operator", company_name: companyName.trim() },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (hasSupabase) await supabase.auth.signOut();
}

function setupError(error) {
  if (error?.code === "42P01" || /operator_(memberships|applications|portal_state)/i.test(error?.message || "")) {
    const wrapped = new Error("The operator database has not been installed yet. Run supabase/operator_portal.sql in the Supabase SQL Editor.");
    wrapped.code = "PARTNER_SCHEMA_MISSING";
    return wrapped;
  }
  return error;
}

function normalizeOperator(row) {
  return {
    id: row.id,
    name: row.name || "TicoWild partner",
    type: row.type || "tours",
    regions: row.regions || "",
    destinations: row.destinations || "",
    categories: row.categories || [],
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
    website: row.website || "",
    takeRate: row.referral_fee ?? null,
    stage: row.status === "active" ? "Active partner" : "In talks",
  };
}

export async function loadPartnerContext(session) {
  if (session?.demo && session.demoIntent === "apply") {
    return {
      kind: "application",
      application: session.demoCompany ? { company_name: session.demoCompany, status: "draft" } : null,
      email: session.user.email,
      demo: true,
    };
  }
  if (session?.demo || !hasSupabase) {
    const operator = mergedOperators({})[0];
    return {
      kind: "active",
      demo: true,
      role: "owner",
      operator,
      portal: loadPortal(operator.id),
      bookings: [],
    };
  }

  const user = session.user;
  const membershipResult = await supabase
    .from("operator_memberships")
    .select("role,status,operator:operators(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (membershipResult.error) throw setupError(membershipResult.error);

  if (membershipResult.data?.operator) {
    const operator = normalizeOperator(membershipResult.data.operator);
    const [portalResult, bookingsResult] = await Promise.all([
      supabase.from("operator_portal_state").select("state").eq("operator_id", operator.id).maybeSingle(),
      supabase.from("bookings").select("*").eq("operator_id", operator.id).order("date", { ascending: true }),
    ]);
    if (portalResult.error) throw setupError(portalResult.error);
    if (bookingsResult.error && bookingsResult.error.code !== "42P01") throw bookingsResult.error;
    return {
      kind: "active",
      role: membershipResult.data.role,
      operator,
      portal: portalResult.data?.state || {},
      bookings: (bookingsResult.data || []).map((b) => ({
        id: b.id,
        guest: b.guest_name || b.name || "TicoWild guest",
        pax: b.guests || 1,
        date: b.date,
        time: b.time || "Time pending",
        tour: b.name || "TicoWild experience",
        pickup: b.meet || "Pickup details pending",
        maskedPhone: b.guest_phone_masked || "Available after confirmation",
        operatorNet: b.operator_net || 0,
        pending: b.status === "Requested",
      })),
    };
  }

  const applicationResult = await supabase
    .from("operator_applications")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (applicationResult.error) throw setupError(applicationResult.error);
  return { kind: "application", application: applicationResult.data, email: user.email };
}

export async function saveApplication(user, values, submit = false, agreement = null) {
  const payload = {
    user_id: user.id,
    email: user.email,
    company_name: values.companyName.trim(),
    contact_name: values.contactName.trim(),
    phone: values.phone.trim(),
    whatsapp: values.whatsapp.trim(),
    website: values.website.trim(),
    regions: values.regions,
    categories: values.categories,
    languages: values.languages,
    years_in_business: values.yearsInBusiness ? Number(values.yearsInBusiness) : null,
    description: values.description.trim(),
    status: submit ? "pending" : "draft",
    submitted_at: submit ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
    agreement_version: agreement?.agreementVersion || null,
    agreement_accepted_at: agreement?.acceptedAt || null,
    agreement_signer_name: agreement?.signerName?.trim() || null,
    agreement_signer_title: agreement?.title?.trim() || null,
    agreement_legal_name: agreement?.legalName?.trim() || null,
    agreement_signature: agreement?.signature || null,
  };
  if (!hasSupabase) return { id: "demo-application", ...payload };
  const { data, error } = await supabase
    .from("operator_applications")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw setupError(error);
  return data;
}

export async function savePortal(operatorId, portal) {
  if (!hasSupabase) return portal;
  const { error } = await supabase
    .from("operator_portal_state")
    .upsert({ operator_id: operatorId, state: portal, updated_at: new Date().toISOString() }, { onConflict: "operator_id" });
  if (error) throw setupError(error);
  return portal;
}
