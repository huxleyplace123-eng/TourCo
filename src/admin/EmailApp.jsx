import { useEffect, useMemo, useRef, useState } from "react";
import { Mail, RefreshCw, Send, LogOut, PenLine, ArrowLeft, ExternalLink } from "lucide-react";
import WorkspaceSwitch from "./WorkspaceSwitch.jsx";
import { c, FONT } from "../theme.js";
import { mailConfig } from "./mail-config.js";
import { connectMail, disconnectMail, listMail, mailAccount, mailConfigured, readMail, replyMail, sendMail } from "./mail-client.js";
import { messageMatches } from "./mail-model.js";
import { loadCustomers } from "./store.js";
import { loadOperatorOverlay, mergedOperators } from "./operators-store.js";
import { allEmailTemplates } from "./email-templates.js";

const blank = () => ({ to: "", bcc: "", subject: "", body: "" });
function initialDraft() {
  const p = new URLSearchParams(window.location.search);
  return Object.fromEntries(Object.keys(blank()).map(k => [k, p.get(k) || ""]));
}
export default function EmailApp({ workspace, onWorkspace, onSignOut }) {
  const [account, setAccount] = useState(null), [folder, setFolder] = useState("inbox");
  const [messages, setMessages] = useState([]), [next, setNext] = useState(null), [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(initialDraft), [compose, setCompose] = useState(() => Boolean(initialDraft().to || initialDraft().bcc));
  const [replyId, setReplyId] = useState(null), [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false), [sending, setSending] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const sendLock = useRef(false), request = useRef(0), detailRequest = useRef(0);
  const templates = useMemo(allEmailTemplates, []);
  const contacts = useMemo(() => [...loadCustomers(), ...mergedOperators(loadOperatorOverlay())].filter(x => x.email), []);
  const matches = useMemo(() => messages.filter(m => messageMatches(m, query)), [messages, query]);
  async function refresh(append = false) {
    const generation = ++request.current; setBusy(true); setError("");
    try {
      const data = await listMail(folder, append ? next : undefined);
      if (request.current !== generation) return;
      setMessages(old => append ? [...new Map([...old, ...data.value].map(m => [m.id, m])).values()] : data.value);
      setNext(data["@odata.nextLink"] || null);
    } catch (e) { if (request.current === generation) setError(e.message); }
    finally { if (request.current === generation) setBusy(false); }
  }
  useEffect(() => { let live = true; mailAccount().then(a => { if (live) setAccount(a); }).catch(e => { if (live) setError(e.message); });
    // Remove draft text from the address bar after consuming the CRM handoff.
    window.history.replaceState(null, "", "/admin/?workspace=email");
    return () => { live = false; request.current++; detailRequest.current++; };
  }, []);
  useEffect(() => { detailRequest.current++; setSelected(null); setMessages([]); setNext(null); if (account) refresh(); }, [account, folder]);
  async function connect() { setBusy(true); setError(""); try { setAccount(await connectMail()); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function disconnect() { await disconnectMail(); request.current++; detailRequest.current++; setAccount(null); setMessages([]); setSelected(null); setDraft(blank()); setCompose(false); setNotice(""); }
  async function open(message) {
    const generation = ++detailRequest.current; setCompose(false); setSelected(null); setError(""); setBusy(true);
    try { const detail = await readMail(message.id); if (detailRequest.current === generation) setSelected(detail); }
    catch (e) { if (detailRequest.current === generation) setError(e.message); }
    finally { if (detailRequest.current === generation) setBusy(false); }
  }
  async function submit(event) {
    event.preventDefault(); if (sendLock.current) return; sendLock.current = true; setSending(true); setError(""); setNotice("");
    try {
      if (replyId) await replyMail(replyId, draft.body); else await sendMail(draft);
      setDraft(blank()); setReplyId(null); setCompose(false); setSelected(null);
      setNotice("Microsoft accepted your message for sending. A copy is saved in Sent mail. Delivery is not yet confirmed.");
      if (folder === "sentitems") await refresh(); else setFolder("sentitems");
    } catch (e) { setError(e.message); }
    finally { sendLock.current = false; setSending(false); }
  }
  const edit = key => event => setDraft(d => ({ ...d, [key]: event.target.value }));
  const newMessage = () => { detailRequest.current++; setSelected(null); setDraft(blank()); setReplyId(null); setCompose(true); setNotice(""); };
  return <div className="mail-app">
    <style>{`
      .mail-app{min-height:100vh;background:${c.sand};color:white;font-family:${FONT};padding:24px}
      .mail-app *{box-sizing:border-box}.mail-top{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:28px}
      .mail-app button,.mail-app input,.mail-app textarea,.mail-app select{font:inherit}
      .mail-app button,.mail-outlook{border:1px solid ${c.line};background:${c.white};color:white;border-radius:10px;padding:10px 14px;cursor:pointer;display:inline-flex;gap:8px;align-items:center;text-decoration:none}
      .mail-app button:disabled{opacity:.5;cursor:default}.mail-app button.primary{background:${c.gold};color:${c.ink};font-weight:800}
      .mail-heading{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:20px;flex-wrap:wrap}.mail-heading h1{margin:0 0 8px;font-size:32px}.mail-muted{color:${c.stone};font-size:13px;line-height:1.6}
      .mail-panel{background:${c.white};border:1px solid ${c.line};border-radius:16px;padding:22px}.mail-grid{display:grid;grid-template-columns:minmax(260px,360px) minmax(0,1fr);gap:16px}.mail-tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
      .mail-app input,.mail-app textarea,.mail-app select{width:100%;border:1px solid ${c.line};border-radius:8px;padding:11px;background:${c.sand};color:white;min-width:0}.mail-app label{display:grid;gap:7px;font-size:13px;margin-bottom:14px}.mail-app textarea{min-height:230px;resize:vertical;line-height:1.6}
      .mail-list{display:grid;gap:8px;margin-top:14px}.mail-list button{display:block;text-align:left;width:100%;overflow-wrap:anywhere}.mail-list strong,.mail-list small{display:block;margin:5px 0}.mail-list small{color:${c.stone}}.mail-alert{padding:14px;border-radius:10px;margin-bottom:16px;background:#123c35}.mail-error{background:#4b242d;color:#fecaca}.mail-body{white-space:pre-wrap;overflow-wrap:anywhere;font-family:inherit;line-height:1.7;font-size:14px}.mail-detail h2{overflow-wrap:anywhere}.mail-empty{padding:45px 16px;text-align:center;color:${c.stone}}
      @media(max-width:800px){.mail-app{padding:14px}.mail-grid{grid-template-columns:1fr}.mail-top{gap:12px}.mail-panel{padding:16px}.mail-heading h1{font-size:26px}}
    `}</style>
    <header className="mail-top"><strong style={{fontSize:22}}>Tico<span style={{color:c.gold}}>Wild</span> CRM</strong><WorkspaceSwitch workspace={workspace} onWorkspace={onWorkspace}/><button style={{marginLeft:"auto"}} onClick={async () => { await disconnect(); onSignOut(); }}><LogOut size={16}/>Sign out</button></header>
    <div className="mail-heading"><div><h1>Email</h1><div className="mail-muted">{mailConfig.mailbox} · {account ? "Connected to Microsoft 365" : "Connect your business mailbox"}</div></div><div className="mail-tools"><a className="mail-outlook" href="https://outlook.cloud.microsoft/mail/?realm=ticowild.com&login_hint=info%40ticowild.com" target="_blank" rel="noreferrer"><ExternalLink size={15}/>Open Outlook</a>{account && <button onClick={disconnect}>Disconnect mailbox</button>}</div></div>
    {error && <div role="alert" className="mail-alert mail-error">{error}</div>}{notice && <div role="status" className="mail-alert">{notice}</div>}
    {!account ? <section className="mail-panel"><Mail size={32} color={c.teal}/><h2>Your mailbox, inside the CRM</h2><p className="mail-muted">Read incoming messages, see sent mail, and reply or send without leaving this workspace. Microsoft controls access to your mailbox.</p><button className="primary" disabled={busy || !mailConfigured} onClick={connect}>{busy ? "Connecting…" : "Connect info@ticowild.com"}</button>{!mailConfigured && <p className="mail-muted">Microsoft app registration is being completed. Outlook remains available above.</p>}{compose && <p className="mail-muted">Your message to {draft.to || "the selected recipients"} is ready here after you connect.</p>}</section> : <div className="mail-grid">
      <section className="mail-panel"><div className="mail-tools"><button onClick={() => setFolder("inbox")} aria-pressed={folder === "inbox"}>Inbox</button><button onClick={() => setFolder("sentitems")} aria-pressed={folder === "sentitems"}>Sent mail</button><button aria-label="Refresh email" disabled={busy} onClick={() => refresh()}><RefreshCw size={16}/></button></div><button className="primary" onClick={newMessage}><PenLine size={16}/>New message</button><label style={{marginTop:18}}>Find in loaded messages<input aria-label="Find in loaded messages" value={query} onChange={e => setQuery(e.target.value)} placeholder="Email address, name, or subject"/></label><div className="mail-muted">{messages.length} messages loaded. Load more to search older mail.</div><div className="mail-list">{matches.map(m => <button key={m.id} onClick={() => open(m)}><small>{folder === "sentitems" ? m.toRecipients?.map(r => r.emailAddress?.address).join(", ") : m.from?.emailAddress?.address}</small><strong>{m.subject || "(No subject)"}</strong><small>{new Date(m.receivedDateTime || m.sentDateTime).toLocaleString()}</small><span>{m.bodyPreview?.slice(0,100)}</span></button>)}</div>{!busy && !matches.length && <p className="mail-empty">No matching messages loaded.</p>}{busy && <p role="status">Loading…</p>}{next && <button disabled={busy} onClick={() => refresh(true)}>Load more</button>}</section>
      <section className="mail-panel mail-detail">{compose ? <form onSubmit={submit}><h2>{replyId ? "Reply" : "New message"}</h2><p className="mail-muted">From: {mailConfig.mailbox}</p><label>To<input required={!draft.bcc} disabled={Boolean(replyId) || sending} value={draft.to} onChange={edit("to")} list="crm-email-contacts"/></label><datalist id="crm-email-contacts">{contacts.map((x,i) => <option key={i} value={x.email}>{x.name || x.companyName}</option>)}</datalist>{!replyId && <><label>Bcc<input value={draft.bcc} onChange={edit("bcc")} disabled={sending}/></label><label>Use a template<select defaultValue="" disabled={sending} onChange={e => {const t=templates.find(t=>t.id===e.target.value);if(t)setDraft(d=>({...d,subject:t.subject,body:t.body}));}}><option value="">Choose a template</option>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label></>}<label>Subject<input required value={draft.subject} disabled={Boolean(replyId) || sending} onChange={edit("subject")}/></label><label>Message<textarea required value={draft.body} onChange={edit("body")} disabled={sending}/></label><div className="mail-tools"><button className="primary" disabled={sending} type="submit"><Send size={16}/>{sending ? "Sending…" : "Send email"}</button><button type="button" disabled={sending} onClick={() => setCompose(false)}>Close draft</button></div></form> : selected ? <><h2>{selected.subject || "(No subject)"}</h2><p className="mail-muted">From: {selected.from?.emailAddress?.address}<br/>To: {selected.toRecipients?.map(r=>r.emailAddress?.address).join(", ")}<br/>{new Date(selected.receivedDateTime || selected.sentDateTime).toLocaleString()}</p><div className="mail-tools">{folder === "inbox" && <button onClick={() => {setReplyId(selected.id);setDraft({to:selected.from?.emailAddress?.address || "",bcc:"",subject:`Re: ${selected.subject || ""}`,body:""});setCompose(true);}}><ArrowLeft size={16}/>Reply</button>}{selected.webLink?.startsWith("https://outlook.") && <a className="mail-outlook" href={selected.webLink} target="_blank" rel="noreferrer">Open in Outlook</a>}<button onClick={() => setQuery(selected.from?.emailAddress?.address || "")}>Find sender’s messages</button></div><pre className="mail-body">{selected.body?.content}</pre></> : <div className="mail-empty"><Mail size={32}/><h2>Select a message</h2><p>Inbox and Sent mail come directly from Microsoft 365.<br/>Delivery failures appear in your inbox.</p></div>}</section>
    </div>}
  </div>;
}
