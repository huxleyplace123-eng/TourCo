import React from "react";
import { c, grad, gradText } from "../theme.js";
import { Eyebrow } from "./ui.jsx";

// ── PageHero ── one cinematic, on-brand hero for every sub-page.
// Real photo backdrop + navy vignette + brand cyan/yellow glow + a gradient
// accent on the last word of the title. Consistent everywhere so no page has a
// random flat gradient band. Pass `image` (any Photo URL), `eyebrow`, `title`
// (string; last word auto-accents unless `accent={false}`), `sub`, `align`,
// `children` (extra content under the copy), and `height`.
export function PageHero({ image, eyebrow, title, sub, align = "left", children, height = 260, accentWord }) {
  const center = align === "center";
  const renderTitle = () => {
    if (typeof title !== "string" || accentWord === null) return title;
    const words = title.trim().split(" ");
    const last = accentWord || words.pop();
    const head = accentWord ? title.replace(new RegExp(accentWord + "$"), "").trim() : words.join(" ");
    return (<>{head} <span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>{last}</span></>);
  };
  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: height, display: "flex", alignItems: "flex-end" }}>
      {image && (
        <img src={image} alt="" aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.46, animation: "tnHeroKen 24s ease-in-out infinite alternate" }} />
      )}
      {/* navy vignette so text always pops */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.72) 0%, rgba(11,26,46,.5) 40%, rgba(11,26,46,.97) 100%)" }} />
      {/* brand glow — cyan top-left, yellow bottom-right */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(45% 55% at 15% 20%, rgba(34,211,238,.22), transparent 55%), radial-gradient(45% 55% at 88% 90%, rgba(255,208,0,.14), transparent 55%)` }} />
      {/* fine grain for texture */}
      <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.05, mixBlendMode: "overlay", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

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
