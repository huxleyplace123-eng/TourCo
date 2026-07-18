import React from "react";

// TicoWild crest — the full illustrated lockup (macaw + Costa Rica scene +
// "TICO WILD ADVENTURES" wordmark + tagline), so it's self-contained. `height`
// takes any CSS length; the default is a responsive clamp tuned for the nav on
// desktop and mobile. (fontSize/tagline kept for call-site compatibility.)
export function Logo({ height = "clamp(80px, 11vw, 116px)", fontSize, tagline }) {
  return (
    <img
      src="/logo-crest.webp"
      alt="TicoWild Adventures — Costa Rica"
      width="504"
      height="512"
      style={{
        height,
        width: "auto",
        display: "block",
        filter: "drop-shadow(0 6px 16px rgba(0,0,0,.42))",
      }}
    />
  );
}
