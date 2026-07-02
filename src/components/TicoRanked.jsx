import React from "react";
import { Star, ArrowRight, Plus, Check } from "lucide-react";
import { c, money } from "../theme.js";
import { activityImage } from "../images.js";
import { Photo } from "../motion.jsx";
import { TicoFace } from "./TicoFace.jsx";
import { ticoActivityVerdict } from "../intelligence/tico.js";

// ── Tico's ranked list ── this is Tico ALIVE on the page: his personal ranking of
// experiences, #1 → #N, each with a rank medal, stars, and his own verdict in his
// voice. Not a chatbot — his curation IS the content. Reusable anywhere.
//
// props: items (activities[]), limit (top N), title, onView, onAdd, trip

const MEDAL = { 1: "#FFD000", 2: "#C9D6E8", 3: "#E0A46B" };

function rankBadge(rank) {
  const gold = MEDAL[rank];
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 999, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 900, fontSize: 15, letterSpacing: -0.5,
      background: gold ? gold : "rgba(127,166,232,.14)",
      color: gold ? "#0B1A2E" : c.stone,
      boxShadow: gold ? `0 0 16px -4px ${gold}` : "none",
      border: gold ? "none" : `1px solid ${c.line}`,
    }}>{rank}</div>
  );
}

function Stars({ score }) {
  // 5 stars, filled proportionally to the score
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, score - i));
        return (
          <span key={i} style={{ position: "relative", width: 13, height: 13, display: "inline-block" }}>
            <Star size={13} color={c.line} fill={c.line} style={{ position: "absolute", inset: 0 }} />
            <span style={{ position: "absolute", inset: 0, width: `${fill * 100}%`, overflow: "hidden" }}>
              <Star size={13} color={c.gold} fill={c.gold} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function TicoRanked({ items = [], limit = 5, onView, onAdd, trip = [] }) {
  // rank by Tico's real score (his opinion), then take the top N
  const ranked = items
    .map((a) => ({ a, v: ticoActivityVerdict(a) }))
    .sort((x, y) => y.v.score - x.v.score)
    .slice(0, limit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {ranked.map(({ a, v }, i) => {
        const rank = i + 1;
        const inTrip = trip.some((t) => t.id === a.id);
        return (
          <div key={a.id} style={{
            display: "flex", alignItems: "stretch", gap: 0, overflow: "hidden",
            background: c.white, border: `1px solid ${rank === 1 ? "rgba(255,208,0,.4)" : c.line}`,
            borderRadius: 18, boxShadow: rank === 1 ? "0 0 40px -20px rgba(255,208,0,.5)" : "none",
          }}>
            {/* thumbnail */}
            <div style={{ position: "relative", width: 128, flexShrink: 0 }}>
              <Photo src={activityImage(a, 400)} fallback="#12325e" alt={a.title} height={"100%"} zoom={false} style={{ height: "100%", minHeight: 118 }} />
              <span style={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>{rankBadge(rank)}</span>
            </div>

            {/* body */}
            <div style={{ flex: 1, minWidth: 0, padding: "13px 15px", display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: c.teal, textTransform: "uppercase", letterSpacing: 0.3 }}>{a.category}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <Stars score={v.score} />
                  <b style={{ color: c.gold, fontSize: 12.5 }}>{v.score.toFixed(1)}</b>
                </span>
              </div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: c.charcoal, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</h4>

              {/* Tico's verdict — his voice + his face's mood */}
              <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <TicoFace size={20} glow={false} mood={v.mood} animate={false} />
                <span style={{ fontSize: 12.5, lineHeight: 1.4, color: c.charcoal, fontStyle: "italic", opacity: 0.9 }}>
                  <b style={{ color: c.teal, fontStyle: "normal" }}>{v.label}.</b> {v.verdict}
                </span>
              </div>

              {/* actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 4 }}>
                <span style={{ fontWeight: 800, color: c.charcoal, fontSize: 14 }}>{money(a.price)}<span style={{ color: c.stone, fontWeight: 600, fontSize: 12 }}>/person</span></span>
                {onAdd && (
                  <button onClick={() => onAdd(a.id)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: inTrip ? "rgba(34,211,238,.14)" : c.gold, color: inTrip ? c.teal : c.ink, border: "none", borderRadius: 9, padding: "6px 11px", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
                    {inTrip ? <><Check size={13} />Added</> : <><Plus size={13} />Add</>}
                  </button>
                )}
                {onView && (
                  <button onClick={() => onView(a.id)} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: "none", color: c.stone, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                    Details <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
