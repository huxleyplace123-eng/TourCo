import React from "react";
import { MapPin, Clock, Compass, Star, Check, Plus, Users, Sparkles, ShieldCheck, ArrowRight, Quote } from "lucide-react";
import { c, gradFor, money } from "../theme.js";
import { operators } from "../data.js";
import { activityImage } from "../images.js";
import { Badge, Button } from "./ui.jsx";
import { TiltCard, Photo } from "../motion.jsx";

// Activity card — dark glass + real 3D tilt + neon glow + cinematic photo.
// `note` (optional) renders John's take INSIDE the card so every card is a
// single aligned unit of equal height.
export function ActivityCard({ a, onAdd, onView, inTrip, note }) {
  const op = operators.find((o) => o.id === a.operatorId);
  return (
    <TiltCard style={{ background: c.white, overflow: "hidden", border: `1px solid ${c.line}`, display: "flex", flexDirection: "column", height: "100%" }} radius={20}>
      <Photo
        src={activityImage(a)}
        fallback={gradFor(a.category)}
        alt={a.title}
        height={172}
        overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,7,15,.10) 0%, transparent 30%, rgba(5,7,15,.78) 100%)" }} />}
      >
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap", zIndex: 2 }}>
          <Badge icon={ShieldCheck} bg="rgba(5,7,15,.55)" color={c.teal}>Vetted</Badge>
          {a.confirm
            ? <Badge bg="rgba(5,7,15,.55)" color="#fff" icon={Clock}>Concierge confirm</Badge>
            : <Badge bg="rgba(34,211,238,.9)" color={c.ink} icon={Check}>Available now</Badge>}
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 6, zIndex: 2 }}>
          {a.family && <Badge bg="rgba(5,7,15,.55)" color={c.blue} icon={Users}>Family</Badge>}
          {a.private && <Badge bg="rgba(5,7,15,.55)" color={c.orchid} icon={Sparkles}>Private</Badge>}
        </div>
        <span style={{ position: "absolute", bottom: 12, right: 12, zIndex: 2, background: "rgba(34,211,238,.16)", border: "1px solid rgba(34,211,238,.5)", backdropFilter: "blur(6px)", color: "#fff", fontWeight: 800, fontSize: 12.5, padding: "5px 11px", borderRadius: 999, boxShadow: "0 0 18px -4px rgba(34,211,238,.7)" }}>
          {money(a.price)}/person
        </span>
      </Photo>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: c.teal, letterSpacing: 0.3 }}>{a.category}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12.5, fontWeight: 700, color: c.charcoal }}>
            <Star size={13} fill={c.gold} color={c.gold} />{a.rating}
          </span>
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: c.charcoal, lineHeight: 1.2 }}>{a.title}</h3>
        <div style={{ display: "flex", gap: 14, color: c.stone, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{a.region}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} />{a.duration}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Compass size={13} />{a.level}</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: c.stone, fontWeight: 600 }}>operated by</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.charcoal, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{op?.name}</div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: c.stone, flexShrink: 0 }}>
            <Star size={11} fill={c.gold} color={c.gold} />{a.reviews}
          </span>
        </div>

        {/* John's take — inside the card, so cards stay one aligned unit */}
        {note && (
          <div style={{ display: "flex", gap: 8, marginTop: 4, padding: "10px 12px", background: "rgba(34,211,238,.06)", border: `1px solid rgba(34,211,238,.18)`, borderRadius: 12 }}>
            <Quote size={14} color={c.teal} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: c.charcoal, fontStyle: "italic", opacity: 0.9 }}>{note}</p>
          </div>
        )}

        {/* CTA row — one clear primary action + a clean details link */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 14 }}>
          <Button variant={inTrip ? "dark" : "primary"} size="sm" full onClick={() => onAdd(a.id)}>
            {inTrip ? <><Check size={15} />Added</> : <><Plus size={15} />Add to trip</>}
          </Button>
          <button onClick={() => onView(a.id)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", color: c.stone, fontWeight: 700, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap", padding: "8px 2px", transition: "color .15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.teal)}
            onMouseLeave={(e) => (e.currentTarget.style.color = c.stone)}
          >Details <ArrowRight size={14} /></button>
        </div>
      </div>
    </TiltCard>
  );
}
