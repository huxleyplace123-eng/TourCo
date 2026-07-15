import React, { useState, useMemo } from "react";
import { ArrowRight, MapPin, Sun, Umbrella, Compass, Utensils, Car, DollarSign, ShieldAlert, CloudRain, Wallet, Camera } from "lucide-react";
import { c, grad } from "../theme.js";
import { regions } from "../data.js";
import { beaches, BEACH_TAGS } from "../places.js";
import { regionImage, pageHero, beachImage } from "../images.js";
import { Section, SectionHead, Eyebrow, Button } from "../components/ui.jsx";
import { Photo, Lift, Reveal } from "../motion.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { GuideHero } from "../components/GuideHero.jsx";
import { TicoAvatar, TicoRating, TicoPick, TicoSectionIntro, useTicoBeach } from "../components/Tico.jsx";

// Beach card — extracted so Tico's rating hook lives at a component boundary.
function BeachCard({ b }) {
  const tico = useTicoBeach(b);
  return (
    <Lift style={{ overflow: "hidden", border: `1px solid ${c.line}`, height: "100%", display: "flex", flexDirection: "column" }} radius={18}>
      <Photo src={beachImage(b)} fallback={grad.reef} alt={b.name} height={150}
        overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(11,26,46,.75) 100%)" }} />}>
        {tico.isPick && <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}><TicoPick /></span>}
        <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, zIndex: 2 }}>
          <div style={{ color: c.gold, fontSize: 11.5, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{b.region}</div>
          <div style={{ color: "#fff", fontSize: 19, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>{b.name}</div>
        </div>
      </Photo>
      <div style={{ padding: 15, display: "flex", flexDirection: "column", gap: 8, flex: 1, background: c.white }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}><span title={`Rico says: ${tico.label}`}><TicoRating score={tico.score} mood={tico.mood} /></span></div>
        <p style={{ margin: 0, color: c.stone, fontSize: 13.5, lineHeight: 1.5, flex: 1 }}>{b.blurb}</p>
        {tico.take && <div style={{ display: "flex", gap: 7, alignItems: "flex-start", background: "rgba(34,211,238,.06)", border: "1px solid rgba(34,211,238,.18)", borderRadius: 10, padding: "8px 10px" }}><TicoAvatar size={18} glow={false} mood={tico.takeMood} animate={false} /><span style={{ fontSize: 12, color: c.charcoal, lineHeight: 1.4, fontStyle: "italic" }}>{tico.take}</span></div>}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(255,208,0,.08)", border: "1px solid rgba(255,208,0,.2)", borderRadius: 10, padding: "8px 10px" }}>
          <Sun size={13} color={c.gold} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 12, color: c.charcoal, lineHeight: 1.4 }}><b style={{ color: c.gold }}>Local tip:</b> {b.tip}</span>
        </div>
      </div>
    </Lift>
  );
}

const TIPS = [
  { icon: Sun, title: "Best time to visit", body: "Dry season (Dec–Apr) for sun; green season (May–Nov) for lush jungle, fewer crowds, and lower prices." },
  { icon: Umbrella, title: "What to pack", body: "Reef-safe sunscreen, quick-dry clothes, closed shoes for trails, and a light rain layer year-round." },
  { icon: Utensils, title: "Eat like a local", body: "Casados, gallo pinto, and fresh ceviche. Ask us for the sodas (family kitchens) locals love." },
  { icon: Compass, title: "Getting around", body: "Private transfers beat rental cars on the rough coastal roads. We coordinate every pickup so nothing's rushed." },
];

// Real, researched local knowledge (sources: mytanfeet, Two Weeks in Costa Rica,
// Earth Trekkers, Radical Storage, U.S. State Dept travel advisory).
const PLAYBOOK = [
  { icon: DollarSign, title: "Tipping — keep it easy", points: [
    "Restaurants add a 10% service charge already — extra is optional, only for great service.",
    "Tour guides: ~10% of the tour is generous and appreciated.",
    "Drivers/shuttles: $2–5 per person (more for long or exceptional rides).",
    "Parking 'tips' are usually just the small parking fee — a couple dollars.",
  ] },
  { icon: Car, title: "Driving here vs. home", points: [
    "You drive on the right; a valid license + passport (with entry stamp) is all you need.",
    "Speed is in km/h (highway ~90 km/h ≈ 55 mph); gas is by the liter and full-serve.",
    "Avoid city driving 5–8am & 3–6pm — that's rush hour.",
    "Don't drive 2+ hour unpaved routes after dark, especially in rainy season.",
  ] },
  { icon: ShieldAlert, title: "Stay smart & safe", points: [
    "Petty theft is the main risk — never leave anything visible in a car, even locked.",
    "Thieves can jam key-fob signals — always double-check the doors actually locked.",
    "Skip crowded public buses (pickpockets); use registered taxis or reputable transfer services.",
    "Flat tire or breakdown? Don't stop in lonely spots — call your rental or dial 911.",
  ] },
  { icon: CloudRain, title: "Weather rhythm", points: [
    "Green season = sunny mornings, afternoon showers. Do outdoor tours early.",
    "Sunrise ~5:30am, sunset ~5:45pm year-round (near the equator) — plan around it.",
    "Waterfalls are fullest Sep–Oct; whales peak Aug–Oct in the south.",
    "Always pack a light rain layer — even 'dry season' surprises you.",
  ] },
  { icon: Wallet, title: "Money & essentials", points: [
    "USD is widely accepted, but small colón for sodas & markets is handy.",
    "Cards work at most tours/restaurants; carry some cash for rural spots.",
    "Tap water is generally safe in most tourist areas.",
    "Buy travel insurance — adventure activities make it well worth it.",
  ] },
  { icon: Camera, title: "Do it like a local", points: [
    "Eat at 'sodas' — family kitchens with the best casados at honest prices.",
    "Reef-safe sunscreen only — regular kinds damage the reefs (and some parks ban them).",
    "Learn 'Pura Vida' — it's hello, goodbye, thanks, and a whole way of life.",
    "Slow down. The best Costa Rica days aren't over-scheduled.",
  ] },
];

function BeachChip({ on, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all .15s",
      background: on ? "rgba(34,211,238,.14)" : "rgba(255,255,255,.05)",
      border: on ? `1.5px solid ${c.teal}` : `1.5px solid ${c.line}`,
      color: on ? c.teal : c.charcoal,
    }}>{children}</button>
  );
}

export function Guide({ go, embedded = false }) {
  const [beachTag, setBeachTag] = useState("all");
  const shownBeaches = useMemo(() => beaches.filter((b) => beachTag === "all" || b.tags.includes(beachTag)), [beachTag]);
  return (
    <>
      {!embedded && <GuideHero go={go} />}

      <Section bg={c.sand}>
        <SectionHead eyebrow="Explore" title="Pick your corner of the coast" accent />
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
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

      {/* ── Beaches ── */}
      <Section bg={c.sand} pad={40}>
        <TicoSectionIntro kind="beaches" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <BeachChip on={beachTag === "all"} onClick={() => setBeachTag("all")}>All beaches</BeachChip>
          {BEACH_TAGS.map((t) => (
            <BeachChip key={t.key} on={beachTag === t.key} onClick={() => setBeachTag(t.key)}>{t.label}</BeachChip>
          ))}
        </div>
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {shownBeaches.map((b, i) => (
            <Reveal key={b.id} delay={(i % 3) * 60}><BeachCard b={b} /></Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.sand}>
        <SectionHead eyebrow="Insider tips" title="Know before you go" center />
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
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
      </Section>

      {/* ── The Local's Playbook — real, researched insider knowledge ── */}
      <Section bg={c.sand} pad={40}>
        <SectionHead eyebrow="The Local's Playbook" title="What locals wish you knew" center accent
          sub="Straight talk from the ground — the stuff that saves your trip." />
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          {PLAYBOOK.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 70}>
              <div style={{ background: c.white, borderRadius: 18, padding: 22, border: `1px solid ${c.line}`, height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.25)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <p.icon size={19} color={c.teal} />
                  </span>
                  <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: c.charcoal }}>{p.title}</h3>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.points.map((pt) => (
                    <li key={pt} style={{ display: "flex", gap: 8, fontSize: 13.5, color: c.stone, lineHeight: 1.45 }}>
                      <span style={{ color: c.gold, fontWeight: 800, flexShrink: 0 }}>·</span>{pt}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Button variant="dark" size="lg" onClick={() => go("build")}>Plan a trip with a local <ArrowRight size={18} /></Button>
        </div>
      </Section>
    </>
  );
}
