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
export const backendHost = hasSupabase ? new URL(url).host : "";

export const supabase = hasSupabase
  ? createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      global: { headers: { "x-client-info": "ticowild-web" } },
    })
  : null;

export function withTimeout(promise, ms = 12000, label = "TicoWild service") {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} did not respond. Please try again.`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function friendlyBackendError(error, fallback = "TicoWild could not reach the live service.") {
  const message = String(error?.message || "");
  if (/fetch|network|respond|timeout|failed/i.test(message)) {
    return new Error(`${fallback} Your information is safe; check your connection and try again.`);
  }
  return error instanceof Error ? error : new Error(fallback);
}
