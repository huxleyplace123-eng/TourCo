import { useMemo, useState } from "react";
import { Check, Copy, FilePlus2, Mail, Pencil, Search, Send, Sparkles, Trash2, Users, X } from "lucide-react";
import { c, FONT, radius, shadow } from "../theme.js";
import WorkspaceSwitch from "./WorkspaceSwitch.jsx";
import { EMAIL_TEMPLATES, loadCustomTemplates, saveCustomTemplates, templateVariables } from "./email-templates.js";

const blankTemplate = (audience = "operator") => ({ id: "", audience, category: "Custom", name: "", useWhen: "", subject: "", body: "", custom: true });

const copyText = async (value) => {
  try { await navigator.clipboard.writeText(value); return true; }
  catch {
    const node = document.createElement("textarea"); node.value = value;
    node.style.position = "fixed"; node.style.opacity = "0"; document.body.appendChild(node); node.select();
    const ok = document.execCommand("copy"); node.remove(); return ok;
  }
};

function TemplateEditor({ initial, onClose, onSave }) {
  const [draft, setDraft] = useState(initial);
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));
  const valid = draft.name.trim() && draft.subject.trim() && draft.body.trim();
  const field = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: radius.sm, color: c.charcoal, fontFamily: FONT, fontSize: 14, padding: "10px 12px", outline: "none" };
  const label = { display: "grid", gap: 6, color: c.stone, fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" };
  return (
    <div className="tpl-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tpl-editor">
        <div className="tpl-editor-head"><div><div className="tpl-eyebrow">Custom template</div><h2>{initial.id ? "Edit template" : "Create template"}</h2></div><button className="tpl-icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className="tpl-editor-grid">
          <label style={label}>Audience<select value={draft.audience} onChange={set("audience")} style={field}><option value="operator">Operators</option><option value="customer">Customers</option></select></label>
          <label style={label}>Category<input value={draft.category} onChange={set("category")} style={field} placeholder="Follow-up" /></label>
          <label className="tpl-editor-wide" style={label}>Template name<input value={draft.name} onChange={set("name")} style={field} placeholder="A clear internal name" /></label>
          <label className="tpl-editor-wide" style={label}>Use when<input value={draft.useWhen} onChange={set("useWhen")} style={field} placeholder="Describe the moment this template is for" /></label>
          <label className="tpl-editor-wide" style={label}>Subject<input value={draft.subject} onChange={set("subject")} style={field} placeholder="Email subject" /></label>
          <label className="tpl-editor-wide" style={label}>Message<textarea value={draft.body} onChange={set("body")} rows={13} style={{ ...field, resize: "vertical", minHeight: 260, lineHeight: 1.55 }} placeholder="Write the reusable message. Use variables such as {{first_name}}." /></label>
        </div>
        <div className="tpl-editor-foot"><span>Tip: use double braces for details to replace, such as {"{{travel_date}}"}.</span><div><button className="tpl-btn ghost" onClick={onClose}>Cancel</button><button className="tpl-btn primary" disabled={!valid} onClick={() => valid && onSave(draft)}><Check size={15} /> Save template</button></div></div>
      </div>
    </div>
  );
}

function Preview({ template, onClose, onDuplicate, onEdit, onDelete }) {
  const [copied, setCopied] = useState("");
  const vars = templateVariables(template);
  const copy = async (kind, value) => { if (await copyText(value)) { setCopied(kind); window.setTimeout(() => setCopied(""), 1600); } };
  return (
    <div className="tpl-preview-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="tpl-preview">
        <div className="tpl-preview-head"><div><span className={`tpl-audience ${template.audience}`}>{template.audience}</span><h2>{template.name}</h2><p>{template.useWhen}</p></div><button className="tpl-icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className="tpl-preview-body">
          <div className="tpl-label">Subject</div><div className="tpl-subject"><span>{template.subject}</span><button className="tpl-icon-btn" onClick={() => copy("subject", template.subject)} title="Copy subject">{copied === "subject" ? <Check size={17} /> : <Copy size={17} />}</button></div>
          <div className="tpl-label">Message</div><div className="tpl-message">{template.body}</div>
          {vars.length > 0 && <><div className="tpl-label">Replace before sending</div><div className="tpl-vars">{vars.map((v) => <span key={v}>{v}</span>)}</div></>}
        </div>
        <div className="tpl-preview-actions">
          {template.custom && <button className="tpl-btn danger" onClick={onDelete}><Trash2 size={15} /> Delete</button>}
          <button className="tpl-btn ghost" onClick={template.custom ? onEdit : onDuplicate}>{template.custom ? <Pencil size={15} /> : <FilePlus2 size={15} />}{template.custom ? "Edit" : "Duplicate and edit"}</button>
          <button className="tpl-btn primary" onClick={() => copy("all", `Subject: ${template.subject}\n\n${template.body}`)}>{copied === "all" ? <Check size={15} /> : <Copy size={15} />}{copied === "all" ? "Copied" : "Copy email"}</button>
        </div>
      </aside>
    </div>
  );
}

export default function TemplatesApp({ workspace, onWorkspace, onSignOut }) {
  const [audience, setAudience] = useState("operator");
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState(() => loadCustomTemplates());
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const templates = useMemo(() => [...EMAIL_TEMPLATES, ...custom], [custom]);
  const visible = useMemo(() => templates.filter((t) => t.audience === audience && [t.name, t.category, t.useWhen, t.subject, t.body].join(" ").toLowerCase().includes(query.trim().toLowerCase())), [templates, audience, query]);
  const categories = useMemo(() => [...new Set(visible.map((t) => t.category))], [visible]);
  const persist = (next) => { setCustom(next); saveCustomTemplates(next); };
  const save = (draft) => {
    const entry = { ...draft, id: draft.id || `custom-${Date.now()}`, custom: true };
    persist(custom.some((t) => t.id === entry.id) ? custom.map((t) => t.id === entry.id ? entry : t) : [...custom, entry]);
    setEditing(null); setAudience(entry.audience); setSelected(entry);
  };
  const remove = (template) => { if (!window.confirm(`Delete ${template.name}? This can't be undone.`)) return; persist(custom.filter((t) => t.id !== template.id)); setSelected(null); };

  return (
    <div className="tpl-app">
      <style>{`
        *{box-sizing:border-box}.tpl-app{min-height:100vh;background:${c.sand};color:${c.charcoal};font-family:${FONT};padding:18px 22px 48px;background-image:radial-gradient(circle at 88% 8%,rgba(34,211,238,.13),transparent 32%),radial-gradient(circle at 8% 82%,rgba(255,208,0,.07),transparent 30%)}
        .tpl-topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;max-width:1480px;margin:0 auto}.tpl-logo{font-size:22px;font-weight:850;letter-spacing:-.5px}.tpl-logo b{color:${c.gold}}.tpl-logo span{color:${c.stone};font-size:15px;margin-left:8px}.tpl-signout,.tpl-icon-btn{all:unset;box-sizing:border-box;cursor:pointer;color:${c.stone}}.tpl-signout{margin-left:auto;padding:9px 13px;border:1px solid ${c.line};border-radius:${radius.sm}px;font-size:13px;font-weight:700}.tpl-icon-btn{display:grid;place-items:center;width:36px;height:36px;border-radius:10px}.tpl-icon-btn:hover{background:rgba(255,255,255,.07);color:${c.charcoal}}
        .tpl-hero{max-width:1480px;margin:28px auto 20px;padding:30px;border:1px solid ${c.line};border-radius:${radius.xl}px;background:linear-gradient(120deg,rgba(34,211,238,.10),rgba(19,41,74,.92) 46%,rgba(255,208,0,.07));box-shadow:${shadow.lg};display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end;overflow:hidden;position:relative}.tpl-hero:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;right:-70px;top:-130px;border:42px solid rgba(255,208,0,.08)}.tpl-eyebrow{color:${c.teal};font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.tpl-hero h1,.tpl-editor h2,.tpl-preview h2{margin:8px 0 0;letter-spacing:-.045em}.tpl-hero h1{font-size:clamp(30px,4vw,52px);max-width:760px}.tpl-hero p{color:${c.stone};line-height:1.65;max-width:720px;margin:12px 0 0;font-size:14.5px}.tpl-hero-actions{display:flex;gap:9px;position:relative;z-index:1}
        .tpl-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border-radius:${radius.sm}px;border:1px solid ${c.line};font:700 13px ${FONT};cursor:pointer}.tpl-btn.primary{background:${c.gold};border-color:${c.gold};color:${c.ink};box-shadow:${shadow.glowGold}}.tpl-btn.ghost{background:rgba(255,255,255,.05);color:${c.charcoal}}.tpl-btn.danger{background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.28);color:#FCA5A5}.tpl-btn:disabled{opacity:.42;cursor:not-allowed;box-shadow:none}
        .tpl-toolbar{max-width:1480px;margin:0 auto 18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}.tpl-segments{display:flex;gap:3px;padding:4px;border:1px solid ${c.line};border-radius:${radius.pill}px;background:rgba(255,255,255,.045)}.tpl-segments button{border:0;border-radius:${radius.pill}px;background:transparent;color:${c.stone};padding:8px 14px;font:750 13px ${FONT};cursor:pointer;display:flex;align-items:center;gap:7px}.tpl-segments button.on{background:${c.teal};color:${c.ink}}.tpl-search{position:relative;flex:1;min-width:240px;max-width:520px}.tpl-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:${c.stone}}.tpl-search input{width:100%;background:rgba(255,255,255,.055);border:1px solid ${c.line};border-radius:${radius.sm}px;color:${c.charcoal};padding:10px 12px 10px 38px;font:14px ${FONT};outline:none}.tpl-count{margin-left:auto;color:${c.stone};font-size:12.5px}.tpl-count b{color:${c.teal}}
        .tpl-content{max-width:1480px;margin:auto;display:grid;gap:24px}.tpl-section h2{margin:0 0 10px;font-size:13px;color:${c.stone};text-transform:uppercase;letter-spacing:.08em}.tpl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.tpl-card{position:relative;border:1px solid ${c.line};border-radius:${radius.lg}px;background:linear-gradient(150deg,rgba(255,255,255,.055),rgba(19,41,74,.86));padding:18px;text-align:left;color:${c.charcoal};font-family:${FONT};cursor:pointer;min-height:218px;display:flex;flex-direction:column;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;overflow:hidden}.tpl-card:hover{transform:translateY(-2px);border-color:rgba(34,211,238,.38);box-shadow:${shadow.glow}}.tpl-card:after{content:"";position:absolute;width:90px;height:90px;border-radius:50%;right:-42px;bottom:-42px;background:rgba(34,211,238,.07)}.tpl-card-top{display:flex;justify-content:space-between;gap:12px}.tpl-audience{display:inline-flex;align-items:center;padding:4px 9px;border-radius:999px;font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.08em}.tpl-audience.operator{color:${c.gold};background:rgba(255,208,0,.11);border:1px solid rgba(255,208,0,.25)}.tpl-audience.customer{color:${c.teal};background:rgba(34,211,238,.11);border:1px solid rgba(34,211,238,.25)}.tpl-custom{color:${c.stone};font-size:10.5px;font-weight:750}.tpl-card h3{font-size:18px;margin:15px 0 7px;letter-spacing:-.025em}.tpl-card p{margin:0;color:${c.stone};font-size:12.5px;line-height:1.55}.tpl-card-subject{margin-top:auto;padding-top:15px;border-top:1px solid ${c.line};display:flex;align-items:flex-start;gap:8px;color:${c.charcoal};font-size:12.5px;line-height:1.4;min-width:0}.tpl-card-subject span{min-width:0;overflow-wrap:anywhere}.tpl-card-subject svg{color:${c.teal};flex:0 0 auto;margin-top:1px}
        .tpl-preview-bg,.tpl-modal-bg{position:fixed;inset:0;z-index:80;background:rgba(3,9,18,.7);backdrop-filter:blur(5px);display:flex;justify-content:flex-end}.tpl-preview{width:min(650px,100vw);height:100%;background:${c.canvas2};border-left:1px solid ${c.line};box-shadow:${shadow.xl};display:flex;flex-direction:column;animation:tplIn .18s ease}@keyframes tplIn{from{transform:translateX(28px);opacity:.5}to{transform:none;opacity:1}}.tpl-preview-head{display:flex;gap:20px;padding:24px;border-bottom:1px solid ${c.line}}.tpl-preview-head>div{flex:1}.tpl-preview-head h2{font-size:27px}.tpl-preview-head p{color:${c.stone};line-height:1.55;margin:8px 0 0;font-size:13px}.tpl-preview-body{padding:24px;overflow-y:auto;display:grid;gap:10px}.tpl-label{font-size:10.5px;font-weight:850;text-transform:uppercase;letter-spacing:.09em;color:${c.stone};margin-top:7px}.tpl-subject{display:flex;align-items:center;gap:12px;padding:13px 14px;background:rgba(255,255,255,.05);border:1px solid ${c.line};border-radius:${radius.sm}px;font-weight:750}.tpl-subject span{flex:1}.tpl-message{white-space:pre-wrap;padding:20px;border:1px solid ${c.line};border-radius:${radius.md}px;background:rgba(255,255,255,.035);line-height:1.68;font-size:13.5px;color:#E8F1FF}.tpl-vars{display:flex;flex-wrap:wrap;gap:7px}.tpl-vars span{padding:5px 9px;border-radius:999px;border:1px solid rgba(34,211,238,.25);background:rgba(34,211,238,.08);color:${c.teal};font:650 11px ${FONT}}.tpl-preview-actions{display:flex;gap:8px;justify-content:flex-end;padding:16px 20px;border-top:1px solid ${c.line};margin-top:auto;flex-wrap:wrap}
        .tpl-modal-bg{justify-content:center;align-items:flex-start;overflow-y:auto;padding:4vh 12px}.tpl-editor{width:min(760px,100%);background:${c.canvas2};border:1px solid ${c.line};border-radius:${radius.lg}px;box-shadow:${shadow.xl};overflow:hidden}.tpl-editor-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:20px 22px;border-bottom:1px solid ${c.line}}.tpl-editor-head h2{font-size:24px}.tpl-editor-grid{padding:20px 22px;display:grid;grid-template-columns:1fr 1fr;gap:14px}.tpl-editor-wide{grid-column:1/-1}.tpl-editor-foot{padding:14px 22px;border-top:1px solid ${c.line};display:flex;justify-content:space-between;align-items:center;gap:14px;color:${c.stone};font-size:11.5px}.tpl-editor-foot>div{display:flex;gap:8px}.tpl-empty{padding:50px 24px;text-align:center;border:1px dashed ${c.line};border-radius:${radius.lg}px;color:${c.stone}}
        @media(max-width:980px){.tpl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tpl-hero{grid-template-columns:1fr}.tpl-hero-actions{justify-content:flex-start}}@media(max-width:640px){html,body,#root{max-width:100%;overflow-x:hidden}.tpl-app{width:100%;max-width:100%;overflow-x:hidden;padding:12px 12px 36px}.tpl-topbar{min-width:0}.tpl-topbar .crm-workspace-switch{order:3}.tpl-signout{margin-left:auto}.tpl-hero{margin-top:16px;padding:22px 18px;border-radius:${radius.lg}px}.tpl-hero h1{font-size:32px}.tpl-hero-actions{width:100%}.tpl-hero-actions .tpl-btn{width:100%}.tpl-toolbar{align-items:stretch;min-width:0}.tpl-segments{width:100%;min-width:0}.tpl-segments button{flex:1;justify-content:center}.tpl-search{max-width:none;width:100%;min-width:0}.tpl-count{margin-left:0}.tpl-grid{grid-template-columns:minmax(0,1fr)}.tpl-card{min-width:0;min-height:200px}.tpl-preview-actions .tpl-btn{flex:1}.tpl-editor-grid{grid-template-columns:1fr}.tpl-editor-wide{grid-column:1}.tpl-editor-foot{align-items:stretch;flex-direction:column}.tpl-editor-foot>div{display:grid;grid-template-columns:1fr 1fr}.tpl-message{padding:15px}.tpl-preview-head,.tpl-preview-body{padding:18px}}
      `}</style>
      <div className="tpl-topbar"><div className="tpl-logo">Tico<b>Wild</b><span>CRM</span></div><WorkspaceSwitch workspace={workspace} onWorkspace={onWorkspace} /><button className="tpl-signout" onClick={onSignOut}>Sign out</button></div>
      <section className="tpl-hero"><div><div className="tpl-eyebrow"><Sparkles size={13} style={{ verticalAlign: -2, marginRight: 6 }} />Communications studio</div><h1>Send the right message at the right moment.</h1><p>A practical library for partner outreach and traveler care. Every template explains when to use it, what must be personalized, and what should be confirmed before it is sent.</p></div><div className="tpl-hero-actions"><button className="tpl-btn primary" onClick={() => setEditing(blankTemplate(audience))}><FilePlus2 size={16} /> Create template</button></div></section>
      <div className="tpl-toolbar"><div className="tpl-segments"><button className={audience === "operator" ? "on" : ""} onClick={() => setAudience("operator")}><Send size={14} /> Operators</button><button className={audience === "customer" ? "on" : ""} onClick={() => setAudience("customer")}><Users size={14} /> Customers</button></div><div className="tpl-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${audience} templates…`} /></div><div className="tpl-count"><b>{visible.length}</b> templates</div></div>
      <main className="tpl-content">{categories.map((category) => <section className="tpl-section" key={category}><h2>{category}</h2><div className="tpl-grid">{visible.filter((t) => t.category === category).map((template) => <button className="tpl-card" key={template.id} onClick={() => setSelected(template)}><div className="tpl-card-top"><span className={`tpl-audience ${template.audience}`}>{template.audience}</span>{template.custom && <span className="tpl-custom">Custom</span>}</div><h3>{template.name}</h3><p>{template.useWhen}</p><div className="tpl-card-subject"><Mail size={14} /><span>{template.subject}</span></div></button>)}</div></section>)}{!visible.length && <div className="tpl-empty">No templates match this search.</div>}</main>
      {selected && <Preview template={selected} onClose={() => setSelected(null)} onDuplicate={() => setEditing({ ...selected, id: "", name: `${selected.name} copy`, custom: true })} onEdit={() => setEditing(selected)} onDelete={() => remove(selected)} />}
      {editing && <TemplateEditor initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}
