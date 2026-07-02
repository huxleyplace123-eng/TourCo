import React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { c, grad } from "../theme.js";
import { activities } from "../data.js";
import { Button, Section, SectionHead } from "../components/ui.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";
import { Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";
import { TicoSectionIntro } from "../components/Tico.jsx";
import { TicoRanked } from "../components/TicoRanked.jsx";

export function Home({ go, addToTrip, trip, viewActivity }) {
  const featured = activities.slice(0, 8);

  return (
    <>
      {/* ── Living cinematic hero ── */}
      <CinematicHero go={go} />

      {/* ── Tico's Top Picks ── his personal ranking, front and center ── */}
      <Section bg={c.sand}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <TicoSectionIntro kind="topPicks" />
          <Button variant="ghost" onClick={() => go("activities")}>See all Tico rates <ArrowRight size={16} /></Button>
        </div>
        <Reveal>
          <TicoRanked items={activities} limit={5} onView={viewActivity} onAdd={addToTrip} trip={trip} />
        </Reveal>
      </Section>

      {/* ── Featured activities ── */}
      <Section bg={c.sand}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 30 }}>
          <SectionHead eyebrow="Popular right now" title="Hand-picked experiences" accent />
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
      <Section bg={c.sand} pad={70}>
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
