import React from "react";
import { MapPin, Clock, Compass, Star, Check, Plus, Users, Sparkles, ShieldCheck } from "lucide-react";
import { c, gradFor, money } from "../theme.js";
import { operators } from "../data.js";
import { Badge, Button } from "./ui.jsx";

// Compact activity card (mirrors the original lu component).
export function ActivityCard({ a, onAdd, onView, inTrip }) {
  const op = operators.find((o) => o.id === a.operatorId);
  return (
    <div style={{ background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: "0 14px 40px -22px rgba(15,30,40,.45)", border: "1px solid rgba(0,0,0,.04)", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 168, background: gradFor(a.category) }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 10%, rgba(255,255,255,.3), transparent 60%)" }} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Badge icon={ShieldCheck} bg="rgba(255,255,255,.92)">Vetted</Badge>
          {a.confirm
            ? <Badge bg="rgba(31,41,51,.7)" color="#fff" icon={Clock}>Concierge confirm</Badge>
            : <Badge bg="rgba(47,107,235,.85)" color="#fff" icon={Check}>Available now</Badge>}
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 6 }}>
          {a.family && <Badge bg="rgba(255,255,255,.9)" color={c.blue} icon={Users}>Family</Badge>}
          {a.private && <Badge bg="rgba(255,255,255,.9)" color={c.orchid} icon={Sparkles}>Private</Badge>}
        </div>
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: c.teal }}>{a.category}</span>
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
        <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: c.stone, fontWeight: 600 }}>from</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.emerald }}>
              {money(a.price)}<span style={{ fontSize: 13, color: c.stone, fontWeight: 600 }}> /person</span>
            </div>
          </div>
          <span style={{ fontSize: 11.5, color: c.stone }}>{op?.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          <Button variant={inTrip ? "dark" : "primary"} size="sm" full onClick={() => onAdd(a.id)}>
            {inTrip ? <><Check size={15} />Added to trip</> : <><Plus size={15} />Add to trip</>}
          </Button>
          <Button variant="ghost" size="sm" full onClick={() => onView(a.id)}>View details</Button>
        </div>
      </div>
    </div>
  );
}
