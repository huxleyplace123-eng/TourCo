import React from "react";

// TicoWild wordmark — matched EXACTLY to the brand logo:
// "Tico" white + "Wild" yellow (#FFD000), with an optional
// "COSTA RICA · TOUR GUIDES" tagline underneath. No icon.
export function Logo({ fontSize = 22, tagline = false, dark = false }) {
  return (
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
  );
}
