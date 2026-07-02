import React from "react";
import { ArrowLeft, MapPin, Clock, Compass, Star, Check, Plus, ShieldCheck, MessageCircle, Package, Backpack, Quote } from "lucide-react";
import { c, grad, gradFor, money } from "../theme.js";
import { activities, operators } from "../data.js";
import { activityImage } from "../images.js";
import { Section, Button, Badge } from "../components/ui.jsx";
import { Photo, Reveal } from "../motion.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";

function InfoList({ title, icon: Icon, items }) {
  return (
    <div style={{ background: c.white, borderRadius: 18, padding: 22, border: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(47,107,235,.1)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={c.emerald} />
        </span>
        <span style={{ fontWeight: 800, color: c.charcoal, fontSize: 16 }}>{title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((it) => (
          <div key={it} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 14.5, color: c.charcoal }}>
            <Check size={15} color={c.emerald} style={{ marginTop: 2, flexShrink: 0 }} />{it}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Detail({ activeId, go, addToTrip, trip, viewActivity }) {
  const a = activities.find((x) => x.id === activeId) || activities[0];
  const op = operators.find((o) => o.id === a.operatorId);
  const inTrip = trip.some((t) => t.id === a.id);
  const related = activities.filter((x) => x.category === a.category && x.id !== a.id).slice(0, 3);
  const alsoLike = related.length ? related : activities.filter((x) => x.id !== a.id).slice(0, 3);

  return (
    <>
      {/* Hero image band */}
      <div style={{ position: "relative" }}>
        <Photo src={activityImage(a, 1600)} fallback={gradFor(a.category)} alt={a.title} height={380} zoom={false}
          overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,20,45,.35) 0%, transparent 30%, rgba(8,20,45,.72) 100%)" }} />} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: 1180, margin: "0 auto", padding: "22px 20px 30px", left: 0, right: 0 }}>
          <button onClick={() => go("activities")} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.9)", border: "none", borderRadius: 999, padding: "9px 16px", fontWeight: 700, color: c.charcoal, cursor: "pointer", fontSize: 14 }}>
            <ArrowLeft size={16} />All activities
          </button>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <Badge icon={ShieldCheck} bg="rgba(255,255,255,.92)">Vetted operator</Badge>
              {a.family && <Badge bg="rgba(255,255,255,.92)" color={c.blue}>Family-friendly</Badge>}
              {a.private && <Badge bg="rgba(255,255,255,.92)" color={c.orchid}>Private available</Badge>}
            </div>
            <div style={{ color: c.gold, fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>{a.category}</div>
            <h1 style={{ color: "#fff", fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, letterSpacing: -1, margin: "4px 0 0", maxWidth: 760 }}>{a.title}</h1>
            <div style={{ display: "flex", gap: 18, color: "rgba(255,255,255,.92)", fontSize: 15, fontWeight: 600, flexWrap: "wrap", marginTop: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={15} />{a.region}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={15} />{a.duration}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Compass size={15} />{a.level}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Star size={15} fill={c.gold} color={c.gold} />{a.rating} · {a.reviews} reviews</span>
            </div>
          </div>
        </div>
      </div>

      <Section bg={c.sand}>
        <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 26, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ background: c.white, borderRadius: 18, padding: 24, border: "1px solid rgba(255,255,255,.08)" }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: c.charcoal }}>About this experience</h2>
              <p style={{ color: c.stone, fontSize: 16, lineHeight: 1.7, margin: 0 }}>{a.desc}</p>
            </div>

            {/* John's local take */}
            <div style={{ background: grad.jungle, borderRadius: 18, padding: 24, color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 10%, rgba(34,211,238,.4), transparent 45%)" }} />
              <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: 999, background: grad.sunset, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: c.charcoal, flexShrink: 0 }}>J</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <Quote size={16} color={c.gold} />
                    <span style={{ fontWeight: 800, fontSize: 15 }}>John's local take</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: "rgba(255,255,255,.92)" }}>
                    {`"${a.bestFor?.[0] || "Everyone"} love this one — I only work with ${op?.name}, who reply in ${op?.responseTime}. Book the morning slot for the best conditions, and let me handle the pickup timing so it fits the rest of your day."`}
                  </p>
                </div>
              </div>
            </div>

            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
              <InfoList title="What's included" icon={Package} items={a.included} />
              <InfoList title="What to bring" icon={Backpack} items={a.bring} />
            </div>
          </div>

          {/* Book panel */}
          <div style={{ position: "sticky", top: 92, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: c.white, borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 20px 50px -30px rgba(0,0,0,.35)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: c.charcoal }}>{money(a.price)}</span>
                <span style={{ color: c.stone, fontWeight: 600, marginBottom: 6 }}>/ person</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.emerald, fontWeight: 700, fontSize: 13.5, marginTop: 4 }}>
                <ShieldCheck size={15} />Only 20% ({money(a.price * 0.2)}) to reserve
              </div>
              <Button variant={inTrip ? "dark" : "primary"} full size="lg" style={{ marginTop: 18 }} onClick={() => addToTrip(a.id)}>
                {inTrip ? <><Check size={17} />Added to your trip</> : <><Plus size={17} />Add to my trip</>}
              </Button>
              <Button variant="ghost" full size="sm" style={{ marginTop: 10 }} onClick={() => window.alert("Opening WhatsApp concierge…")}>
                <MessageCircle size={15} />Ask about this activity
              </Button>
              <p style={{ textAlign: "center", color: c.stone, fontSize: 12, marginTop: 14, marginBottom: 0 }}>
                {a.confirm ? "Concierge confirms availability within hours." : "Instant availability — reserve anytime."}
              </p>
            </div>

            {/* Operator card */}
            <div style={{ background: c.white, borderRadius: 20, padding: 20, border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: 12, color: c.stone, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Operated by</div>
              <div style={{ fontWeight: 800, color: c.charcoal, fontSize: 17, marginTop: 4 }}>{op?.name}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap", fontSize: 13, color: c.stone, fontWeight: 600 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Star size={13} fill={c.gold} color={c.gold} />{op?.rating}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{op?.region}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} />Replies {op?.responseTime}</span>
              </div>
              {op?.insurance && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, background: "rgba(47,107,235,.08)", color: c.emerald, padding: "7px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12.5 }}>
                  <ShieldCheck size={14} />Insured & vetted by TicoWild
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        <div style={{ marginTop: 46 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: c.charcoal, marginBottom: 20 }}>You might also like</h2>
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
            {alsoLike.map((x, i) => (
              <Reveal key={x.id} delay={(i % 3) * 70}>
                <ActivityCard a={x} onAdd={addToTrip} onView={viewActivity} inTrip={trip.some((t) => t.id === x.id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <style>{`@media(min-width:940px){.detail-grid{grid-template-columns:1fr 360px!important}.detail-grid .two-col{grid-template-columns:1fr 1fr!important}}`}</style>
    </>
  );
}
