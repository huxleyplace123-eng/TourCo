import { useEffect, useState } from "react";
import { hasSupabase, supabase } from "./supabase.js";
import Login from "./Login.jsx";
import Portal from "./Portal.jsx";

const DEMO_SESSION_KEY = "ticowild_portal_session";

// Auth gate. With Supabase configured, this is real passwordless (magic-link)
// auth: signInWithOtp emails a one-time link, the session persists across
// devices, and onAuthStateChange keeps us in sync. Without keys, it runs a
// demo session so the whole portal is clickable.
export default function Root() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasSupabase) {
      supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
      return () => sub.subscription.unsubscribe();
    }
    try { const r = localStorage.getItem(DEMO_SESSION_KEY); if (r) setSession(JSON.parse(r)); } catch { /* noop */ }
    setReady(true);
  }, []);

  const signIn = async (email) => {
    if (hasSupabase) {
      // Sends the one-time sign-in link. On click, Supabase restores the session
      // via detectSessionInUrl and onAuthStateChange fires.
      await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + "/my/" } });
      return;
    }
    const s = { user: { email }, email };
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const signOut = async () => {
    if (hasSupabase) await supabase.auth.signOut();
    localStorage.removeItem(DEMO_SESSION_KEY);
    setSession(null);
  };

  if (!ready) return null;
  if (!session) return <Login onSignIn={signIn} />;
  const email = session.user?.email || session.email || "";
  return <Portal email={email} onSignOut={signOut} />;
}
