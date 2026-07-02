import React, { useState } from "react";
import { ArrowRight, ShieldCheck, MessageCircle, Sparkles, Map, Compass, Calendar, Users, Heart, ChevronDown, Star } from "lucide-react";
import { c, grad } from "../theme.js";
import { activities } from "../data.js";
import { heroImage } from "../images.js";
import { Button, Section, SectionHead, Eyebrow, Field } from "../components/ui.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";
import { Reveal } from "../motion.jsx";

const TRUST = [
  { icon: ShieldCheck, label: "Vetted operators" },
  { icon: MessageCircle, label: "WhatsApp concierge" },
  { icon: Sparkles, label: "20% deposit" },
  { icon: Map, label: "Local's Guide" },
];

function TrustBar({ light }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {TRUST.map((t) => (
        <div key={t.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: light ? "rgba(255,255,255,.13)" : "#fff", border: light ? "1px solid rgba(255,255,255,.26)" : "1px solid rgba(0,0,0,.06)", color: light ? "#fff" : c.emerald, padding: "9px 15px", borderRadius: 999, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap" }}>
          <t.icon size={16} />{t.label}
        </div>
      ))}
    </div>
  );
}

function planInput(base) {
  return { ...base };
}

export function Home({ go, addToTrip, trip, viewActivity }) {
  const [plan, setPlan] = useState({ dest: "Manuel Antonio", dates: "", group: "2", type: "Couple / Honeymoon" });
  const featured = activities.slice(0, 8);

  const selectStyle = { width: "100%", border: "1.5px solid rgba(0,0,0,.12)", borderRadius: 12, padding: "11px 12px 11px 38px", fontSize: 14.5, color: c.charcoal, background: "#fff", outline: "none", appearance: "none", paddingRight: 34, cursor: "pointer" };
  const wrap = (icon, node) => (
    <div style={{ position: "relative" }}>
      {React.createElement(icon, { size: 16, color: c.stone, style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" } })}
      {node}
      <ChevronDown size={16} color={c.stone} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );

  return (
    <>
      {/* ── HERO ── */}
      <style>{`
        @keyframes tnFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } }
        @keyframes tnKen { 0%{ transform: scale(1.08) translate(0,0) } 100%{ transform: scale(1.18) translate(-2%, -2%) } }
      `}</style>
      <div style={{ position: "relative", background: grad.hero, overflow: "hidden" }}>
        {/* Cinematic photo layer — real Costa Rica scene, slow Ken-Burns drift, gradient stays as the tint. */}
        <img src={heroImage()} alt="" aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.42, animation: "tnKen 24s ease-in-out infinite alternate" }} />
        <div style={{ position: "absolute", inset: 0, background: grad.hero, opacity: 0.72 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 12% 20%, rgba(34,211,238,.5), transparent 45%), radial-gradient(circle at 88% 80%, rgba(255,208,0,.32), transparent 45%)" }} />
        <div className="hero-grid" style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "84px 20px 90px", display: "grid", gridTemplateColumns: "1fr", gap: 48 }}>
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.16)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "5px 11px", borderRadius: 999 }}>
              <Sparkles size={13} /> Your local adventure concierge
            </span>
            <h1 style={{ color: "#fff", fontSize: "clamp(36px,6vw,62px)", lineHeight: 1.02, fontWeight: 800, letterSpacing: -1.5, margin: "18px 0 0" }}>
              Costa Rica adventures,<br /><span style={{ color: c.gold }}>planned by locals.</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,.9)", fontSize: 19, lineHeight: 1.6, maxWidth: 540, marginTop: 18 }}>
              Build a custom itinerary with vetted local tours, transparent pricing, and real human support — without the guesswork.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Build my adventure plan <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => go("activities")}>Browse activities</Button>
            </div>
            <div style={{ marginTop: 30 }}><TrustBar light /></div>
          </div>

          {/* Plan card */}
          <div style={{ background: "rgba(255,253,248,.97)", borderRadius: 26, padding: 24, boxShadow: "0 40px 80px -30px rgba(0,0,0,.55)", backdropFilter: "blur(8px)", alignSelf: "start", animation: "tnFloat 7s ease-in-out infinite" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Compass size={20} color={c.teal} />
              <span style={{ fontWeight: 800, color: c.charcoal, fontSize: 18 }}>Start your trip plan</span>
            </div>
            <p style={{ color: c.stone, fontSize: 13.5, margin: "0 0 16px" }}>Tell us the basics — your concierge takes it from there.</p>
            <Field label="Destination">
              {wrap(Compass, <select value={plan.dest} onChange={(e) => setPlan({ ...plan, dest: e.target.value })} style={selectStyle}>
                {["Manuel Antonio", "Quepos", "Uvita", "Dominical", "Jacó", "Tamarindo", "Guanacaste", "Not sure yet"].map((o) => <option key={o}>{o}</option>)}
              </select>)}
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Travel dates">
                <div style={{ position: "relative" }}>
                  <Calendar size={16} color={c.stone} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input placeholder="e.g. Jul 12–19" value={plan.dates} onChange={(e) => setPlan({ ...plan, dates: e.target.value })} style={{ width: "100%", border: "1.5px solid rgba(0,0,0,.12)", borderRadius: 12, padding: "11px 12px 11px 38px", fontSize: 14.5, color: c.charcoal, outline: "none" }} />
                </div>
              </Field>
              <Field label="Group size">
                {wrap(Users, <select value={plan.group} onChange={(e) => setPlan({ ...plan, group: e.target.value })} style={selectStyle}>
                  {["1", "2", "3–4", "5–8", "9+"].map((o) => <option key={o}>{o}</option>)}
                </select>)}
              </Field>
            </div>
            <Field label="Trip type">
              {wrap(Heart, <select value={plan.type} onChange={(e) => setPlan({ ...plan, type: e.target.value })} style={selectStyle}>
                {["Family", "Couple / Honeymoon", "Adult group weekend", "Fishing trip", "Adventure", "Luxury group"].map((o) => <option key={o}>{o}</option>)}
              </select>)}
            </Field>
            <Button variant="dark" full size="lg" onClick={() => go("build")} style={{ marginTop: 8 }}>Start planning <ArrowRight size={18} /></Button>
            <p style={{ textAlign: "center", color: c.stone, fontSize: 12, marginTop: 12 }}>Free to plan · Only 20% to reserve · No spam</p>
          </div>
        </div>
      </div>

      {/* ── Featured activities ── */}
      <Section bg={c.sand}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 30 }}>
          <SectionHead eyebrow="Popular right now" title="Hand-picked experiences" />
          <Button variant="ghost" onClick={() => go("activities")}>View all activities <ArrowRight size={16} /></Button>
        </div>
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
          {featured.map((a, i) => (
            <Reveal key={a.id} delay={(i % 4) * 80}>
              <ActivityCard a={a} onAdd={addToTrip} onView={viewActivity} inTrip={trip.some((t) => t.id === a.id)} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Closing CTA ── */}
      <Section bg={c.white} pad={70}>
        <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", background: grad.hero, padding: "60px 28px", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 20%, rgba(255,208,0,.35), transparent 50%)" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 800, letterSpacing: -1, margin: 0 }}>Let's build your Costa Rica adventure</h2>
            <p style={{ color: "rgba(255,255,255,.9)", fontSize: 18, marginTop: 14, maxWidth: 540, marginInline: "auto" }}>
              Tell us your dates and group — your concierge sends back a ready-to-book plan.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Build my adventure plan <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => window.alert("Opening WhatsApp concierge…")}><MessageCircle size={18} />Chat on WhatsApp</Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
