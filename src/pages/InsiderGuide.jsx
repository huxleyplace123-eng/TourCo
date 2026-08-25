import React, { useState } from "react";
import { ArrowLeft, ArrowRight, BadgePercent, CheckCircle2, Compass, Gift, MapPin, MapPinned, Utensils, Wine } from "lucide-react";
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
  { id: "dining", icon: Utensils, eyebrow: "Eat & drink", title: `${restaurants.length} restaurants · ${bars.length} bars`, body: "Open the dining guide and filter by mood or region.", accent: c.gold },
  { id: "coast", icon: MapPinned, eyebrow: "Beaches & regions", title: `${regions.length} regions · ${beaches.length} beaches`, body: "Compare the coast by swimming, surf, snorkeling and sunset fit.", accent: c.teal },
  { id: "savings", icon: BadgePercent, eyebrow: "Listed savings", title: `${deals.length} offers`, body: "See listed offers and codes with a clear confirmation warning.", accent: c.coral },
  { id: "free", icon: Gift, eyebrow: "Free & low-cost", title: `${freeThings.length} local stops`, body: "Find beaches, viewpoints and other budget-friendly ideas.", accent: "#37E36B" },
];

export function InsiderGuide({ go, trip = [] }) {
  const [active, setActive] = useState(null);
  const selected = COLLECTIONS.find((item) => item.id === active);
  const choose = (id) => {
    setActive(id);
    window.setTimeout(() => document.getElementById("insider-content")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <>
      <div className="insider-hero" style={{ position: "relative", minHeight: 570, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <img src={HERO?.src} alt="Costa Rica coast" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(96deg,rgba(6,16,34,.97),rgba(6,16,34,.82) 50%,rgba(6,16,34,.28))" }} />
        <div className="insider-hero-inner" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto", padding: "84px 20px 88px" }}>
          <div style={{ maxWidth: 720 }}>
            <Eyebrow><span style={{ color: c.gold }}>TicoWild Insider Guide</span></Eyebrow>
            <h1 style={{ color: "#fff", fontSize: "clamp(42px,7vw,76px)", lineHeight: .98, letterSpacing: -2.4, margin: "14px 0 0", fontWeight: 800 }}>
              Eat, explore and save<br /><span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>without the endless scroll.</span>
            </h1>
            <p style={{ color: "rgba(243,247,255,.82)", maxWidth: 630, fontSize: 18, lineHeight: 1.65, margin: "24px 0 0" }}>Restaurants, beaches, local shortcuts and practical savings, organized so you can open only the part you need.</p>
            <div className="mobile-cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 29 }}>
              <Button variant="primary" size="lg" onClick={() => choose("dining")}>Open the guide <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => go("build")}>Plan around my route</Button>
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 27 }}>
              {[[CheckCircle2, `${restaurants.length + bars.length} places to eat and drink`], [MapPin, `${beaches.length} beaches`], [Compass, `${deals.length + freeThings.length} ways to save`]].map(([Icon, label]) => <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(243,247,255,.72)", fontSize: 13, fontWeight: 700 }}><Icon size={15} color={c.teal} />{label}</span>)}
            </div>
          </div>
        </div>
      </div>

      <nav className="insider-jump-rail" aria-label="Insider Guide sections">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "10px 20px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {COLLECTIONS.map((item) => <button key={item.id} type="button" aria-pressed={active === item.id} onClick={() => choose(item.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, flex: "0 0 auto", border: active === item.id ? `1px solid ${item.accent}` : `1px solid ${c.line}`, borderRadius: 999, background: active === item.id ? `${item.accent}18` : "rgba(255,255,255,.055)", color: "#fff", padding: "8px 13px", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}><item.icon size={14} color={item.accent} />{item.eyebrow}</button>)}
        </div>
      </nav>

      <Section bg={c.sand} pad={46}>
        <div style={{ maxWidth: 720, marginBottom: 27 }}><Eyebrow><span style={{ color: c.teal }}>Choose one collection</span></Eyebrow><h2 style={{ color: "#fff", fontSize: "clamp(30px,4vw,46px)", letterSpacing: -1.2, margin: "8px 0 0" }}>What do you need right now?</h2><p style={{ color: c.stone, lineHeight: 1.65, fontSize: 16, margin: "12px 0 0" }}>Pick a section below. The guide opens it here without burying you under every restaurant, beach and offer at once.</p></div>
        <div className="insider-overview-grid" style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
          {COLLECTIONS.map((item, index) => <button key={item.id} type="button" onClick={() => choose(item.id)} className="insider-overview-card" style={{ ...glass, position: "relative", overflow: "hidden", background: active === item.id ? `${item.accent}12` : "rgba(14,26,48,.94)", border: active === item.id ? `1px solid ${item.accent}` : `1px solid ${c.line}`, borderRadius: 20, padding: 20, cursor: "pointer", textAlign: "left", minHeight: 164 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style={{ width: 42, height: 42, borderRadius: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `${item.accent}18`, border: `1px solid ${item.accent}44` }}><item.icon size={19} color={item.accent} /></span><span style={{ color: c.stone, fontWeight: 900, fontSize: 11 }}>{String(index + 1).padStart(2, "0")}</span></div><div style={{ color: item.accent, fontSize: 11.5, fontWeight: 900, letterSpacing: .8, textTransform: "uppercase", marginTop: 16 }}>{item.eyebrow}</div><div style={{ color: "#fff", fontSize: 19, fontWeight: 800, marginTop: 4 }}>{item.title}</div><p style={{ color: c.stone, fontSize: 13, lineHeight: 1.48, margin: "7px 0 0" }}>{item.body}</p></button>)}
        </div>
      </Section>

      {selected && (
        <div id="insider-content" className="insider-anchor" style={{ scrollMarginTop: 126 }}>
          <div style={{ background: c.canvas2, borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}` }}><div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}><div><span style={{ color: selected.accent, fontSize: 11.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: .8 }}>Now viewing</span><h2 style={{ color: "#fff", fontSize: 25, margin: "4px 0 0" }}>{selected.eyebrow}</h2></div><Button variant="ghost" size="sm" onClick={() => setActive(null)}><ArrowLeft size={15} />Close section</Button></div></div>
          {active === "dining" && <Restaurants go={go} embedded />}
          {active === "coast" && <Guide go={go} embedded />}
          {active === "savings" && <Deals go={go} trip={trip} embedded section="deals" />}
          {active === "free" && <Deals go={go} trip={trip} embedded section="free" />}
        </div>
      )}

      <Section bg={c.sand} pad={48}>
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, border: "1px solid rgba(255,208,0,.3)", background: "linear-gradient(145deg,rgba(255,208,0,.1),rgba(17,32,58,.98) 42%,rgba(8,20,42,.98))", padding: "clamp(25px,5vw,42px)", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}><Wine size={28} color={c.gold} /><div style={{ flex: "1 1 440px" }}><div style={{ color: c.gold, fontWeight: 900, fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase" }}>Bring the pieces together</div><h2 style={{ color: "#fff", fontSize: "clamp(25px,3.5vw,38px)", margin: "6px 0 0", letterSpacing: -.9 }}>Turn the guide into a trip that flows.</h2><p style={{ color: c.stone, lineHeight: 1.6, fontSize: 14.5, margin: "9px 0 0" }}>When you request availability, TicoWild can use your route, saved experiences and preferences in one conversation.</p></div><Button variant="gold" size="lg" onClick={() => go(trip.length ? "portal" : "build")}>{trip.length ? "Continue my trip" : "Start my trip"} <ArrowRight size={17} /></Button></div>
      </Section>

      <style>{`.insider-jump-rail{position:sticky;top:64px;z-index:44;background:rgba(8,20,42,.92);border-block:1px solid rgba(255,255,255,.08);backdrop-filter:blur(16px)}.insider-overview-card{transition:transform .2s ease}.insider-overview-card:hover{transform:translateY(-3px)}@media(max-width:680px){.insider-hero{min-height:650px!important}.insider-overview-grid{grid-template-columns:1fr!important}}@media(prefers-reduced-motion:reduce){.insider-overview-card{transition:none!important}}`}</style>
    </>
  );
}
