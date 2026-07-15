import React, { useEffect, useState } from "react";
import { ArrowRight, Heart, ThumbsDown, Waves, Sun, Bird, ShieldCheck, Cloud, Map, Sparkles } from "lucide-react";
import { c, grad, glass } from "../theme.js";
import { activities } from "../data.js";
import { Section, Button } from "../components/ui.jsx";
import { Reveal, useCountUp, Photo } from "../motion.jsx";
import { TicoFace } from "../components/TicoFace.jsx";
import { TicoRanked } from "../components/TicoRanked.jsx";
import { heroSlides, cdnImage } from "../images.js";
import { LIFE, CREDENTIALS, KNOWLEDGE, LORE } from "../intelligence/ticoPersona.js";

const KICON = { waves: Waves, sun: Sun, bird: Bird, shield: ShieldCheck, cloud: Cloud, map: Map };

// A single live credential counter (animates when the hero mounts).
function Stat({ value, suffix, label, sub, delay = 0 }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay); return () => clearTimeout(t); }, [delay]);
  const n = useCountUp(go ? value : 0, 1100);
  const shown = value >= 1000 ? n.toLocaleString() : n;
  return (
    <div style={{ textAlign: "center", minWidth: 96 }}>
      <div style={{ fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1, textShadow: "0 2px 20px rgba(34,211,238,.5)" }}>
        {shown}{suffix}
      </div>
      <div style={{ color: c.gold, fontWeight: 800, fontSize: 12, marginTop: 5, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ color: "rgba(243,247,255,.6)", fontSize: 11, marginTop: 2, maxWidth: 130, marginInline: "auto", lineHeight: 1.3 }}>{sub}</div>
    </div>
  );
}

export function MeetTicoPage({ go, addToTrip, trip, viewActivity }) {
  const slides = heroSlides(1900);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <>
      {/* ══ CINEMATIC HERO ══ Tico perched over his coast, with his résumé ══ */}
      <div style={{ position: "relative", overflow: "hidden", minHeight: "min(88vh, 780px)", display: "flex", alignItems: "center" }}>
        {/* live cross-fading Costa Rica backdrop — HIS world */}
        {slides.map((s, i) => (
          <div key={i} aria-hidden style={{
            position: "absolute", inset: 0, backgroundImage: `url(${s.src})`, backgroundSize: "cover", backgroundPosition: "center",
            opacity: i === slide ? 1 : 0, transition: "opacity 1.6s ease", transform: "scale(1.06)",
            animation: i === slide ? "ticoKen 8s ease-out both" : "none",
          }} />
        ))}
        {/* cinematic wash so text + bird pop */}
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.55) 0%, rgba(11,26,46,.35) 40%, rgba(11,26,46,.92) 100%)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 60% at 30% 40%, rgba(34,211,238,.22), transparent 60%)" }} />

        <style>{`
          @keyframes ticoKen { from{ transform: scale(1.02) } to{ transform: scale(1.12) } }
          @keyframes ticoRise { from{ opacity:0; transform: translateY(20px) } to{ opacity:1; transform: translateY(0) } }
          @keyframes ticoPerch { 0%,100%{ transform: translateY(0) rotate(-1deg) } 50%{ transform: translateY(-8px) rotate(1.5deg) } }
          @media(prefers-reduced-motion:reduce){ [style*="ticoKen"],[style*="ticoPerch"]{ animation:none!important } }
        `}</style>

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1120, margin: "0 auto", padding: "40px 20px", display: "grid", gap: 24, alignItems: "center", gridTemplateColumns: "1fr" }} className="tico-hero-grid">
          {/* Tico, perched and huge */}
          <div style={{ textAlign: "center", order: 2 }} className="tico-hero-bird">
            <div style={{ position: "relative", display: "inline-block", animation: "ticoPerch 5s ease-in-out infinite" }}>
              <div aria-hidden style={{ position: "absolute", inset: -30, borderRadius: 999, background: "radial-gradient(circle, rgba(34,211,238,.45), transparent 70%)", filter: "blur(14px)" }} />
              <div style={{ position: "relative" }}><TicoFace size={200} mood="proud" /></div>
            </div>
          </div>

          {/* His billing */}
          <div style={{ order: 1 }} className="tico-hero-copy">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, ...glass, color: c.gold, padding: "6px 13px", borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 16, animation: "ticoRise .5s .05s both" }}>
              <Sparkles size={14} /> Meet Rico the Tico · your local intelligence
            </div>
            <h1 style={{ color: "#fff", fontSize: "clamp(38px,6vw,68px)", fontWeight: 900, letterSpacing: -2, lineHeight: 0.98, margin: 0, animation: "ticoRise .5s .12s both" }}>
              The smartest bird<br />in <span style={{ color: c.gold }}>Costa Rica.</span>
            </h1>
            <p style={{ color: "rgba(243,247,255,.9)", fontSize: "clamp(16px,2vw,18px)", lineHeight: 1.55, margin: "18px 0 0", maxWidth: 520, animation: "ticoRise .5s .2s both" }}>
              I'm Rico the Tico — a scarlet macaw who's flown every metre of this coast. I don't guess. I <b style={{ color: "#fff" }}>know</b> — the tides, the seasons, the wildlife, every honest guide. Now that mind works for you.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24, animation: "ticoRise .5s .28s both" }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Plan with me <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => go("activities")}>See what I rate</Button>
            </div>
          </div>
        </div>

        {/* résumé stat strip pinned to the bottom of the hero */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 3, borderTop: "1px solid rgba(127,166,232,.18)", background: "rgba(11,26,46,.55)", backdropFilter: "blur(10px)" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "18px 20px", display: "flex", gap: 18, justifyContent: "space-around", flexWrap: "wrap" }}>
            {CREDENTIALS.map((s, i) => <Stat key={s.label} {...s} delay={250 + i * 130} />)}
          </div>
        </div>

        <style>{`
          @media(min-width:900px){
            .tico-hero-grid{ grid-template-columns: 1.05fr .95fr!important; padding-bottom:120px!important }
            .tico-hero-bird{ order:2!important } .tico-hero-copy{ order:1!important }
          }
          @media(max-width:899px){ .tico-hero-grid{ padding-bottom:150px!important } }
        `}</style>
      </div>

      {/* ══ WHAT TICO KNOWS ══ proof of genius ══ */}
      <Section bg={c.sand}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 32px" }}>
          <div style={{ color: c.teal, fontWeight: 800, fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>Why travelers trust the bird</div>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, letterSpacing: -1, margin: "8px 0 0" }}>What Rico knows</h2>
        </div>
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))" }}>
          {KNOWLEDGE.map((k, i) => {
            const Ico = KICON[k.icon] || Sparkles;
            return (
              <Reveal key={k.title} delay={(i % 3) * 70}>
                <div style={{ position: "relative", overflow: "hidden", background: c.white, border: `1px solid ${c.line}`, borderRadius: 20, height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* cinematic photo top */}
                  <div style={{ position: "relative" }}>
                    <Photo src={cdnImage(k.img, 640)} fallback={grad.jungle} alt={k.title} height={158}
                      overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.15) 0%, transparent 30%, rgba(11,26,46,.92) 100%)" }} />} />
                    {/* icon badge */}
                    <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2, display: "inline-flex", width: 42, height: 42, borderRadius: 12, background: grad.jungle, alignItems: "center", justifyContent: "center", boxShadow: "0 0 22px -6px rgba(34,211,238,.9)", border: "1px solid rgba(255,255,255,.15)" }}>
                      <Ico size={20} color="#fff" />
                    </span>
                    {/* stat chip */}
                    <span style={{ position: "absolute", top: 14, right: 12, zIndex: 2, background: "rgba(255,208,0,.92)", color: c.ink, fontWeight: 900, fontSize: 11.5, padding: "4px 10px", borderRadius: 999, letterSpacing: 0.2, boxShadow: "0 0 16px -4px rgba(255,208,0,.8)" }}>{k.stat}</span>
                    {/* title over image */}
                    <h3 style={{ position: "absolute", bottom: 11, left: 14, right: 14, zIndex: 2, margin: 0, color: "#fff", fontSize: 18.5, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.1, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>{k.title}</h3>
                  </div>
                  {/* Tico's line */}
                  <div style={{ padding: "14px 16px 16px", display: "flex", gap: 9, alignItems: "flex-start", flex: 1 }}>
                    <TicoFace size={24} glow={false} mood="proud" animate={false} />
                    <p style={{ margin: 0, color: c.charcoal, fontSize: 13.5, lineHeight: 1.55, fontStyle: "italic", opacity: 0.92 }}>"{k.line}"</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ══ HOW I RATE ══ the honesty system ══ */}
      <Section bg={c.sand} pad={30}>
        <Reveal>
          <div style={{ ...glass, borderRadius: 22, padding: "clamp(22px,4vw,32px)", maxWidth: 820, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
              <TicoFace size={44} mood="proud" />
              <h2 style={{ margin: 0, color: "#fff", fontSize: 22, fontWeight: 800 }}>How I rate — and why you can trust it</h2>
            </div>
            <p style={{ color: c.stone, fontSize: 15, lineHeight: 1.6, margin: "0 0 18px" }}>
              I don't hand out stars for fun. Every experience is scored on the operator, how in-season it is right now, the value, and whether it's the real thing or a trap. Then I give it to you straight:
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { mood: "excited", label: "A perch-topper", range: "4.9–5.0", body: "This is a 10. I'd fly across the country for it.", bar: "100%", col: c.gold },
                { mood: "proud", label: "Rico's Pick", range: "4.7+", body: "Yes. This is the good stuff. Book it.", bar: "88%", col: c.teal },
                { mood: "happy", label: "Really solid", range: "4.4+", body: "You'll be glad you did it. No notes.", bar: "70%", col: c.blue },
                { mood: "chill", label: "Worth it if it fits", range: "4.0+", body: "Good, not life-changing. Do it if it fits the day.", bar: "52%", col: c.blue },
                { mood: "unimpressed", label: "Only if you're curious", range: "<4.0", body: "Eh. I've got better for you, honestly.", bar: "32%", col: c.stone },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(34,211,238,.05)", border: `1px solid ${c.line}`, borderRadius: 13, padding: "12px 14px" }}>
                  <TicoFace size={34} mood={r.mood} glow={false} animate={false} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ color: c.charcoal, fontWeight: 800, fontSize: 14 }}>{r.label}</span>
                      <span style={{ color: r.col, fontWeight: 800, fontSize: 12 }}>{r.range}</span>
                    </div>
                    <div style={{ color: c.stone, fontSize: 13, fontStyle: "italic", margin: "2px 0 6px" }}>"{r.body}"</div>
                    <div style={{ height: 5, borderRadius: 999, background: "rgba(127,166,232,.14)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: r.bar, borderRadius: 999, background: r.col }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ══ PERSONALITY ══ loves / can't stand, as rich cards ══ */}
      <Section bg={c.sand} pad={30}>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 820, margin: "0 auto" }}>
          <Reveal>
            <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, rgba(255,111,165,.10), rgba(19,41,74,1) 55%)", border: "1px solid rgba(255,111,165,.25)", borderRadius: 20, padding: 24, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16, color: "#FF6FA5", fontWeight: 800, fontSize: 16 }}>
                <span style={{ display: "inline-flex", width: 34, height: 34, borderRadius: 10, background: "rgba(255,111,165,.16)", alignItems: "center", justifyContent: "center" }}><Heart size={17} /></span>
                Things I love
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LIFE.loves.map((l) => (
                  <div key={l} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ color: "#FF6FA5", marginTop: 2, flexShrink: 0 }}>♥</span>
                    <span style={{ color: c.charcoal, fontSize: 13.5, lineHeight: 1.45 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, rgba(127,166,232,.10), rgba(19,41,74,1) 55%)", border: `1px solid ${c.line}`, borderRadius: 20, padding: 24, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16, color: c.stone, fontWeight: 800, fontSize: 16 }}>
                <span style={{ display: "inline-flex", width: 34, height: 34, borderRadius: 10, background: "rgba(127,166,232,.14)", alignItems: "center", justifyContent: "center" }}><ThumbsDown size={16} /></span>
                Things I can't stand
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LIFE.against.map((l) => (
                  <div key={l} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ color: c.stone, marginTop: 1, flexShrink: 0, fontWeight: 900 }}>✕</span>
                    <span style={{ color: c.charcoal, fontSize: 13.5, lineHeight: 1.45 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <style>{`@media(min-width:760px){.two-col{grid-template-columns:1fr 1fr!important}}`}</style>
      </Section>

      {/* ══ HIS LEGEND ══ the myth, briefly ══ */}
      <Section bg={c.sand} pad={30}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, letterSpacing: -0.5, margin: "0 0 20px", textAlign: "center" }}>The legend of Rico the Tico</h2>
          <div style={{ position: "relative", paddingLeft: 26 }}>
            <div aria-hidden style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 2, background: `linear-gradient(${c.teal},${c.blue})`, opacity: 0.4 }} />
            {LORE.map((l, i) => (
              <Reveal key={l.year} delay={i * 80}>
                <div style={{ position: "relative", marginBottom: 18 }}>
                  <span style={{ position: "absolute", left: -26, top: 3, width: 16, height: 16, borderRadius: 999, background: i === LORE.length - 1 ? c.gold : c.teal, boxShadow: `0 0 12px -2px ${i === LORE.length - 1 ? c.gold : c.teal}`, border: "3px solid #0B1A2E" }} />
                  <div style={{ color: i === LORE.length - 1 ? c.gold : c.teal, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>{l.year}</div>
                  <div style={{ color: c.charcoal, fontSize: 14.5, lineHeight: 1.5, marginTop: 3 }}>{l.text}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ══ ALL-TIME FAVORITES ══ the list you liked, kept ══ */}
      <Section bg={c.sand}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18, maxWidth: 820, marginInline: "auto" }}>
          <TicoFace size={44} mood="excited" />
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, letterSpacing: -0.4 }}>My all-time favorites</h2>
            <p style={{ margin: "4px 0 0", color: c.stone, fontSize: 14 }}><b style={{ color: c.teal }}>Rico:</b> <span style={{ fontStyle: "italic" }}>"If you only did my top few, you'd still go home happy. Ranked, most-loved first."</span></p>
          </div>
        </div>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Reveal><TicoRanked items={activities} limit={6} onView={viewActivity} onAdd={addToTrip} trip={trip} /></Reveal>
        </div>
      </Section>
    </>
  );
}
