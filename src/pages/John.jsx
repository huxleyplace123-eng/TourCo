import React from "react";
import { ArrowRight, Star, Quote, MessageCircle } from "lucide-react";
import { c, grad } from "../theme.js";
import { activities, operators } from "../data.js";
import { Section, Eyebrow, Button } from "../components/ui.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";
import { Reveal } from "../motion.jsx";

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
      <div style={{ background: grad.jungle, padding: "50px 20px 46px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 88% 12%, rgba(255,208,0,.3), transparent 45%)" }} />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 88, height: 88, borderRadius: 999, background: grad.sunset, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 38, color: c.charcoal, flexShrink: 0, boxShadow: "0 16px 40px -18px rgba(0,0,0,.6)" }}>J</div>
          <div>
            <Eyebrow><span style={{ color: c.gold }}>John Recommends</span></Eyebrow>
            <h1 style={{ color: "#fff", fontSize: "clamp(28px,5vw,44px)", fontWeight: 800, letterSpacing: -1, margin: "4px 0 8px" }}>The ones I'd book myself</h1>
            <p style={{ color: "rgba(255,255,255,.9)", fontSize: 17, maxWidth: 580, margin: 0 }}>
              After years of guiding, these are the experiences I hand-pick for friends and family. Every one is vetted, and I know the operators personally.
            </p>
          </div>
        </div>
      </div>

      <Section bg={c.sand}>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
          {picks.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 70}>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <ActivityCard a={a} onAdd={addToTrip} onView={viewActivity} inTrip={trip.some((t) => t.id === a.id)} />
                {NOTES[a.id] && (
                  <div style={{ background: "#fff", borderRadius: "0 0 16px 16px", marginTop: -12, padding: "18px 16px 14px", border: "1px solid rgba(0,0,0,.05)", borderTop: "none", display: "flex", gap: 10 }}>
                    <Quote size={16} color={c.teal} style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: c.stone, fontStyle: "italic" }}>{NOTES[a.id]}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.white} pad={60}>
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
