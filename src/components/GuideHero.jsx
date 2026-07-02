import React, { useEffect, useState } from "react";
import { MapPin, Compass } from "lucide-react";
import { c, grad, gradText } from "../theme.js";
import { Eyebrow } from "./ui.jsx";
import { themedSlides } from "../images.js";

// Real Costa Rica silhouette (0–100 viewBox), lifted from ExploreMap.
const CR_OUTLINE = "M12,30 L22,22 L30,25 L28,33 L21,36 L26,42 L19,47 L14,45 L12,52 Q18,54 23,57 L30,54 L33,60 L40,62 L47,68 L53,72 L59,78 L65,84 L71,88 Q75,90 79,88 L75,82 L71,76 L67,68 L73,66 L79,70 L85,68 L90,62 L94,55 L97,47 L95,39 L89,33 L83,29 L77,25 L69,21 L60,18 L52,16 L44,17 L36,15 L28,13 L20,17 Z";
// A few glowing hotspots on the map (x,y in the 0–100 space).
const PINS = [
  { x: 33, y: 60, label: "Manuel Antonio" },
  { x: 47, y: 68, label: "Uvita" },
  { x: 20, y: 22, label: "Guanacaste" },
  { x: 71, y: 40, label: "Arenal" },
  { x: 60, y: 78, label: "Osa" },
];

// ── Local's Guide hero ── feels like an interactive guide: a live Costa Rica map
// backdrop with glowing location pins, over a cross-fading carousel of "exploring"
// photos that slowly pan/zoom (Ken Burns) so it reads almost like video.
export function GuideHero({ go }) {
  const slides = themedSlides("guide", 1800);
  const [slide, setSlide] = useState(0);
  const [pin, setPin] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setSlide((s) => (s + 1) % slides.length), 4500);
    const b = setInterval(() => setPin((p) => (p + 1) % PINS.length), 2200);
    return () => { clearInterval(a); clearInterval(b); };
  }, [slides.length]);

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: 420, display: "flex", alignItems: "flex-end" }}>
      <style>{`
        @keyframes guideKen { 0%{ transform: scale(1.05) translate(0,0) } 100%{ transform: scale(1.16) translate(-2%,-2%) } }
        @keyframes guidePin { 0%,100%{ transform: translateY(0); opacity:.85 } 50%{ transform: translateY(-4px); opacity:1 } }
        @keyframes guidePulse { 0%{ transform: scale(1); opacity:.7 } 100%{ transform: scale(2.6); opacity:0 } }
        @keyframes guideRise { from{ opacity:0; transform: translateY(18px) } to{ opacity:1; transform: translateY(0) } }
        @media(prefers-reduced-motion:reduce){ [style*="guideKen"]{ animation:none!important } }
      `}</style>

      {/* explorer photo carousel with Ken Burns motion */}
      {slides.map((s, i) => (
        <img key={s.src} src={s.src} alt="" aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            opacity: i === slide ? 1 : 0, transition: "opacity 1.6s ease",
            animation: i === slide ? "guideKen 6s ease-out both" : "none" }} />
      ))}
      {/* darken so the map + text read */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.62) 0%, rgba(11,26,46,.4) 40%, rgba(11,26,46,.94) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(45% 60% at 82% 40%, rgba(34,211,238,.2), transparent 60%)` }} />

      {/* live map, top-right — the "interactive guide" motif */}
      <svg viewBox="0 0 100 100" aria-hidden
        style={{ position: "absolute", right: "3%", top: "8%", width: "min(38%, 360px)", height: "auto", opacity: 0.92, filter: "drop-shadow(0 8px 30px rgba(0,0,0,.5))" }}>
        <defs>
          <linearGradient id="ghTerr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#12467a" /><stop offset="1" stopColor="#0b1a2e" /></linearGradient>
        </defs>
        <path d={CR_OUTLINE} fill="url(#ghTerr)" stroke="rgba(34,211,238,.55)" strokeWidth="0.5" />
        {PINS.map((p, i) => (
          <g key={p.label}>
            {i === pin && <circle cx={p.x} cy={p.y} r="2.4" fill="none" stroke={c.gold} strokeWidth="0.6" style={{ transformOrigin: `${p.x}px ${p.y}px`, animation: "guidePulse 1.6s ease-out infinite" }} />}
            <circle cx={p.x} cy={p.y} r="1.5" fill={i === pin ? c.gold : c.teal}
              style={{ transformOrigin: `${p.x}px ${p.y}px`, animation: i === pin ? "guidePin 1.6s ease-in-out infinite" : "none" }} />
          </g>
        ))}
      </svg>

      {/* content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "34px 20px 30px", width: "100%" }}>
        <div style={{ animation: "guideRise .6s ease both" }}><Eyebrow><span style={{ color: c.gold }}>Local's Guide</span></Eyebrow></div>
        <h1 style={{ color: "#fff", fontSize: "clamp(28px,4.4vw,46px)", fontWeight: 800, letterSpacing: -1.4, lineHeight: 1.04, margin: "4px 0 0", textShadow: "0 6px 30px rgba(0,0,0,.5)", animation: "guideRise .6s .06s both" }}>
          Costa Rica, <span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>region by region</span>
        </h1>
        <p style={{ color: "rgba(243,247,255,.85)", fontSize: 15.5, lineHeight: 1.55, maxWidth: 540, margin: "10px 0 0", animation: "guideRise .6s .12s both" }}>
          Where to go for what — written by the people who actually live and guide here. Tap the map, follow the trail.
        </p>
        {/* live "now exploring" chip synced to the carousel */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, background: "rgba(11,26,46,.55)", backdropFilter: "blur(8px)", border: `1px solid ${c.line}`, padding: "7px 13px", borderRadius: 999, animation: "guideRise .6s .18s both" }}>
          <Compass size={14} color={c.teal} />
          <span key={slide} style={{ color: "#fff", fontSize: 12.5, fontWeight: 700 }}>Now exploring: {slides[slide].label}</span>
        </div>
      </div>
    </div>
  );
}
