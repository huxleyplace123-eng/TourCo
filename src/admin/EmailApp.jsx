import OutlookDraft from './OutlookDraft.jsx';
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
      .mail-app{height:100dvh;min-height:0;display:flex;flex-direction:column;padding:14px 18px;font-size:14px;overflow:hidden}
      .mail-top{gap:12px;margin-bottom:12px;flex-shrink:0}.mail-heading{gap:12px;margin-bottom:12px;flex-shrink:0}.mail-heading h1{font-size:24px;margin:0 0 3px}
      .mail-app button,.mail-outlook{padding:7px 10px;border-radius:7px;font-size:13px}.mail-app button:focus-visible,.mail-outlook:focus-visible{outline:2px solid ${c.gold};outline-offset:2px}
      .mail-heading .mail-tools{margin:0}.mail-tools{gap:6px;margin-bottom:10px}.mail-muted{font-size:12px;line-height:1.45}
      .mail-grid{flex:1;min-height:0;grid-template-columns:minmax(280px,340px) minmax(0,1fr);gap:12px;overflow:hidden}
      .mail-panel{min-width:0;border-radius:10px;padding:12px}.mail-sidebar{display:flex;flex-direction:column;min-height:0;overflow:hidden}
      .mail-sidebar>.primary{align-self:flex-start}.mail-sidebar>label{margin:12px 0 8px!important;font-size:12px;gap:5px}
      .mail-app input,.mail-app select{padding:8px 10px}.mail-app label{gap:5px;margin-bottom:10px}
      .mail-list-scroll{flex:1;min-height:0;overflow-y:auto;margin:8px -12px -12px;scrollbar-gutter:stable}
      .mail-list{display:block;margin:0}.mail-list button{border:0;border-bottom:1px solid ${c.line};border-radius:0;background:transparent;padding:10px 12px;line-height:1.35;min-width:0}
      .mail-list button:hover{background:rgba(34,211,238,.07)}.mail-list button[aria-current="true"]{background:rgba(34,211,238,.12);box-shadow:inset 3px 0 ${c.teal}}
      .mail-row-top{display:flex;align-items:baseline;gap:8px}.mail-list .mail-sender{flex:1;min-width:0;margin:0;font-size:12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .mail-date{flex-shrink:0;font-size:11px;color:${c.stone}}.mail-list strong{font-size:13px;margin:4px 0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .mail-preview{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:${c.stone};font-size:12px}.mail-list button[data-unread="true"] strong{color:${c.gold}}
      .mail-detail{overflow-y:auto;min-height:0;padding:18px 22px;scrollbar-gutter:stable}.mail-detail h2{font-size:20px;line-height:1.35;margin:0 0 10px}.mail-detail .mail-tools{padding-bottom:12px;border-bottom:1px solid ${c.line}}
      .mail-body{line-height:1.6;margin:16px 0;max-width:90ch;font-size:14px}.mail-alert{padding:10px 12px;margin-bottom:10px;flex-shrink:0}.mail-empty{padding:28px 12px}
      @media(max-width:800px){.mail-app{height:auto;min-height:100dvh;overflow:visible;padding:12px}.mail-grid{display:flex;flex-direction:column;overflow:visible;flex:none}.mail-sidebar{max-height:420px}.mail-list-scroll{min-height:100px}.mail-detail{overflow:visible;padding:16px}.mail-top{gap:8px}.mail-heading h1{font-size:22px}.mail-body{max-width:100%}}
    `}</style>
    <header className="mail-top"><strong style={{fontSize:22}}>Tico<span style={{color:c.gold}}>Wild</span> CRM</strong><WorkspaceSwitch workspace={workspace} onWorkspace={onWorkspace}/><button style={{marginLeft:"auto"}} onClick={async () => { await disconnect(); onSignOut(); }}><LogOut size={16}/>Sign out</button></header>
    <div className="mail-heading"><div><h1>Email</h1><div className="mail-muted">{mailConfig.mailbox} · {account ? "Connected to Microsoft 365" : "Connect your business mailbox"}</div></div><div className="mail-tools"><a className="mail-outlook" href="https://outlook.cloud.microsoft/mail/?realm=ticowild.com&login_hint=info%40ticowild.com" target="_blank" rel="noreferrer"><ExternalLink size={15}/>Open Outlook</a>{account && <button onClick={disconnect}>Disconnect mailbox</button>}</div></div>
    {error && <div role="alert" className="mail-alert mail-error">{error}</div>}{notice && <div role="status" className="mail-alert">{notice}</div>}
    {!account ? <section className="mail-panel"><Mail size={32} color={c.teal}/><h2>Your mailbox, inside the CRM</h2><p className="mail-muted">Read incoming messages, see sent mail, and reply or send without leaving this workspace. Microsoft controls access to your mailbox.</p><button className="primary" disabled={busy || !mailConfigured} onClick={connect}>{busy ? "Connecting…" : "Connect info@ticowild.com"}</button>{!mailConfigured && <p className="mail-muted">Microsoft app registration is being completed. Outlook remains available above.</p>}{compose && <><h3>Prepared CRM message</h3><p>To: {draft.to || "Bcc recipients"}</p><p>Subject: {draft.subject}</p><OutlookDraft draft={draft}/><pre className="mail-body">{draft.body}</pre></>}</section> : <div className="mail-grid">
      <section className="mail-panel mail-sidebar"><div className="mail-tools"><button onClick={() => setFolder("inbox")} aria-pressed={folder === "inbox"}>Inbox</button><button onClick={() => setFolder("sentitems")} aria-pressed={folder === "sentitems"}>Sent mail</button><button aria-label="Refresh email" disabled={busy} onClick={() => refresh()}><RefreshCw size={16}/></button></div><button className="primary" onClick={newMessage}><PenLine size={16}/>New message</button><label style={{marginTop:18}}>Find in loaded messages<input aria-label="Find in loaded messages" value={query} onChange={e => setQuery(e.target.value)} placeholder="Email address, name, or subject"/></label><div className="mail-muted">{matches.length} of {messages.length} loaded messages{next ? " · More available" : ""}</div><div className="mail-list-scroll"><div className="mail-list">{matches.map(m => <button key={m.id} aria-current={selected?.id === m.id ? "true" : undefined} onClick={() => open(m)}><span className="mail-row-top"><small className="mail-sender">{folder === "sentitems" ? m.toRecipients?.map(r => r.emailAddress?.address).join(", ") : m.from?.emailAddress?.name || m.from?.emailAddress?.address}</small><time className="mail-date" title={new Date(m.receivedDateTime || m.sentDateTime).toLocaleString()}>{new Date(m.receivedDateTime || m.sentDateTime).toDateString() === new Date().toDateString() ? new Date(m.receivedDateTime || m.sentDateTime).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}) : new Date(m.receivedDateTime || m.sentDateTime).toLocaleDateString([], {month:"short",day:"numeric"})}</time></span><strong>{m.subject || "(No subject)"}</strong><span className="mail-preview">{m.bodyPreview}</span></button>)}</div>{!busy && !matches.length && <p className="mail-empty">No matching messages loaded.</p>}{busy && <p role="status">Loading…</p>}{next && <button disabled={busy} onClick={() => refresh(true)}>Load more</button>}</div></section>
      <section className="mail-panel mail-detail">{compose ? <form onSubmit={submit}><h2>{replyId ? "Reply" : "New message"}</h2><p className="mail-muted">From: {mailConfig.mailbox}</p><label>To<input required={!draft.bcc} disabled={Boolean(replyId) || sending} value={draft.to} onChange={edit("to")} list="crm-email-contacts"/></label><datalist id="crm-email-contacts">{contacts.map((x,i) => <option key={i} value={x.email}>{x.name || x.companyName}</option>)}</datalist>{!replyId && <><label>Bcc<input value={draft.bcc} onChange={edit("bcc")} disabled={sending}/></label><label>Use a template<select defaultValue="" disabled={sending} onChange={e => {const t=templates.find(t=>t.id===e.target.value);if(t)setDraft(d=>({...d,subject:t.subject,body:t.body}));}}><option value="">Choose a template</option>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label></>}<label>Subject<input required value={draft.subject} disabled={Boolean(replyId) || sending} onChange={edit("subject")}/></label><label>Message<textarea required value={draft.body} onChange={edit("body")} disabled={sending}/></label><OutlookDraft draft={draft} disabled={sending}/>{replyId&&<p className="mail-muted">This opens a new message with your reply text. To preserve the original conversation, open the original message in Outlook and reply there.</p>}<details><summary>Direct CRM sending (delivery restriction unresolved)</summary><div className="mail-tools"><button disabled={sending} type="submit"><Send size={16}/>{sending ? "Sending…" : "Send email"}</button></div></details><button type="button" disabled={sending} onClick={() => setCompose(false)}>Close draft</button></form> : selected ? <><h2>{selected.subject || "(No subject)"}</h2><p className="mail-muted">From: {selected.from?.emailAddress?.address}<br/>To: {selected.toRecipients?.map(r=>r.emailAddress?.address).join(", ")}<br/>{new Date(selected.receivedDateTime || selected.sentDateTime).toLocaleString()}</p><div className="mail-tools">{folder === "inbox" && <button onClick={() => {setReplyId(selected.id);setDraft({to:selected.from?.emailAddress?.address || "",bcc:"",subject:`Re: ${selected.subject || ""}`,body:""});setCompose(true);}}><ArrowLeft size={16}/>Reply</button>}{selected.webLink?.startsWith("https://outlook.") && <a className="mail-outlook" href={selected.webLink} target="_blank" rel="noreferrer">Open in Outlook</a>}<button onClick={() => setQuery(selected.from?.emailAddress?.address || "")}>Find sender’s messages</button></div><pre className="mail-body">{selected.body?.content}</pre></> : <div className="mail-empty"><Mail size={32}/><h2>Select a message</h2><p>Inbox and Sent mail come directly from Microsoft 365.<br/>Delivery failures appear in your inbox.</p></div>}</section>
    </div>}
  </div>;
}
