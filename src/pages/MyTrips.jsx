import React, { useState } from "react";
import { ArrowRight, Compass, MapPin, Clock, Trash2, ShieldCheck, MessageCircle, Calendar, List, Sparkles } from "lucide-react";
import { c, grad, money } from "../theme.js";
import { activities } from "../data.js";
import { activityImage } from "../images.js";
import { Section, Eyebrow, Button } from "../components/ui.jsx";
import { Photo, useCountUp } from "../motion.jsx";
import { StoryPoster } from "../components/TripStory.jsx";
import { SmartPlan } from "../components/SmartPlan.jsx";

function EmptyState({ go }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", background: c.white, borderRadius: 24, padding: "50px 30px", border: "1px solid rgba(255,255,255,.08)" }}>
      <span style={{ width: 66, height: 66, borderRadius: 999, background: grad.hero, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Compass size={32} color="#fff" />
      </span>
      <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: c.charcoal }}>Your trip is empty — for now</h2>
      <p style={{ color: c.stone, fontSize: 16, lineHeight: 1.6, marginBottom: 22 }}>
        Add activities you love and they'll gather here. Reserve when you're ready — only 20% down.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Button variant="primary" size="lg" onClick={() => go("build")}>Build my adventure <ArrowRight size={18} /></Button>
        <Button variant="ghost" size="lg" onClick={() => go("activities")}>Browse activities</Button>
      </div>
    </div>
  );
}

export function MyTrips({ go, trip, removeFromTrip }) {
  const [view, setView] = useState("story"); // 'story' | 'list'
  const chosen = trip.map((t) => ({ ...t, a: activities.find((a) => a.id === t.id) })).filter((x) => x.a);
  const total = chosen.reduce((s, g) => s + g.a.price * g.pax, 0);
  const deposit = useCountUp(Math.round(total * 0.2));

  const ToggleBtn = ({ id, icon: Icon, label }) => (
    <button onClick={() => setView(id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: view === id ? "#fff" : "rgba(255,255,255,.16)", color: view === id ? c.emerald : "#fff", transition: "all .2s" }}>
      <Icon size={16} />{label}
    </button>
  );

  return (
    <>
      <div style={{ background: grad.ocean, padding: "54px 20px 44px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Eyebrow><span style={{ color: c.gold }}>My Trips</span></Eyebrow>
          <h1 style={{ color: "#fff", fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, letterSpacing: -1, margin: "6px 0 8px" }}>Your Costa Rica plan</h1>
          <p style={{ color: "rgba(255,255,255,.9)", fontSize: 17, marginBottom: chosen.length ? 18 : 0 }}>
            {chosen.length ? `${chosen.length} experience${chosen.length !== 1 ? "s" : ""} ready to reserve.` : "Everything you add lands right here."}
          </p>
          {chosen.length > 0 && (
            <div style={{ display: "inline-flex", gap: 6, background: "rgba(0,0,0,.14)", padding: 5, borderRadius: 999 }}>
              <ToggleBtn id="story" icon={Sparkles} label="Story view" />
              <ToggleBtn id="list" icon={List} label="List view" />
            </div>
          )}
        </div>
      </div>

      <Section bg={c.sand}>
        {chosen.length > 0 && view === "story" ? (
          <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 30, alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.charcoal, margin: "0 0 20px" }}>Your smart day-by-day</h2>
              <SmartPlan chosen={chosen} pax={chosen[0]?.pax || 2} />
              <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
                <Button variant="primary" onClick={() => window.alert("Reservation flow — connect payments here.")}>
                  <ShieldCheck size={16} />Reserve for {money(total * 0.2)}
                </Button>
                <Button variant="ghost" onClick={() => go("activities")}>Add more <ArrowRight size={15} /></Button>
              </div>
            </div>
            <div style={{ position: "sticky", top: 92 }}>
              <StoryPoster chosen={chosen} total={total} />
            </div>
          </div>
        ) : chosen.length === 0 ? (
          <EmptyState go={go} />
        ) : (
          <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {chosen.map(({ a, pax, id }) => (
                <div key={id} style={{ background: c.white, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", display: "flex", flexWrap: "wrap" }}>
                  <div style={{ width: 140, minWidth: 140, flex: "0 0 140px" }}>
                    <Photo src={activityImage(a)} fallback={grad.ocean} alt={a.title} height={130} zoom={false} />
                  </div>
                  <div style={{ padding: 16, flex: 1, minWidth: 200, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.teal }}>{a.category}</div>
                    <h3 style={{ margin: "3px 0 6px", fontSize: 17, fontWeight: 800, color: c.charcoal }}>{a.title}</h3>
                    <div style={{ display: "flex", gap: 14, color: c.stone, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{a.region}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} />{a.duration}</span>
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, color: c.charcoal, fontSize: 16 }}>{money(a.price)} <span style={{ color: c.stone, fontWeight: 600, fontSize: 13 }}>× {pax}</span></span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button variant="ghost" size="sm" onClick={() => go("detail") || null}>Details</Button>
                        <button onClick={() => removeFromTrip(id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,90,77,.1)", color: c.orchid, border: "none", borderRadius: 999, padding: "9px 14px", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                          <Trash2 size={14} />Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ position: "sticky", top: 92, background: c.white, borderRadius: 22, padding: 24, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 20px 50px -30px rgba(0,0,0,.35)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: c.charcoal }}>Trip summary</h3>
              <div style={{ display: "flex", justifyContent: "space-between", color: c.stone, fontSize: 14, marginBottom: 8 }}>
                <span>{chosen.length} experiences</span><span style={{ fontWeight: 700, color: c.charcoal }}>{money(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: "1px dashed rgba(255,255,255,.12)" }}>
                <span style={{ fontWeight: 800, color: c.charcoal }}>Due today (20%)</span>
                <span style={{ fontWeight: 800, fontSize: 24, color: c.emerald }}>{money(deposit)}</span>
              </div>
              <Button variant="primary" full size="lg" style={{ marginTop: 18 }} onClick={() => window.alert("Reservation flow — connect payments here.")}>
                <ShieldCheck size={17} />Reserve for {money(total * 0.2)}
              </Button>
              <Button variant="ghost" full size="sm" style={{ marginTop: 10 }} onClick={() => window.alert("Opening WhatsApp concierge…")}>
                <MessageCircle size={15} />Send to concierge
              </Button>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: c.stone, fontSize: 12.5, marginTop: 14, justifyContent: "center" }}>
                <Calendar size={14} />Balance due closer to your dates
              </div>
            </div>
          </div>
        )}
      </Section>

      <style>{`@media(min-width:940px){.detail-grid{grid-template-columns:1fr 340px!important}}`}</style>
    </>
  );
}
