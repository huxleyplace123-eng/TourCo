import { useEffect, useState } from "react";
import { hasSupabase, supabase, withTimeout, friendlyBackendError } from "./supabase.js";
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasSupabase) {
      withTimeout(supabase.auth.getSession(), 10000, "Customer portal")
        .then(({ data, error: authError }) => { if (authError) throw authError; setSession(data.session); })
        .catch((err) => setError(friendlyBackendError(err, "The customer portal could not connect.").message))
        .finally(() => setReady(true));
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
      const { error: authError } = await withTimeout(supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + "/my/" } }), 12000, "Sign-in email");
      if (authError) throw friendlyBackendError(authError, "We could not send your sign-in link.");
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

  if (!ready) return <PortalStatus title="Opening your trip…" />;
  if (error) return <PortalStatus title="Customer portal needs attention" message={error} action="Try again" onAction={() => window.location.reload()} />;
  if (!session) return <Login onSignIn={signIn} />;
  const email = session.user?.email || session.email || "";
  return <Portal email={email} onSignOut={signOut} />;
}

function PortalStatus({ title, message = "Securely connecting to TicoWild.", action, onAction }) {
  return <div style={{ minHeight:"100vh",display:"grid",placeItems:"center",padding:18,background:"#0B1A2E",color:"#fff",fontFamily:"'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}><div style={{ width:"min(500px,100%)",padding:28,borderRadius:22,border:"1px solid rgba(127,166,232,.18)",background:"#13294A",textAlign:"center",boxShadow:"0 32px 80px -32px rgba(0,0,0,.8)" }}><div style={{ width:44,height:44,borderRadius:15,display:"grid",placeItems:"center",margin:"0 auto 14px",background:"rgba(34,211,238,.12)",color:"#22D3EE",fontSize:21 }}>✦</div><h1 style={{ margin:"0 0 8px",fontSize:24 }}>{title}</h1><p style={{ margin:"0 auto",color:"#7FA6E8",lineHeight:1.6,fontSize:14 }}>{message}</p>{action&&<button onClick={onAction} style={{ marginTop:18,padding:"10px 16px",border:0,borderRadius:12,background:"#FFD000",color:"#0B1A2E",fontWeight:850,cursor:"pointer" }}>{action}</button>}</div></div>;
}
