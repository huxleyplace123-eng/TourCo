import React, { useEffect, useState } from "react";
import { Sparkles, MapPin, Clock, Check } from "lucide-react";
import { c, grad, gradText } from "../theme.js";
import { Eyebrow } from "./ui.jsx";
import { TicoFace } from "./TicoFace.jsx";
import { themedSlides } from "../images.js";

// A sample day-by-day that "assembles itself" so travelers SEE the outcome
// they're about to get. Real activity names from the catalog.
const PLAN = [
  { day: "Day 1", region: "Manuel Antonio", items: ["Rainforest zipline", "Sunset catamaran"], mood: "excited" },
  { day: "Day 2", region: "Uvita", items: ["Whale watching", "Nauyaca waterfalls"], mood: "happy" },
  { day: "Day 3", region: "Quepos", items: ["Offshore sport fishing", "Beachfront ceviche"], mood: "proud" },
];

export function BuildHero() {
  const slides = themedSlides("activities", 1800);
  const [slide, setSlide] = useState(0);
  const [built, setBuilt] = useState(0);   // how many day-cards have "assembled"
  useEffect(() => {
    const s = setInterval(() => setSlide((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(s);
  }, [slides.length]);
  useEffect(() => {
    // reveal day cards one by one, then loop the "planning" effect
    const timers = PLAN.map((_, i) => setTimeout(() => setBuilt((b) => Math.max(b, i + 1)), 900 + i * 850));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: 460, display: "flex", alignItems: "center" }}>
      <style>{`
        @keyframes bhKen { from{ transform: scale(1.04) } to{ transform: scale(1.14) } }
        @keyframes bhRise { from{ opacity:0; transform: translateY(18px) } to{ opacity:1; transform: translateY(0) } }
        @keyframes bhCardIn { 0%{ opacity:0; transform: translateX(28px) rotate(1.5deg) } 100%{ opacity:1; transform: translateX(0) rotate(0) } }
        @keyframes bhChip { from{ opacity:0; transform: translateY(6px) } to{ opacity:1; transform: translateY(0) } }
        @keyframes bhDot { 0%,80%,100%{ opacity:.3 } 40%{ opacity:1 } }
        @keyframes bhFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-7px) } }
        @media(prefers-reduced-motion:reduce){ [style*="bh"]{ animation:none!important; opacity:1!important; transform:none!important } }
      `}</style>

      {/* cinematic activities backdrop, Ken-Burns */}
      {slides.map((s, i) => (
        <img key={s.src} src={s.src} alt="" aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            opacity: i === slide ? 1 : 0, transition: "opacity 1.6s ease",
            animation: i === slide ? "bhKen 7s ease-out both" : "none" }} />
      ))}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(11,26,46,.92) 0%, rgba(11,26,46,.66) 46%, rgba(11,26,46,.28) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(45% 60% at 12% 20%, rgba(34,211,238,.2), transparent 55%)" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto", padding: "44px 20px", display: "grid", gridTemplateColumns: "1fr", gap: 28, alignItems: "center" }} className="bh-grid">
        {/* ── copy ── */}
        <div className="bh-copy">
          <div style={{ animation: "bhRise .6s .05s both" }}><Eyebrow><span style={{ color: c.gold }}>Build My Costa Rica</span></Eyebrow></div>
          <h1 style={{ color: "#fff", fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: -1.8, lineHeight: 1.0, margin: "6px 0 0", animation: "bhRise .6s .12s both" }}>
            Watch your trip<br /><span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>build itself.</span>
          </h1>
          <p style={{ color: "rgba(243,247,255,.85)", fontSize: "clamp(15px,1.8vw,17px)", lineHeight: 1.55, maxWidth: 470, margin: "16px 0 0", animation: "bhRise .6s .2s both" }}>
            Tell Tico your vibe and dates. He assembles a day-by-day plan from vetted local operators — drive times, tides, and season all handled.
          </p>
          {/* Tico "planning" status line */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 20, background: "rgba(11,26,46,.55)", backdropFilter: "blur(8px)", border: `1px solid ${c.line}`, padding: "8px 13px", borderRadius: 999, animation: "bhRise .6s .28s both" }}>
            <TicoFace size={24} glow={false} mood="excited" animate={false} />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Tico is planning your days</span>
            <span style={{ display: "inline-flex", gap: 3 }}>
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 5, height: 5, borderRadius: 999, background: c.teal, animation: `bhDot 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
            </span>
          </div>
        </div>

        {/* ── the itinerary assembling itself ── */}
        <div className="bh-plan" style={{ display: "flex", flexDirection: "column", gap: 12, justifySelf: "stretch" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: c.gold, fontWeight: 800, fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.5, animation: "bhRise .6s .3s both" }}>
            <Sparkles size={14} /> Your day-by-day, live
          </div>
          {PLAN.map((d, i) => (
            <div key={d.day}
              style={{ opacity: i < built ? 1 : 0, animation: i < built ? "bhCardIn .55s cubic-bezier(.2,.8,.3,1) both" : "none",
                background: "rgba(14,26,48,.82)", backdropFilter: "blur(10px)", border: `1px solid ${i === 2 ? "rgba(255,208,0,.4)" : c.line}`, borderRadius: 16, padding: "13px 15px", display: "flex", gap: 12, alignItems: "center", boxShadow: "0 20px 50px -30px rgba(0,0,0,.9)" }}>
              <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: grad.hero, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", lineHeight: 1 }}>
                <span style={{ fontSize: 8, fontWeight: 700, opacity: 0.8 }}>DAY</span>
                <span style={{ fontSize: 16, fontWeight: 900 }}>{i + 1}</span>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, color: c.teal, fontWeight: 700, fontSize: 12 }}><MapPin size={11} />{d.region}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
                  {d.items.map((it, j) => (
                    <span key={it} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(34,211,238,.1)", border: "1px solid rgba(34,211,238,.24)", color: "#fff", fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, animation: i < built ? `bhChip .4s ease ${0.25 + j * 0.15}s both` : "none" }}>
                      <Check size={10} color={c.teal} />{it}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {/* the "next day" still assembling */}
          {built >= PLAN.length && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: c.stone, fontSize: 12.5, fontWeight: 600, padding: "4px 2px", animation: "bhRise .5s both" }}>
              <span style={{ display: "inline-flex", gap: 3 }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: 5, height: 5, borderRadius: 999, background: c.gold, animation: `bhDot 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
              </span>
              …and Tico keeps tailoring it to you
            </div>
          )}
        </div>
      </div>

      <style>{`@media(min-width:900px){ .bh-grid{ grid-template-columns: 1fr .92fr!important } }`}</style>
    </div>
  );
}
