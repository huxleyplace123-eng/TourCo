import { useState } from "react";
import { ArrowRight, BadgeCheck, Building2, CalendarCheck, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "../components/Logo.jsx";
import { c, FONT, grad, radius, shadow } from "../theme.js";
import { createAccount, hasSupabase, sendMagicLink, signIn } from "./partnerData.js";

const inputStyle = {
  width: "100%", padding: "13px 14px", borderRadius: radius.sm, border: `1px solid ${c.line}`,
  background: "rgba(255,255,255,.055)", color: c.charcoal, outline: "none", fontSize: 15,
};

const benefits = [
  [CalendarCheck, "Run your availability", "Keep dates and capacity current from your phone."],
  [Building2, "Manage your business", "Update tours, pricing, pickup details, and your public profile."],
  [BadgeCheck, "Stay booking-ready", "Agreements, verification, messages, and requests live in one place."],
];

export default function PartnerAuth({ onSession, onDemo }) {
  const params = new URLSearchParams(window.location.search);
  const invitedCompany = params.get("company") || "";
  const invitedEmail = params.get("email") || "";
  const [mode, setMode] = useState(invitedCompany || invitedEmail ? "apply" : "signin");
  const [companyName, setCompanyName] = useState(invitedCompany);
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setNotice("");
    if (!hasSupabase) return onDemo(mode, { companyName, email: email.trim() });
    if (mode === "apply" && password.length < 8) return setError("Use at least 8 characters for your password.");
    setBusy(true);
    try {
      if (mode === "signin") {
        const session = await signIn(email.trim(), password);
        onSession(session);
      } else {
        const result = await createAccount({ companyName, email: email.trim(), password });
        if (result.session) onSession(result.session);
        else setNotice("Check your email to confirm your account. Your partner application will be waiting when you return.");
      }
    } catch (err) {
      setError(err.message || "We couldn't complete that request.");
    } finally {
      setBusy(false);
    }
  };

  const magic = async () => {
    if (!email.trim()) return setError("Enter your email first.");
    if (!hasSupabase) return onDemo("signin", { email: email.trim() });
    setBusy(true); setError(""); setNotice("");
    try {
      await sendMagicLink(email.trim());
      setNotice("Your secure sign-in link is on the way. Check your email and tap the link to continue.");
    } catch (err) {
      setError(err.message || "We couldn't send the sign-in link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="partner-auth">
      <style>{`
        .partner-auth { min-height:100vh; position:relative; overflow:hidden; background:${c.sand}; color:${c.charcoal}; font-family:${FONT}; }
        .partner-auth:before { content:""; position:absolute; inset:0; background:${grad.aurora}; pointer-events:none; }
        .partner-auth-shell { min-height:100vh; position:relative; display:grid; grid-template-columns:minmax(0,1.1fr) minmax(390px,.9fr); max-width:1240px; margin:auto; }
        .partner-story { padding:clamp(32px,6vw,76px); display:flex; flex-direction:column; justify-content:space-between; }
        .partner-auth-card-wrap { padding:28px; display:flex; align-items:center; justify-content:center; }
        .partner-auth-card { width:min(460px,100%); padding:30px; border-radius:${radius.xl}px; background:rgba(19,41,74,.88); border:1px solid rgba(127,166,232,.22); box-shadow:${shadow.xl}; backdrop-filter:blur(20px); }
        .partner-benefits { display:grid; gap:12px; margin-top:34px; max-width:600px; }
        .partner-benefit { display:grid; grid-template-columns:42px 1fr; gap:13px; align-items:center; padding:13px; border-radius:16px; background:rgba(255,255,255,.035); border:1px solid ${c.line}; }
        .partner-field { display:grid; gap:7px; color:${c.stone}; font-size:12px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; }
        .partner-field input:focus { border-color:${c.teal}!important; box-shadow:0 0 0 3px rgba(34,211,238,.12); }
        .partner-brand-mobile { display:none; }
        @media(max-width:820px){ .partner-auth-shell{grid-template-columns:1fr;display:block}.partner-story{min-height:0;padding:20px 20px 2px;display:block}.partner-story-copy,.partner-auth-foot{display:none}.partner-auth-card-wrap{padding:14px 14px 36px;display:block}.partner-auth-card{padding:24px 20px;margin:0 auto}.partner-brand-desktop{display:none}.partner-brand-mobile{display:block} }
      `}</style>
      <div className="partner-auth-shell">
        <section className="partner-story">
          <div className="partner-brand-desktop"><Logo fontSize={25} tagline /></div>
          <div className="partner-brand-mobile"><Logo fontSize={22} /></div>
          <div className="partner-story-copy">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, color:c.teal, fontSize:12, fontWeight:800, letterSpacing:".1em", textTransform:"uppercase" }}><Sparkles size={15}/> TicoWild Partner Center</div>
            <h1 style={{ margin:"16px 0 14px", maxWidth:620, fontSize:"clamp(38px,5vw,66px)", lineHeight:.98, letterSpacing:"-.055em" }}>Your tours.<br/><span style={{ color:c.gold }}>One command center.</span></h1>
            <p style={{ maxWidth:570, margin:0, color:c.stone, fontSize:17, lineHeight:1.7 }}>Manage the details that help TicoWild send you the right guests and deliver a smoother experience every time.</p>
            <div className="partner-benefits">
              {benefits.map(([Icon,title,text]) => <div className="partner-benefit" key={title}>
                <div style={{ width:42,height:42,borderRadius:13,display:"grid",placeItems:"center",background:"rgba(34,211,238,.11)",color:c.teal }}><Icon size={20}/></div>
                <div><div style={{ fontWeight:800,fontSize:14 }}>{title}</div><div style={{ color:c.stone,fontSize:12.5,lineHeight:1.5 }}>{text}</div></div>
              </div>)}
            </div>
          </div>
          <div className="partner-auth-foot" style={{ color:c.stone,fontSize:11.5 }}>Built for approved TicoWild partners across Costa Rica.</div>
        </section>

        <section className="partner-auth-card-wrap">
          <form className="partner-auth-card" onSubmit={submit}>
            <div style={{ display:"flex",alignItems:"center",gap:11,marginBottom:24 }}>
              <div style={{ width:42,height:42,borderRadius:14,display:"grid",placeItems:"center",background:c.gold,color:c.ink,boxShadow:shadow.glowGold }}><KeyRound size={20}/></div>
              <div><div style={{ fontSize:20,fontWeight:800 }}>{mode === "signin" ? "Partner sign in" : "Apply to partner"}</div><div style={{ color:c.stone,fontSize:12.5 }}>{mode === "signin" ? "Welcome back to TicoWild" : "Create your secure partner account"}</div></div>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,padding:4,borderRadius:14,background:"rgba(255,255,255,.04)",marginBottom:20 }}>
              {[['signin','Sign in'],['apply','Apply']].map(([key,label]) => <button type="button" key={key} onClick={() => { setMode(key);setError("");setNotice(""); }} style={{ padding:"10px",border:0,borderRadius:11,background:mode===key?c.surface2:"transparent",color:mode===key?c.charcoal:c.stone,fontWeight:800,cursor:"pointer" }}>{label}</button>)}
            </div>

            <div style={{ display:"grid",gap:14 }}>
              {mode === "apply" && <label className="partner-field">Company name<input required value={companyName} onChange={(e)=>setCompanyName(e.target.value)} placeholder="Your tour company" style={inputStyle}/></label>}
              <label className="partner-field">Email address<input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" style={inputStyle}/></label>
              <label className="partner-field">Password<input required type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder={mode === "apply" ? "At least 8 characters" : "Your password"} autoComplete={mode === "apply" ? "new-password" : "current-password"} style={inputStyle}/></label>
            </div>

            {error && <div style={{ marginTop:14,padding:"11px 12px",borderRadius:12,background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.3)",color:"#FCA5A5",fontSize:12.5,lineHeight:1.5 }}>{error}</div>}
            {notice && <div style={{ marginTop:14,padding:"11px 12px",borderRadius:12,background:"rgba(52,211,153,.1)",border:"1px solid rgba(52,211,153,.3)",color:"#6EE7B7",fontSize:12.5,lineHeight:1.5 }}>{notice}</div>}

            <button disabled={busy} type="submit" style={{ width:"100%",marginTop:18,padding:"13px 16px",border:0,borderRadius:radius.sm,background:c.gold,color:c.ink,fontWeight:800,cursor:busy?"wait":"pointer",boxShadow:shadow.glowGold,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create partner account"}<ArrowRight size={17}/>
            </button>
            {mode === "signin" && <button disabled={busy} type="button" onClick={magic} style={{ width:"100%",marginTop:10,padding:"11px",border:`1px solid ${c.line}`,borderRadius:radius.sm,background:"transparent",color:c.teal,fontWeight:750,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}><Mail size={16}/> Email me a secure link</button>}

            {!hasSupabase && <div style={{ marginTop:16,padding:"12px",borderRadius:12,background:"rgba(255,208,0,.08)",border:"1px solid rgba(255,208,0,.22)",fontSize:12,color:c.stone,lineHeight:1.55 }}>
              <b style={{ color:c.gold }}>Preview mode:</b> Supabase is not configured in this environment. Continue to see the partner experience with safe demo data.
            </div>}
            <div style={{ marginTop:18,display:"flex",gap:8,alignItems:"center",justifyContent:"center",color:c.stone,fontSize:11.5 }}><ShieldCheck size={14}/> Secure access. Each partner sees only their own company.</div>
          </form>
        </section>
      </div>
    </div>
  );
}
