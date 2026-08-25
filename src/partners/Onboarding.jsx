import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Building2, Check, Clock3, FileSignature, Globe2, LogOut, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "../components/Logo.jsx";
import { AGREEMENT_VERSION, OperatorAgreement } from "../components/OperatorAgreement.jsx";
import { c, FONT, grad, radius, shadow } from "../theme.js";
import { saveApplication } from "./partnerData.js";

const REGIONS = ["Guanacaste", "Central Pacific", "South Pacific", "Northern Plains", "Central Valley", "Caribbean"];
const CATEGORIES = ["Adventure", "Wildlife", "Water", "Fishing", "Surfing", "Wellness", "Transport", "Hotels", "Food & dining", "Other"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian"];

const field = { width:"100%", padding:"12px 13px", borderRadius:12, border:`1px solid ${c.line}`, background:"rgba(255,255,255,.05)", color:c.charcoal, outline:"none", fontSize:14 };
const blank = { companyName:"", contactName:"", phone:"", whatsapp:"", website:"", regions:[], categories:[], languages:["English","Spanish"], yearsInBusiness:"", description:"" };

function valuesFrom(application, email) {
  if (!application) return { ...blank };
  return {
    companyName: application.company_name || "",
    contactName: application.contact_name || "",
    phone: application.phone || "",
    whatsapp: application.whatsapp || "",
    website: application.website || "",
    regions: application.regions || [],
    categories: application.categories || [],
    languages: application.languages || [],
    yearsInBusiness: application.years_in_business || "",
    description: application.description || "",
    email,
  };
}

function agreementFrom(application) {
  if (!application?.agreement_accepted_at) return null;
  return {
    legalName: application.agreement_legal_name || application.company_name || "",
    signerName: application.agreement_signer_name || "",
    title: application.agreement_signer_title || "",
    email: application.email || "",
    signature: application.agreement_signature || "",
    acceptedAt: application.agreement_accepted_at,
    agreementVersion: application.agreement_version || AGREEMENT_VERSION,
  };
}

export default function Onboarding({ user, application, onSubmitted, onSignOut }) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(() => valuesFrom(application, user.email));
  const [agreement, setAgreement] = useState(() => agreementFrom(application));
  const [showAgreement, setShowAgreement] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key) => (event) => setValues((v) => ({ ...v, [key]: event.target.value }));
  const toggle = (key, value) => setValues((v) => ({ ...v, [key]: v[key].includes(value) ? v[key].filter((x) => x !== value) : [...v[key], value] }));
  const complete = useMemo(() => [values.companyName, values.contactName, values.phone, values.regions.length, values.categories.length, values.description].filter(Boolean).length, [values]);

  const next = () => {
    setError("");
    if (step === 1 && (!values.companyName.trim() || !values.contactName.trim() || !values.phone.trim())) return setError("Add your company, primary contact, and phone number to continue.");
    if (step === 2 && (!values.regions.length || !values.categories.length)) return setError("Choose at least one region and one service category.");
    if (step === 3 && !values.description.trim()) return setError("Add a short company description before continuing to the agreement.");
    setStep((s) => Math.min(4, s + 1));
  };

  const submit = async () => {
    if (!agreement?.acceptedAt || !agreement?.signature) return setError("Review and sign the partner agreement before submitting.");
    setBusy(true); setError("");
    try { onSubmitted(await saveApplication(user, values, true, agreement)); }
    catch (err) { setError(err.message || "We couldn't submit your application."); }
    finally { setBusy(false); }
  };

  const signedAgreement = async (signed) => {
    setAgreement(signed);
    setError("");
    try { await saveApplication(user, values, false, signed); }
    catch (err) { setError(err.message || "We couldn't attach the signed agreement."); }
  };

  return (
    <Shell onSignOut={onSignOut}>
      <div className="onboard-grid">
        <style>{`
          .onboard-grid{display:grid;grid-template-columns:280px minmax(0,1fr);gap:18px;max-width:1050px;margin:0 auto;padding:34px 20px 60px}.onboard-card{border:1px solid ${c.line};background:rgba(19,41,74,.9);border-radius:${radius.lg}px;box-shadow:${shadow.md}}.onboard-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}.onboard-chip{border:1px solid ${c.line};background:rgba(255,255,255,.035);color:${c.stone};border-radius:999px;padding:8px 11px;font-size:12px;font-weight:750;cursor:pointer}.onboard-chip.on{border-color:${c.teal};background:rgba(34,211,238,.11);color:${c.teal}}@media(max-width:760px){.onboard-grid{grid-template-columns:1fr;padding:20px 14px 42px}.onboard-fields{grid-template-columns:1fr}.onboard-side{display:none}}
        `}</style>
        <aside className="onboard-card onboard-side" style={{ padding:20,alignSelf:"start",position:"sticky",top:20 }}>
          <div style={{ color:c.teal,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:".1em" }}>Partner onboarding</div>
          <h2 style={{ margin:"8px 0 6px",fontSize:22 }}>Build a profile guests can trust.</h2>
          <p style={{ margin:"0 0 20px",color:c.stone,fontSize:12.5,lineHeight:1.6 }}>TicoWild reviews every partner before publishing or sending bookings.</p>
          {[['Business details',Building2],['Services and regions',MapPin],['Review details',BadgeCheck],['Agreement and submit',FileSignature]].map(([label,Icon],i)=>{
            const n=i+1,on=step===n,done=step>n;
            return <div key={label} style={{ display:"grid",gridTemplateColumns:"34px 1fr",gap:10,alignItems:"center",padding:"10px 0",opacity:on||done?1:.55 }}>
              <div style={{ width:34,height:34,borderRadius:11,display:"grid",placeItems:"center",background:done?"rgba(52,211,153,.14)":on?"rgba(255,208,0,.14)":"rgba(255,255,255,.04)",color:done?"#34D399":on?c.gold:c.stone }}>{done?<Check size={17}/>:<Icon size={16}/>}</div>
              <div style={{ fontSize:13,fontWeight:800 }}>{label}</div>
            </div>;
          })}
          <div style={{ marginTop:18,height:5,borderRadius:999,background:"rgba(255,255,255,.06)",overflow:"hidden" }}><div style={{ width:`${(complete/6)*100}%`,height:"100%",background:grad.ocean }}/></div>
          <div style={{ marginTop:7,color:c.stone,fontSize:11 }}>{complete} of 6 essentials complete</div>
        </aside>

        <main className="onboard-card" style={{ padding:"clamp(20px,4vw,34px)" }}>
          <div style={{ color:c.gold,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:".1em" }}>Step {step} of 4</div>
          <h1 style={{ margin:"8px 0 6px",fontSize:"clamp(25px,4vw,36px)",letterSpacing:"-.035em" }}>{step===1?"Tell us about the business":step===2?"Where and how you operate":step===3?"Review your partner application":"Review and sign the agreement"}</h1>
          <p style={{ margin:"0 0 24px",color:c.stone,fontSize:13.5,lineHeight:1.6 }}>{step===1?"This creates the private company record connected to your login.":step===2?"We use this to match your company with the right travelers and requests.":step===3?"Confirm the details before reviewing the TicoWild partner agreement.":"A signed agreement is required before the application can be submitted for approval."}</p>

          {step===1 && <div className="onboard-fields">
            <Field label="Company name"><input style={field} value={values.companyName} onChange={set('companyName')} placeholder="Legal or trading name"/></Field>
            <Field label="Primary contact"><input style={field} value={values.contactName} onChange={set('contactName')} placeholder="Owner or manager"/></Field>
            <Field label="Phone"><input style={field} value={values.phone} onChange={set('phone')} placeholder="+506 …"/></Field>
            <Field label="WhatsApp"><input style={field} value={values.whatsapp} onChange={set('whatsapp')} placeholder="+506 …"/></Field>
            <Field label="Website"><input style={field} value={values.website} onChange={set('website')} placeholder="https://…"/></Field>
            <Field label="Account email"><input disabled style={{ ...field,opacity:.6 }} value={user.email}/></Field>
          </div>}

          {step===2 && <div style={{ display:"grid",gap:22 }}>
            <Choice label="Service regions" help="Choose every region where you regularly operate." items={REGIONS} selected={values.regions} onToggle={(v)=>toggle('regions',v)}/>
            <Choice label="Services" help="What should TicoWild send your way?" items={CATEGORIES} selected={values.categories} onToggle={(v)=>toggle('categories',v)}/>
            <Choice label="Languages" help="Languages your team can use with guests." items={LANGUAGES} selected={values.languages} onToggle={(v)=>toggle('languages',v)}/>
            <Field label="Years in business"><input type="number" min="0" max="100" style={{ ...field,maxWidth:190 }} value={values.yearsInBusiness} onChange={set('yearsInBusiness')} placeholder="e.g. 8"/></Field>
          </div>}

          {step===3 && <div style={{ display:"grid",gap:16 }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10 }}>
              <Review icon={Building2} label="Company" value={values.companyName}/><Review icon={MapPin} label="Regions" value={values.regions.join(', ')}/><Review icon={Globe2} label="Services" value={values.categories.join(', ')}/>
            </div>
            <Field label="Company description"><textarea style={{ ...field,minHeight:120,resize:"vertical",lineHeight:1.6 }} value={values.description} onChange={set('description')} placeholder="Describe what you offer, where you operate, and what makes the guest experience special."/></Field>
            <div style={{ display:"flex",gap:10,alignItems:"flex-start",padding:14,borderRadius:14,border:"1px solid rgba(52,211,153,.25)",background:"rgba(52,211,153,.07)" }}><ShieldCheck size={19} color="#34D399"/><div style={{ fontSize:12.5,lineHeight:1.55,color:c.stone }}><b style={{ color:c.charcoal }}>Nothing is published automatically.</b> The TicoWild team will review your application, verify the business, and activate your full partner portal.</div></div>
          </div>}

          {step===4 && <div style={{ display:"grid",gap:16 }}>
            <div style={{ padding:18,borderRadius:18,border:`1px solid ${agreement?"rgba(52,211,153,.38)":c.line}`,background:agreement?"rgba(52,211,153,.075)":"rgba(255,255,255,.03)",display:"grid",gridTemplateColumns:"48px 1fr",gap:13,alignItems:"center" }}>
              <div style={{ width:48,height:48,borderRadius:15,display:"grid",placeItems:"center",background:agreement?"rgba(52,211,153,.14)":"rgba(255,208,0,.12)",color:agreement?"#34D399":c.gold }}><FileSignature size={23}/></div>
              <div><div style={{ fontWeight:850,fontSize:15 }}>Operator Partner, Booking Fee & Indemnity Agreement</div><div style={{ marginTop:4,color:agreement?"#6EE7B7":c.stone,fontSize:12.5,lineHeight:1.55 }}>{agreement?`Signed by ${agreement.signerName} on ${new Date(agreement.acceptedAt).toLocaleDateString()}`:"Review the booking model, fees, cancellations, safety, insurance, indemnity and non-circumvention terms."}</div></div>
            </div>
            <button type="button" onClick={()=>setShowAgreement(true)} style={{ ...button(true),width:"100%",padding:13 }}>{agreement?<><FileSignature size={17}/> Review or sign again</>:<><FileSignature size={17}/> Review and sign agreement</>}</button>
            <div style={{ display:"flex",gap:10,alignItems:"flex-start",padding:14,borderRadius:14,border:`1px solid ${c.line}`,background:"rgba(255,255,255,.025)" }}><ShieldCheck size={19} color={c.teal}/><div style={{ fontSize:12.5,lineHeight:1.55,color:c.stone }}><b style={{ color:c.charcoal }}>The application cannot be approved without this agreement.</b> Your signed copy downloads automatically and the acceptance record stays attached to your application.</div></div>
          </div>}

          {error && <div style={{ marginTop:18,padding:11,borderRadius:12,color:"#FCA5A5",background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.28)",fontSize:12.5 }}>{error}</div>}
          <div style={{ display:"flex",justifyContent:"space-between",gap:10,marginTop:26 }}>
            <button type="button" disabled={step===1} onClick={()=>setStep((s)=>s-1)} style={button(false,step===1)}><ArrowLeft size={16}/> Back</button>
            {step<4?<button type="button" onClick={next} style={button(true)} >Continue <ArrowRight size={16}/></button>:<button type="button" disabled={busy||!agreement} onClick={submit} style={button(true,busy||!agreement)}>{busy?"Submitting…":"Submit signed application"}<BadgeCheck size={17}/></button>}
          </div>
        </main>
      </div>
      {showAgreement && <OperatorAgreement delivery="record" initialValues={{ legalName:values.companyName,signerName:values.contactName,email:user.email,phone:values.whatsapp||values.phone,category:values.categories.join(', '),location:values.regions.join(', ') }} onSigned={signedAgreement} onClose={()=>setShowAgreement(false)}/>}
    </Shell>
  );
}

export function PendingReview({ application, onSignOut }) {
  return <Shell onSignOut={onSignOut}><div style={{ maxWidth:680,margin:"0 auto",padding:"70px 18px",textAlign:"center" }}>
    <div style={{ width:74,height:74,borderRadius:24,display:"grid",placeItems:"center",margin:"0 auto 20px",background:"rgba(255,208,0,.12)",color:c.gold,border:"1px solid rgba(255,208,0,.25)",boxShadow:shadow.glowGold }}><Clock3 size={34}/></div>
    <div style={{ color:c.teal,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:".12em" }}>Application received</div>
    <h1 style={{ margin:"10px 0",fontSize:"clamp(30px,5vw,48px)",letterSpacing:"-.045em" }}>{application?.company_name || "Your company"} is in review.</h1>
    <p style={{ maxWidth:560,margin:"0 auto",color:c.stone,fontSize:15,lineHeight:1.7 }}>TicoWild will verify the details and activate the complete partner center. You’ll receive an email when access is ready.</p>
    <div style={{ margin:"28px auto 0",padding:18,maxWidth:520,borderRadius:18,border:`1px solid ${c.line}`,background:c.white,textAlign:"left" }}>
      <div style={{ fontWeight:800,marginBottom:11 }}>What happens next</div>
      {["TicoWild reviews your company and service areas","We confirm pricing, safety, and operating details","Your portal opens for tours, availability, bookings, and messages"].map((x,i)=><div key={x} style={{ display:"flex",gap:10,padding:"8px 0",color:c.stone,fontSize:12.5 }}><span style={{ color:c.gold,fontWeight:800 }}>{i+1}</span>{x}</div>)}
    </div>
  </div></Shell>;
}

function Shell({ children,onSignOut }) { return <div style={{ minHeight:"100vh",background:`${grad.aurora},${c.sand}`,color:c.charcoal,fontFamily:FONT }}><header style={{ height:68,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 clamp(16px,4vw,34px)",borderBottom:`1px solid ${c.line}`,background:"rgba(11,26,46,.78)",backdropFilter:"blur(14px)" }}><Logo fontSize={21}/><button onClick={onSignOut} style={{ display:"inline-flex",alignItems:"center",gap:7,border:0,background:"transparent",color:c.stone,fontWeight:750,cursor:"pointer" }}><LogOut size={15}/> Sign out</button></header>{children}</div>; }
function Field({ label,children }) { return <label style={{ display:"grid",gap:7,color:c.stone,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:".055em" }}>{label}{children}</label>; }
function Choice({ label,help,items,selected,onToggle }) { return <div><div style={{ fontWeight:800,fontSize:14 }}>{label}</div><div style={{ color:c.stone,fontSize:11.5,margin:"3px 0 10px" }}>{help}</div><div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{items.map((x)=><button type="button" className={`onboard-chip ${selected.includes(x)?'on':''}`} onClick={()=>onToggle(x)} key={x}>{selected.includes(x)&&<Check size={12} style={{ verticalAlign:-2,marginRight:4 }}/>} {x}</button>)}</div></div>; }
function Review({ icon:Icon,label,value }) { return <div style={{ padding:14,borderRadius:15,border:`1px solid ${c.line}`,background:"rgba(255,255,255,.035)" }}><Icon size={17} color={c.teal}/><div style={{ color:c.stone,fontSize:10.5,fontWeight:800,textTransform:"uppercase",margin:"9px 0 3px" }}>{label}</div><div style={{ fontSize:12.5,fontWeight:750,lineHeight:1.5 }}>{value||"Not added"}</div></div>; }
function button(primary,disabled=false){ return { display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,padding:"11px 17px",borderRadius:12,border:primary?0:`1px solid ${c.line}`,background:primary?c.gold:"transparent",color:primary?c.ink:c.stone,fontWeight:800,cursor:disabled?"default":"pointer",opacity:disabled ? .55 : 1,boxShadow:primary&&!disabled?shadow.glowGold:"none" }; }
