import React from "react";
import { MapPin, Clock, Compass, Check, Plus, Users, Sparkles, ShieldCheck, ArrowRight, Sun, CloudRain, TrendingUp, Tag } from "lucide-react";
import { c, gradFor, money } from "../theme.js";
import { activityImage } from "../images.js";
import { Badge, Button } from "./ui.jsx";
import { TiltCard, Photo } from "../motion.jsx";
import { getInsights } from "../intelligence/index.js";
import { TicoPick, TicoRating, TicoAvatar, useTicoActivity } from "./Tico.jsx";
import { activityPath } from "../routing.js";

const INSIGHT_ICON = { sparkle: Sparkles, clock: Clock, rain: CloudRain, sun: Sun, trend: TrendingUp, tag: Tag };
const TONE = {
  good: { bg: "rgba(34,211,238,.10)", bd: "rgba(34,211,238,.28)", fg: c.teal },
  warn: { bg: "rgba(255,208,0,.12)", bd: "rgba(255,208,0,.3)", fg: c.gold },
  info: { bg: "rgba(147,174,207,.10)", bd: "rgba(147,174,207,.25)", fg: c.stone },
};

// The single most useful live insight for a card (season > weather > else).
function topInsight(a) {
  const res = getInsights(a.id);
  if (!res) return null;
  const byType = (t) => res.insights.find((i) => i.type === t);
  return byType("season") || byType("weather") || byType("demand") || res.insights[0] || null;
}

// Activity card — dark glass + real 3D tilt + neon glow + cinematic photo.
// `note` (optional) renders the guide's take inside the card so every card is a
// single aligned unit of equal height.
export function ActivityCard({ a, onAdd, onView, inTrip, note, compact = false }) {
  const insight = topInsight(a);
  const Ico = insight ? INSIGHT_ICON[insight.icon] || Sparkles : null;
  const tone = insight ? TONE[insight.tone] || TONE.info : null;
  const tico = useTicoActivity(a);
  return (
    <TiltCard className="activity-card" style={{ background: c.white, overflow: "hidden", border: `1px solid ${c.line}`, display: "flex", flexDirection: "column", height: "100%" }} radius={20}>
      <Photo
        src={activityImage(a)}
        fallback={gradFor(a.category)}
        alt={a.title}
        height={172}
        overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.10) 0%, transparent 30%, rgba(11,26,46,.78) 100%)" }} />}
      >
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap", zIndex: 2 }}>
          {tico.isPick ? <TicoPick /> : <Badge icon={ShieldCheck} bg="rgba(11,26,46,.55)" color={c.teal}>Curated idea</Badge>}
          <Badge bg="rgba(11,26,46,.62)" color="#fff" icon={Clock}>Request availability</Badge>
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 6, zIndex: 2 }}>
          {a.family && <Badge bg="rgba(11,26,46,.55)" color={c.blue} icon={Users}>Family</Badge>}
          {a.private && <Badge bg="rgba(11,26,46,.55)" color={c.orchid} icon={Sparkles}>Private</Badge>}
        </div>
        <span style={{ position: "absolute", bottom: 12, right: 12, zIndex: 2, background: "rgba(34,211,238,.16)", border: "1px solid rgba(34,211,238,.5)", backdropFilter: "blur(6px)", color: "#fff", fontWeight: 800, fontSize: 12.5, padding: "5px 11px", borderRadius: 999, boxShadow: "0 0 18px -4px rgba(34,211,238,.7)" }}>
          from {money(a.price)}/person
        </span>
      </Photo>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: c.teal, letterSpacing: 0.3 }}>{a.category}</span>
          {!compact && <span title={`Rico says: ${tico.label}`}><TicoRating score={tico.score} mood={tico.mood} /></span>}
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: c.charcoal, lineHeight: 1.2 }}>{a.title}</h3>
        <div style={{ display: "flex", gap: 14, color: c.stone, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{a.region}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} />{a.duration}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Compass size={13} />{a.level}</span>
        </div>
        <div style={{ color: c.stone, fontSize: 12.5, lineHeight: 1.4 }}><span style={{ color: c.charcoal, fontWeight: 800 }}>Best for:</span> {a.bestFor?.slice(0, 3).join(" · ")}</div>

        {/* Planning note based on TicoWild's static season and route model. */}
        {!compact && insight && (
          <div title="TicoWild planning note" style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start", background: tone.bg, border: `1px solid ${tone.bd}`, color: tone.fg, padding: "5px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>
            <Ico size={12} />{insight.text}
          </div>
        )}
        {!compact && <div style={{ display: "flex", alignItems: "center", gap: 7, color: c.stone, fontSize: 12.5, lineHeight: 1.4 }}>
          <ShieldCheck size={14} color={c.teal} style={{ flexShrink: 0 }} />Timing, operator and final price confirmed before payment
        </div>}

        {/* Tico's take — his in-character reaction, face matching his mood */}
        {!compact && <div style={{ display: "flex", gap: 8, marginTop: 4, padding: "10px 12px", background: "rgba(34,211,238,.06)", border: `1px solid rgba(34,211,238,.18)`, borderRadius: 12 }}>
          <TicoAvatar size={22} glow={false} mood={tico.takeMood} animate={false} />
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: c.charcoal, fontStyle: "italic", opacity: 0.92 }}>{note || tico.take}</p>
        </div>}

        {/* CTA row — one clear primary action + a clean details link */}
        <div className="activity-card-actions" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 14 }}>
          <Button variant={inTrip ? "dark" : "primary"} size="sm" full onClick={() => onAdd(a.id)}>
            {inTrip ? <><Check size={15} />Saved to trip</> : <><Plus size={15} />Save to trip</>}
          </Button>
          <a href={activityPath(a)} onClick={(event) => { event.preventDefault(); onView(a.id); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: c.stone, fontWeight: 700, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap", padding: "8px 2px", transition: "color .15s", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.teal)}
            onMouseLeave={(e) => (e.currentTarget.style.color = c.stone)}
          >Details <ArrowRight size={14} /></a>
        </div>
      </div>
    </TiltCard>
  );
}
