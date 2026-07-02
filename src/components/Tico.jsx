import React from "react";
import { c } from "../theme.js";
import { TicoFace } from "./TicoFace.jsx";
import {
  ticoRateActivity, ticoRateSpot,
  ticoActivityVerdict, ticoSpotVerdict,
  ticoActivityTake, ticoSpotTake, ticoBeachTake,
  ticoSectionIntro,
} from "../intelligence/tico.js";

// ── Tico avatar ── his expressive face, reused at any size. `mood` drives the
// expression; it stays a friendly "happy" by default. Kept the old name/props so
// every existing caller keeps working.
export function TicoAvatar({ size = 34, glow = true, mood = "happy", animate = true }) {
  return <TicoFace size={size} glow={glow} mood={mood} animate={animate} />;
}

// ── "Tico's Pick" ribbon ── goes on a card image for his top calls.
export function TicoPick({ style = {} }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg,#FFD000,#FFDE4D)", color: c.ink, padding: "4px 10px 4px 6px", borderRadius: 999, fontSize: 11, fontWeight: 800, boxShadow: "0 0 16px -3px rgba(255,208,0,.8)", ...style }}>
      <TicoFace size={16} glow={false} mood="proud" animate={false} /> Tico's Pick
    </span>
  );
}

// ── Tico rating chip ── his face + the score. Face wears the verdict's mood.
export function TicoRating({ score, mood = "happy", size = "sm" }) {
  const big = size === "lg";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 800, color: c.gold, fontSize: big ? 15 : 12.5 }}>
      <TicoFace size={big ? 22 : 16} glow={false} mood={mood} animate={false} />{score.toFixed(1)}
    </span>
  );
}

// ── Tico's take line ── his one-liner review, with a mini expressive face.
export function TicoTake({ text, mood = "happy", style = {} }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(34,211,238,.07)", border: "1px solid rgba(34,211,238,.2)", borderRadius: 12, padding: "9px 11px", ...style }}>
      <TicoFace size={22} glow={false} mood={mood} animate={false} />
      <span style={{ fontSize: 12.5, lineHeight: 1.45, color: c.charcoal, fontStyle: "italic" }}>{text}</span>
    </div>
  );
}

// ── Tico's section intro ── a page header spoken by Tico: his face, his title,
// his framing line. Makes a section feel like HE is walking you through it.
export function TicoSectionIntro({ kind, region, style = {} }) {
  const { title, line, mood } = ticoSectionIntro(kind, { region });
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 18, ...style }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div aria-hidden style={{ position: "absolute", inset: -6, borderRadius: 999, background: "radial-gradient(circle, rgba(34,211,238,.3), transparent 70%)", filter: "blur(4px)" }} />
        <div style={{ position: "relative" }}><TicoFace size={46} mood={mood} /></div>
      </div>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, color: "#fff", letterSpacing: -0.4, lineHeight: 1.1 }}>{title}</h2>
        <p style={{ margin: "5px 0 0", fontSize: 14, lineHeight: 1.5, color: c.stone, maxWidth: 620 }}>
          <b style={{ color: c.teal }}>Tico:</b> <span style={{ fontStyle: "italic" }}>"{line}"</span>
        </p>
      </div>
    </div>
  );
}

// ── Convenience hooks ── everything Tico thinks about a thing, in one call.
// Each returns { score, isPick, mood, label, verdict, take } — `take` is his
// one-liner (string) and `mood` is the expression his face should wear.
export function useTicoActivity(a) {
  const v = ticoActivityVerdict(a);
  const t = ticoActivityTake(a);
  return { ...v, take: t.text, takeMood: t.mood };
}
export function useTicoSpot(spot) {
  const v = ticoSpotVerdict(spot);
  const t = ticoSpotTake(spot);
  return { ...v, take: t.text, takeMood: t.mood };
}
export function useTicoBeach(b) {
  const v = ticoSpotVerdict(b);
  const t = ticoBeachTake(b);
  return { ...v, take: t.text, takeMood: t.mood };
}
