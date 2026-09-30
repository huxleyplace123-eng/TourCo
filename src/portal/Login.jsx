import { useState } from "react";
import { Mail, ArrowRight, Check, MapPinned, MessageCircle, ShieldCheck, Sparkles, LockKeyhole } from "lucide-react";
import { c, FONT, radius } from "../theme.js";
import { cdnImage } from "../images.js";
import { hasSupabase } from "./supabase.js";
import { Logo } from "../components/Logo.jsx";

export default function Login({ onSignIn, onPasswordSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("link");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid = /\S+@\S+\.\S+/.test(email);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || (mode === "password" && password.length < 8)) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "password") await onPasswordSignIn(email.trim(), password);
      else { await onSignIn(email.trim()); setSent(true); }
    }
    catch (err) { setError(err.message || (mode === "password" ? "We could not sign you in. Please check your details." : "We could not send the sign-in link. Please try again.")); }
    finally { setBusy(false); }
  };

  return (
    <div className="portal-login">
      <style>{`
        .portal-login{min-height:100vh;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(430px,.92fr);background:#F5F4F0;color:#172532;font-family:${FONT}}
        .portal-login-story{position:relative;display:flex;flex-direction:column;justify-content:space-between;min-height:100vh;padding:42px clamp(30px,5vw,72px);overflow:hidden;background-position:center;background-size:cover;color:#fff}
        .portal-login-story:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,23,34,.22),rgba(7,23,34,.9))}
        .portal-login-story>*{position:relative;z-index:1}
        .portal-login-brand{display:flex;align-items:center}
        .portal-login-copy{max-width:620px}.portal-login-copy>span{display:inline-flex;align-items:center;gap:7px;margin-bottom:14px;font-size:10.5px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#8FE6DA}
        .portal-login-copy h1{margin:0 0 16px;font-size:clamp(42px,6vw,70px);line-height:.93;letter-spacing:-.065em}
        .portal-login-copy p{max-width:540px;margin:0;color:rgba(255,255,255,.78);font-size:15px;line-height:1.65}
        .portal-login-proof{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:30px}
        .portal-login-proof div{display:grid;gap:7px;padding:15px;border:1px solid rgba(255,255,255,.17);border-radius:16px;background:rgba(255,255,255,.09);backdrop-filter:blur(12px)}
        .portal-login-proof svg{color:#FFD000}.portal-login-proof b{font-size:12px}.portal-login-proof span{color:rgba(255,255,255,.67);font-size:10.5px;line-height:1.4}
        .portal-login-panel{display:flex;align-items:center;justify-content:center;padding:32px}
        .portal-login-card{width:min(430px,100%);padding:34px;border:1px solid #DFE4E6;border-radius:27px;background:#fff;box-shadow:0 28px 75px rgba(19,40,61,.12)}
        .portal-login-mobile-brand{display:none;margin-bottom:22px}
        .portal-login-card h2{margin:0 0 7px;font-size:28px;letter-spacing:-.045em}.portal-login-card>p,.portal-login-sent>p{margin:0 0 24px;color:#697781;font-size:13px;line-height:1.55}
        .portal-login-modes{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:0 0 18px;padding:4px;border-radius:14px;background:#F1F3F3}
        .portal-login-modes button{min-height:39px;border:0;border-radius:10px;background:transparent;color:#697781;font:800 11.5px ${FONT};cursor:pointer}
        .portal-login-modes button[data-active="true"]{background:#fff;color:#13283D;box-shadow:0 4px 12px rgba(19,40,61,.09)}
        .portal-login-input{position:relative;display:block}.portal-login-input svg{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#71808A}
        .portal-login-input+.portal-login-input{margin-top:10px}
        .portal-login-input input{width:100%;box-sizing:border-box;min-height:52px;padding:0 15px 0 44px;border:1px solid #D9DFE2;border-radius:13px;background:#F8F9F8;color:#172532;font:500 15px ${FONT};outline:none}
        .portal-login-input input:focus{border-color:#0A8174;box-shadow:0 0 0 3px rgba(10,129,116,.1)}
        .portal-login-submit{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:52px;margin-top:11px;border:0;border-radius:13px;background:#13283D;color:#fff;font:850 14px ${FONT};cursor:pointer;box-shadow:0 12px 26px rgba(19,40,61,.18)}
        .portal-login-submit:disabled{opacity:.4;cursor:default;box-shadow:none}
        .portal-login-security{display:flex;align-items:flex-start;gap:10px;margin-top:18px;padding:13px;border-radius:14px;background:#EFF8F6;color:#526D68;font-size:10.5px;line-height:1.45}.portal-login-security svg{flex:0 0 auto;color:#078B78}.portal-login-security b{display:block;color:#1D4742;font-size:11.5px}
        .portal-login-sent{text-align:center}.portal-login-check{width:62px;height:62px;border-radius:20px;background:#E7F7F2;color:#078B78;display:grid;place-items:center;margin:4px auto 18px}
        @media(max-width:800px){.portal-login{grid-template-columns:1fr;min-height:100dvh}.portal-login-story{display:none}.portal-login-panel{align-items:flex-start;padding:26px 16px 40px}.portal-login-card{margin-top:4vh;padding:27px 22px;border-radius:23px}.portal-login-mobile-brand{display:block}.portal-login-card h2{font-size:26px}}
      `}</style>
      <section className="portal-login-story" style={{ backgroundImage:`url(${cdnImage("photo-1530789253388-582c481c54b0",1600)})` }}>
        <div className="portal-login-brand"><Logo fontSize={25} tagline /></div>
        <div className="portal-login-copy"><span><Sparkles size={14}/> Your Costa Rica journey</span><h1>Every detail.<br/>One beautiful trip.</h1><p>Your itinerary, exact meeting points, booking vouchers, and a real local concierge—all together when you need them.</p><div className="portal-login-proof"><div><MapPinned size={18}/><b>Know where to go</b><span>Exact pins, pickup notes, and directions.</span></div><div><MessageCircle size={18}/><b>Talk to a human</b><span>Your trip conversation stays in one place.</span></div><div><ShieldCheck size={18}/><b>Travel securely</b><span>Use a secure email link or your password.</span></div></div></div>
      </section>
      <main className="portal-login-panel"><div className="portal-login-card">
        <div className="portal-login-mobile-brand"><Logo fontSize={23} surface="light" /></div>
        {sent ? <div className="portal-login-sent"><div className="portal-login-check"><Check size={30}/></div><h2>Check your email</h2><p>We sent a one-time sign-in link to <b style={{color:c.charcoal}}>{email}</b>. Tap it and you’re in—no password needed.</p><button onClick={()=>setSent(false)} style={{background:"none",border:0,color:c.teal,font:`750 13px ${FONT}`,cursor:"pointer"}}>Use a different email</button></div> : <>
          <h2>Open your trip</h2><p>Use the email connected to your TicoWild booking. Choose a secure email link or your password.</p>
          <div className="portal-login-modes"><button type="button" data-active={mode==="link"} onClick={()=>{setMode("link");setError("");}}>Email link</button><button type="button" data-active={mode==="password"} onClick={()=>{setMode("password");setError("");}}>Password</button></div>
          <form onSubmit={submit}><label className="portal-login-input"><Mail size={17}/><input autoFocus type="email" inputMode="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@email.com"/></label>{mode==="password"&&<label className="portal-login-input"><LockKeyhole size={17}/><input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Your password"/></label>}<button className="portal-login-submit" type="submit" disabled={!valid||busy||(mode==="password"&&password.length<8)}>{busy?(mode==="password"?"Signing in…":"Sending…"):(mode==="password"?<>Sign in securely <ArrowRight size={17}/></>:<>Email me a secure link <ArrowRight size={17}/></>)}</button>{error&&<div role="alert" style={{marginTop:10,padding:"10px 12px",borderRadius:radius.sm,border:"1px solid #F1B9B5",background:"#FFF3F2",color:"#B42318",fontSize:12}}>{error}</div>}</form>
          <div className="portal-login-security"><ShieldCheck size={18}/><div><b>{mode==="password"?"Protected password access":"Private one-time access"}</b>{mode==="password"?"Your password is encrypted and your trip stays connected to this account.":"Each link is unique and sent only to your inbox. No password is needed."}</div></div>
          {!hasSupabase&&<div style={{marginTop:14,padding:"8px 11px",borderRadius:11,background:"#FFF8D9",border:"1px solid #F1E39C",color:"#796400",fontSize:10.5,fontWeight:750}}>Demo mode—sending a link signs you in immediately.</div>}
        </>}
      </div></main>
    </div>
  );
}
