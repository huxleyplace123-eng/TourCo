import React from "react";
import { c } from "../theme.js";
import { ticoRateActivity, ticoRateSpot, ticoActivityTake, ticoSpotTake, ticoBeachTake } from "../intelligence/tico.js";

// ── Tico avatar ── the macaw head mark, reused at any size.
export function TicoAvatar({ size = 34, glow = true }) {
  return (
    <svg width={size} height={size} viewBox="80 64 108 108" role="img" aria-label="Tico"
      style={{ flexShrink: 0, filter: glow ? "drop-shadow(0 3px 10px rgba(34,211,238,.4))" : "none" }}>
      <defs>
        <linearGradient id="ticoG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F6BEB" /><stop offset="1" stopColor="#0A2E8F" /></linearGradient>
        <clipPath id="ticoC"><rect x="80" y="64" width="108" height="108" rx="30" /></clipPath>
      </defs>
      <rect x="80" y="64" width="108" height="108" rx="30" fill="url(#ticoG)" />
      <g clipPath="url(#ticoC)">
        <rect x="80" y="64" width="108" height="38" fill="#ffffff" opacity="0.08" />
        <path d="M120 100C104 104 98 124 106 144C112 158 128 162 140 156C138 148 138 136 142 128C146 118 150 108 144 100C136 94 128 98 120 100Z" fill="#0A1F5C" />
        <path d="M124 96C118 88 128 84 134 90C130 92 126 94 124 96Z" fill="#0A1F5C" />
        <path d="M140 112C160 108 176 116 174 128C172 138 158 138 148 132C142 128 140 120 140 112Z" fill="#FFD000" />
        <path d="M148 132C156 136 168 136 174 130C172 140 158 144 148 138Z" fill="#F0A400" />
        <path d="M140 122C150 122 160 124 166 128" fill="none" stroke="#0A1F5C" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="126" cy="120" r="7" fill="#22D3EE" /><circle cx="126" cy="120" r="2.8" fill="#0B1A2E" />
      </g>
    </svg>
  );
}

// ── "Tico's Pick" ribbon ── goes on a card image for his top calls.
export function TicoPick({ style = {} }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg,#FFD000,#FFDE4D)", color: c.ink, padding: "4px 10px 4px 6px", borderRadius: 999, fontSize: 11, fontWeight: 800, boxShadow: "0 0 16px -3px rgba(255,208,0,.8)", ...style }}>
      <TicoAvatar size={16} glow={false} /> Tico's Pick
    </span>
  );
}

// ── Tico rating chip ── "🦜 4.8" style.
export function TicoRating({ score, size = "sm" }) {
  const big = size === "lg";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 800, color: c.gold, fontSize: big ? 15 : 12.5 }}>
      <TicoAvatar size={big ? 20 : 15} glow={false} />{score.toFixed(1)}
    </span>
  );
}

// ── Tico's take line ── his one-liner review, with a mini avatar.
export function TicoTake({ text, style = {} }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(34,211,238,.07)", border: "1px solid rgba(34,211,238,.2)", borderRadius: 12, padding: "9px 11px", ...style }}>
      <TicoAvatar size={22} glow={false} />
      <span style={{ fontSize: 12.5, lineHeight: 1.45, color: c.charcoal, fontStyle: "italic" }}>{text}</span>
    </div>
  );
}

// Convenience: everything Tico thinks about an ACTIVITY, in one call.
export function useTicoActivity(a) {
  const { score, isPick } = ticoRateActivity(a);
  return { score, isPick, take: ticoActivityTake(a) };
}
export function useTicoSpot(spot) {
  const { score, isPick } = ticoRateSpot(spot);
  return { score, isPick, take: ticoSpotTake(spot) };
}
export function useTicoBeach(b) {
  const { score, isPick } = ticoRateSpot(b);
  return { score, isPick, take: ticoBeachTake(b) };
}
