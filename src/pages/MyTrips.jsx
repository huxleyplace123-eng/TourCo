import React, { useState } from "react";
import { ArrowRight, Compass, MapPin, Clock, Trash2, ShieldCheck, MessageCircle, Calendar, List, Sparkles, PlusCircle, Route, CalendarCheck, Sun, Utensils, Bed } from "lucide-react";
import { c, grad, money, glass } from "../theme.js";
import { activities } from "../data.js";
import { activityImage, pageHero, cdnImage } from "../images.js";
import { Section, Eyebrow, Button } from "../components/ui.jsx";
import { Photo, useCountUp, Reveal } from "../motion.jsx";
import { StoryPoster } from "../components/TripStory.jsx";
import { SmartPlan } from "../components/SmartPlan.jsx";
import { TripsHero } from "../components/TripsHero.jsx";
import { TicoFace } from "../components/TicoFace.jsx";

// How the trip works — three simple, reassuring steps.
const STEPS = [
  { icon: PlusCircle, title: "1 · Add what you love", body: "Tap 'Add to trip' on any activity, or let Tico build a day-by-day. No account, no commitment — it just gathers here." },
  { icon: Route, title: "2 · We shape the days", body: "Tico orders everything around drive times, tides and season, so your trip flows instead of zig-zagging the coast." },
  { icon: CalendarCheck, title: "3 · Reserve for 20%", body: "Lock it in with a 20% deposit; pay the rest to the vetted operator on the day. Every booking is reconfirmed before you go." },
];

// What a great Costa Rica trip actually looks like — descriptive, not a list of
// cards. A simple day-rhythm with a vivid image, so first-timers 'get it'.
const RHYTHM = [
  { icon: Sun, when: "Mornings", what: "The big adventures — zipline, raft, dive, hike a volcano. Calm, cool, and crowd-free before the day heats up.", img: "photo-1679117730976-cdb5f6b05b88" },
  { icon: Utensils, when: "Afternoons", what: "Slow it down: a soda lunch, a waterfall swim, a beach nap. Green-season rain (if any) rolls through now — perfect timing.", img: "photo-1620658927695-c33df6fb8130" },
  { icon: Bed, when: "Evenings", what: "Sunset on the Pacific, fresh ceviche, a cold Imperial. Then early to bed — the forest wakes you at first light.", img: "photo-1512100356356-de1b84283e18" },
];

function EmptyState({ go }) {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      {/* how it works */}
      <Reveal>
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 26px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "clamp(24px,3.4vw,30px)", fontWeight: 800, color: "#fff", letterSpacing: -0.6 }}>Start your trip — here's how it works</h2>
          <p style={{ color: c.stone, fontSize: 15, lineHeight: 1.55, margin: 0 }}>No forms, no pressure. Add what excites you and it becomes a real, ordered plan.</p>
        </div>
      </Reveal>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginBottom: 34 }}>
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 80}>
            <div style={{ background: c.white, border: `1px solid ${c.line}`, borderRadius: 18, padding: 22, height: "100%" }}>
              <span style={{ display: "inline-flex", width: 46, height: 46, borderRadius: 13, background: grad.jungle, alignItems: "center", justifyContent: "center", boxShadow: "0 0 22px -6px rgba(34,211,238,.7)" }}><s.icon size={22} color="#fff" /></span>
              <h3 style={{ margin: "13px 0 6px", color: c.charcoal, fontSize: 16.5, fontWeight: 800 }}>{s.title}</h3>
              <p style={{ margin: 0, color: c.stone, fontSize: 13.5, lineHeight: 1.55 }}>{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* what a great day looks like */}
      <Reveal>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <TicoFace size={42} mood="happy" />
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, letterSpacing: -0.4 }}>What a great Costa Rica day feels like</h2>
            <p style={{ margin: "3px 0 0", color: c.stone, fontSize: 14 }}><b style={{ color: c.teal }}>Tico:</b> <span style={{ fontStyle: "italic" }}>"Don't over-schedule. The best days have a rhythm — go hard early, then let the coast slow you down."</span></p>
          </div>
        </div>
      </Reveal>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", marginBottom: 34 }}>
        {RHYTHM.map((r, i) => (
          <Reveal key={r.when} delay={i * 80}>
            <div style={{ background: c.white, border: `1px solid ${c.line}`, borderRadius: 18, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative" }}>
                <Photo src={cdnImage(r.img, 560)} fallback={grad.ocean} alt={r.when} height={130}
                  overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(11,26,46,.85) 100%)" }} />} />
                <div style={{ position: "absolute", bottom: 10, left: 13, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 6, color: "#fff", fontWeight: 800, fontSize: 15 }}>
                  <r.icon size={15} color={c.gold} />{r.when}
                </div>
              </div>
              <div style={{ padding: "13px 15px 15px", flex: 1 }}>
                <p style={{ margin: 0, color: c.stone, fontSize: 13.5, lineHeight: 1.55 }}>{r.what}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* CTA */}
      <Reveal>
        <div style={{ ...glass, borderRadius: 22, padding: "26px 24px", textAlign: "center" }}>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 20, margin: "0 0 6px" }}>Ready to build yours?</h3>
          <p style={{ color: c.stone, fontSize: 14.5, margin: "0 0 18px" }}>Add your first experience and watch the plan come together.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" onClick={() => go("build")}>Build my adventure <ArrowRight size={18} /></Button>
            <Button variant="ghost" size="lg" onClick={() => go("activities")}>Browse activities</Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export function MyTrips({ go, trip, removeFromTrip }) {
  const [view, setView] = useState("story"); // 'story' | 'list'
  const chosen = trip.map((t) => ({ ...t, a: activities.find((a) => a.id === t.id) })).filter((x) => x.a);
  const total = chosen.reduce((s, g) => s + g.a.price * g.pax, 0);
  const deposit = useCountUp(Math.round(total * 0.2));

  const ToggleBtn = ({ id, icon: Icon, label }) => (
    <button onClick={() => setView(id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: view === id ? c.teal : "transparent", color: view === id ? c.ink : "#fff", transition: "all .2s" }}>
      <Icon size={16} />{label}
    </button>
  );

  return (
    <>
      <TripsHero count={chosen.length} />
      {chosen.length > 0 && (
        <div style={{ background: c.sand, borderBottom: `1px solid ${c.line}` }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "inline-flex", gap: 6, background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, padding: 5, borderRadius: 999 }}>
              <ToggleBtn id="story" icon={Sparkles} label="Story view" />
              <ToggleBtn id="list" icon={List} label="List view" />
            </div>
          </div>
        </div>
      )}

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
