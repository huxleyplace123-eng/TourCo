import React from "react";
import { ArrowRight, ShieldCheck, MessageCircle, Sparkles, Map } from "lucide-react";
import { c, grad } from "../theme.js";
import { activities } from "../data.js";
import { Button, Section, SectionHead } from "../components/ui.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";
import { Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";

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

export function Home({ go, addToTrip, trip, viewActivity }) {
  const featured = activities.slice(0, 8);

  return (
    <>
      {/* ── Living cinematic hero ── */}
      <CinematicHero go={go} />

      {/* ── Trust bar ── */}
      <Section bg={c.sand} pad={0}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", paddingBottom: 8 }}>
          {TRUST.map((t) => (
            <div key={t.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid rgba(0,0,0,.06)", color: c.emerald, padding: "9px 15px", borderRadius: 999, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", boxShadow: "0 6px 18px -12px rgba(0,0,0,.3)" }}>
              <t.icon size={16} />{t.label}
            </div>
          ))}
        </div>
      </Section>

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
