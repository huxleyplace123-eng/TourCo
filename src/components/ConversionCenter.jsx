import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Check, Mail, MessageCircle, Send, X } from "lucide-react";
import { c, glass } from "../theme.js";
import { Button, Field } from "./ui.jsx";
import { deliverInquiry, inquiryMessage, whatsappHref } from "../conversion.js";

const ConversionContext = createContext(null);
const inputStyle = { width: "100%", boxSizing: "border-box", border: `1px solid ${c.line}`, borderRadius: 12, background: "rgba(255,255,255,.06)", color: c.charcoal, padding: "12px 13px", fontSize: 14.5, outline: "none", colorScheme: "dark" };

function InquiryModal({ request, onClose }) {
  const [form, setForm] = useState(() => ({
    name: "", email: "", phone: "", destination: request.destination || "",
    arrival: request.arrival || "", departure: request.departure || "",
    travelers: request.travelers || "2", notes: request.notes || "", website: "",
  }));
  const [state, setState] = useState("editing");
  const [fallbackHref, setFallbackHref] = useState("");
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const activityTitles = request.activity_titles || (request.activity ? [request.activity.title] : []);
  const payload = useMemo(() => ({
    ...form,
    intent: request.intent || "planning",
    activity_ids: request.activity_ids || (request.activity ? [request.activity.id] : []),
    activity_titles: activityTitles,
  }), [form, request, activityTitles]);
  const wa = whatsappHref(inquiryMessage(payload));

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    if (form.website) {
      setState("sent");
      return;
    }
    if (!form.name.trim() || !form.email.trim()) return;
    setState("sending");
    const result = await deliverInquiry(payload);
    if (result.delivered) setState("sent");
    else {
      setFallbackHref(result.fallbackHref);
      setState("email");
      window.location.href = result.fallbackHref;
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Request trip help" onMouseDown={onClose} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(4,12,26,.78)", backdropFilter: "blur(10px)", display: "grid", placeItems: "center", padding: 18 }}>
      <div className="inquiry-modal" onMouseDown={(event) => event.stopPropagation()} style={{ width: "min(620px,100%)", maxHeight: "min(780px,calc(100dvh - 28px))", overflowY: "auto", ...glass, background: "rgba(11,26,46,.98)", borderRadius: 24, padding: "clamp(20px,4vw,30px)", boxShadow: "0 35px 100px rgba(0,0,0,.55)" }}>
        <button type="button" aria-label="Close" onClick={onClose} style={{ float: "right", width: 42, height: 42, borderRadius: 999, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.06)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><X size={18} /></button>
        {state === "sent" ? (
          <div style={{ textAlign: "center", padding: "42px 8px 24px" }}>
            <span style={{ width: 58, height: 58, borderRadius: 999, background: "rgba(34,211,238,.14)", color: c.teal, display: "inline-grid", placeItems: "center" }}><Check size={28} /></span>
            <h2 style={{ color: "#fff", margin: "18px 0 8px", fontSize: 28 }}>Your request is in.</h2>
            <p style={{ color: c.stone, lineHeight: 1.65, maxWidth: 430, margin: "0 auto 22px" }}>TicoWild can now confirm the current availability, timing and final details with you before any payment.</p>
            {wa && <a href={wa} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}><Button variant="primary"><MessageCircle size={17} />Continue on WhatsApp</Button></a>}
          </div>
        ) : state === "email" ? (
          <div style={{ textAlign: "center", padding: "42px 8px 24px" }}>
            <span style={{ width: 58, height: 58, borderRadius: 999, background: "rgba(255,208,0,.14)", color: c.gold, display: "inline-grid", placeItems: "center" }}><Mail size={27} /></span>
            <h2 style={{ color: "#fff", margin: "18px 0 8px", fontSize: 27 }}>Finish in your email app</h2>
            <p style={{ color: c.stone, lineHeight: 1.65, maxWidth: 450, margin: "0 auto 22px" }}>The website is not connected to its inquiry inbox yet, so we opened a ready-to-send email instead of pretending your request was delivered.</p>
            <a href={fallbackHref} style={{ textDecoration: "none" }}><Button variant="primary"><Mail size={17} />Open the email again</Button></a>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ color: c.teal, fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 6 }}>Request current availability</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(25px,5vw,34px)", letterSpacing: -1, margin: "7px 58px 8px 0" }}>{activityTitles.length ? activityTitles.join(" + ") : "Let’s shape your Costa Rica days"}</h2>
            <p style={{ color: c.stone, margin: "0 0 22px", lineHeight: 1.6 }}>Send the basics. We’ll confirm what is available, the exact price and what happens next. No payment is taken here.</p>
            <div className="inquiry-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Name"><input required autoFocus maxLength={120} value={form.name} onChange={set("name")} style={inputStyle} autoComplete="name" /></Field>
              <Field label="Email"><input required type="email" maxLength={320} value={form.email} onChange={set("email")} style={inputStyle} autoComplete="email" /></Field>
              <Field label="Phone / WhatsApp (optional)"><input maxLength={50} value={form.phone} onChange={set("phone")} style={inputStyle} autoComplete="tel" /></Field>
              <Field label="Where are you staying?"><input maxLength={160} value={form.destination} onChange={set("destination")} style={inputStyle} placeholder="Manuel Antonio" /></Field>
              <Field label="Arrival"><input type="date" value={form.arrival} onChange={set("arrival")} style={inputStyle} /></Field>
              <Field label="Departure"><input type="date" min={form.arrival || undefined} value={form.departure} onChange={set("departure")} style={inputStyle} /></Field>
            </div>
            <Field label="Travelers"><select value={form.travelers} onChange={set("travelers")} style={inputStyle}>{["1","2","3","4","5–8","9+"].map((value) => <option key={value}>{value}</option>)}</select></Field>
            <div aria-hidden="true" style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label></div>
            <Field label="Anything we should know?"><textarea maxLength={5000} value={form.notes} onChange={set("notes")} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Kids, mobility needs, preferred days or the kind of experience you want" /></Field>
            <Button type="submit" variant="primary" size="lg" full disabled={state === "sending"}>{state === "sending" ? "Sending…" : <><Send size={17} />Send my request</>}</Button>
            <p style={{ textAlign: "center", color: c.stone, fontSize: 12, margin: "12px 0 0" }}>No payment. No obligation. We confirm the details first.</p>
          </form>
        )}
      </div>
      <style>{`@media(max-width:620px){.inquiry-grid{grid-template-columns:1fr!important}.inquiry-modal{border-radius:20px!important;padding:20px!important}}`}</style>
    </div>
  );
}

export function ConversionCenter({ children }) {
  const [request, setRequest] = useState(null);
  const api = useMemo(() => ({
    openInquiry: (details = {}) => setRequest({ ...details, key: Date.now() }),
    openConcierge: (details = {}) => {
      const message = inquiryMessage({ intent: details.intent || "planning", ...details });
      const href = whatsappHref(message);
      if (href) window.open(href, "_blank", "noopener,noreferrer");
      else setRequest({ ...details, key: Date.now() });
    },
  }), []);
  return <ConversionContext.Provider value={api}>{children}{request && <InquiryModal key={request.key} request={request} onClose={() => setRequest(null)} />}</ConversionContext.Provider>;
}

export function useConversion() {
  const value = useContext(ConversionContext);
  if (!value) throw new Error("useConversion must be used inside ConversionCenter");
  return value;
}
