import React, { useEffect, useState } from "react";
import { Compass, MapPin } from "lucide-react";
import { c, gradText } from "../theme.js";
import { Eyebrow } from "./ui.jsx";

// An illustrated "your journey" motif — a coastline with your stops connecting
// into a glowing route, plus drifting fish/sun, no photo. Ties the page together.
const COAST = "M6,54 Q16,40 22,44 Q30,50 38,40 Q48,28 58,34 Q70,42 80,30 Q90,20 96,26";
const STOPS = [
  { x: 22, y: 44, label: "Arrive" },
  { x: 38, y: 40, label: "Adventure" },
  { x: 58, y: 34, label: "Coast" },
  { x: 80, y: 30, label: "Unwind" },
];

export function TripsHero({ count = 0 }) {
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLit((n) => (n + 1) % (STOPS.length + 1)), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: 340, background: "radial-gradient(130% 120% at 80% 15%, #0e3358 0%, #071a30 55%, #050f1f 100%)", display: "flex", alignItems: "center" }}>
      <style>{`
        @keyframes trRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes trDraw{to{stroke-dashoffset:0}}
        @keyframes trFish{0%{transform:translateX(0)}100%{transform:translateX(120px)}}
        @keyframes trBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes trPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}
        @media(prefers-reduced-motion:reduce){[style*="tr"],.tr-svg *{animation:none!important;stroke-dashoffset:0!important}}
      `}</style>

      {/* soft grid + glow */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(127,166,232,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(127,166,232,.05) 1px,transparent 1px)", backgroundSize: "42px 42px", maskImage: "radial-gradient(120% 100% at 75% 30%,#000 40%,transparent 82%)" }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "1fr", gap: 20, alignItems: "center" }} className="tr-grid">
        {/* copy */}
        <div className="tr-copy">
          <div style={{ animation: "trRise .6s .05s both" }}><Eyebrow><span style={{ color: c.gold }}>My Trips</span></Eyebrow></div>
          <h1 style={{ color: "#fff", fontSize: "clamp(32px,5vw,54px)", fontWeight: 900, letterSpacing: -1.6, lineHeight: 1.0, margin: "6px 0 0", animation: "trRise .6s .12s both" }}>
            Your Costa Rica,<br /><span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>one journey.</span>
          </h1>
          <p style={{ color: "rgba(243,247,255,.82)", fontSize: "clamp(15px,1.8vw,17px)", lineHeight: 1.55, maxWidth: 470, margin: "16px 0 0", animation: "trRise .6s .2s both" }}>
            {count > 0
              ? `${count} experience${count !== 1 ? "s" : ""} lined up. Here's your day-by-day, the deposit math, and exactly what to expect — all in one place.`
              : "Everything you add lands here and becomes a real plan — the route, the timing, the deposit, and what to do each day. Start adding and watch it come together."}
          </p>
        </div>

        {/* illustrated route */}
        <div className="tr-art" style={{ position: "relative", justifySelf: "center", width: "100%", maxWidth: 420 }}>
          <svg viewBox="0 0 100 72" className="tr-svg" style={{ width: "100%", height: "auto", overflow: "visible" }}>
            {/* sun */}
            <circle cx="84" cy="16" r="7" fill={c.gold} opacity="0.9" style={{ animation: "trBob 6s ease-in-out infinite", filter: "drop-shadow(0 0 8px rgba(255,208,0,.6))" }} />
            {/* coastline route */}
            <path d={COAST} fill="none" stroke="rgba(34,211,238,.9)" strokeWidth="1.1" strokeLinecap="round"
              style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: "trDraw 2.4s ease-out .3s forwards", filter: "drop-shadow(0 0 3px rgba(34,211,238,.6))" }} />
            {/* dotted "your route" under it */}
            <path d={COAST} fill="none" stroke={c.gold} strokeWidth="0.7" strokeDasharray="0.5 3" strokeLinecap="round" opacity="0.7" />
            {/* stops */}
            {STOPS.map((s, i) => (
              <g key={s.label}>
                {lit === i && <circle cx={s.x} cy={s.y} r="2.4" fill="none" stroke={c.gold} strokeWidth="0.5" style={{ transformOrigin: `${s.x}px ${s.y}px`, animation: "trPulse 1.4s ease-out infinite" }} />}
                <circle cx={s.x} cy={s.y} r="2" fill={i <= lit - 1 || lit === 0 ? c.gold : c.teal} stroke="#071a30" strokeWidth="0.6" />
                <text x={s.x} y={s.y - 4} fill="rgba(255,255,255,.8)" fontSize="2.6" fontWeight="700" textAnchor="middle">{s.label}</text>
              </g>
            ))}
            {/* little fish drifting along the bottom */}
            <g style={{ animation: "trFish 9s linear infinite" }} opacity="0.55">
              <path d="M8,64 q3,-2 6,0 q-3,2 -6,0 Z" fill={c.teal} />
              <path d="M14,64 l2,-1.4 v2.8 Z" fill={c.teal} />
            </g>
            <g style={{ animation: "trFish 12s linear infinite", animationDelay: "2s" }} opacity="0.4">
              <path d="M4,68 q2.4,-1.6 4.8,0 q-2.4,1.6 -4.8,0 Z" fill={c.blue} />
              <path d="M8.8,68 l1.6,-1.1 v2.2 Z" fill={c.blue} />
            </g>
            <text x="50" y="70" fill="rgba(34,211,238,.3)" fontSize="2.4" fontWeight="700" letterSpacing="1" textAnchor="middle">PACIFIC COAST</text>
          </svg>
        </div>
      </div>

      <style>{`@media(min-width:900px){.tr-grid{grid-template-columns:1.05fr .95fr!important}}`}</style>
    </div>
  );
}
