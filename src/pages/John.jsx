import React from "react";
import { ArrowRight, Star, Quote, MessageCircle } from "lucide-react";
import { c, grad, glass } from "../theme.js";
import { activities, operators } from "../data.js";
import { pageHero, personImage } from "../images.js";
import { Section, Eyebrow, Button } from "../components/ui.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";
import { Reveal } from "../motion.jsx";
import { PageHero } from "../components/PageHero.jsx";

// John's personal picks: highest-rated + a couple of signature experiences.
const PICK_IDS = ["a15", "a4", "a1", "a11", "a16", "a10", "a7", "a12"];
const NOTES = {
  a15: "My #1 for couples. Nothing beats a private waterfall picnic ending on a sunset boat.",
  a4: "The one I send everyone on. Open bar, snorkeling, golden hour — it never misses.",
  a1: "For the anglers: this captain finds fish when nobody else can.",
  a11: "Bring the family. The natural pool at the base is pure magic.",
  a16: "When you want to splurge — a private yacht day is the trip of a lifetime.",
  a10: "The most fun you'll have getting soaked. Book the morning run.",
  a7: "Best value adrenaline on the coast. Kids and grandparents both love it.",
  a12: "Only for the brave — the views from a paraglider are unreal.",
};

export function John({ go, addToTrip, trip, viewActivity }) {
  const picks = PICK_IDS.map((id) => activities.find((a) => a.id === id)).filter(Boolean);

  return (
    <>
      <PageHero image={pageHero("john")} eyebrow="John Recommends" title="The ones I'd book myself"
        sub="After years of guiding, these are the experiences I hand-pick for friends and family. Every one is vetted, and I know the operators personally.">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
          <span style={{ width: 46, height: 46, borderRadius: 999, overflow: "hidden", border: `2px solid ${c.gold}`, flexShrink: 0 }}>
            <img src={personImage("john", 100)} alt="John" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </span>
          <span style={{ ...glass, color: "#fff", padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
            Hand-picked by <b style={{ color: c.gold }}>John</b> · your local guide
          </span>
        </div>
      </PageHero>

      <Section bg={c.sand}>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
          {picks.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 70} style={{ height: "100%" }}>
              <ActivityCard a={a} onAdd={addToTrip} onView={viewActivity} inTrip={trip.some((t) => t.id === a.id)} note={NOTES[a.id]} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.sand} pad={60}>
        <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", background: grad.hero, padding: "52px 28px", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 30%, rgba(34,211,238,.4), transparent 50%)" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, letterSpacing: -1, margin: 0 }}>Want my help planning?</h2>
            <p style={{ color: "rgba(255,255,255,.9)", fontSize: 17, marginTop: 12, maxWidth: 500, marginInline: "auto" }}>Tell me your dates and group — I'll put together a plan that fits you perfectly.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Build with John <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => window.alert("Opening WhatsApp concierge…")}><MessageCircle size={18} />Message me</Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
