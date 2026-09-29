import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, MapPin, Search, ShieldCheck, Sparkles, Route } from "lucide-react";
import { c, glass } from "../theme.js";
import { themedSlides } from "../images.js";

// Vivid, fishing-forward home backdrop — distinct from the Meet Tico hero.
const SLIDES = themedSlides("home", 1900);

// Time-of-day accent — the glow shifts with the visitor's local hour.
function timeGrade(hour) {
  if (hour >= 5 && hour < 12) return { accent: "#FF9E7A", label: "Good morning" };
  if (hour >= 12 && hour < 17) return { accent: c.teal, label: "Good afternoon" };
  if (hour >= 17 && hour < 21) return { accent: c.gold, label: "Good evening" };
  return { accent: "#7DD3FC", label: "Good evening" };
}

export function CinematicHero({ go, onSearch }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [hour, setHour] = useState(12);
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
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
  const submitSearch = (event) => {
    event.preventDefault();
    if (onSearch) onSearch(query, date);
    else go("activities");
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      className="tn-hero"
      style={{ position: "relative", overflow: "hidden", background: c.sand, minHeight: 700 }}
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
        .tn-hero .hero-grid { grid-template-columns: 1fr !important; }
        .tn-hero-content { max-width: 1280px !important; }
        .tn-hero-content > * { min-width: 0; }
        .tn-hero-copy { max-width: 880px; }
        .tn-hero-mobile-copy { display: none; }
        .tn-hero-title-line { display: block; }
        .tn-hero-accent-line {
          position: relative;
          display: block;
          width: fit-content;
          max-width: 100%;
          margin-top: 4px;
          padding-bottom: 11px;
        }
        .tn-hero-accent-lead,
        .tn-hero-accent-finish { display: inline-block; }
        .tn-hero-accent-finish { margin-left: .22em; }
        .tn-hero-search {
          width: min(820px,100%);
          display: grid;
          grid-template-columns: minmax(0,1.35fr) minmax(190px,.65fr) 60px;
          align-items: center;
          gap: 0;
          margin-top: 30px;
          padding: 8px;
          border: 1px solid rgba(255,255,255,.6);
          border-radius: 28px;
          background: rgba(251,253,255,.94);
          box-shadow: 0 30px 80px -34px rgba(0,0,0,.9), 0 0 42px -22px rgba(34,211,238,.8);
          backdrop-filter: blur(18px);
        }
        .tn-search-field { min-width:0;display:grid;grid-template-columns:28px minmax(0,1fr);grid-template-rows:auto auto;column-gap:10px;align-items:center;padding:10px 18px; }
        .tn-search-field + .tn-search-field { border-left:1px solid rgba(11,26,46,.14); }
        .tn-search-field > svg { grid-row:1 / 3;color:#058da1; }
        .tn-search-field label { color:${c.ink};font-size:14.5px;font-weight:900;letter-spacing:.01em; }
        .tn-search-field input { min-width:0;width:100%;border:0;outline:0;background:transparent;color:${c.ink};font:inherit;font-size:18px;padding:4px 0 0; }
        .tn-search-field input::placeholder { color:rgba(11,26,46,.5); }
        .tn-hero-search button { width:56px;height:56px;display:grid;place-items:center;border:0;border-radius:50%;background:${c.gold};color:${c.ink};cursor:pointer;box-shadow:0 12px 28px -12px rgba(255,208,0,.9);transition:transform .18s ease,box-shadow .18s ease; }
        .tn-hero-search button:hover { transform:scale(1.05);box-shadow:0 16px 36px -12px rgba(255,208,0,1); }
        @media (prefers-reduced-motion: reduce){ .tn-hero *{ animation:none!important } }
        @media (min-width: 980px){
          .tn-hero-content { padding: 74px 28px 92px !important; }
        }
        @media (min-width: 821px) and (max-width: 979px){
          .tn-hero-content { padding: 64px 28px 84px !important; gap: 44px !important; }
        }
        /* ── Mobile hero polish ── hide the desktop sun/bird blob, preserve
           readable line lengths, and give the stacked layout room to breathe. */
        @media (max-width: 820px){
          .tn-hero { min-height: auto !important; }
          .tn-hero-scene { display: none !important; }
          .tn-hero-content { padding: 60px clamp(24px,5vw,40px) 72px !important; }
          .tn-hero-image {
            object-position: var(--mobile-position) !important;
            transform: none !important;
          }
        }
        @media (max-width: 520px){
          .tn-hero-content { padding: 40px 18px 48px !important; }
          .tn-hero-copy { width: 100%; max-width: none; overflow: visible; }
          .tn-hero .tn-h1 {
            width: 100%;
            max-width: none;
            font-size: clamp(42px,12vw,50px) !important;
            line-height: .98 !important;
            letter-spacing: -1.7px !important;
          }
          .tn-hero-accent-line { width: 100%; max-width: none; }
          .tn-hero-accent-finish { display: block; margin-left: 0; }
          .tn-hero-desktop-copy { display: none; }
          .tn-hero-mobile-copy {
            display: block;
            margin-top: 22px !important;
            max-width: 31ch !important;
            font-size: 15.5px !important;
            line-height: 1.55 !important;
          }
          .tn-hero-search {
            grid-template-columns:minmax(0,1fr) 58px;
            margin-top:24px;
            padding:5px;
            border-radius:20px;
          }
          .tn-search-field { grid-template-columns:22px minmax(0,1fr);column-gap:9px;padding:8px 10px; }
          .tn-search-field:first-child { grid-column:1 / -1;padding:9px 12px 10px;border-bottom:1px solid rgba(11,26,46,.12); }
          .tn-search-field + .tn-search-field { border-left:0; }
          .tn-search-field > svg { width:17px; }
          .tn-search-field label { font-size:12.5px; }
          .tn-search-field input { font-size:15.5px;padding-top:2px; }
          .tn-hero-search button { width:44px;height:44px;justify-self:end; }
          .tn-hero-trust { margin-top: 20px !important; gap: 11px !important; }
          .tn-hero-trust > span:first-child { display: none !important; }
        }
      `}</style>

      {/* ── Cinematic carousel, full-bleed, cross-fading + scroll-scrubbed ──
          Backdrop sits "further back": minimal zoom so the WHOLE scene shows
          (fishing boats, parasailing, waterfalls) instead of a tight crop. Only
          a light mouse/scroll parallax drift, no compounding scale. */}
      <div style={{ position: "absolute", inset: 0, transform: `translate3d(${mouse.x * 8}px, ${mouse.y * 6 + scrollY * 0.06}px, 0)`, transition: "transform .18s cubic-bezier(.2,.7,.2,1)" }}>
        {SLIDES.map((s, i) => (
          <img key={s.src} className="tn-hero-image" src={s.src} alt="" aria-hidden loading={i === 0 ? "eager" : "lazy"} fetchpriority={i === 0 ? "high" : "low"} decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: s.desktopPosition,
              "--mobile-position": s.mobilePosition,
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
              style={{ width: 32, height: 44, border: "none", cursor: "pointer", background: "transparent", padding: 0, display: "grid", placeItems: "center" }}>
              <span aria-hidden style={{ display: "block", width: i === slide ? 20 : 7, height: 7, borderRadius: 999, background: i === slide ? c.teal : "rgba(255,255,255,.4)", transition: "all .3s" }} />
            </button>
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
        <div className="tn-hero-copy" style={{ transform: `translateY(${scrollY * -0.08}px)`, opacity: 1 - scrub * 0.6 }}>
          <h1 className="rise tn-h1" style={{ color: "#fff", fontSize: "clamp(58px,5.8vw,84px)", lineHeight: .98, fontWeight: 800, letterSpacing: "clamp(-3.8px,-.22vw,-2px)", margin: 0, animationDelay: ".08s", textWrap: "balance" }}>
            <span className="tn-hero-title-line">Costa Rica,</span>
            <span className="tn-hero-accent-line">
              <span className="tn-hero-accent-lead" style={{ color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,.35)" }}>made</span>
              <span className="tn-hero-accent-finish" style={{ color: c.gold, textShadow: "0 0 28px rgba(255,208,0,.2)" }}>simple.</span>
              <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, borderRadius: 999, background: c.teal, boxShadow: "0 0 18px rgba(34,211,238,.24)", opacity: 0.72 }} />
            </span>
          </h1>
          <p className="rise tn-hero-desktop-copy" style={{ color: "rgba(243,247,255,.78)", fontSize: 18, lineHeight: 1.7, maxWidth: 560, marginTop: 32, animationDelay: ".16s" }}>
            Search by place or activity. Add your travel date if you know it.
          </p>
          <p className="rise tn-hero-mobile-copy" style={{ color: "rgba(243,247,255,.82)", animationDelay: ".16s" }}>
            Search by place or activity. Add your date if you know it.
          </p>

          <form className="rise tn-hero-search" onSubmit={submitSearch} role="search" style={{ animationDelay: ".19s" }}>
            <span className="tn-search-field">
              <MapPin size={20} aria-hidden="true" />
              <label htmlFor="hero-where">Where to?</label>
              <input id="hero-where" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Place or activity" />
            </span>
            <span className="tn-search-field">
              <CalendarDays size={20} aria-hidden="true" />
              <label htmlFor="hero-when">When</label>
              <input id="hero-when" type="date" aria-label="When" value={date} onChange={(event) => setDate(event.target.value)} />
            </span>
            <button type="submit" aria-label="Search experiences"><Search size={22} /></button>
          </form>

          {/* refined trust row */}
          <div className="rise tn-hero-trust" style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 24, animationDelay: ".2s" }}>
            {[[Sparkles, "A smaller, curated selection"], [Route, "Built around your route"], [ShieldCheck, "Details confirmed first"]].map(([Icon, t]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(243,247,255,.72)", fontSize: 13.5, fontWeight: 600 }}>
                <Icon size={15} color={c.teal} />{t}
              </span>
            ))}
          </div>

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
