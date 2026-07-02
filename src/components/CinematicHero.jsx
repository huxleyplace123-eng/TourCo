import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Compass, Calendar, Users, Heart, ChevronDown, ShieldCheck, Sparkles, MessageCircle, Star } from "lucide-react";
import { c, grad, glass, gradText } from "../theme.js";
import { themedSlides, personImage } from "../images.js";
import { Button, Field } from "./ui.jsx";
import { Magnetic } from "../motion.jsx";

// Vivid, fishing-forward home backdrop — distinct from the Meet Tico hero.
const SLIDES = themedSlides("home", 1900);

// Time-of-day accent — the glow shifts with the visitor's local hour.
function timeGrade(hour) {
  if (hour >= 5 && hour < 12) return { accent: "#FF9E7A", label: "Good morning" };
  if (hour >= 12 && hour < 17) return { accent: c.teal, label: "Good afternoon" };
  if (hour >= 17 && hour < 21) return { accent: c.gold, label: "Good evening" };
  return { accent: "#7DD3FC", label: "Good evening" };
}

export function CinematicHero({ go }) {
  const [plan, setPlan] = useState({ dest: "Manuel Antonio", dates: "", group: "2", type: "Couple / Honeymoon" });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [hour, setHour] = useState(12);
  const [slide, setSlide] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    setHour(new Date().getHours());
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    // rotate the hero backdrop through beautiful Costa Rica scenes
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => { window.removeEventListener("scroll", onScroll); clearInterval(id); };
  }, []);

  const onMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouse({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
  };

  const g = timeGrade(hour);
  const layer = (depth) => ({
    transform: `translate3d(${mouse.x * depth * 16}px, ${mouse.y * depth * 12 + scrollY * depth * 0.15}px, 0) scale(${1.08 + depth * 0.05})`,
    transition: "transform .18s cubic-bezier(.2,.7,.2,1)",
  });
  // Scroll-scrub: image scales up + fades as you scroll past the hero.
  const scrub = Math.min(1, scrollY / 700);

  const selectStyle = { width: "100%", border: `1.5px solid ${c.line}`, borderRadius: 12, padding: "11px 12px 11px 38px", fontSize: 14.5, color: c.charcoal, background: "rgba(255,255,255,.05)", outline: "none", appearance: "none", paddingRight: 34, cursor: "pointer" };
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
      style={{ position: "relative", overflow: "hidden", background: c.sand, minHeight: 720 }}
    >
      <style>{`
        @keyframes tnFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } }
        @keyframes tnShimmer { 0%,100%{ opacity:.4 } 50%{ opacity:.8 } }
        @keyframes tnRise { from{ opacity:0; transform: translateY(30px) } to{ opacity:1; transform: translateY(0) } }
        @keyframes tnSun { 0%,100%{ transform: scale(1); opacity:.85 } 50%{ transform: scale(1.1); opacity:1 } }
        @keyframes tnBirds { 0%{ transform: translateX(-10%) translateY(0) } 50%{ transform: translateX(60%) translateY(-16px) } 100%{ transform: translateX(130%) translateY(6px) } }
        @keyframes tnWave { 0%{ transform: translateX(-1.5%) scaleY(1) } 100%{ transform: translateX(1.5%) scaleY(1.1) } }
        @keyframes tnBorder { 0%{ background-position: 0% 50% } 100%{ background-position: 200% 50% } }
        .tn-hero .rise { animation: tnRise .9s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce){ .tn-hero *{ animation:none!important } }
        /* ── Mobile hero polish ── hide the desktop sun/bird blob (ugly behind
           text), tighten top spacing, and let the photo show through more. */
        @media (max-width: 820px){
          .tn-hero { min-height: auto !important; }
          .tn-hero-scene { display: none !important; }
          .tn-hero-content { padding: 40px 20px 70px !important; gap: 26px !important; }
        }
      `}</style>

      {/* ── Cinematic carousel, full-bleed, cross-fading + scroll-scrubbed ──
          Backdrop sits "further back": minimal zoom so the WHOLE scene shows
          (fishing boats, parasailing, waterfalls) instead of a tight crop. Only
          a light mouse/scroll parallax drift, no compounding scale. */}
      <div style={{ position: "absolute", inset: 0, transform: `translate3d(${mouse.x * 8}px, ${mouse.y * 6 + scrollY * 0.06}px, 0)`, transition: "transform .18s cubic-bezier(.2,.7,.2,1)" }}>
        {SLIDES.map((s, i) => (
          <img key={s.src} src={s.src} alt="" aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center",
              opacity: (i === slide ? 1 : 0) * (1 - scrub * 0.5),
              transform: `scale(${1 + scrub * 0.12})`,
              transition: "opacity 1.6s ease, transform 6s ease" }} />
        ))}
      </div>
      {/* cinematic wash — dark enough on the left for the copy + plan card, but
          lets the vivid photo shine through on the right (like the Meet Tico hero) */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(11,26,46,.9) 0%, rgba(11,26,46,.62) 42%, rgba(11,26,46,.24) 72%, rgba(11,26,46,.12) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 0%, transparent 45%, rgba(11,26,46,.55) 100%)" }} />
      {/* scene label + slide dots */}
      <div style={{ position: "absolute", bottom: 20, right: 24, zIndex: 3, display: "flex", alignItems: "center", gap: 12, opacity: 1 - scrub }}>
        <span key={slide} style={{ ...glass, color: "#fff", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, animation: "tnRise .6s ease both" }}>{SLIDES[slide].label}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {SLIDES.map((_, i) => (
            <button key={i} className="tn-dot" onClick={() => setSlide(i)} aria-label={`Scene ${i + 1}`}
              style={{ width: i === slide ? 20 : 7, height: 7, borderRadius: 999, border: "none", cursor: "pointer", background: i === slide ? c.teal : "rgba(255,255,255,.4)", transition: "all .3s", padding: 0 }} />
          ))}
        </div>
      </div>
      {/* aurora + accent glows */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 60% at 12% 18%, ${g.accent}33, transparent 55%), radial-gradient(45% 55% at 88% 75%, rgba(34,211,238,.28), transparent 55%)`, ...layer(0.8) }} />
      {/* light rays */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 35%, rgba(255,255,255,.06) 50%, transparent 65%)", animation: "tnShimmer 8s ease-in-out infinite", pointerEvents: "none" }} />

      {/* animated scene: sun, birds — desktop only (the sun blob is ugly behind
          mobile text, so it's hidden under 820px via .tn-hero-scene) */}
      <div className="tn-hero-scene" aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", ...layer(0.6) }}>
        <div style={{ position: "absolute", right: "14%", top: "14%", width: 130, height: 130, borderRadius: 999, background: `radial-gradient(circle, ${g.accent} 0%, ${g.accent}66 40%, transparent 70%)`, filter: "blur(3px)", animation: "tnSun 6s ease-in-out infinite" }} />
        <svg viewBox="0 0 100 20" style={{ position: "absolute", left: "6%", top: "20%", width: 90, opacity: 0.5, color: "#fff", animation: "tnBirds 28s linear infinite" }}>
          <path d="M4 10 Q7 6 10 10 Q13 6 16 10" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M28 7 Q30 4 32 7 Q34 4 36 7" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M50 12 Q52 9 54 12 Q56 9 58 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="hero-grid tn-hero-content" style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "88px 20px 116px", display: "grid", gridTemplateColumns: "1fr", gap: 56, alignItems: "center" }}>
        <div style={{ transform: `translateY(${scrollY * -0.08}px)`, opacity: 1 - scrub * 0.6 }}>
          <span className="rise" style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass, color: "#fff", fontWeight: 600, fontSize: 12.5, padding: "8px 15px", borderRadius: 999, letterSpacing: 0.2 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: g.accent, boxShadow: `0 0 12px ${g.accent}` }} />
            {g.label} · your local adventure concierge
          </span>
          <h1 className="rise tn-h1" style={{ color: "#fff", fontSize: "clamp(40px,5.6vw,68px)", lineHeight: 1.02, fontWeight: 800, letterSpacing: -2, margin: "24px 0 0", animationDelay: ".08s" }}>
            Costa Rica adventures,<br />
            <span style={{ position: "relative", display: "inline-block" }}>
              <span style={{ ...gradText(`linear-gradient(100deg,${c.teal} 10%,${c.gold})`), filter: `drop-shadow(0 0 28px ${g.accent}44)` }}>planned by locals.</span>
              <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: -6, height: 3, borderRadius: 999, background: `linear-gradient(90deg,${c.teal},${c.gold})`, opacity: 0.5 }} />
            </span>
          </h1>
          <p className="rise" style={{ color: "rgba(243,247,255,.78)", fontSize: 18, lineHeight: 1.65, maxWidth: 460, marginTop: 22, animationDelay: ".16s" }}>
            Build a custom itinerary with vetted local tours, transparent pricing, and real human support — without the guesswork.
          </p>

          {/* refined trust row */}
          <div className="rise" style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 24, animationDelay: ".2s" }}>
            {[[ShieldCheck, "Vetted operators"], [Sparkles, "Only 20% to reserve"], [MessageCircle, "Human concierge"]].map(([Icon, t]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(243,247,255,.72)", fontSize: 13.5, fontWeight: 600 }}>
                <Icon size={15} color={c.teal} />{t}
              </span>
            ))}
          </div>

          <div className="rise" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28, animationDelay: ".24s" }}>
            <Magnetic><Button variant="primary" size="lg" onClick={() => go("build")}>Build my adventure plan <ArrowRight size={18} /></Button></Magnetic>
            <Magnetic strength={0.25}><Button variant="glass" size="lg" onClick={() => go("activities")}>Browse activities</Button></Magnetic>
          </div>

          {/* social proof — avatar stack + rating, balances the card's weight */}
          <div className="rise" style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 30, animationDelay: ".3s" }}>
            <div style={{ display: "flex" }}>
              {["sarah", "delgado", "crew", "emma"].map((who, i) => (
                <span key={who} style={{ width: 38, height: 38, borderRadius: 999, overflow: "hidden", border: `2px solid ${c.sand}`, marginLeft: i ? -12 : 0, background: grad.ocean, flexShrink: 0 }}>
                  <img src={personImage(who, 80)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </span>
              ))}
            </div>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {[0, 1, 2, 3, 4].map((k) => <Star key={k} size={14} fill={c.gold} color={c.gold} />)}
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginLeft: 4 }}>4.9</span>
              </div>
              <div style={{ color: "rgba(243,247,255,.65)", fontSize: 13, fontWeight: 500 }}>Loved by 4,200+ travelers</div>
            </div>
          </div>
        </div>

        {/* Plan card — glass */}
        <div className="rise" style={{ ...glass, background: "rgba(14,21,38,.72)", borderRadius: 26, padding: 24, boxShadow: "0 50px 100px -34px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.08)", alignSelf: "start", animation: "tnFloat 7s ease-in-out infinite", animationDelay: ".3s", transform: `translate(${mouse.x * -10}px, ${mouse.y * -8}px)` }}>
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
                <input placeholder="e.g. Jul 12–19" value={plan.dates} onChange={(e) => setPlan({ ...plan, dates: e.target.value })} style={{ width: "100%", border: `1.5px solid ${c.line}`, borderRadius: 12, padding: "11px 12px 11px 38px", fontSize: 14.5, color: c.charcoal, background: "rgba(255,255,255,.05)", outline: "none", boxSizing: "border-box" }} />
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

      {/* layered waves fading into canvas */}
      <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160, pointerEvents: "none" }}>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path style={{ animation: "tnWave 12s ease-in-out infinite alternate" }} fill="rgba(34,211,238,.06)" d="M0,120 C240,80 480,160 720,120 C960,80 1200,160 1440,120 L1440,200 L0,200 Z" />
          <path style={{ animation: "tnWave 9s ease-in-out infinite alternate-reverse" }} fill="rgba(34,211,238,.08)" d="M0,150 C288,110 576,180 864,150 C1152,120 1296,170 1440,150 L1440,200 L0,200 Z" />
          <path fill={c.sand} d="M0,178 C360,150 720,196 1080,176 C1260,166 1350,184 1440,178 L1440,200 L0,200 Z" />
        </svg>
      </div>

      {/* scroll cue */}
      <div aria-hidden style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 2, color: "rgba(243,247,255,.6)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, animation: "tnFloat 2.4s ease-in-out infinite" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>SCROLL</span>
        <ChevronDown size={18} />
      </div>
    </div>
  );
}
