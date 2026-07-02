import React, { useEffect, useState } from "react";
import { Compass, MapPin, Navigation } from "lucide-react";
import { c, grad, gradText } from "../theme.js";
import { Eyebrow } from "./ui.jsx";
import { useCountUp } from "../motion.jsx";

// Real Costa Rica silhouette (0–100 viewBox), shared with ExploreMap.
const CR_OUTLINE = "M12,30 L22,22 L30,25 L28,33 L21,36 L26,42 L19,47 L14,45 L12,52 Q18,54 23,57 L30,54 L33,60 L40,62 L47,68 L53,72 L59,78 L65,84 L71,88 Q75,90 79,88 L75,82 L71,76 L67,68 L73,66 L79,70 L85,68 L90,62 L94,55 L97,47 L95,39 L89,33 L83,29 L77,25 L69,21 L60,18 L52,16 L44,17 L36,15 L28,13 L20,17 Z";
// A travel route that threads down the Pacific coast, then the pins along it.
const ROUTE = "M22,26 Q34,34 40,46 Q48,58 56,66 Q64,74 74,80";
const PINS = [
  { x: 22, y: 26, label: "Guanacaste", d: 0 },
  { x: 40, y: 46, label: "Jacó", d: 0.5 },
  { x: 52, y: 62, label: "Manuel Antonio", d: 1.0 },
  { x: 62, y: 72, label: "Uvita", d: 1.5 },
  { x: 74, y: 80, label: "Osa", d: 2.0 },
];

function Stat({ to, suffix, label, delay }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay); return () => clearTimeout(t); }, [delay]);
  const n = useCountUp(go ? to : 0, 1100);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "#fff", letterSpacing: -0.8, lineHeight: 1, textShadow: "0 2px 16px rgba(34,211,238,.4)" }}>{n}{suffix}</div>
      <div style={{ color: c.gold, fontWeight: 800, fontSize: 11, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
    </div>
  );
}

// ── Map hero ── a living, self-drawing Costa Rica: the coastline draws itself, a
// travel route threads down the Pacific, glowing pins drop one-by-one at real
// regions, a radar sweeps, and live counters tick up. It IS a map — a cinematic
// preview of the interactive tool below. Nothing else on the site looks like it.
export function MapHero() {
  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: 440, background: "radial-gradient(130% 120% at 78% 18%, #0e3358 0%, #071a30 55%, #050f1f 100%)", display: "flex", alignItems: "center" }}>
      <style>{`
        @keyframes mhDraw { to { stroke-dashoffset: 0 } }
        @keyframes mhRoute { to { stroke-dashoffset: 0 } }
        @keyframes mhRadar { 0%{ transform: translate(-50%,-50%) rotate(0deg) } 100%{ transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes mhPinDrop { 0%{ opacity:0; transform: translate(-50%,-140%) scale(.4) } 60%{ opacity:1; transform: translate(-50%,-46%) scale(1.15) } 100%{ opacity:1; transform: translate(-50%,-50%) scale(1) } }
        @keyframes mhPulse { 0%{ transform: translate(-50%,-50%) scale(1); opacity:.7 } 100%{ transform: translate(-50%,-50%) scale(3); opacity:0 } }
        @keyframes mhGlow { 0%,100%{ opacity:.4 } 50%{ opacity:.8 } }
        @keyframes mhRise { from{ opacity:0; transform: translateY(18px) } to{ opacity:1; transform: translateY(0) } }
        @keyframes mhFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } }
        @media(prefers-reduced-motion:reduce){ [style*="mh"],.mh-map *{ animation:none!important; stroke-dashoffset:0!important } }
      `}</style>

      {/* grid + drifting glow atmosphere */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(127,166,232,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(127,166,232,.06) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(120% 100% at 70% 30%, #000 40%, transparent 80%)" }} />
      <div aria-hidden style={{ position: "absolute", right: "8%", top: "12%", width: 420, height: 420, borderRadius: 999, background: "radial-gradient(circle, rgba(34,211,238,.18), transparent 65%)", filter: "blur(12px)", animation: "mhGlow 9s ease-in-out infinite" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "1fr", gap: 20, alignItems: "center" }} className="mh-grid">
        {/* ── copy + stats ── */}
        <div className="mh-copy">
          <div style={{ animation: "mhRise .6s .05s both" }}>
            <Eyebrow><span style={{ color: c.gold }}>Explore the map</span></Eyebrow>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: -1.8, lineHeight: 1.0, margin: "6px 0 0", animation: "mhRise .6s .12s both" }}>
            All of Costa Rica,<br /><span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>one living map.</span>
          </h1>
          <p style={{ color: "rgba(243,247,255,.82)", fontSize: "clamp(15px,1.8vw,17px)", lineHeight: 1.55, maxWidth: 480, margin: "16px 0 0", animation: "mhRise .6s .2s both" }}>
            Real geography, real coordinates. Every tour, beach, kitchen, national park, waterfall and hidden cove — exactly where it is. Tap a pin, plan the route.
          </p>
          <div style={{ display: "flex", gap: 26, marginTop: 24, flexWrap: "wrap", animation: "mhRise .6s .28s both" }}>
            <Stat to={120} suffix="+" label="mapped spots" delay={500} />
            <Stat to={7} suffix="" label="coastal regions" delay={650} />
            <Stat to={12} suffix="" label="national parks" delay={800} />
          </div>
        </div>

        {/* ── the living map ── */}
        <div className="mh-map" style={{ position: "relative", aspectRatio: "1 / 1", maxWidth: 440, width: "100%", margin: "0 auto", justifySelf: "center" }}>
          {/* radar sweep */}
          <div aria-hidden style={{ position: "absolute", left: "48%", top: "56%", width: "130%", height: "130%", background: "conic-gradient(from 0deg, rgba(34,211,238,.16), transparent 28%, transparent 100%)", borderRadius: "50%", animation: "mhRadar 16s linear infinite", pointerEvents: "none" }} />

          <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="mhTerr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#12467a" /><stop offset="0.6" stopColor="#0d3358" /><stop offset="1" stopColor="#0b1a2e" /></linearGradient>
              <filter id="mhSoft"><feGaussianBlur stdDeviation="0.5" /></filter>
            </defs>
            {/* soft shadow */}
            <path d={CR_OUTLINE} fill="rgba(0,0,0,.4)" transform="translate(1,1.2)" filter="url(#mhSoft)" />
            {/* filled land */}
            <path d={CR_OUTLINE} fill="url(#mhTerr)" opacity="0.96" />
            {/* self-drawing coastline stroke */}
            <path d={CR_OUTLINE} fill="none" stroke="rgba(34,211,238,.85)" strokeWidth="0.7" strokeLinejoin="round"
              style={{ strokeDasharray: 340, strokeDashoffset: 340, animation: "mhDraw 2.6s ease-out .2s forwards", filter: "drop-shadow(0 0 3px rgba(34,211,238,.6))" }} />
            {/* travel route threading the coast — draws itself after the coastline */}
            <path d={ROUTE} fill="none" stroke={c.gold} strokeWidth="0.9" strokeLinecap="round"
              style={{ strokeDasharray: 140, strokeDashoffset: 140, animation: "mhRoute 2.4s ease-in-out 1.4s forwards", opacity: 0.95, filter: "drop-shadow(0 0 3px rgba(255,208,0,.5))" }} />
            {/* labels */}
            <text x="52" y="30" fill="rgba(255,255,255,.10)" fontSize="4.4" fontWeight="800" style={{ letterSpacing: 2 }} textAnchor="middle">COSTA RICA</text>
            <text x="18" y="66" fill="rgba(34,211,238,.34)" fontSize="2.2" fontWeight="700" textAnchor="middle" style={{ letterSpacing: 1 }}>PACIFIC</text>
          </svg>

          {/* dropping pins with labels */}
          {PINS.map((p, i) => (
            <div key={p.label} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", animation: `mhPinDrop .7s cubic-bezier(.2,.9,.3,1.2) ${1.4 + p.d * 0.45}s both` }}>
              <span aria-hidden style={{ position: "absolute", left: "50%", top: "50%", width: 22, height: 22, borderRadius: 999, border: `1.5px solid ${i === 2 ? c.gold : c.teal}`, transform: "translate(-50%,-50%)", animation: `mhPulse 1.8s ease-out ${2 + p.d * 0.45}s infinite` }} />
              <span style={{ position: "relative", display: "flex", width: 16, height: 16, borderRadius: 999, background: i === 2 ? c.gold : c.teal, border: "2px solid #071a30", boxShadow: `0 0 12px ${i === 2 ? "rgba(255,208,0,.9)" : "rgba(34,211,238,.9)"}`, alignItems: "center", justifyContent: "center" }}>
                <MapPin size={8} color="#071a30" />
              </span>
              {i === 2 && (
                <span style={{ position: "absolute", left: "50%", top: "-26px", transform: "translateX(-50%)", whiteSpace: "nowrap", background: c.gold, color: c.ink, fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 999, boxShadow: "0 4px 12px rgba(0,0,0,.4)" }}>{p.label}</span>
              )}
            </div>
          ))}

          {/* floating "you are here" compass chip */}
          <div style={{ position: "absolute", right: -6, bottom: 6, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(11,26,46,.7)", backdropFilter: "blur(8px)", border: `1px solid ${c.line}`, color: "#fff", padding: "6px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, animation: "mhFloat 4s ease-in-out infinite" }}>
            <Navigation size={12} color={c.teal} /> Pura Vida coast
          </div>
        </div>
      </div>

      <style>{`@media(min-width:900px){ .mh-grid{ grid-template-columns: 1.1fr .9fr!important } }`}</style>
    </div>
  );
}
