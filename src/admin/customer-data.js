import { hasSupabase, supabase, withTimeout, friendlyBackendError } from "../portal/supabase.js";
import { blankCustomer, normalizeCustomer, todayIso } from "./store.js";

const noteId = () => `n_${crypto.randomUUID()}`;

function customerFingerprint(customer) {
  const email = String(customer?.email || "").trim().toLowerCase();
  const start = customer?.travelStart || "";
  return email ? `${email}|${start}` : `id:${customer?.id || ""}`;
}

function mergeLocalIntoRemote(remote, local) {
  const notes = [...(remote.notes || []), ...(local.notes || [])];
  const uniqueNotes = [...new Map(notes.map((note) => [note.id || `${note.at}|${note.text}`, note])).values()];
  return normalizeCustomer({
    ...remote,
    ...local,
    id: remote.id,
    inquiryId: remote.inquiryId || local.inquiryId,
    createdAt: [remote.createdAt, local.createdAt].filter(Boolean).sort()[0],
    updatedAt: [remote.updatedAt, local.updatedAt].filter(Boolean).sort().at(-1),
    notes: uniqueNotes,
    tags: [...new Set([...(remote.tags || []), ...(local.tags || [])])],
  });
}

function inquiryToCustomer(row) {
  const created = row.created_at || new Date().toISOString();
  return normalizeCustomer({
    ...blankCustomer(),
    id: `web_${row.id}`,
    inquiryId: row.id,
    createdAt: created,
    updatedAt: created,
    name: row.name || "Website inquiry",
    phone: row.phone || "",
    email: row.email || "",
    travelStart: row.arrival || "",
    travelEnd: row.departure || "",
    travelers: row.travelers || "",
    region: row.destination || "",
    activities: (row.activity_titles || []).join(", "),
    source: row.source_path === "/admin/migration" ? "Manual" : "Website",
    temperature: "Hot",
    nextFollowUp: todayIso(),
    nextAction: "Respond to new website inquiry",
    notes: [{ id: noteId(), at: created, kind: "note", text: row.notes || "New website planning request" }],
  });
}

async function teamAccess() {
  if (!hasSupabase) return null;
  const { data: { session }, error: sessionError } = await withTimeout(supabase.auth.getSession(), 8000, "Team session");
  if (sessionError) throw sessionError;
  if (!session) return null;
  const { data, error } = await withTimeout(
    supabase.from("team_members").select("user_id,role").eq("user_id", session.user.id).maybeSingle(),
    8000,
    "Team access",
  );
  if (error) throw error;
  return data ? { session, member: data } : null;
}

export async function loadConnectedCustomers(localCustomers = []) {
  try {
    const access = await teamAccess();
    if (!access) return { connected: false, customers: localCustomers, imported: 0 };
    const [customersResult, inquiriesResult] = await Promise.all([
      supabase.from("crm_customers").select("id,record,updated_at").order("updated_at", { ascending: false }),
      supabase.from("public_inquiries").select("*").eq("status", "new").order("created_at", { ascending: true }),
    ]);
    if (customersResult.error) throw customersResult.error;
    if (inquiriesResult.error) throw inquiriesResult.error;

    const remote = (customersResult.data || []).map((row) => normalizeCustomer({ ...row.record, id: row.id }));
    const remoteByFingerprint = new Map(remote.map((item) => [customerFingerprint(item), item]));
    const mergedRemote = remote.map((item) => {
      const local = localCustomers.find((candidate) => customerFingerprint(candidate) === customerFingerprint(item));
      return local ? mergeLocalIntoRemote(item, local) : item;
    });
    const localOnly = localCustomers.filter((item) => !remoteByFingerprint.has(customerFingerprint(item)));
    const known = new Set([...mergedRemote, ...localOnly].map(customerFingerprint));
    const fresh = (inquiriesResult.data || []).map(inquiryToCustomer).filter((item) => {
      const fingerprint = customerFingerprint(item);
      if (known.has(fingerprint)) return false;
      known.add(fingerprint);
      return true;
    });
    const mergedById = new Map([...mergedRemote, ...localOnly].map((item) => [item.id, normalizeCustomer(item)]));
    fresh.forEach((item) => mergedById.set(item.id, item));
    if (fresh.length) {
      await saveConnectedCustomers(fresh);
    }
    const inquiryIds = (inquiriesResult.data || []).map((item) => item.id);
    if (inquiryIds.length) await supabase.from("public_inquiries").update({ status: "imported" }).in("id", inquiryIds);
    return { connected: true, customers: [...mergedById.values()], imported: fresh.length, member: access.member };
  } catch (error) {
    throw friendlyBackendError(error, "The CRM could not sync with the live database.");
  }
}

export async function saveConnectedCustomers(customers) {
  if (!hasSupabase || !customers.length) return;
  const rows = customers.map((customer) => ({
    id: customer.id,
    record: customer,
    updated_at: customer.updatedAt || new Date().toISOString(),
  }));
  const { error } = await withTimeout(
    supabase.from("crm_customers").upsert(rows, { onConflict: "id" }),
    12000,
    "CRM sync",
  );
  if (error) throw friendlyBackendError(error, "The CRM could not save to the live database.");
}

export async function deleteConnectedCustomers(ids) {
  if (!hasSupabase || !ids.length) return;
  const { error } = await withTimeout(supabase.from("crm_customers").delete().in("id", ids), 12000, "CRM sync");
  if (error) throw friendlyBackendError(error, "The CRM could not delete from the live database.");
}
