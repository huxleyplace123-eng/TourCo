// Customer-portal data layer. Every function returns a Promise so the UI is
// identical whether data comes from Supabase (live) or the demo set (no keys).
// When Supabase is configured, swap the demo bodies for real queries against
// the schema in supabase/schema.sql — the shapes already match.
import { hasSupabase, supabase } from "./supabase.js";
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
export async function getTrip() {
  if (!hasSupabase) return DEMO_TRIP;
  // LIVE: const { data } = await supabase.from("trips").select("*, bookings(*)").single(); return shapeTrip(data);
  return DEMO_TRIP;
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
  const { data } = await supabase.from("messages").select("*").order("at", { ascending: true });
  return data || [];
}

export async function sendMessage(text) {
  const msg = { id: `m_${Date.now().toString(36)}`, from: "customer", text, at: new Date().toISOString() };
  if (!hasSupabase) {
    const all = [...(await getMessages()), msg];
    localStorage.setItem(DEMO_MSG_KEY, JSON.stringify(all));
    return all;
  }
  await supabase.from("messages").insert({ text, from: "customer" });
  return getMessages();
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getProfile(fallbackEmail = "") {
  if (!hasSupabase) {
    try { const r = localStorage.getItem(DEMO_PROFILE_KEY); if (r) return JSON.parse(r); } catch { /* noop */ }
    return { name: "", email: fallbackEmail, phone: "", country: "", travelers: "2", notes: "" };
  }
  const { data } = await supabase.from("profiles").select("*").single();
  return data || { name: "", email: fallbackEmail, phone: "", country: "", travelers: "", notes: "" };
}

export async function saveProfile(profile) {
  if (!hasSupabase) { localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile)); return profile; }
  await supabase.from("profiles").upsert(profile);
  return profile;
}
