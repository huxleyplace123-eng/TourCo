import React, { useEffect, useState } from "react";
import { c, grad, gradText } from "../theme.js";
import { Eyebrow } from "./ui.jsx";

// ── PageHero ── one cinematic, on-brand hero for every sub-page.
// Real photo backdrop + navy vignette + brand cyan/yellow glow + a gradient
// accent on the last word of the title. Consistent everywhere so no page has a
// random flat gradient band. Pass `image` (any Photo URL), `eyebrow`, `title`
// (string; last word auto-accents unless `accent={false}`), `sub`, `align`,
// `children` (extra content under the copy), and `height`.
export function PageHero({ image, slides, eyebrow, title, sub, align = "left", children, height = 260, accentWord }) {
  const center = align === "center";
  // Optional vivid cross-fading backdrop (slides = [{src,label}]). Falls back to
  // the single `image` when no slides are passed.
  const useSlides = Array.isArray(slides) && slides.length > 0;
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!useSlides) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [useSlides, slides && slides.length]);
  // A taller, more cinematic hero when running the vivid slide treatment.
  const h = useSlides ? Math.max(height, 380) : height;
  const renderTitle = () => {
    if (typeof title !== "string" || accentWord === null) return title;
    const words = title.trim().split(" ");
    const last = accentWord || words.pop();
    const head = accentWord ? title.replace(new RegExp(accentWord + "$"), "").trim() : words.join(" ");
    return (<>{head} <span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>{last}</span></>);
  };
  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: h, display: "flex", alignItems: "flex-end" }}>
      {useSlides ? (
        slides.map((s, i) => (
          <img key={s.src} src={s.src} alt="" aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              opacity: i === slide ? 1 : 0, transition: "opacity 1.6s ease",
              transform: "scale(1.06)", animation: i === slide ? "tnHeroKen 8s ease-out both" : "none" }} />
        ))
      ) : (
        image && (
          <img src={image} alt="" aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.46, animation: "tnHeroKen 24s ease-in-out infinite alternate" }} />
        )
      )}
      {/* navy vignette so text always pops — lighter in slide mode so the vivid
          photos actually shine (matches the Meet Tico hero) */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: useSlides
        ? "linear-gradient(180deg, rgba(11,26,46,.5) 0%, rgba(11,26,46,.32) 40%, rgba(11,26,46,.92) 100%)"
        : "linear-gradient(180deg, rgba(11,26,46,.72) 0%, rgba(11,26,46,.5) 40%, rgba(11,26,46,.97) 100%)" }} />
      {/* brand glow — cyan top-left, yellow bottom-right */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(45% 55% at 15% 20%, rgba(34,211,238,.22), transparent 55%), radial-gradient(45% 55% at 88% 90%, rgba(255,208,0,.14), transparent 55%)` }} />
      {/* fine grain for texture */}
      <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.05, mixBlendMode: "overlay", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {/* scene label + dots (slide mode only) */}
      {useSlides && (
        <div style={{ position: "absolute", bottom: 16, right: 20, zIndex: 3, display: "flex", alignItems: "center", gap: 10 }}>
          <span key={slide} style={{ background: "rgba(11,26,46,.55)", backdropFilter: "blur(8px)", color: "#fff", padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, animation: "tnHeroRise .5s ease both" }}>{slides[slide].label}</span>
          <div style={{ display: "flex", gap: 5 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} aria-label={`Scene ${i + 1}`}
                style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 999, border: "none", cursor: "pointer", background: i === slide ? c.teal : "rgba(255,255,255,.45)", transition: "all .3s", padding: 0 }} />
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes tnHeroKen{0%{transform:scale(1.06)}100%{transform:scale(1.16)}}
        @keyframes tnHeroRise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .tn-phero > *{animation:tnHeroRise .7s cubic-bezier(.2,.7,.2,1) both}
        .tn-phero > *:nth-child(2){animation-delay:.06s}
        .tn-phero > *:nth-child(3){animation-delay:.12s}
        .tn-phero > *:nth-child(4){animation-delay:.18s}`}</style>

      <div className="tn-phero" style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "34px 20px 28px", width: "100%", textAlign: center ? "center" : "left" }}>
        {eyebrow && <Eyebrow><span style={{ color: c.gold }}>{eyebrow}</span></Eyebrow>}
        <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.05, margin: "4px 0 0", textShadow: "0 6px 30px rgba(0,0,0,.5)" }}>
          {renderTitle()}
        </h1>
        {sub && (
          <p style={{ color: "rgba(243,247,255,.82)", fontSize: 15.5, lineHeight: 1.55, maxWidth: 560, margin: center ? "10px auto 0" : "10px 0 0" }}>{sub}</p>
        )}
        {children}
      </div>
    </div>
  );
}
