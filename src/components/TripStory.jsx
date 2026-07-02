import React, { useState } from "react";
import { Sunrise, Sun, Sunset, MapPin, Share2, Download, Sparkles, Check } from "lucide-react";
import { c, grad, money } from "../theme.js";
import { activityImage } from "../images.js";
import { Photo, Reveal } from "../motion.jsx";
import { Button } from "./ui.jsx";

const DAY_ICON = [Sunrise, Sun, Sunset];
const DAY_WORD = ["Morning", "Midday", "Golden hour"];

// ── Day-by-day cinematic timeline ── each chosen activity becomes a "day"
// on a vertical path with a photo, time-of-day marker, and rise-in animation.
export function TripTimeline({ chosen }) {
  return (
    <div style={{ position: "relative", paddingLeft: 8 }}>
      {chosen.map(({ a }, i) => {
        const Icon = DAY_ICON[i % 3];
        const last = i === chosen.length - 1;
        return (
          <Reveal key={a.id} delay={i * 70}>
            <div style={{ display: "flex", gap: 18, position: "relative", paddingBottom: last ? 0 : 26 }}>
              {/* rail */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 999, background: grad.hero, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px -8px rgba(47,107,235,.6)", zIndex: 2 }}>
                  <Icon size={20} color="#fff" />
                </div>
                {!last && <div style={{ flex: 1, width: 3, background: "linear-gradient(180deg, rgba(47,107,235,.5), rgba(34,211,238,.2))", marginTop: 4, minHeight: 40, borderRadius: 999 }} />}
              </div>
              {/* card */}
              <div style={{ flex: 1, background: c.white, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", display: "flex", flexWrap: "wrap", boxShadow: "0 14px 40px -28px rgba(0,0,0,.4)" }}>
                <div style={{ width: 130, minWidth: 130, flex: "0 0 130px" }}>
                  <Photo src={activityImage(a)} fallback={grad.ocean} alt={a.title} height={116} />
                </div>
                <div style={{ padding: "14px 16px", flex: 1, minWidth: 180 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800, color: c.emerald, letterSpacing: 0.5, textTransform: "uppercase" }}>
                    Day {i + 1} · {DAY_WORD[i % 3]}
                  </div>
                  <h3 style={{ margin: "3px 0 6px", fontSize: 17, fontWeight: 800, color: c.charcoal, lineHeight: 1.2 }}>{a.title}</h3>
                  <div style={{ display: "flex", gap: 14, color: c.stone, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{a.region}</span>
                    <span>{a.duration}</span>
                    <span style={{ color: c.charcoal, fontWeight: 800 }}>{money(a.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

// ── Shareable "My Costa Rica Story" poster ── a gorgeous gradient card that
// composes the itinerary into something worth posting to Instagram.
export function StoryPoster({ chosen, total, tripType = "adventure" }) {
  const [copied, setCopied] = useState(false);
  const regions = [...new Set(chosen.map((x) => x.a.region))];
  const days = chosen.length;

  const share = async () => {
    const text = `My Costa Rica adventure with TicoWild 🌿\n${chosen.map((x, i) => `Day ${i + 1}: ${x.a.title}`).join("\n")}\n\nPlanned by locals at TicoWild.`;
    try {
      if (navigator.share) { await navigator.share({ title: "My Costa Rica Story", text }); return; }
      await navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { /* user dismissed */ }
  };

  return (
    <div>
      {/* the poster */}
      <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", background: grad.hero, color: "#fff", padding: "30px 26px 26px", boxShadow: "0 30px 70px -30px rgba(8,28,58,.6)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 12% 12%, rgba(34,211,238,.5), transparent 42%), radial-gradient(circle at 88% 90%, rgba(255,208,0,.35), transparent 45%)" }} />
        {/* faint photo collage strip */}
        <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.16 }}>
          {chosen.slice(0, 4).map((x) => (
            <div key={x.a.id} style={{ flex: 1, backgroundImage: `url(${activityImage(x.a, 500)})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.16)", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
            <Sparkles size={13} color={c.gold} /> My Costa Rica Story
          </div>
          <h2 style={{ fontSize: "clamp(26px,4vw,36px)", fontWeight: 800, letterSpacing: -1, margin: "14px 0 4px", lineHeight: 1.05 }}>
            {days}-day {tripType} in paradise
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0 20px" }}>
            {regions.slice(0, 4).map((r) => (
              <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,.15)", padding: "5px 11px", borderRadius: 999, fontSize: 12.5, fontWeight: 700 }}>
                <MapPin size={12} />{r}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {chosen.slice(0, 6).map((x, i) => (
              <div key={x.a.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5 }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, background: "rgba(255,255,255,.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontWeight: 600 }}>{x.a.title}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.2)" }}>
            <div>
              <div style={{ fontSize: 12, opacity: .85 }}>Total adventure value</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{money(total)}</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
              TicoWild 🌿<div style={{ fontSize: 11, fontWeight: 600, opacity: .8 }}>planned by locals</div>
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <Button variant="primary" full onClick={share}>
          {copied ? <><Check size={16} />Copied to share!</> : <><Share2 size={16} />Share my story</>}
        </Button>
        <Button variant="ghost" onClick={() => window.print()}><Download size={16} />Save</Button>
      </div>
      <p style={{ textAlign: "center", color: c.stone, fontSize: 12.5, marginTop: 10 }}>Post it, send it to your crew, or save it for later.</p>
    </div>
  );
}
