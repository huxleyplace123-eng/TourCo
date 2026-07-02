import React from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { c, grad } from "../theme.js";
import { packages } from "../data.js";
import { Section, SectionHead, Eyebrow, Button } from "../components/ui.jsx";
import { PackageCard } from "../components/PackageCard.jsx";
import { Reveal } from "../motion.jsx";

export function Packages({ go }) {
  const view = (p) => go("build");
  return (
    <>
      <div style={{ background: grad.sunset, padding: "54px 20px 44px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Eyebrow><span style={{ color: c.charcoal }}>Ready-made trips</span></Eyebrow>
          <h1 style={{ color: c.charcoal, fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, letterSpacing: -1, margin: "6px 0 8px" }}>Curated adventure packages</h1>
          <p style={{ color: "rgba(11,26,46,.75)", fontSize: 17, maxWidth: 560 }}>
            Pre-built by locals for every kind of traveler. Pick one and your concierge tailors it to your dates.
          </p>
        </div>
      </div>

      <Section bg={c.sand}>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
          {packages.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 80}>
              <PackageCard p={p} onView={view} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.white} pad={70}>
        <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", background: grad.hero, padding: "56px 28px", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,208,0,.35), transparent 50%)" }} />
          <div style={{ position: "relative" }}>
            <SectionHead center light title="Nothing fits perfectly?" sub="Every package is a starting point. Tell us what you want and we'll build a custom one from scratch." />
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Build a custom trip <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => window.alert("Opening WhatsApp concierge…")}><MessageCircle size={18} />Ask a local</Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
