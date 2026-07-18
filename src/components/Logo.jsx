import React, { useId } from "react";

// TicoWild logo — macaw-head mark (from the brand SVG) + wordmark:
// "Tico" white + "Wild" yellow (#FFD000), optional tagline underneath.
export function Logo({ fontSize = 22, tagline = false }) {
  const id = useId();
  const mark = Math.round(fontSize * 1.55); // icon scales with wordmark
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: fontSize * 0.5 }}>
      {/* macaw mark on a rounded blue tile */}
      <svg width={mark} height={mark} viewBox="80 64 108 108" role="img" aria-label="TicoWild"
        style={{ flexShrink: 0, filter: "drop-shadow(0 4px 12px rgba(34,211,238,.35))" }}>
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F6BEB" /><stop offset="1" stopColor="#0A2E8F" /></linearGradient>
          <clipPath id={`c${id}`}><rect x="80" y="64" width="108" height="108" rx="28" /></clipPath>
        </defs>
        <rect x="80" y="64" width="108" height="108" rx="28" fill={`url(#g${id})`} />
        <g clipPath={`url(#c${id})`}>
          <rect x="80" y="64" width="108" height="38" fill="#ffffff" opacity="0.08" />
          <path d="M120 100C104 104 98 124 106 144C112 158 128 162 140 156C138 148 138 136 142 128C146 118 150 108 144 100C136 94 128 98 120 100Z" fill="#0A1F5C" />
          <path d="M124 96C118 88 128 84 134 90C130 92 126 94 124 96Z" fill="#0A1F5C" />
          <path d="M140 112C160 108 176 116 174 128C172 138 158 138 148 132C142 128 140 120 140 112Z" fill="#FFD000" />
          <path d="M148 132C156 136 168 136 174 130C172 140 158 144 148 138Z" fill="#F0A400" />
          <path d="M140 122C150 122 160 124 166 128" fill="none" stroke="#0A1F5C" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="126" cy="120" r="7" fill="#22D3EE" /><circle cx="126" cy="120" r="2.8" fill="#0B1A2E" />
        </g>
      </svg>
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1, gap: tagline ? 5 : 0 }}>
        <span style={{ fontWeight: 800, fontSize, letterSpacing: -1 }}>
          <span style={{ color: "#FFFFFF" }}>Tico</span>
          <span style={{ color: "#FFD000" }}>Wild</span>
        </span>
        {tagline && (
          <span style={{ color: "#7FA6E8", fontWeight: 600, fontSize: Math.max(8, fontSize * 0.33), letterSpacing: fontSize * 0.14, textTransform: "uppercase" }}>
            Costa Rica · Tour Guides
          </span>
        )}
      </span>
    </span>
  );
}
