import React from "react";
import { ArrowRight, MapPin, Sun, Umbrella, Compass, Utensils } from "lucide-react";
import { c, grad } from "../theme.js";
import { regions } from "../data.js";
import { regionImage, pageHero } from "../images.js";
import { Section, SectionHead, Eyebrow, Button } from "../components/ui.jsx";
import { Photo, Lift, Reveal } from "../motion.jsx";
import { PageHero } from "../components/PageHero.jsx";

const TIPS = [
  { icon: Sun, title: "Best time to visit", body: "Dry season (Dec–Apr) for sun; green season (May–Nov) for lush jungle, fewer crowds, and lower prices." },
  { icon: Umbrella, title: "What to pack", body: "Reef-safe sunscreen, quick-dry clothes, closed shoes for trails, and a light rain layer year-round." },
  { icon: Utensils, title: "Eat like a local", body: "Casados, gallo pinto, and fresh ceviche. Ask your concierge for the sodas (family kitchens) locals love." },
  { icon: Compass, title: "Getting around", body: "Private transfers beat rental cars on the rough coastal roads. We coordinate every pickup so nothing's rushed." },
];

export function Guide({ go }) {
  return (
    <>
      <PageHero image={pageHero("guide")} eyebrow="Local's Guide" title="Costa Rica, region by region"
        sub="Where to go for what. Written by the people who actually live and guide here." />

      <Section bg={c.sand}>
        <SectionHead eyebrow="Explore" title="Pick your corner of the coast" accent />
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {regions.map((r, i) => (
            <Reveal key={r.name} delay={(i % 3) * 70}>
              <Lift style={{ overflow: "hidden", cursor: "pointer" }} onClick={() => go("activities")}>
                <Photo src={regionImage(r.name)} fallback={grad[r.gradKey] || grad.ocean} alt={r.name} height={200}
                  overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(8,20,45,.78) 100%)" }} />}>
                  <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 2 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, color: c.gold, fontWeight: 700, fontSize: 12.5 }}>
                      <MapPin size={13} />{r.tag}
                    </div>
                    <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>{r.name}</div>
                  </div>
                </Photo>
              </Lift>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.sand}>
        <SectionHead eyebrow="Insider tips" title="Know before you go" center />
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
          {TIPS.map((t) => (
            <div key={t.title} style={{ background: c.surface2, borderRadius: 18, padding: 24 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: grad.jungle, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <t.icon size={21} color="#fff" />
              </span>
              <h3 style={{ margin: "14px 0 8px", fontSize: 17, fontWeight: 800, color: c.charcoal }}>{t.title}</h3>
              <p style={{ margin: 0, color: c.stone, fontSize: 14.5, lineHeight: 1.6 }}>{t.body}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Button variant="dark" size="lg" onClick={() => go("build")}>Plan a trip with a local <ArrowRight size={18} /></Button>
        </div>
      </Section>
    </>
  );
}
