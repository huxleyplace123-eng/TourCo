import { useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";
import OperatorPortal from "../admin/OperatorPortal.jsx";
import { c, FONT, grad, radius } from "../theme.js";
import Onboarding, { PendingReview } from "./Onboarding.jsx";
import PartnerAuth from "./PartnerAuth.jsx";
import {
  demoSession, getSession, loadPartnerContext, savePortal, signOut, watchSession,
} from "./partnerData.js";

export default function Root() {
  const [session, setSession] = useState(undefined);
  const [context, setContext] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    getSession().then((next) => { if (live) setSession(next); }).catch((err) => { if (live) { setError(err.message); setSession(null); } });
    const stop = watchSession((next) => setSession(next));
    return () => { live = false; stop(); };
  }, []);

  useEffect(() => {
    if (!session) { setContext(null); return; }
    let live = true;
    setLoading(true); setError("");
    loadPartnerContext(session)
      .then((next) => { if (live) setContext(next); })
      .catch((err) => { if (live) setError(err.message || "We couldn't load your partner account."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [session]);

  const leave = async () => {
    await signOut();
    setContext(null); setSession(null);
  };

  if (session === undefined) return <Loading />;
  if (!session) return <PartnerAuth onSession={setSession} onDemo={(intent, profile) => setSession(demoSession(intent, profile))} />;
  if (error) return <ErrorScreen message={error} onRetry={() => setSession({ ...session })} onSignOut={leave} />;
  if (loading || !context) return <Loading />;

  if (context.kind === "active") {
    return (
      <OperatorPortal
        op={context.operator}
        mode="partner"
        role={context.role}
        initialPortal={context.portal}
        assignedBookings={context.demo ? undefined : context.bookings}
        demo={context.demo}
        onPortalChange={(next) => savePortal(context.operator.id, next).catch((err) => setError(err.message))}
        onExit={leave}
      />
    );
  }

  const application = context.application;
  if (application?.status === "pending" || application?.status === "approved") {
    return <PendingReview application={application} onSignOut={leave} />;
  }
  return <Onboarding user={session.user} application={application} onSubmitted={(next) => setContext({ ...context, application: next })} onSignOut={leave} />;
}

function Loading() {
  return <div style={{ minHeight:"100vh",display:"grid",placeItems:"center",background:`${grad.aurora},${c.sand}`,color:c.charcoal,fontFamily:FONT }}><div style={{ display:"grid",placeItems:"center",gap:12 }}><LoaderCircle size={30} color={c.gold} style={{ animation:"spin 1s linear infinite" }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{ color:c.stone,fontSize:13,fontWeight:700 }}>Opening Partner Center…</div></div></div>;
}

function ErrorScreen({ message,onRetry,onSignOut }) {
  return <div style={{ minHeight:"100vh",display:"grid",placeItems:"center",padding:18,background:`${grad.aurora},${c.sand}`,color:c.charcoal,fontFamily:FONT }}><div style={{ width:"min(520px,100%)",padding:26,borderRadius:radius.lg,border:`1px solid ${c.line}`,background:c.white,textAlign:"center" }}><AlertTriangle size={32} color="#FCA5A5"/><h1 style={{ margin:"12px 0 8px",fontSize:23 }}>Partner Center needs attention</h1><p style={{ margin:"0 auto 18px",color:c.stone,fontSize:13,lineHeight:1.65 }}>{message}</p><div style={{ display:"flex",gap:9,justifyContent:"center",flexWrap:"wrap" }}><button onClick={onRetry} style={{ display:"inline-flex",gap:7,alignItems:"center",padding:"10px 15px",border:0,borderRadius:11,background:c.gold,color:c.ink,fontWeight:800,cursor:"pointer" }}><RefreshCw size={15}/> Try again</button><button onClick={onSignOut} style={{ padding:"10px 15px",border:`1px solid ${c.line}`,borderRadius:11,background:"transparent",color:c.stone,fontWeight:800,cursor:"pointer" }}>Sign out</button></div></div></div>;
}
