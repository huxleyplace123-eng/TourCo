import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Compass, Calendar, Users, Heart, ChevronDown } from "lucide-react";
import { c, grad } from "../theme.js";
import { heroImage } from "../images.js";
import { Button, Field } from "./ui.jsx";
import { Magnetic } from "../motion.jsx";

// Time-of-day color grade — the hero tint shifts with the visitor's local hour,
// so the coast feels like it's living in real time (dawn → day → golden → night).
function timeGrade(hour) {
  if (hour >= 5 && hour < 8) return { name: "dawn", tint: "linear-gradient(160deg, #FF9E7A 0%, #7A5CCB 55%, #1E3A8F 100%)", accent: "#FFD6A5", label: "Good morning" };
  if (hour >= 8 && hour < 16) return { name: "day", tint: `linear-gradient(155deg, ${c.jungle} 0%, ${c.emerald} 45%, ${c.teal} 100%)`, accent: c.gold, label: "Pura vida" };
  if (hour >= 16 && hour < 19) return { name: "golden", tint: "linear-gradient(160deg, #12306E 0%, #E0662E 60%, #FFC24B 100%)", accent: "#FFE39A", label: "Golden hour" };
  return { name: "night", tint: "linear-gradient(165deg, #04102E 0%, #0A2E6B 55%, #10618A 100%)", accent: c.teal, label: "Buenas noches" };
}

export function CinematicHero({ go }) {
  const [plan, setPlan] = useState({ dest: "Manuel Antonio", dates: "", group: "2", type: "Couple / Honeymoon" });
  const [mouse, setMouse] = useState({ x: 0, y: 0 }); // -1..1
  const [scrollY, setScrollY] = useState(0);
  const [hour, setHour] = useState(12);
  const wrapRef = useRef(null);

  useEffect(() => {
    setHour(new Date().getHours());
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouse({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
  };

  const g = timeGrade(hour);
  // Parallax helper: each layer moves by a different factor from mouse + scroll.
  const layer = (depth) => ({
    transform: `translate3d(${mouse.x * depth * 14}px, ${mouse.y * depth * 10 + scrollY * depth * 0.12}px, 0) scale(${1.06 + depth * 0.04})`,
    transition: "transform .18s cubic-bezier(.2,.7,.2,1)",
  });

  const selectStyle = { width: "100%", border: "1.5px solid rgba(0,0,0,.12)", borderRadius: 12, padding: "11px 12px 11px 38px", fontSize: 14.5, color: c.charcoal, background: "#fff", outline: "none", appearance: "none", paddingRight: 34, cursor: "pointer" };
  const wrap = (icon, node) => (
    <div style={{ position: "relative" }}>
      {React.createElement(icon, { size: 16, color: c.stone, style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" } })}
      {node}
      <ChevronDown size={16} color={c.stone} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      className="tn-hero"
      style={{ position: "relative", overflow: "hidden", background: g.tint, minHeight: 640 }}
    >
      <style>{`
        @keyframes tnFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } }
        @keyframes tnDrift { 0%{ transform: translateX(-4%) } 100%{ transform: translateX(4%) } }
        @keyframes tnShimmer { 0%,100%{ opacity:.5 } 50%{ opacity:.85 } }
        @keyframes tnRise { from{ opacity:0; transform: translateY(24px) } to{ opacity:1; transform: translateY(0) } }
        @keyframes tnSun { 0%,100%{ transform: scale(1); opacity:.9 } 50%{ transform: scale(1.08); opacity:1 } }
        @keyframes tnBirds { 0%{ transform: translateX(-10%) translateY(0) } 50%{ transform: translateX(60%) translateY(-14px) } 100%{ transform: translateX(130%) translateY(4px) } }
        @keyframes tnWave { 0%{ transform: translateX(-1.5%) scaleY(1) } 100%{ transform: translateX(1.5%) scaleY(1.08) } }
        .tn-hero .rise { animation: tnRise .8s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce){ .tn-hero *{ animation:none!important } }
      `}</style>

      {/* ── Depth layers ── */}
      {/* far photo */}
      <img src={heroImage(1800)} alt="" aria-hidden
        style={{ position: "absolute", inset: "-6%", width: "112%", height: "112%", objectFit: "cover", opacity: g.name === "night" ? 0.28 : 0.5, ...layer(0.4) }} />
      {/* color wash */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: g.tint, opacity: 0.62 }} />
      {/* atmospheric glows */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 15% 25%, rgba(34,211,238,.45), transparent 42%), radial-gradient(circle at 85% 78%, ${g.accent}55, transparent 45%)`, ...layer(0.7) }} />
      {/* drifting mist band */}
      <div aria-hidden style={{ position: "absolute", left: "-8%", right: "-8%", top: "38%", height: 180, background: "radial-gradient(60% 100% at 50% 50%, rgba(255,255,255,.16), transparent 70%)", filter: "blur(8px)", animation: "tnDrift 14s ease-in-out infinite alternate", ...layer(1.0) }} />
      {/* light rays / shimmer */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.10) 48%, transparent 62%)", animation: "tnShimmer 7s ease-in-out infinite", pointerEvents: "none" }} />

      {/* ── Animated SVG scene: sun, layered undulating waves, drifting birds ── */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", ...layer(0.55) }}>
        {/* glowing sun */}
        <div style={{ position: "absolute", right: "16%", top: "16%", width: 120, height: 120, borderRadius: 999, background: `radial-gradient(circle, ${g.accent} 0%, ${g.accent}88 40%, transparent 70%)`, filter: "blur(2px)", animation: "tnSun 6s ease-in-out infinite" }} />
        {/* drifting birds */}
        <svg viewBox="0 0 100 20" style={{ position: "absolute", left: "8%", top: "22%", width: 90, opacity: 0.55, color: "#fff", animation: "tnBirds 26s linear infinite" }}>
          <path d="M4 10 Q7 6 10 10 Q13 6 16 10" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M28 7 Q30 4 32 7 Q34 4 36 7" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M50 12 Q52 9 54 12 Q56 9 58 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
      {/* layered waves at the base */}
      <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200, pointerEvents: "none" }}>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path style={{ animation: "tnWave 12s ease-in-out infinite alternate", transformOrigin: "center" }} fill="rgba(255,255,255,.10)" d="M0,120 C240,80 480,160 720,120 C960,80 1200,160 1440,120 L1440,200 L0,200 Z" />
          <path style={{ animation: "tnWave 9s ease-in-out infinite alternate-reverse" }} fill="rgba(255,255,255,.14)" d="M0,150 C288,110 576,180 864,150 C1152,120 1296,170 1440,150 L1440,200 L0,200 Z" />
          <path fill={c.sand} d="M0,178 C360,150 720,196 1080,176 C1260,166 1350,184 1440,178 L1440,200 L0,200 Z" />
        </svg>
      </div>

      {/* film grain for texture */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06, mixBlendMode: "overlay", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      {/* bottom fade into page */}
      <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: `linear-gradient(180deg, transparent, ${c.sand})` }} />

      {/* ── Content ── */}
      <div className="hero-grid" style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "78px 20px 96px", display: "grid", gridTemplateColumns: "1fr", gap: 48 }}>
        <div style={{ transform: `translateY(${scrollY * -0.06}px)` }}>
          <span className="rise" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.16)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "6px 13px", borderRadius: 999, border: "1px solid rgba(255,255,255,.25)", backdropFilter: "blur(6px)" }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: g.accent, boxShadow: `0 0 10px ${g.accent}` }} />
            {g.label} · your local adventure concierge
          </span>
          <h1 className="rise" style={{ color: "#fff", fontSize: "clamp(38px,6.4vw,68px)", lineHeight: 1.0, fontWeight: 800, letterSpacing: -2, margin: "20px 0 0", textShadow: "0 6px 40px rgba(0,0,0,.35)", animationDelay: ".08s" }}>
            Costa Rica adventures,<br /><span style={{ color: g.accent }}>planned by locals.</span>
          </h1>
          <p className="rise" style={{ color: "rgba(255,255,255,.92)", fontSize: 19, lineHeight: 1.6, maxWidth: 540, marginTop: 20, animationDelay: ".16s" }}>
            Build a custom itinerary with vetted local tours, transparent pricing, and real human support — without the guesswork.
          </p>
          <div className="rise" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28, animationDelay: ".24s" }}>
            <Magnetic><Button variant="primary" size="lg" onClick={() => go("build")}>Build my adventure plan <ArrowRight size={18} /></Button></Magnetic>
            <Magnetic strength={0.25}><Button variant="glass" size="lg" onClick={() => go("activities")}>Browse activities</Button></Magnetic>
          </div>
        </div>

        {/* Plan card */}
        <div className="rise" style={{ background: "rgba(255,253,248,.97)", borderRadius: 26, padding: 24, boxShadow: "0 50px 90px -34px rgba(0,0,0,.6)", backdropFilter: "blur(8px)", alignSelf: "start", animation: "tnFloat 7s ease-in-out infinite", animationDelay: ".3s", transform: `translate(${mouse.x * -8}px, ${mouse.y * -6}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Compass size={20} color={c.teal} />
            <span style={{ fontWeight: 800, color: c.charcoal, fontSize: 18 }}>Start your trip plan</span>
          </div>
          <p style={{ color: c.stone, fontSize: 13.5, margin: "0 0 16px" }}>Tell us the basics — your concierge takes it from there.</p>
          <Field label="Destination">
            {wrap(Compass, <select value={plan.dest} onChange={(e) => setPlan({ ...plan, dest: e.target.value })} style={selectStyle}>
              {["Manuel Antonio", "Quepos", "Uvita", "Dominical", "Jacó", "Tamarindo", "Guanacaste", "Not sure yet"].map((o) => <option key={o}>{o}</option>)}
            </select>)}
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Travel dates">
              <div style={{ position: "relative" }}>
                <Calendar size={16} color={c.stone} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input placeholder="e.g. Jul 12–19" value={plan.dates} onChange={(e) => setPlan({ ...plan, dates: e.target.value })} style={{ width: "100%", border: "1.5px solid rgba(0,0,0,.12)", borderRadius: 12, padding: "11px 12px 11px 38px", fontSize: 14.5, color: c.charcoal, outline: "none", boxSizing: "border-box" }} />
              </div>
            </Field>
            <Field label="Group size">
              {wrap(Users, <select value={plan.group} onChange={(e) => setPlan({ ...plan, group: e.target.value })} style={selectStyle}>
                {["1", "2", "3–4", "5–8", "9+"].map((o) => <option key={o}>{o}</option>)}
              </select>)}
            </Field>
          </div>
          <Field label="Trip type">
            {wrap(Heart, <select value={plan.type} onChange={(e) => setPlan({ ...plan, type: e.target.value })} style={selectStyle}>
              {["Family", "Couple / Honeymoon", "Adult group weekend", "Fishing trip", "Adventure", "Luxury group"].map((o) => <option key={o}>{o}</option>)}
            </select>)}
          </Field>
          <Button variant="dark" full size="lg" onClick={() => go("build")} style={{ marginTop: 8 }}>Start planning <ArrowRight size={18} /></Button>
          <p style={{ textAlign: "center", color: c.stone, fontSize: 12, marginTop: 12 }}>Free to plan · Only 20% to reserve · No spam</p>
        </div>
      </div>

      {/* scroll cue */}
      <div aria-hidden style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 2, color: "rgba(255,255,255,.7)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, animation: "tnFloat 2.4s ease-in-out infinite" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>SCROLL</span>
        <ChevronDown size={18} />
      </div>
    </div>
  );
}
