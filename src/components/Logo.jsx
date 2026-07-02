import React, { useId } from "react";
import { c } from "../theme.js";

// TripNest wordmark + pin mark (verbatim shape from the original oc component).
export function Logo({ dark = false, fontSize = 20, mark = 34 }) {
  const id = useId();
  const wordA = dark ? "#FFFFFF" : c.charcoal;
  const wordB = dark ? "#FFD000" : c.emerald;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width={mark} height={mark} viewBox="0 0 40 40" role="img" aria-label="TripNest"
        style={{ filter: "drop-shadow(0 6px 14px rgba(15,60,160,.35))", flexShrink: 0 }}>
        <defs>
          <linearGradient id={id} x1="3" y1="2" x2="37" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E5FE0" />
            <stop offset="0.6" stopColor="#2F6BEB" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="11" fill={`url(#${id})`} />
        <rect x="1" y="1" width="38" height="15" rx="11" fill="#FFFFFF" opacity="0.12" />
        <path d="M20 8.6c-4.7 0-8.4 3.6-8.4 8.1 0 5.8 6.7 11.8 7.7 12.7a1 1 0 0 0 1.3 0c1-.9 7.8-6.9 7.8-12.7 0-4.5-3.7-8.1-8.4-8.1Z" fill="#FFFFFF" />
        <circle cx="20" cy="16.5" r="3.1" fill="#FFD000" />
      </svg>
      <span style={{ fontWeight: 800, fontSize, letterSpacing: -0.5, lineHeight: 1 }}>
        <span style={{ color: wordA }}>Trip</span>
        <span style={{ color: wordB }}>Nest</span>
      </span>
    </span>
  );
}
