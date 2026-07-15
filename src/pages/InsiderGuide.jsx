import React from "react";
import { ArrowRight, BadgePercent, CheckCircle2, Compass, LockKeyhole, MapPin, MapPinned, Sparkles, Utensils } from "lucide-react";
import { c, glass, grad, gradText } from "../theme.js";
import { beaches, deals, freeThings } from "../places.js";
import { restaurants } from "../restaurants.js";
import { beachImage, dealImage, restaurantImage, themedSlides } from "../images.js";
import { Button, Eyebrow, Section } from "../components/ui.jsx";
import { Photo, Reveal } from "../motion.jsx";

const HERO = themedSlides("guide", 1900)[0];

const PREVIEW = [
  { kind: "Beach", icon: MapPinned, item: beaches[0], title: beaches[0]?.name, region: beaches[0]?.region, body: beaches[0]?.blurb, image: beachImage(beaches[0]) },
  { kind: "Local table", icon: Utensils, item: restaurants[0], title: restaurants[0]?.name, region: restaurants[0]?.region, body: restaurants[0]?.blurb, image: restaurantImage(restaurants[0]) },
  { kind: "Smart saving", icon: BadgePercent, item: deals[0], title: deals[0]?.title, region: deals[0]?.where, body: deals[0]?.detail, image: dealImage(deals[0]) },
].filter((entry) => entry.title);

const MEMBER_COLLECTIONS = [
  { icon: MapPinned, title: `${Math.max(0, beaches.length - 1)} more beaches`, body: "Exact map pins, the right arrival time, parking notes, and Rico's honest take." },
  { icon: Utensils, title: `${Math.max(0, restaurants.length - 1)} more local tables`, body: "What to order, when to reserve, and participating customer offers." },
  { icon: BadgePercent, title: `${deals.length} verified savings`, body: "Current offers, simple redemption instructions, and expiration details." },
  { icon: Compass, title: `${freeThings.length} low-cost local wins`, body: "Memorable stops that keep the trip special without filling every hour with tours." },
];

export function InsiderGuide({ go, trip = [] }) {
  const saved = trip.length;
  return (
    <>
      <div className="insider-hero" style={{ position: "relative", minHeight: 610, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <img src={HERO?.src} alt="Costa Rica coast" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(96deg, rgba(6,16,34,.96) 0%, rgba(6,16,34,.83) 47%, rgba(6,16,34,.34) 100%)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 90% at 84% 80%, rgba(255,208,0,.2), transparent 58%)" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto", padding: "90px 20px 100px" }}>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow><span style={{ color: c.gold }}>Included with every confirmed booking</span></Eyebrow>
            <h1 style={{ color: "#fff", fontSize: "clamp(42px,7vw,78px)", lineHeight: .98, letterSpacing: -2.5, margin: "14px 0 0", fontWeight: 800 }}>
              The places locals<br /><span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>don't put on a checklist.</span>
            </h1>
            <p style={{ color: "rgba(243,247,255,.82)", maxWidth: 600, fontSize: 18, lineHeight: 1.65, margin: "24px 0 0" }}>
              One beautifully organized guide for beaches, local food, fair-value experiences, and customer-only offers—curated around your actual route.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Plan my trip <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => go("portal")}>{saved ? `View my ${saved} saved experience${saved === 1 ? "" : "s"}` : "How access works"}</Button>
            </div>
          </div>
        </div>
      </div>

      <Section bg={c.sand} pad={54}>
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: -96, position: "relative", zIndex: 4 }}>
          {[
            [CheckCircle2, "Locally selected", "Fewer, better recommendations"],
            [MapPin, "Route-aware", "Useful places near your stops"],
            [BadgePercent, "Customer value", "Participating offers, clearly marked"],
            [Sparkles, "Kept current", "Built for the trip you're taking"],
          ].map(([Icon, title, body]) => (
            <div key={title} style={{ ...glass, background: "rgba(14,26,48,.96)", padding: 20, borderRadius: 18, boxShadow: "0 24px 60px -34px rgba(0,0,0,.9)" }}>
              <Icon size={19} color={c.teal} />
              <div style={{ color: "#fff", fontWeight: 800, marginTop: 11 }}>{title}</div>
              <div style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.45, marginTop: 4 }}>{body}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section bg={c.sand} pad={34}>
        <div style={{ maxWidth: 720, marginBottom: 28 }}>
          <Eyebrow><span style={{ color: c.teal }}>A taste of the guide</span></Eyebrow>
          <h2 style={{ color: "#fff", fontSize: "clamp(30px,4vw,46px)", letterSpacing: -1.2, margin: "7px 0 0" }}>Useful before you book. Indispensable once you arrive.</h2>
          <p style={{ color: c.stone, lineHeight: 1.65, fontSize: 16, margin: "13px 0 0" }}>We keep a small public preview open. Confirmed travelers unlock the complete collection and route-specific details.</p>
        </div>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))" }}>
          {PREVIEW.map((entry, index) => (
            <Reveal key={`${entry.kind}-${entry.title}`} delay={index * 80}>
              <div style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${c.line}`, background: c.white, height: "100%" }}>
                <Photo src={entry.image} fallback={grad.ocean} alt={entry.title} height={190}
                  overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(7,18,38,.82) 100%)" }} />}>
                  <span style={{ position: "absolute", top: 14, left: 14, display: "inline-flex", alignItems: "center", gap: 6, ...glass, color: c.gold, padding: "6px 10px", borderRadius: 999, fontWeight: 800, fontSize: 11.5 }}><entry.icon size={13} />{entry.kind}</span>
                  <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, color: "#fff", fontWeight: 800, fontSize: 21 }}>{entry.title}</div>
                </Photo>
                <div style={{ padding: 18 }}>
                  <div style={{ color: c.teal, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} />{entry.region}</div>
                  <p style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.55, margin: "9px 0 0" }}>{entry.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.sand} pad={48}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, border: "1px solid rgba(255,208,0,.35)", background: "linear-gradient(145deg,rgba(255,208,0,.11),rgba(17,32,58,.98) 38%,rgba(8,20,42,.98))", padding: "clamp(24px,5vw,48px)" }}>
          <div aria-hidden style={{ position: "absolute", width: 340, height: 340, borderRadius: 999, right: -120, top: -170, border: "1px solid rgba(255,208,0,.2)" }} />
          <div style={{ position: "relative", display: "grid", gap: 30, gridTemplateColumns: "minmax(0,1fr)", alignItems: "center" }} className="insider-lock-grid">
            <div>
              <span style={{ width: 48, height: 48, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,208,0,.14)", border: "1px solid rgba(255,208,0,.35)" }}><LockKeyhole color={c.gold} size={22} /></span>
              <h2 style={{ color: "#fff", fontSize: "clamp(28px,4vw,43px)", margin: "16px 0 0", letterSpacing: -1 }}>Your booking unlocks the whole coast.</h2>
              <p style={{ color: "rgba(243,247,255,.72)", lineHeight: 1.65, fontSize: 16, margin: "13px 0 0", maxWidth: 560 }}>
                No separate membership and no fake paywall. Once a TicoWild reservation is confirmed, the complete guide belongs with that trip.
              </p>
              <Button variant="gold" size="lg" onClick={() => go(saved ? "portal" : "build")} style={{ marginTop: 24 }}>{saved ? "Continue to my trip" : "Start planning"} <ArrowRight size={17} /></Button>
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }} className="insider-collection-grid">
              {MEMBER_COLLECTIONS.map((item) => (
                <div key={item.title} style={{ background: "rgba(255,255,255,.055)", border: `1px solid ${c.line}`, borderRadius: 16, padding: 17, minHeight: 132 }}>
                  <item.icon size={18} color={c.teal} />
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginTop: 10 }}>{item.title}</div>
                  <div style={{ color: c.stone, fontSize: 12.5, lineHeight: 1.45, marginTop: 5 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <style>{`
        @media(min-width:880px){.insider-lock-grid{grid-template-columns:minmax(0,.9fr) minmax(420px,1.1fr)!important}}
        @media(max-width:620px){.insider-hero{min-height:680px!important}.insider-collection-grid{grid-template-columns:1fr!important}}
      `}</style>
    </>
  );
}
