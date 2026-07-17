// Supabase client for the customer portal. Reads its config from Vite env vars
// (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). If they aren't set, the portal
// runs in DEMO mode: the login screen fakes the magic-link flow and the data
// layer serves sample trip data, so the whole experience is clickable with no
// backend. Drop in the two keys and it becomes real passwordless auth + a live
// database — no code changes.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anon);

export const supabase = hasSupabase
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;
