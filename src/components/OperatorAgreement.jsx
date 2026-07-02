import React, { useRef, useState, useEffect } from "react";
import { X, PenLine, Download, Check, RotateCcw, FileText, Mail } from "lucide-react";
import { c, glass } from "../theme.js";

// TicoWild's email — where signed agreements are sent.
const TICOWILD_EMAIL = "partners@ticowild.com";

// The agreement, section by section (condensed from the PDF for on-screen review).
const SECTIONS = [
  { h: "Operator Partner, Booking Fee & Indemnity Agreement", p: "This Agreement is between TicoWild LLC (\"TicoWild\", \"Platform\") and the Operator named below. TicoWild is a travel discovery, referral, booking and concierge platform. The Operator is an independent provider of the tours, activities, transport, guide, restaurant, rental or experience services (\"Operator Services\"). TicoWild is not the operator, carrier, employer, guide or controlling party for any Operator Service." },
  { h: "1 · Booking model & the TicoWild fee", p: "Unless agreed otherwise in writing, the customer pays TicoWild a 20% reservation deposit / booking fee of the customer-facing price. The Operator delivers the service and collects the remaining 80% directly from the customer at or before the time of service. The Operator will not circumvent TicoWild or collect the 20% fee directly." },
  { h: "2 · Cancellations & refunds", p: "Non-fault (weather, unsafe conditions, closures, force majeure): if the deposit isn't fully refunded, the 20% is split equally — TicoWild keeps 10%, Operator receives 10%. Full refund: neither party is paid. Operator-fault (overbooking, staffing/equipment failure, missing permits, late arrival, unsafe conduct, nonperformance): Operator receives no deposit share and reimburses TicoWild for refunds, chargebacks, fees, credits and replacement costs." },
  { h: "3 · Legal, permits, insurance & safety", p: "Operator warrants it is legally formed and holds all licenses, permits, registrations and insurance required to provide Operator Services, and complies with all applicable Costa Rica and local laws. Operator maintains appropriate liability insurance (recommended min. USD $1,000,000 per occurrence / $2,000,000 aggregate, higher for high-risk activities) and, where available, names TicoWild as additional insured. Operator is solely responsible for safety, equipment, qualified staff, briefings, gear, capacity limits, conditions monitoring and signed customer waivers." },
  { h: "4 · Indemnity & limitation of liability", p: "To the fullest extent permitted by law, Operator defends, indemnifies and holds TicoWild harmless from claims arising out of the Operator Services, including injury, death, property damage, transport/vessel/equipment, staff conduct, unsafe conditions, cancellations, inaccurate listings, legal/tax/permit failures, data misuse and breach of this Agreement. TicoWild's total liability to Operator is capped at the lesser of fees retained in the prior 3 months or USD $1,000." },
  { h: "5 · No circumvention & price parity", p: "For any customer introduced through TicoWild, the Operator will not bypass the Platform, solicit direct bookings to avoid fees, or undercut the TicoWild price — during the term and for 24 months after the customer's last interaction. Violations carry liquidated damages as stated in the full agreement." },
  { h: "6 · Term, media, data & general", p: "Either party may terminate for convenience on 15–30 days' notice; TicoWild may suspend immediately for insurance/permit lapses, safety or reputational risk. Operator grants TicoWild a license to use its listing materials for marketing. Customer data is used only to fulfill bookings. Disputes: good-faith talks, then binding arbitration. This on-screen summary reflects the full TicoWild LLC Operator Partner Agreement, which governs; a complete copy is available on request." },
];

// A field the operator fills in.
const FIELDS = [
  { key: "legalName", label: "Operator legal name", ph: "e.g. Pura Vida Adventures S.A." },
  { key: "signerName", label: "Your name (signer)", ph: "First & last name" },
  { key: "title", label: "Title", ph: "Owner / Manager" },
  { key: "email", label: "Email", ph: "you@company.com", type: "email" },
  { key: "phone", label: "Phone / WhatsApp", ph: "+506 …" },
  { key: "category", label: "Service category", ph: "Tour / Fishing / ATV / Zipline / Restaurant…" },
  { key: "location", label: "Location / service area", ph: "e.g. Manuel Antonio" },
];

// ── Draw-to-sign canvas ── finger or mouse. Returns a data-URL on change.
function SignaturePad({ onChange }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    canvas.width = w * ratio; canvas.height = h * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#0B1A2E";
  }, []);

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; const ctx = ref.current.getContext("2d"); const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const move = (e) => { if (!drawing.current) return; e.preventDefault(); const ctx = ref.current.getContext("2d"); const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); setHasInk(true); };
  const end = () => { if (!drawing.current) return; drawing.current = false; onChange(hasInk ? ref.current.toDataURL("image/png") : ""); };
  const clear = () => { const ctx = ref.current.getContext("2d"); ctx.clearRect(0, 0, ref.current.width, ref.current.height); setHasInk(false); onChange(""); };

  return (
    <div>
      <div style={{ position: "relative", background: "#fff", borderRadius: 12, border: `1.5px solid ${c.line}`, overflow: "hidden" }}>
        <canvas ref={ref} style={{ width: "100%", height: 120, display: "block", touchAction: "none", cursor: "crosshair" }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
        {!hasInk && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#9db3d6", fontSize: 13, pointerEvents: "none" }}>✍️ Sign here with your finger or mouse</span>}
      </div>
      <button onClick={clear} style={{ marginTop: 7, display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", color: c.stone, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}><RotateCcw size={13} />Clear signature</button>
    </div>
  );
}

export function OperatorAgreement({ onClose }) {
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f.key, ""])));
  const [sig, setSig] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const missing = FIELDS.some((f) => !form[f.key].trim()) || !sig || !agreed;
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  // Build the completed agreement as a downloadable HTML file (opens/prints as a
  // clean signed document — no backend needed).
  const buildDoc = () => {
    const rows = FIELDS.map((f) => `<tr><td style="padding:6px 12px;color:#5b6b82">${f.label}</td><td style="padding:6px 12px;font-weight:700">${escapeHtml(form[f.key])}</td></tr>`).join("");
    const secs = SECTIONS.map((s) => `<h3 style="margin:18px 0 4px;color:#0B1A2E">${s.h}</h3><p style="margin:0;color:#333;line-height:1.55;font-size:13px">${s.p}</p>`).join("");
    return `<!doctype html><html><head><meta charset="utf-8"><title>TicoWild Operator Agreement — ${escapeHtml(form.legalName)}</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;max-width:760px;margin:24px auto;padding:0 20px;color:#0B1A2E">
<h1 style="color:#0B1A2E">TicoWild LLC — Operator Partner Agreement</h1>
<p style="color:#5b6b82">Signed electronically on ${today}.</p>
<table style="border-collapse:collapse;background:#f6f8fb;border-radius:8px;margin:12px 0">${rows}</table>
${secs}
<h3 style="margin:22px 0 6px">Signature</h3>
<img src="${sig}" alt="signature" style="height:90px;border-bottom:1px solid #0B1A2E"/>
<p style="margin:6px 0 0"><b>${escapeHtml(form.signerName)}</b> — ${escapeHtml(form.title)}, ${escapeHtml(form.legalName)}<br/>${escapeHtml(form.email)} · ${escapeHtml(form.phone)}<br/>Date: ${today}</p>
<p style="margin:18px 0 0;font-size:11px;color:#8a99b3">By signing, the Operator agrees to the TicoWild LLC Operator Partner, Booking Fee and Indemnity Agreement, which governs in full.</p>
</body></html>`;
  };

  const download = () => {
    const blob = new Blob([buildDoc()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `TicoWild-Agreement-${(form.legalName || "operator").replace(/[^a-z0-9]+/gi, "-")}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  const submit = () => {
    download(); // give them the signed copy
    // open a pre-filled email to TicoWild with the details
    const body = `New signed Operator Partner Agreement:%0D%0A%0D%0A` +
      FIELDS.map((f) => `${f.label}: ${form[f.key]}`).join("%0D%0A") +
      `%0D%0ASigned: ${today}%0D%0A%0D%0A(The signed agreement file has been downloaded — please attach it to this email before sending.)`;
    window.location.href = `mailto:${TICOWILD_EMAIL}?subject=${encodeURIComponent("Signed Operator Agreement — " + (form.legalName || ""))}&body=${body}`;
    setDone(true);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(5,12,26,.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "24px 14px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...glass, background: "rgba(10,20,40,.97)", borderRadius: 22, width: "min(680px,100%)", boxShadow: "0 40px 100px -40px rgba(0,0,0,.95)", overflow: "hidden" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: `1px solid ${c.line}`, background: "linear-gradient(135deg, rgba(34,211,238,.1), transparent)" }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(34,211,238,.14)", border: "1px solid rgba(34,211,238,.3)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><FileText size={19} color={c.teal} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Become a TicoWild operator</div>
            <div style={{ color: c.stone, fontSize: 12 }}>Review, fill in, sign & send — all online.</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: c.stone, cursor: "pointer" }}><X size={19} /></button>
        </div>

        {done ? (
          <div style={{ padding: "40px 26px", textAlign: "center" }}>
            <span style={{ width: 64, height: 64, borderRadius: 999, background: "rgba(55,227,107,.14)", border: "1px solid rgba(55,227,107,.4)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Check size={32} color="#37E36B" /></span>
            <h3 style={{ color: "#fff", fontSize: 21, fontWeight: 800, margin: "0 0 8px" }}>Signed — ¡pura vida!</h3>
            <p style={{ color: c.stone, fontSize: 14.5, lineHeight: 1.55, maxWidth: 420, margin: "0 auto 18px" }}>
              Your signed agreement downloaded, and an email to <b style={{ color: "#fff" }}>{TICOWILD_EMAIL}</b> opened — just attach the file and hit send. We'll review your documents and get your listing live.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={download} style={btnGhost}><Download size={15} />Download again</button>
              <button onClick={onClose} style={btnPrimary}>Done</button>
            </div>
          </div>
        ) : (
          <div style={{ maxHeight: "calc(100vh - 180px)", overflowY: "auto", padding: "18px" }}>
            {/* agreement text */}
            <div style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${c.line}`, borderRadius: 14, padding: "16px 18px", maxHeight: 240, overflowY: "auto", marginBottom: 20 }}>
              {SECTIONS.map((s) => (
                <div key={s.h} style={{ marginBottom: 12 }}>
                  <h4 style={{ color: c.teal, fontSize: 13.5, fontWeight: 800, margin: "0 0 4px" }}>{s.h}</h4>
                  <p style={{ color: "rgba(243,247,255,.82)", fontSize: 12.5, lineHeight: 1.55, margin: 0 }}>{s.p}</p>
                </div>
              ))}
            </div>

            {/* fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }} className="oa-fields">
              {FIELDS.map((f) => (
                <label key={f.key} style={{ display: "block" }}>
                  <span style={{ display: "block", color: c.stone, fontSize: 12, fontWeight: 700, marginBottom: 5 }}>{f.label}</span>
                  <input type={f.type || "text"} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.ph}
                    style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 13.5, outline: "none" }} />
                </label>
              ))}
            </div>

            {/* signature */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.stone, fontSize: 12, fontWeight: 700, marginBottom: 7 }}><PenLine size={14} color={c.teal} />Signature</span>
              <SignaturePad onChange={setSig} />
            </div>

            {/* agree */}
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginBottom: 18 }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3, width: 17, height: 17, accentColor: c.teal, flexShrink: 0 }} />
              <span style={{ color: "rgba(243,247,255,.85)", fontSize: 12.5, lineHeight: 1.5 }}>I have read and agree to the TicoWild LLC Operator Partner Agreement above, and I'm authorized to sign on behalf of the Operator.</span>
            </label>

            <button onClick={submit} disabled={missing} style={{ ...btnPrimary, width: "100%", opacity: missing ? 0.5 : 1, cursor: missing ? "not-allowed" : "pointer", justifyContent: "center" }}>
              <Mail size={16} />Sign & send to TicoWild
            </button>
            {missing && <p style={{ color: c.stone, fontSize: 11.5, textAlign: "center", margin: "8px 0 0" }}>Fill every field, sign, and check the box to continue.</p>}
          </div>
        )}
      </div>
      <style>{`@media(max-width:560px){.oa-fields{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

const btnPrimary = { display: "inline-flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg,${c.teal},${c.emerald})`, color: c.ink, border: "none", borderRadius: 12, padding: "12px 18px", fontWeight: 800, fontSize: 14, cursor: "pointer" };
const btnGhost = { display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.06)", color: "#fff", border: `1px solid ${c.line}`, borderRadius: 12, padding: "12px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer" };

function escapeHtml(s) { return String(s || "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch])); }
