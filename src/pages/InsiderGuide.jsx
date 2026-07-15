import React from "react";
import { ArrowRight, BadgePercent, CheckCircle2, Compass, Gift, LockKeyhole, MapPin, MapPinned, Utensils, Wine } from "lucide-react";
import { c, glass, gradText } from "../theme.js";
import { regions } from "../data.js";
import { restaurants } from "../restaurants.js";
import { bars, beaches, deals, freeThings } from "../places.js";
import { themedSlides } from "../images.js";
import { Button, Eyebrow, Section } from "../components/ui.jsx";
import { Restaurants } from "./Restaurants.jsx";
import { Guide } from "./Guide.jsx";
import { Deals } from "./Deals.jsx";

const HERO = themedSlides("guide", 1900)[0];

const COLLECTIONS = [
  {
    id: "insider-dining",
    icon: Utensils,
    eyebrow: "Eats & drinks",
    title: `${restaurants.length} restaurants · ${bars.length} bars`,
    body: "Local sodas, sunset dinners, breakfast, seafood, happy hours, live music, and nightlife—filterable by mood and region.",
    accent: c.gold,
  },
  {
    id: "insider-coast",
    icon: MapPinned,
    eyebrow: "Beaches & regions",
    title: `${regions.length} regions · ${beaches.length} beaches`,
    body: "Choose the right corner of the coast, then compare swimming, surf, snorkeling, family beaches, sunsets, and hidden coves.",
    accent: c.teal,
  },
  {
    id: "insider-savings",
    icon: BadgePercent,
    eyebrow: "Deals & discounts",
    title: `${deals.length} listed offers`,
    body: "Tour offers, transport savings, family deals, happy hours, promo codes, and clear redemption timing in one place.",
    accent: c.coral,
  },
  {
    id: "insider-free",
    icon: Gift,
    eyebrow: "Free & low-cost",
    title: `${freeThings.length} local wins`,
    body: "Beaches, viewpoints, swimming holes, markets, and memorable stops that do not need another expensive tour booking.",
    accent: "#37E36B",
  },
];

function jumpTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

function CollectionOverview() {
  return (
    <Section bg={c.sand} pad={46}>
      <div style={{ maxWidth: 760, marginBottom: 28 }}>
        <Eyebrow><span style={{ color: c.teal }}>Everything in one place</span></Eyebrow>
        <h2 style={{ color: "#fff", fontSize: "clamp(30px,4vw,48px)", letterSpacing: -1.3, margin: "8px 0 0" }}>Four rich collections. One beautifully organized guide.</h2>
        <p style={{ color: c.stone, lineHeight: 1.65, fontSize: 16, margin: "13px 0 0" }}>
          Browse every existing TicoWild recommendation below. Use the section rail to jump between dining, beaches, savings, and affordable local discoveries.
        </p>
      </div>
      <div className="insider-overview-grid" style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
        {COLLECTIONS.map((item, index) => (
          <button key={item.id} type="button" onClick={() => jumpTo(item.id)} style={{ ...glass, position: "relative", overflow: "hidden", background: "rgba(14,26,48,.94)", borderRadius: 20, padding: 20, cursor: "pointer", textAlign: "left", minHeight: 176, transition: "transform .2s ease,border-color .2s ease" }} className="insider-overview-card">
            <span aria-hidden style={{ position: "absolute", width: 150, height: 150, borderRadius: 999, right: -68, top: -82, background: item.accent, opacity: .09, filter: "blur(2px)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 14 }}>
              <span style={{ width: 42, height: 42, borderRadius: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `${item.accent}18`, border: `1px solid ${item.accent}44` }}><item.icon size={19} color={item.accent} /></span>
              <span style={{ color: c.stone, fontWeight: 900, fontSize: 11, letterSpacing: 1.2 }}>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div style={{ position: "relative", color: item.accent, fontSize: 11.5, fontWeight: 900, letterSpacing: .8, textTransform: "uppercase", marginTop: 17 }}>{item.eyebrow}</div>
            <div style={{ position: "relative", color: "#fff", fontSize: 19, fontWeight: 800, marginTop: 4 }}>{item.title}</div>
            <p style={{ position: "relative", color: c.stone, fontSize: 12.75, lineHeight: 1.48, margin: "7px 0 0" }}>{item.body}</p>
          </button>
        ))}
      </div>
    </Section>
  );
}

function BookingLayer({ go, saved }) {
  return (
    <Section bg={c.sand} pad={38}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, border: "1px solid rgba(255,208,0,.35)", background: "linear-gradient(145deg,rgba(255,208,0,.1),rgba(17,32,58,.98) 42%,rgba(8,20,42,.98))", padding: "clamp(24px,5vw,42px)", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div aria-hidden style={{ position: "absolute", width: 320, height: 320, borderRadius: 999, right: -120, top: -200, border: "1px solid rgba(255,208,0,.2)" }} />
        <span style={{ width: 54, height: 54, borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,208,0,.14)", border: "1px solid rgba(255,208,0,.35)", flexShrink: 0 }}><LockKeyhole color={c.gold} size={24} /></span>
        <div style={{ position: "relative", flex: "1 1 420px" }}>
          <div style={{ color: c.gold, fontWeight: 900, fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase" }}>The booking advantage</div>
          <h2 style={{ color: "#fff", fontSize: "clamp(24px,3.5vw,38px)", margin: "6px 0 0", letterSpacing: -.9 }}>Browse it all. Book once. Take the guide with you.</h2>
          <p style={{ color: "rgba(243,247,255,.7)", lineHeight: 1.6, fontSize: 14.5, margin: "9px 0 0", maxWidth: 700 }}>
            The full collection stays useful while you plan. A confirmed TicoWild reservation adds the private layer: route-specific guidance, concierge pairing, and participating customer benefits tied to your trip.
          </p>
        </div>
        <Button variant="gold" size="lg" onClick={() => go(saved ? "portal" : "build")}>{saved ? "Continue my trip" : "Start my trip"} <ArrowRight size={17} /></Button>
      </div>
    </Section>
  );
}

export function InsiderGuide({ go, trip = [] }) {
  const saved = trip.length;
  return (
    <>
      <div className="insider-hero" style={{ position: "relative", minHeight: 580, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <img src={HERO?.src} alt="Costa Rica coast" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(96deg, rgba(6,16,34,.97) 0%, rgba(6,16,34,.84) 49%, rgba(6,16,34,.32) 100%)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 90% at 84% 80%, rgba(255,208,0,.2), transparent 58%)" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto", padding: "84px 20px 100px" }}>
          <div style={{ maxWidth: 720 }}>
            <Eyebrow><span style={{ color: c.gold }}>TicoWild Insider Guide</span></Eyebrow>
            <h1 style={{ color: "#fff", fontSize: "clamp(42px,7vw,78px)", lineHeight: .98, letterSpacing: -2.5, margin: "14px 0 0", fontWeight: 800, textWrap: "balance" }}>
              <span className="tn-title-keep">Eat, explore,</span>{" "}<span className="tn-title-keep">and save</span><br />
              <span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}><span className="tn-title-keep">like somebody</span>{" "}<span className="tn-title-keep">tipped you off.</span></span>
            </h1>
            <p style={{ color: "rgba(243,247,255,.82)", maxWidth: 640, fontSize: 18, lineHeight: 1.65, margin: "24px 0 0" }}>
              Restaurants, drinks, beaches, local playbooks, deals, and nearly-free adventures—organized into one guide without throwing away the depth you already had.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
              <Button variant="primary" size="lg" onClick={() => jumpTo("insider-dining")}>Explore the guide <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => go("build")}>Plan around my route</Button>
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 28 }}>
              {[[CheckCircle2, `${restaurants.length + bars.length} places to eat & drink`], [MapPin, `${beaches.length} beaches`], [Compass, `${deals.length + freeThings.length} ways to save`]].map(([Icon, label]) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(243,247,255,.72)", fontSize: 13, fontWeight: 700 }}><Icon size={15} color={c.teal} />{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="insider-jump-rail" aria-label="Insider Guide sections">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "10px 20px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {COLLECTIONS.map((item) => (
            <button key={item.id} type="button" onClick={() => jumpTo(item.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, flex: "0 0 auto", border: `1px solid ${c.line}`, borderRadius: 999, background: "rgba(255,255,255,.055)", color: "#fff", padding: "8px 13px", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}><item.icon size={14} color={item.accent} />{item.eyebrow}</button>
          ))}
        </div>
      </nav>

      <CollectionOverview />
      <BookingLayer go={go} saved={saved} />

      <div id="insider-dining" className="insider-anchor"><Restaurants go={go} embedded /></div>
      <div id="insider-coast" className="insider-anchor"><Guide go={go} embedded /></div>
      <div id="insider-savings" className="insider-anchor"><Deals go={go} trip={trip} embedded /></div>

      <Section bg={c.sand} pad={56}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          <Wine size={24} color={c.gold} />
          <h2 style={{ color: "#fff", fontSize: "clamp(28px,4vw,44px)", margin: "13px 0 0", letterSpacing: -1.1 }}>Now turn the guide into your trip.</h2>
          <p style={{ color: c.stone, lineHeight: 1.65, margin: "12px auto 22px", maxWidth: 600 }}>Choose your dates and stops. Rico will organize the right experiences and local recommendations around the route.</p>
          <Button variant="primary" size="lg" onClick={() => go("build")}>Build my Costa Rica <ArrowRight size={18} /></Button>
        </div>
      </Section>

      <style>{`
        .insider-jump-rail{position:sticky;top:64px;z-index:44;background:rgba(8,20,42,.92);border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .insider-anchor{scroll-margin-top:126px}
        .insider-overview-card:hover{transform:translateY(-3px);border-color:rgba(255,208,0,.38)!important}
        @media(max-width:680px){.insider-hero{min-height:680px!important}.insider-overview-grid{grid-template-columns:1fr!important}.insider-jump-rail{top:64px}}
        @media(prefers-reduced-motion:reduce){.insider-overview-card{transition:none!important}}
      `}</style>
    </>
  );
}
