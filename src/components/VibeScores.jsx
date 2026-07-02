import React from "react";
import { Flame, Users, Leaf, Camera, Cloud, Car, ShieldCheck, Tag, Sparkles } from "lucide-react";
import { c, glass } from "../theme.js";
import { getVibeScores } from "../intelligence/index.js";

const ICON = { flame: Flame, users: Users, leaf: Leaf, camera: Camera, cloud: Cloud, car: Car, shield: ShieldCheck, tag: Tag };

// TicoWild Vibe Scores — the "brain, not a directory" panel. 0–5 meters per
// dimension, computed live by the intelligence engine (season-aware).
export function VibeScores({ activity, compact = false }) {
  const scores = getVibeScores(activity);
  if (!scores.length) return null;

  return (
    <div style={{ background: c.white, borderRadius: 18, padding: compact ? 16 : 22, border: `1px solid ${c.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.25)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={17} color={c.teal} />
        </span>
        <div>
          <div style={{ fontWeight: 800, color: c.charcoal, fontSize: 16 }}>TicoWild Vibe Scores</div>
          <div style={{ fontSize: 12, color: c.stone }}>Our local read — not just stars</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 22px" }}>
        {scores.map((s) => {
          const Ico = ICON[s.icon] || Sparkles;
          return (
            <div key={s.key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: c.charcoal }}>
                  <Ico size={13} color={c.teal} />{s.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: c.stone }}>{s.value}/5</span>
              </div>
              {/* 5-segment meter */}
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i < s.value ? `linear-gradient(90deg,${c.teal},${c.gold})` : "rgba(255,255,255,.1)" }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
