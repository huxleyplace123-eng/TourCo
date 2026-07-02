import React, { useId } from "react";
import { c } from "../theme.js";

// TicoWild wordmark + mark — matched to the brand logo.
// "Tico" white + "Wild" yellow (#FFD000), with the signature cyan line + yellow
// dot flourish. Mark = a rounded navy tile with a cyan leaf/wave glyph.
export function Logo({ dark = false, fontSize = 20, mark = 34 }) {
  const id = useId();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
      <svg width={mark} height={mark} viewBox="0 0 40 40" role="img" aria-label="TicoWild"
        style={{ filter: "drop-shadow(0 6px 16px rgba(34,211,238,.35))", flexShrink: 0 }}>
        <defs>
          <linearGradient id={id} x1="3" y1="2" x2="37" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#7FA6E8" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11" fill="#0B1A2E" stroke={`url(#${id})`} strokeWidth="1.5" />
        {/* stylized leaf / wave — the "wild" mark */}
        <path d="M11 25c6 2 15 1 18-11-9 0-16 3-18 11Z" fill="#22D3EE" />
        <path d="M14 24c4-4 8-6 12-7" stroke="#0B1A2E" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.55" />
        <circle cx="27.5" cy="12.5" r="2.4" fill="#FFD000" />
      </svg>
      <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontWeight: 800, fontSize, letterSpacing: -0.5 }}>
          <span style={{ color: "#FFFFFF" }}>Tico</span>
          <span style={{ color: "#FFD000" }}>Wild</span>
        </span>
      </span>
    </span>
  );
}
