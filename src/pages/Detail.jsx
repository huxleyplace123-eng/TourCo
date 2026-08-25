import React from "react";
import { ArrowLeft, MapPin, Clock, Compass, Check, Plus, ShieldCheck, MessageCircle, Package, Backpack, Calendar } from "lucide-react";
import { c, grad, gradFor, money } from "../theme.js";
import { activities } from "../data.js";
import { activityImage } from "../images.js";
import { Section, Button, Badge } from "../components/ui.jsx";
import { Photo, Reveal } from "../motion.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";
import { depositTerms } from "../intelligence/trust.js";
import { VibeScores } from "../components/VibeScores.jsx";
import { useConversion } from "../components/ConversionCenter.jsx";

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
  const { openInquiry, openConcierge } = useConversion();
  const a = activeId ? activities.find((x) => x.id === activeId) : activities[0];
  if (!a) {
    return (
      <Section bg={c.sand} pad={80}>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ color: c.charcoal, marginBottom: 10 }}>Experience unavailable</h1>
          <p style={{ color: c.stone }}>This experience is not currently approved for publication.</p>
          <Button variant="primary" onClick={() => go("activities")}>Browse approved experiences</Button>
        </div>
      </Section>
    );
  }
  const terms = depositTerms(a.price, 1);
  const inTrip = trip.some((t) => t.id === a.id);
  const related = activities.filter((x) => x.category === a.category && x.id !== a.id).slice(0, 3);
  const alsoLike = related.length ? related : activities.filter((x) => x.id !== a.id).slice(0, 3);

  return (
    <>
      {/* Hero image band */}
      <div className="detail-hero" style={{ position: "relative" }}>
        <Photo src={activityImage(a, 1600)} fallback={gradFor(a.category)} alt={a.title} height={380} zoom={false}
          overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,20,45,.35) 0%, transparent 30%, rgba(8,20,45,.72) 100%)" }} />} />
        <div className="detail-hero-content" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: 1180, margin: "0 auto", padding: "22px 20px 30px", left: 0, right: 0 }}>
          <button onClick={() => go("activities")} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.9)", border: "none", borderRadius: 999, padding: "9px 16px", fontWeight: 700, color: c.charcoal, cursor: "pointer", fontSize: 14 }}>
            <ArrowLeft size={16} />All activities
          </button>
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <Badge icon={ShieldCheck} bg="rgba(255,255,255,.92)">Curated by TicoWild</Badge>
              {a.family && <Badge bg="rgba(255,255,255,.92)" color={c.blue}>Family-friendly</Badge>}
              {a.private && <Badge bg="rgba(255,255,255,.92)" color={c.orchid}>Private available</Badge>}
            </div>
            <div style={{ color: c.gold, fontWeight: 800, fontSize: 14, letterSpacing: 0.5 }}>{a.category}</div>
            <h1 style={{ color: "#fff", fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, letterSpacing: -1, margin: "4px 0 0", maxWidth: 760 }}>{a.title}</h1>
            <div style={{ display: "flex", gap: 18, color: "rgba(255,255,255,.92)", fontSize: 15, fontWeight: 600, flexWrap: "wrap", marginTop: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={15} />{a.region}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={15} />{a.duration}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Compass size={15} />{a.level}</span>
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

            <div className="detail-decision-block" style={{ padding: "clamp(22px,4vw,30px)", borderRadius: 22, background: c.canvas2, border: `1px solid ${c.line}` }}>
              <div style={{ color: c.teal, fontSize: 11.5, fontWeight: 900, letterSpacing: ".09em", textTransform: "uppercase" }}>No surprises at checkout</div>
              <h2 style={{ color: "#fff", fontSize: "clamp(22px,3vw,30px)", letterSpacing: -.6, margin: "7px 0 8px" }}>What you’ll know before you pay</h2>
              <p style={{ color: c.stone, fontSize: 14, lineHeight: 1.55, margin: "0 0 20px" }}>These details arrive with the availability confirmation, so you can make the decision with the full picture.</p>
              <div className="detail-decision-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
                {[
                  [ShieldCheck, "Confirmed operator"],
                  [Clock, "Exact start and pickup"],
                  [Package, "Final total and inclusions"],
                  [Calendar, "Cancellation terms"],
                ].map(([Icon, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 13px", borderRadius: 14, background: "rgba(255,255,255,.045)", border: `1px solid ${c.line}`, color: "#fff", fontSize: 12.5, fontWeight: 800 }}>
                    <Icon size={16} color={c.teal} style={{ flexShrink: 0 }} />{label}
                  </div>
                ))}
              </div>
            </div>

            {/* TicoWild Vibe Scores — the brain, not a directory */}
            <VibeScores activity={a} />

            {/* TicoWild planning note */}
            <div style={{ background: grad.jungle, borderRadius: 18, padding: 24, color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 10%, rgba(34,211,238,.4), transparent 45%)" }} />
              <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: 999, background: grad.sunset, display: "flex", alignItems: "center", justifyContent: "center", color: c.ink, flexShrink: 0 }}><Compass size={23} /></div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <Compass size={16} color={c.gold} />
                    <span style={{ fontWeight: 800, fontSize: 15 }}>TicoWild planning note</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: "rgba(255,255,255,.92)" }}>
                    This is a strong fit for {a.bestFor?.join(", ") || "travelers who want something memorable"}. We confirm the current operator, start time, pickup details and weather plan before asking you to commit.
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
          <aside className="detail-book-panel" style={{ position: "sticky", top: 92, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: c.white, borderRadius: 20, padding: 24, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 20px 50px -30px rgba(0,0,0,.35)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                <span style={{ color: c.stone, fontWeight: 700, marginBottom: 7, marginRight: 2 }}>From</span>
                <span style={{ fontSize: 32, fontWeight: 800, color: c.charcoal }}>{money(a.price)}</span>
                <span style={{ color: c.stone, fontWeight: 600, marginBottom: 6 }}>/ person</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.teal, fontWeight: 700, fontSize: 13.5, marginTop: 4 }}>
                <ShieldCheck size={15} />Final price and availability confirmed first
              </div>
              <Button variant={inTrip ? "dark" : "primary"} full size="lg" style={{ marginTop: 18 }} onClick={() => addToTrip(a.id)}>
                {inTrip ? <><Check size={17} />Added to your trip</> : <><Plus size={17} />Add to my plan</>}
              </Button>
              <Button variant="ghost" full size="sm" style={{ marginTop: 10 }} onClick={() => openInquiry({ intent: "activity", activity: a, destination: a.region })}>
                <MessageCircle size={15} />Request current availability
              </Button>
              <p style={{ color: c.stone, fontSize: 12, lineHeight: 1.5, marginTop: 14, marginBottom: 0 }}>Adding this to your trip does not reserve it or charge you. TicoWild confirms the exact details first. If you continue, the estimated deposit is {money(terms.deposit)} per person.</p>
            </div>

            {/* Clear next steps instead of publishing unverified operator claims. */}
            <div style={{ background: c.white, borderRadius: 20, padding: 20, border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontWeight: 800, color: c.charcoal, fontSize: 17, marginBottom: 13 }}>What happens after you ask</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {["We check the date and starting time", "We confirm the operator, pickup and final total", "You decide whether to continue"].map((label) => (
                  <div key={label} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <Check size={15} color={c.teal} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: c.charcoal, lineHeight: 1.35 }}>{label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => openConcierge({ intent: "activity", activity_title: a.title, destination: a.region })} style={{ marginTop: 16, background: "none", border: 0, padding: 0, color: c.teal, fontWeight: 800, cursor: "pointer" }}>Ask a question first →</button>
            </div>
          </aside>
        </div>

        {/* Related */}
        <div style={{ marginTop: 46 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: c.charcoal, marginBottom: 20 }}>You might also like</h2>
          <div className="responsive-card-grid" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
            {alsoLike.map((x, i) => (
              <Reveal key={x.id} delay={(i % 3) * 70}>
                <ActivityCard a={x} onAdd={addToTrip} onView={viewActivity} inTrip={trip.some((t) => t.id === x.id)} />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <style>{`
        @media(min-width:940px){.detail-grid{grid-template-columns:1fr 360px!important}.detail-grid .two-col{grid-template-columns:1fr 1fr!important}}
        @media(max-width:520px){.detail-decision-grid{grid-template-columns:1fr!important}}
      `}</style>
    </>
  );
}
