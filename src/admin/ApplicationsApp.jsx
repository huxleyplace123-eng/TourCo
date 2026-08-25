import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BadgeCheck, Building2, Check, CircleAlert, Clock3, ExternalLink,
  FileCheck2, Inbox, KeyRound, LoaderCircle, LogOut, Mail, MapPin, MessageSquareText,
  RefreshCw, Search, Send, ShieldCheck, Sparkles, UserRoundCheck, UsersRound, X,
} from "lucide-react";
import { c, FONT, grad, radius, shadow } from "../theme.js";
import { CRM_CSS } from "./crm-ui.jsx";
import WorkspaceSwitch from "./WorkspaceSwitch.jsx";
import {
  approveApplication, getTeamAccess, inviteExistingOperator, loadApplications,
  reviewApplication, sendTeamMagicLink, signOutTeam,
} from "./applications-data.js";

const STATUS = {
  draft: { label: "In progress", color: c.blue, icon: Clock3 },
  pending: { label: "Ready to review", color: c.gold, icon: Inbox },
  needs_changes: { label: "Changes requested", color: "#FB923C", icon: MessageSquareText },
  approved: { label: "Approved", color: "#34D399", icon: BadgeCheck },
  declined: { label: "Declined", color: "#F87171", icon: X },
};

const input = {
  width: "100%", padding: "11px 13px", borderRadius: radius.sm,
  border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)",
  color: c.charcoal, fontFamily: FONT, fontSize: 13.5, outline: "none",
};

const dateLabel = (value) => value
  ? new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
  : "Not submitted";

function StatusPill({ status }) {
  const meta = STATUS[status] || STATUS.draft;
  const Icon = meta.icon;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"5px 9px",borderRadius:999,border:`1px solid ${meta.color}55`,background:`${meta.color}18`,color:meta.color,fontSize:11.5,fontWeight:800,whiteSpace:"nowrap" }}><Icon size={13}/>{meta.label}</span>;
}

function TeamGate({ access, onReady }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const send = async (event) => {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      await sendTeamMagicLink(email.trim());
      setNotice("Check your email and open the secure link. It will bring you straight back to this approval workspace.");
    } catch (err) { setError(err.message || "We couldn't send the staff sign-in link."); }
    finally { setBusy(false); }
  };

  const disconnect = async () => { await signOutTeam(); onReady(); };

  return <div className="approval-gate">
    <div className="approval-gate-copy">
      <div style={{ display:"inline-flex",alignItems:"center",gap:7,color:c.teal,fontSize:11,fontWeight:850,textTransform:"uppercase",letterSpacing:".11em" }}><ShieldCheck size={15}/> Verified team access</div>
      <h1 style={{ margin:"12px 0 10px",fontSize:"clamp(32px,5vw,52px)",lineHeight:1,letterSpacing:"-.05em" }}>Operator decisions belong <span style={{ color:c.gold }}>in one place.</span></h1>
      <p style={{ margin:0,maxWidth:580,color:c.stone,fontSize:15,lineHeight:1.7 }}>Review the real application, leave a clear note, and activate the partner account without moving information between systems.</p>
      <div className="approval-gate-points">
        {[[Inbox,"A clean review queue"],[FileCheck2,"Every business detail together"],[UserRoundCheck,"One-click partner activation"]].map(([Icon,label])=><div key={label}><Icon size={18}/><span>{label}</span></div>)}
      </div>
    </div>
    <form onSubmit={send} className="approval-gate-card">
      <div style={{ width:48,height:48,borderRadius:16,display:"grid",placeItems:"center",background:c.gold,color:c.ink,boxShadow:shadow.glowGold }}><KeyRound size={22}/></div>
      <h2 style={{ margin:"18px 0 5px",fontSize:23,letterSpacing:"-.03em" }}>Open approval access</h2>
      <p style={{ margin:"0 0 18px",color:c.stone,fontSize:12.5,lineHeight:1.55 }}>Use the email connected to your TicoWild staff account.</p>
      {access?.session && !access?.member && <div style={{ marginBottom:14,padding:11,borderRadius:12,border:"1px solid rgba(248,113,113,.28)",background:"rgba(248,113,113,.08)",color:"#FCA5A5",fontSize:12.5 }}>This signed-in account is not on the TicoWild team. <button type="button" onClick={disconnect} style={{ all:"unset",color:c.teal,fontWeight:800,cursor:"pointer" }}>Use another account</button></div>}
      <label style={{ display:"grid",gap:7,color:c.stone,fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:".06em" }}>Team email<input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@ticowild.com" style={input}/></label>
      {error && <div style={{ marginTop:12,color:"#FCA5A5",fontSize:12.5 }}>{error}</div>}
      {notice && <div style={{ marginTop:12,padding:11,borderRadius:12,background:"rgba(52,211,153,.09)",border:"1px solid rgba(52,211,153,.25)",color:"#6EE7B7",fontSize:12.5,lineHeight:1.55 }}>{notice}</div>}
      <button disabled={busy} style={{ width:"100%",marginTop:16,padding:12,border:0,borderRadius:radius.sm,background:c.gold,color:c.ink,fontWeight:850,cursor:busy?"wait":"pointer",display:"flex",justifyContent:"center",alignItems:"center",gap:8 }}>{busy?<LoaderCircle className="approval-spin" size={17}/>:<Mail size={17}/>} Email me a secure link</button>
      {!access?.configured && <div style={{ marginTop:12,color:"#FCA5A5",fontSize:12 }}>Supabase is not configured in this build.</div>}
    </form>
  </div>;
}

function ApplicationCard({ application, selected, onClick }) {
  const initials = (application.company_name || "?").split(/\s+/).slice(0,2).map((x)=>x[0]).join("").toUpperCase();
  return <button onClick={onClick} className={`approval-list-card ${selected?"selected":""}`}>
    <div className="approval-avatar">{initials}</div>
    <div style={{ minWidth:0,flex:1,textAlign:"left" }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,justifyContent:"space-between" }}><strong style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{application.company_name || "Unnamed company"}</strong><ArrowRight size={15} color={c.stone}/></div>
      <div style={{ color:c.stone,fontSize:11.5,margin:"4px 0 8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{application.contact_name || application.email}</div>
      <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}><StatusPill status={application.status}/><span style={{ color:c.stone,fontSize:10.5 }}>{dateLabel(application.submitted_at || application.created_at)}</span></div>
    </div>
  </button>;
}

function DetailRow({ icon: Icon, label, value, href }) {
  return <div className="approval-detail-row"><div className="approval-detail-icon"><Icon size={16}/></div><div style={{ minWidth:0 }}><div className="approval-label">{label}</div>{href?<a href={href} target="_blank" rel="noreferrer">{value}<ExternalLink size={12}/></a>:<div>{value || "Not provided"}</div>}</div></div>;
}

function ApplicationDetail({ application, busy, onAction }) {
  const [notes, setNotes] = useState(application.review_notes || "");
  useEffect(()=>setNotes(application.review_notes || ""),[application.id,application.review_notes]);
  const submitted = application.status !== "draft";
  const action = (status) => onAction(application, status, notes);
  return <section className="approval-detail">
    <div className="approval-detail-head">
      <div><div style={{ color:c.teal,fontSize:10.5,fontWeight:850,textTransform:"uppercase",letterSpacing:".1em" }}>Partner application</div><h2 style={{ margin:"7px 0 5px",fontSize:"clamp(24px,3vw,34px)",letterSpacing:"-.04em" }}>{application.company_name || "Unnamed company"}</h2><div style={{ color:c.stone,fontSize:12 }}>{application.email}</div></div>
      <StatusPill status={application.status}/>
    </div>

    <div className="approval-detail-grid">
      <DetailRow icon={UsersRound} label="Primary contact" value={application.contact_name}/>
      <DetailRow icon={Mail} label="Account email" value={application.email} href={`mailto:${application.email}`}/>
      <DetailRow icon={Building2} label="Phone" value={application.phone} href={application.phone?`tel:${application.phone}`:null}/>
      <DetailRow icon={MessageSquareText} label="WhatsApp" value={application.whatsapp} href={application.whatsapp?`https://wa.me/${application.whatsapp.replace(/\D/g,"")}`:null}/>
      <DetailRow icon={ExternalLink} label="Website" value={application.website} href={application.website}/>
      <DetailRow icon={Clock3} label="Years operating" value={application.years_in_business===null?"Not provided":String(application.years_in_business)}/>
    </div>

    <div className="approval-section"><div className="approval-label">Service regions</div><div className="approval-chips">{(application.regions||[]).length?(application.regions||[]).map((x)=><span key={x}><MapPin size={12}/>{x}</span>):<em>Not provided</em>}</div></div>
    <div className="approval-section"><div className="approval-label">Services</div><div className="approval-chips">{(application.categories||[]).length?(application.categories||[]).map((x)=><span key={x}>{x}</span>):<em>Not provided</em>}</div></div>
    <div className="approval-section"><div className="approval-label">Languages</div><div className="approval-chips">{(application.languages||[]).length?(application.languages||[]).map((x)=><span key={x}>{x}</span>):<em>Not provided</em>}</div></div>
    <div className="approval-section"><div className="approval-label">About the company</div><p style={{ margin:"7px 0 0",color:application.description?c.charcoal:c.stone,fontSize:13.5,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{application.description || "No company description yet."}</p></div>

    <label className="approval-section" style={{ display:"grid",gap:7 }}><div className="approval-label">Review note</div><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="What should the operator know, or what did the team verify?" style={{ ...input,minHeight:88,resize:"vertical",lineHeight:1.55 }}/></label>

    {!submitted && <div className="approval-draft-note"><CircleAlert size={17}/><div><b>This application is still being completed.</b><span> You can review what is here, but decisions unlock after the operator submits it.</span></div></div>}
    {submitted && application.status!=="approved" && application.status!=="declined" && <div className="approval-actions">
      <button disabled={busy} onClick={()=>action("declined")} className="approval-btn danger"><X size={16}/> Decline</button>
      <button disabled={busy} onClick={()=>action("needs_changes")} className="approval-btn secondary"><MessageSquareText size={16}/> Request changes</button>
      <button disabled={busy} onClick={()=>action("approved")} className="approval-btn primary">{busy?<LoaderCircle className="approval-spin" size={17}/>:<Check size={18}/>} Approve partner</button>
    </div>}
    {(application.status==="approved"||application.status==="declined") && <div className="approval-final"><StatusPill status={application.status}/><span>{application.review_notes || (application.status==="approved"?"Partner account activated.":"Application closed.")}</span></div>}
  </section>;
}

function InviteModal({ onClose, onInvited }) {
  const [form,setForm]=useState({companyName:"",email:"",operatorId:"",role:"owner"});
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const set=(k)=>(e)=>setForm((x)=>({...x,[k]:e.target.value}));
  const send=async(e)=>{e.preventDefault();setBusy(true);setError("");try{await inviteExistingOperator(form);onInvited();}catch(err){setError(err.message||"We couldn't create the invitation.");}finally{setBusy(false);}};
  return <div className="approval-modal-bg" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><form className="approval-modal" onSubmit={send}><div style={{ display:"flex",alignItems:"center",gap:10 }}><div style={{ width:42,height:42,borderRadius:14,display:"grid",placeItems:"center",background:"rgba(34,211,238,.12)",color:c.teal }}><Send size={19}/></div><div style={{ flex:1 }}><h3 style={{ margin:0,fontSize:19 }}>Invite an existing operator</h3><div style={{ color:c.stone,fontSize:11.5,marginTop:3 }}>Their signup email securely connects to this company.</div></div><button type="button" onClick={onClose} style={{ all:"unset",cursor:"pointer",color:c.stone }}><X/></button></div><div style={{ display:"grid",gap:12,marginTop:20 }}><label className="approval-field">Company name<input required value={form.companyName} onChange={set("companyName")} style={input}/></label><label className="approval-field">Email<input required type="email" value={form.email} onChange={set("email")} style={input}/></label><label className="approval-field">CRM operator ID<input required value={form.operatorId} onChange={set("operatorId")} placeholder="e.g. arenal-adventures" style={input}/></label><label className="approval-field">Access role<select value={form.role} onChange={set("role")} style={input}>{["owner","manager","guide","finance"].map((x)=><option key={x}>{x}</option>)}</select></label></div>{error&&<div style={{ color:"#FCA5A5",fontSize:12.5,marginTop:12 }}>{error}</div>}<div style={{ display:"flex",justifyContent:"flex-end",gap:9,marginTop:20 }}><button type="button" onClick={onClose} className="approval-btn secondary">Cancel</button><button disabled={busy} className="approval-btn primary">{busy?"Creating…":"Create invitation"}</button></div></form></div>;
}

export default function ApplicationsApp({ workspace, onWorkspace, onSignOut }) {
  const [access,setAccess]=useState(null); const [applications,setApplications]=useState([]);
  const [selectedId,setSelectedId]=useState(null); const [filter,setFilter]=useState("pending"); const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [inviteOpen,setInviteOpen]=useState(false);

  const refreshAccess=async()=>{setLoading(true);setError("");try{const next=await getTeamAccess();setAccess(next);if(next.member){const rows=await loadApplications();setApplications(rows);setSelectedId((id)=>id&&rows.some((x)=>x.id===id)?id:(rows.find((x)=>x.status==="pending")||rows[0])?.id||null);}}catch(err){setError(err.message||"We couldn't open partner applications.");}finally{setLoading(false);}};
  useEffect(()=>{refreshAccess();},[]);
  const counts=useMemo(()=>Object.keys(STATUS).reduce((out,key)=>({...out,[key]:applications.filter((x)=>x.status===key).length}),{}),[applications]);
  const visible=useMemo(()=>applications.filter((x)=>(filter==="all"||x.status===filter)&&[x.company_name,x.contact_name,x.email,...(x.regions||[]),...(x.categories||[])].join(" ").toLowerCase().includes(query.trim().toLowerCase())),[applications,filter,query]);
  const selected=visible.find((x)=>x.id===selectedId)||visible[0]||null;

  const act=async(app,status,notes)=>{const decision=status==="approved"?`Approve ${app.company_name} and activate its partner account?`:status==="declined"?`Decline ${app.company_name}'s application?`:`Send ${app.company_name} back for changes?`;if(!window.confirm(decision))return;setBusy(true);setError("");try{if(status==="approved")await approveApplication(app.id,notes);else await reviewApplication(app.id,status,notes);const rows=await loadApplications();setApplications(rows);setSelectedId(app.id);}catch(err){setError(err.message||"The decision could not be saved.");}finally{setBusy(false);}};
  const teamSignOut=async()=>{await signOutTeam();setAccess({configured:true,session:null,member:null});setApplications([]);};
  const fullSignOut=async()=>{await signOutTeam();onSignOut();};

  return <div style={{ minHeight:"100vh",background:`${grad.aurora},${c.sand}`,color:c.charcoal,fontFamily:FONT }}><style>{`
    ${CRM_CSS}
    .approval-spin{animation:approvalSpin .8s linear infinite}@keyframes approvalSpin{to{transform:rotate(360deg)}}
    .approval-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.approval-shell{max-width:1440px;margin:0 auto;padding:18px var(--crm-gutter) 90px;zoom:.95}
    .approval-gate{margin-top:28px;min-height:620px;border:1px solid ${c.line};border-radius:${radius.xl}px;background:linear-gradient(135deg,rgba(15,36,64,.97),rgba(19,41,74,.88));box-shadow:${shadow.xl};display:grid;grid-template-columns:minmax(0,1.2fr) minmax(340px,.8fr);overflow:hidden}.approval-gate-copy{padding:clamp(36px,6vw,78px);display:flex;flex-direction:column;justify-content:center}.approval-gate-points{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:34px}.approval-gate-points div{padding:14px;border:1px solid ${c.line};border-radius:15px;background:rgba(255,255,255,.035);display:grid;gap:9px;color:${c.teal};font-size:12px;font-weight:750}.approval-gate-card{align-self:center;margin:30px;padding:30px;border:1px solid rgba(127,166,232,.22);border-radius:${radius.lg}px;background:rgba(11,26,46,.7);box-shadow:${shadow.lg}}
    .approval-hero{margin-top:22px;padding:24px;border:1px solid ${c.line};border-radius:${radius.lg}px;background:linear-gradient(130deg,rgba(34,211,238,.08),rgba(255,208,0,.06) 70%,rgba(255,255,255,.025));display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.approval-stats{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr));gap:10px;margin:12px 0}.approval-stat{padding:14px 15px;border-radius:${radius.md}px;border:1px solid ${c.line};background:${c.white}}.approval-grid{display:grid;grid-template-columns:minmax(310px,.72fr) minmax(0,1.28fr);gap:12px;align-items:start}.approval-queue,.approval-detail{border:1px solid ${c.line};border-radius:${radius.lg}px;background:rgba(19,41,74,.92);box-shadow:${shadow.md}}.approval-queue{padding:14px;position:sticky;top:14px;max-height:calc(100vh - 28px);overflow:auto}.approval-list-card{width:100%;display:flex;gap:11px;align-items:center;padding:12px;margin-top:8px;border:1px solid transparent;border-radius:15px;background:rgba(255,255,255,.028);color:${c.charcoal};font-family:${FONT};cursor:pointer}.approval-list-card:hover{background:rgba(255,255,255,.055)}.approval-list-card.selected{border-color:rgba(34,211,238,.45);background:rgba(34,211,238,.075)}.approval-avatar{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;flex:0 0 auto;background:linear-gradient(135deg,rgba(34,211,238,.18),rgba(127,166,232,.14));color:${c.teal};font-size:12px;font-weight:900}.approval-detail{padding:clamp(18px,3vw,28px)}.approval-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:19px;border-bottom:1px solid ${c.line}}.approval-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}.approval-detail-row{display:grid;grid-template-columns:35px 1fr;gap:9px;align-items:center;padding:11px;border-radius:14px;border:1px solid ${c.line};background:rgba(255,255,255,.027);font-size:12.5px}.approval-detail-row a{display:flex;align-items:center;gap:5px;color:${c.teal};text-decoration:none;overflow-wrap:anywhere}.approval-detail-icon{width:35px;height:35px;border-radius:11px;display:grid;place-items:center;background:rgba(34,211,238,.1);color:${c.teal}}.approval-label{color:${c.stone};font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.075em;margin-bottom:3px}.approval-section{margin-top:14px;padding:14px;border:1px solid ${c.line};border-radius:15px;background:rgba(255,255,255,.024)}.approval-chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.approval-chips span{display:inline-flex;align-items:center;gap:4px;padding:6px 9px;border-radius:999px;border:1px solid rgba(34,211,238,.25);background:rgba(34,211,238,.07);color:${c.teal};font-size:11.5px;font-weight:750}.approval-chips em{color:${c.stone};font-size:12px}.approval-actions{display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap;margin-top:17px;padding-top:17px;border-top:1px solid ${c.line}}.approval-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border-radius:11px;font-family:${FONT};font-size:12.5px;font-weight:850;cursor:pointer}.approval-btn.primary{border:1px solid ${c.gold};background:${c.gold};color:${c.ink};box-shadow:${shadow.glowGold}}.approval-btn.secondary{border:1px solid ${c.line};background:rgba(255,255,255,.04);color:${c.charcoal}}.approval-btn.danger{border:1px solid rgba(248,113,113,.32);background:rgba(248,113,113,.08);color:#FCA5A5}.approval-draft-note,.approval-final{display:flex;align-items:flex-start;gap:9px;margin-top:15px;padding:13px;border-radius:14px;border:1px solid rgba(255,208,0,.23);background:rgba(255,208,0,.07);color:${c.stone};font-size:12.5px;line-height:1.5}.approval-final{align-items:center;border-color:${c.line};background:rgba(255,255,255,.03)}.approval-field{display:grid;gap:6px;color:${c.stone};font-size:10.5px;font-weight:850;text-transform:uppercase;letter-spacing:.06em}.approval-modal-bg{position:fixed;inset:0;z-index:80;background:rgba(4,10,20,.72);backdrop-filter:blur(5px);display:grid;place-items:center;padding:14px;overflow:auto}.approval-modal{width:min(520px,100%);padding:24px;border-radius:${radius.lg}px;border:1px solid ${c.line};background:${c.canvas2};box-shadow:${shadow.xl}}
    @media(max-width:900px){.approval-gate{grid-template-columns:1fr;min-height:0}.approval-gate-card{margin:0 18px 22px}.approval-gate-points{grid-template-columns:1fr}.approval-stats{grid-template-columns:repeat(2,1fr)}.approval-grid{grid-template-columns:1fr}.approval-queue{position:static;max-height:none}.approval-detail-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:560px){.approval-shell{padding:12px 12px 70px;zoom:1}.approval-top{gap:8px}.approval-disconnect{display:none}.approval-hero{align-items:flex-start;flex-direction:column;padding:18px}.approval-detail-grid{grid-template-columns:1fr}.approval-actions{display:grid;grid-template-columns:1fr}.approval-actions .approval-btn{width:100%}.approval-detail-head{flex-direction:column}.approval-gate-copy{padding:30px 20px}.approval-gate-card{padding:22px;margin:0 12px 14px}}
  `}</style><div className="approval-shell">
    <header className="approval-top"><div style={{ fontSize:22,fontWeight:800,letterSpacing:-.5 }}>Tico<span style={{ color:c.gold }}>Wild</span><span style={{ color:c.stone,fontWeight:700,fontSize:15,marginLeft:8 }}>CRM</span></div><WorkspaceSwitch workspace={workspace} onWorkspace={onWorkspace}/><div style={{ flex:1 }}/>{access?.member&&<button onClick={teamSignOut} className="approval-btn secondary approval-disconnect"><KeyRound size={14}/> Disconnect approvals</button>}<button onClick={fullSignOut} className="approval-btn secondary"><LogOut size={14}/> Sign out</button></header>
    {loading&&<div style={{ minHeight:520,display:"grid",placeItems:"center",color:c.stone }}><div style={{ textAlign:"center" }}><LoaderCircle className="approval-spin" size={28}/><div style={{ marginTop:10,fontSize:12 }}>Opening applications…</div></div></div>}
    {!loading&&!access?.member&&<TeamGate access={access} onReady={refreshAccess}/>} 
    {!loading&&access?.member&&<>
      <section className="approval-hero"><div><div style={{ display:"flex",alignItems:"center",gap:7,color:c.teal,fontSize:10.5,fontWeight:850,textTransform:"uppercase",letterSpacing:".11em" }}><Sparkles size={14}/> Partner review desk</div><h1 style={{ margin:"8px 0 5px",fontSize:"clamp(27px,4vw,42px)",letterSpacing:"-.05em" }}>Make the next partner decision.</h1><p style={{ margin:0,color:c.stone,fontSize:13.5 }}>Signed in as {access.session.user.email} · {access.member.role}</p></div><div style={{ display:"flex",gap:8,flexWrap:"wrap" }}><button onClick={refreshAccess} className="approval-btn secondary"><RefreshCw size={15}/> Refresh</button><button onClick={()=>setInviteOpen(true)} className="approval-btn primary"><Send size={15}/> Invite operator</button></div></section>
      <div className="approval-stats">{[["Ready to review",counts.pending,c.gold,"pending"],["In progress",counts.draft,c.blue,"draft"],["Changes requested",counts.needs_changes,"#FB923C","needs_changes"],["Approved",counts.approved,"#34D399","approved"]].map(([label,value,color,key])=><button key={key} onClick={()=>setFilter(key)} className="approval-stat" style={{ textAlign:"left",cursor:"pointer",fontFamily:FONT,color:c.charcoal,boxShadow:filter===key?`0 0 0 1px ${color}`:"none" }}><div style={{ color:c.stone,fontSize:10.5,fontWeight:850,textTransform:"uppercase",letterSpacing:".065em" }}>{label}</div><div style={{ color,fontSize:24,fontWeight:900,marginTop:3 }}>{value||0}</div></button>)}</div>
      {error&&<div style={{ padding:12,marginBottom:10,borderRadius:12,border:"1px solid rgba(248,113,113,.28)",background:"rgba(248,113,113,.08)",color:"#FCA5A5",fontSize:12.5 }}>{error}</div>}
      <div className="approval-grid"><aside className="approval-queue"><div style={{ display:"flex",gap:8 }}><div style={{ position:"relative",flex:1 }}><Search size={14} style={{ position:"absolute",left:10,top:12,color:c.stone }}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search applications" style={{ ...input,paddingLeft:31 }}/></div><select value={filter} onChange={(e)=>setFilter(e.target.value)} style={{ ...input,width:"auto" }}><option value="all">All</option>{Object.entries(STATUS).map(([key,meta])=><option value={key} key={key}>{meta.label}</option>)}</select></div><div style={{ margin:"13px 2px 4px",color:c.stone,fontSize:11 }}>{visible.length} application{visible.length===1?"":"s"}</div>{visible.length?visible.map((app)=><ApplicationCard key={app.id} application={app} selected={selected?.id===app.id} onClick={()=>setSelectedId(app.id)}/>):<div style={{ textAlign:"center",padding:"48px 16px",color:c.stone }}><Inbox size={30} style={{ opacity:.45 }}/><div style={{ marginTop:10,fontSize:13 }}>Nothing in this view.</div></div>}</aside>{selected?<ApplicationDetail application={selected} busy={busy} onAction={act}/>:<section className="approval-detail" style={{ minHeight:420,display:"grid",placeItems:"center",textAlign:"center",color:c.stone }}><div><FileCheck2 size={38} style={{ opacity:.4 }}/><div style={{ marginTop:12 }}>Choose an application to review.</div></div></section>}</div>
    </>}
  </div>{inviteOpen&&<InviteModal onClose={()=>setInviteOpen(false)} onInvited={()=>{setInviteOpen(false);refreshAccess();}}/>}</div>;
}
