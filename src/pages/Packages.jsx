import React, { useState, useEffect } from "react";
import { ArrowRight, MessageCircle, Clock, Users, Check, X, Star, ShieldCheck, Sparkles, MapPin, Plus } from "lucide-react";
import { c, grad, glass, money, gradText } from "../theme.js";
import { packages, activities } from "../data.js";
import { packageImage, activityImage, heroImage, themedSlides } from "../images.js";

const PKG_SLIDES = themedSlides("fishing", 1800);
import { Section, Eyebrow, Button } from "../components/ui.jsx";
import { TiltCard, Photo, Reveal } from "../motion.jsx";

// Try to map each package inclusion to a real activity (for photos in the drawer).
function itemActivity(label) {
  const l = label.toLowerCase();
  return activities.find((a) => a.title.toLowerCase().includes(l) || a.category.toLowerCase().includes(l) || l.includes(a.category.toLowerCase().split(" ")[0]));
}

// ── One cinematic package card: full-bleed photo, glass info, day-strip ──
function PackageCard({ p, featured, onOpen }) {
  return (
    <TiltCard max={featured ? 6 : 9} radius={24}
      style={{ position: "relative", overflow: "hidden", border: `1px solid ${c.line}`, cursor: "pointer", minHeight: featured ? 460 : 380, display: "flex" }}>
      <div onClick={() => onOpen(p)} style={{ position: "absolute", inset: 0 }}>
        <Photo src={packageImage(p.id, featured ? 1400 : 900)} fallback={grad[p.gradKey] || grad.ocean} alt={p.title} height={featured ? 460 : 380} zoom
          overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.15) 0%, rgba(11,26,46,.35) 45%, rgba(11,26,46,.94) 100%)" }} />} />
      </div>
      {/* content over photo */}
      <div style={{ position: "relative", zIndex: 2, marginTop: "auto", padding: featured ? 28 : 22, width: "100%", pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {featured && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.gold, color: c.ink, padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, letterSpacing: 0.3, boxShadow: "0 0 20px -4px rgba(255,208,0,.8)" }}>
              <Star size={12} fill={c.ink} />MOST POPULAR
            </span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...glass, color: "#fff", padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}><Clock size={12} />{p.length}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...glass, color: "#fff", padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}><Users size={12} />{p.bestFor}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: featured ? 34 : 25, fontWeight: 800, letterSpacing: -1, color: "#fff", lineHeight: 1.05, textShadow: "0 4px 24px rgba(0,0,0,.6)" }}>{p.title}</h3>
        <p style={{ color: "rgba(243,247,255,.82)", fontSize: featured ? 15.5 : 14, lineHeight: 1.5, margin: "8px 0 0", maxWidth: 460 }}>{p.blurb}</p>

        {/* day-strip: little photo chips of what's inside */}
        <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
          {p.items.slice(0, featured ? 5 : 4).map((it, i) => {
            const act = itemActivity(it);
            return (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, ...glass, padding: "5px 10px 5px 5px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: "#fff" }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, overflow: "hidden", flexShrink: 0, background: grad.ocean, backgroundImage: act ? `url(${activityImage(act, 60)})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
                {it.length > 20 ? it.slice(0, 19) + "…" : it}
              </span>
            );
          })}
          {p.items.length > (featured ? 5 : 4) && <span style={{ ...glass, padding: "5px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: c.teal }}>+{p.items.length - (featured ? 5 : 4)} more</span>}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 20, pointerEvents: "auto" }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(243,247,255,.6)", fontWeight: 600 }}>from</div>
            <div style={{ fontSize: featured ? 30 : 24, fontWeight: 800, ...gradText(`linear-gradient(100deg,${c.teal},${c.gold})`) }}>{money(p.price)}<span style={{ fontSize: 13, color: "rgba(243,247,255,.6)", WebkitTextFillColor: "rgba(243,247,255,.6)", fontWeight: 600 }}>/person</span></div>
          </div>
          <Button variant="primary" size={featured ? "md" : "sm"} onClick={() => onOpen(p)}>View this trip <ArrowRight size={15} /></Button>
        </div>
      </div>
    </TiltCard>
  );
}

// ── Cinematic detail drawer ──
function PackageDrawer({ p, onClose, addToTrip }) {
  if (!p) return null;
  const acts = p.items.map((it) => ({ it, a: itemActivity(it) }));
  const addAll = () => { acts.forEach(({ a }) => a && addToTrip(a.id)); onClose(); };
  const days = Math.max(3, Math.min(p.items.length, 7));

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(11,26,46,.75)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: "40px 16px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: c.canvas2, border: `1px solid ${c.line}`, borderRadius: 26, maxWidth: 780, width: "100%", overflow: "hidden", boxShadow: "0 60px 120px -40px rgba(0,0,0,.9)", animation: "tnDrawer .4s cubic-bezier(.2,.7,.2,1) both" }}>
        <style>{`@keyframes tnDrawer{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        {/* hero */}
        <div style={{ position: "relative", height: 240 }}>
          <Photo src={packageImage(p.id, 1400)} fallback={grad[p.gradKey]} alt={p.title} height={240} zoom={false}
            overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.2), rgba(11,26,46,.96))" }} />} />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, zIndex: 3, ...glass, width: 38, height: 38, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><X size={18} /></button>
          <div style={{ position: "absolute", bottom: 20, left: 24, right: 24, zIndex: 2 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...glass, color: "#fff", padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}><Clock size={12} />{p.length}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...glass, color: "#fff", padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}><Users size={12} />{p.bestFor}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, letterSpacing: -1, color: "#fff" }}>{p.title}</h2>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ color: c.stone, fontSize: 16, lineHeight: 1.6, margin: "0 0 22px" }}>{p.blurb}</p>

          {/* day-by-day timeline */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 16, color: c.charcoal, fontWeight: 800, fontSize: 17 }}>
            <Sparkles size={17} color={c.teal} /> Your day-by-day
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {acts.map(({ it, a }, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: 8, borderRadius: 14, background: c.surface2, border: `1px solid ${c.line}` }}>
                <span style={{ width: 30, height: 30, borderRadius: 999, background: grad.hero, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ width: 56, height: 44, borderRadius: 9, overflow: "hidden", flexShrink: 0 }}>
                  <Photo src={a ? activityImage(a, 120) : heroImage(120)} fallback={grad.ocean} alt={it} height={44} zoom={false} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: c.charcoal, fontSize: 14.5 }}>{it}</div>
                  {a && <div style={{ color: c.stone, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{a.region} · {money(a.price)}</div>}
                </div>
                {a && <Check size={16} color={c.teal} style={{ flexShrink: 0 }} />}
              </div>
            ))}
          </div>

          {/* trust row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            {[["Vetted operators", ShieldCheck], ["Only 20% to reserve", Sparkles], ["Concierge coordinated", MessageCircle]].map(([t, Icon]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,211,238,.08)", border: "1px solid rgba(34,211,238,.2)", color: c.teal, padding: "7px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12.5 }}><Icon size={14} />{t}</span>
            ))}
          </div>

          {/* footer / price + actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginTop: 24, paddingTop: 20, borderTop: `1px dashed ${c.line}` }}>
            <div>
              <div style={{ fontSize: 12, color: c.stone }}>from · deposit today {money(p.price * 0.2)}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.charcoal }}>{money(p.price)}<span style={{ fontSize: 14, color: c.stone, fontWeight: 600 }}>/person</span></div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="ghost" onClick={onClose}>Keep browsing</Button>
              <Button variant="primary" onClick={addAll}><Plus size={16} />Add all to my trip</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Packages({ go, addToTrip }) {
  const [open, setOpen] = useState(null);
  const [featured, ...rest] = packages;
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % PKG_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* ── Vivid fishing-forward cinematic hero ── */}
      <div style={{ position: "relative", overflow: "hidden", padding: "88px 20px 64px", minHeight: 340 }}>
        {PKG_SLIDES.map((s, i) => (
          <img key={s.src} src={s.src} alt="" aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              opacity: i === slide ? 1 : 0, transition: "opacity 1.6s ease", transform: "scale(1.06)",
              animation: i === slide ? "tnPkgKen 8s ease-out both" : "none" }} />
        ))}
        <style>{`@keyframes tnPkgKen{from{transform:scale(1.02)}to{transform:scale(1.12)}}`}</style>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.5) 0%, rgba(11,26,46,.34) 42%, rgba(11,26,46,.92) 100%)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 60% at 20% 20%, rgba(34,211,238,.22), transparent 55%), radial-gradient(50% 60% at 85% 80%, rgba(255,208,0,.14), transparent 55%)` }} />
        {/* scene label */}
        <div style={{ position: "absolute", bottom: 16, right: 20, zIndex: 3, display: "flex", alignItems: "center", gap: 10 }}>
          <span key={slide} style={{ background: "rgba(11,26,46,.55)", backdropFilter: "blur(8px)", color: "#fff", padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>{PKG_SLIDES[slide].label}</span>
          <div style={{ display: "flex", gap: 5 }}>
            {PKG_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Scene ${i + 1}`} style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 999, border: "none", cursor: "pointer", background: i === slide ? c.teal : "rgba(255,255,255,.45)", transition: "all .3s", padding: 0 }} />
            ))}
          </div>
        </div>
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
          <Eyebrow><span style={{ color: c.gold }}>Ready-made trips</span></Eyebrow>
          <h1 style={{ color: "#fff", fontSize: "clamp(34px,6vw,60px)", fontWeight: 800, letterSpacing: -2, margin: "6px 0 10px", lineHeight: 1 }}>
            Curated adventure <span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>packages</span>
          </h1>
          <p style={{ color: "rgba(243,247,255,.8)", fontSize: 18, maxWidth: 560, lineHeight: 1.6 }}>
            Pre-built by locals for every kind of traveler. Open one to see the day-by-day — then let your concierge tailor it to your dates.
          </p>
        </div>
      </div>

      <Section bg={c.sand} pad={48}>
        {/* spotlight (featured) */}
        <Reveal>
          <PackageCard p={featured} featured onOpen={setOpen} />
        </Reveal>
        {/* grid of the rest */}
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", marginTop: 20 }}>
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 90}>
              <PackageCard p={p} onOpen={setOpen} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* closing CTA */}
      <Section bg={c.sand} pad={60}>
        <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", border: `1px solid ${c.line}`, background: c.canvas2, padding: "56px 28px", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 80% at 80% 20%, rgba(34,211,238,.18), transparent 55%), radial-gradient(60% 80% at 15% 90%, rgba(255,208,0,.12), transparent 55%)` }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: -1, margin: 0 }}>Nothing fits perfectly?</h2>
            <p style={{ color: "rgba(243,247,255,.8)", fontSize: 17, marginTop: 12, maxWidth: 520, marginInline: "auto" }}>Every package is a starting point. Tell John what you want and he'll build a custom one from scratch.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Build a custom trip <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => window.alert("Opening WhatsApp concierge…")}><MessageCircle size={18} />Ask a local</Button>
            </div>
          </div>
        </div>
      </Section>

      <PackageDrawer p={open} onClose={() => setOpen(null)} addToTrip={addToTrip} />
    </>
  );
}
