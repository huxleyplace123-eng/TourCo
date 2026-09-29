// Customer-portal data layer. Every function returns a Promise so the UI is
// identical whether data comes from Supabase (live) or the demo set (no keys).
// When Supabase is configured, swap the demo bodies for real queries against
// the schema in supabase/schema.sql — the shapes already match.
import { hasSupabase, supabase, withTimeout, friendlyBackendError } from "./supabase.js";
import { cdnImage } from "../images.js";

const DEMO_MSG_KEY = "ticowild_portal_demo_messages";
const DEMO_PROFILE_KEY = "ticowild_portal_demo_profile";

// ── Demo trip ─────────────────────────────────────────────────────────────────
export const DEMO_TRIP = {
  id: "demo-trip",
  title: "Your Costa Rica Adventure",
  region: "Guanacaste → Arenal",
  start: "2026-09-13",
  end: "2026-09-19",
  travelers: 2,
  status: "Confirmed",            // Planning · Deposit paid · Confirmed · In progress · Completed
  total: 3200,
  deposit: 640,                   // 20% paid online
  days: [
    { date: "2026-09-13", items: [
      { id: "b1", name: "Sky Trek Zipline", operator: "Sky Adventures", time: "8:00 AM",
        meet: "Hotel lobby pickup, 7:30 AM", status: "Confirmed", price: 186,
        bring: "Closed-toe shoes, sunscreen, light layer", photo: "photo-1679117730976-cdb5f6b05b88" },
    ]},
    { date: "2026-09-15", items: [
      { id: "b2", name: "Sunset Catamaran", operator: "Lazy Lizard Sailing", time: "2:30 PM",
        meet: "Tamarindo pier, 2:00 PM", status: "Confirmed", price: 220,
        bring: "Swimsuit, towel, sandals", photo: "photo-1507525428034-b723cf961d3e" },
    ]},
    { date: "2026-09-17", items: [
      { id: "b3", name: "Arenal Volcano Hike + Hot Springs", operator: "Desafío Adventure Company", time: "9:00 AM",
        meet: "La Fortuna base, 8:45 AM", status: "Requested", price: 264,
        bring: "Hiking shoes, swimsuit, water", photo: "photo-1432405972618-c60b0225b8f9" },
    ]},
  ],
};

export const activityPhoto = (id, w = 800) => cdnImage(id, w);

export const tripStages = ["Planning", "Deposit paid", "Confirmed", "In progress", "Completed"];

// ── Trip ──────────────────────────────────────────────────────────────────────
async function currentUser() {
  const { data, error } = await withTimeout(supabase.auth.getUser(), 8000, "Customer account");
  if (error) throw error;
  if (!data.user) throw new Error("Your sign-in has expired. Please sign in again.");
  return data.user;
}

function shapeTrip(row) {
  if (!row) return null;
  const days = new Map();
  for (const booking of row.bookings || []) {
    const date = booking.date || row.start_date;
    if (!days.has(date)) days.set(date, []);
    days.get(date).push({
      id: booking.id,
      name: booking.name || "TicoWild experience",
      operator: booking.operator || "Local partner",
      time: booking.time || "Time pending",
      meet: booking.meet || "Meeting details pending",
      bring: booking.bring || "Comfortable clothing",
      photo: booking.photo || "photo-1432405972618-c60b0225b8f9",
      price: Number(booking.price || 0),
      status: booking.status || "Requested",
    });
  }
  return {
    id: row.id,
    title: row.title || "Your Costa Rica Adventure",
    region: row.region || "Costa Rica",
    start: row.start_date,
    end: row.end_date,
    travelers: row.travelers || 1,
    status: row.status || "Planning",
    total: Number(row.total || 0),
    deposit: Number(row.deposit || 0),
    days: [...days.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))).map(([date, items]) => ({ date, items })),
  };
}

export async function getTrip() {
  if (!hasSupabase) return DEMO_TRIP;
  try {
    const user = await currentUser();
    const { data, error } = await withTimeout(
      supabase.from("trips").select("*, bookings(*)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      12000,
      "Your trip",
    );
    if (error) throw error;
    return shapeTrip(data);
  } catch (error) {
    throw friendlyBackendError(error, "We could not load your trip.");
  }
}

// ── Messages (concierge thread) ───────────────────────────────────────────────
const seedMessages = () => ([
  { id: "m1", from: "team", text: "¡Pura vida! 🌴 Welcome to TicoWild. Your zipline is confirmed for Sunday 8 AM — pickup at your hotel lobby at 7:30.", at: "2026-09-05T15:10:00Z" },
  { id: "m2", from: "team", text: "Quick tip: bring closed-toe shoes and sunscreen for the canopy. Anything you're wondering about?", at: "2026-09-05T15:11:00Z" },
]);

export async function getMessages() {
  if (!hasSupabase) {
    try { const r = localStorage.getItem(DEMO_MSG_KEY); return r ? JSON.parse(r) : seedMessages(); }
    catch { return seedMessages(); }
  }
  const user = await currentUser();
  const { data, error } = await withTimeout(supabase.from("messages").select("*").eq("user_id", user.id).order("at", { ascending: true }), 12000, "Messages");
  if (error) throw friendlyBackendError(error, "We could not load your messages.");
  return data || [];
}

export async function sendMessage(text) {
  const msg = { id: `m_${Date.now().toString(36)}`, from: "customer", text, at: new Date().toISOString() };
  if (!hasSupabase) {
    const all = [...(await getMessages()), msg];
    localStorage.setItem(DEMO_MSG_KEY, JSON.stringify(all));
    return all;
  }
  const user = await currentUser();
  const { error } = await withTimeout(supabase.from("messages").insert({ user_id: user.id, text, from: "customer" }), 12000, "Message delivery");
  if (error) throw friendlyBackendError(error, "Your message was not sent.");
  return getMessages();
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getProfile(fallbackEmail = "") {
  if (!hasSupabase) {
    try { const r = localStorage.getItem(DEMO_PROFILE_KEY); if (r) return JSON.parse(r); } catch { /* noop */ }
    return { name: "", email: fallbackEmail, phone: "", country: "", travelers: "2", notes: "" };
  }
  const user = await currentUser();
  const { data, error } = await withTimeout(supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(), 12000, "Your profile");
  if (error) throw friendlyBackendError(error, "We could not load your profile.");
  return data || { name: "", email: fallbackEmail, phone: "", country: "", travelers: "", notes: "" };
}

export async function saveProfile(profile) {
  if (!hasSupabase) { localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile)); return profile; }
  const user = await currentUser();
  const next = { ...profile, id: user.id, email: profile.email || user.email };
  const { error } = await withTimeout(supabase.from("profiles").upsert(next, { onConflict: "id" }), 12000, "Profile save");
  if (error) throw friendlyBackendError(error, "Your profile was not saved.");
  return next;
}
