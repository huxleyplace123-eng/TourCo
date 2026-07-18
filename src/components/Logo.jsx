import React from "react";
import { LOGO_DATA_URI } from "./logoData.js";

// TicoWild crest — the full illustrated lockup (macaw + Costa Rica scene +
// "TICO WILD ADVENTURES" wordmark + tagline), so it's self-contained. The image
// is embedded (data URI) so it ships inside the bundle — no separate request
// that could 404 or serve a stale cache. `height` takes any CSS length; the
// default is a responsive clamp tuned for the nav. (fontSize/tagline kept for
// call-site compatibility.)
export function Logo({ height = "clamp(80px, 11vw, 116px)", fontSize, tagline }) {
  return (
    <img
      src={LOGO_DATA_URI}
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
