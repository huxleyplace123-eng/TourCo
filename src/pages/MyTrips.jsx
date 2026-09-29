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
import { useConversion } from "../components/ConversionCenter.jsx";

// How the trip works — three simple, reassuring steps.
const STEPS = [
  { icon: PlusCircle, number: "01", title: "Save your favorites", body: "Keep the experiences that feel right." },
  { icon: Route, number: "02", title: "We shape the trip", body: "Rico arranges the best order and timing." },
  { icon: CalendarCheck, number: "03", title: "Confirm when ready", body: "We verify every detail before you pay." },
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
        <div className="trip-start-intro">
          <span>Simple from the start</span>
          <h2>From inspiration to a confirmed trip.</h2>
          <p>Save what excites you. We’ll make the pieces fit.</p>
        </div>
        <ol className="trip-start-progress" aria-label="Three steps from inspiration to confirmation">
          {STEPS.map((s) => (
            <li key={s.number}>
              <div className="trip-start-marker">
                <s.icon size={18} aria-hidden="true" />
                <span>{s.number}</span>
              </div>
              <div className="trip-start-copy">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* what a great day looks like */}
      <Reveal>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <TicoFace size={42} mood="happy" />
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, letterSpacing: -0.4 }}>What a great Costa Rica day feels like</h2>
            <p style={{ margin: "3px 0 0", color: c.stone, fontSize: 14 }}><b style={{ color: c.teal }}>Rico:</b> <span style={{ fontStyle: "italic" }}>"Don't over-schedule. The best days have a rhythm — go hard early, then let the coast slow you down."</span></p>
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

export function MyTrips({ go, trip, removeFromTrip, viewActivity }) {
  const { openInquiry, openConcierge } = useConversion();
  const [view, setView] = useState("story"); // 'story' | 'list'
  const chosen = trip.map((t) => ({ ...t, a: activities.find((a) => a.id === t.id) })).filter((x) => x.a);
  const tripRegions = [...new Set(chosen.map(({ a }) => a.region).filter(Boolean))];
  const inquiryDetails = {
    intent: "trip",
    activity_ids: chosen.map(({ a }) => a.id),
    activity_titles: chosen.map(({ a }) => a.title),
    destination: tripRegions.length === 1 ? tripRegions[0] : "",
  };
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
          <div className="trip-view-toggle" style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "inline-flex", gap: 6, background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, padding: 5, borderRadius: 999 }}>
              <ToggleBtn id="story" icon={Sparkles} label="Story view" />
              <ToggleBtn id="list" icon={List} label="List view" />
            </div>
          </div>
        </div>
      )}

      <Section bg={c.canvas2} className="trip-workspace" pad={chosen.length ? 64 : 54}>
        {chosen.length > 0 && (
          <div className="trip-progress" aria-label="Trip confirmation progress">
            <div className="trip-progress-step is-current"><span>1</span><div><strong>Ideas saved</strong><small>Stored on this device</small></div></div>
            <i aria-hidden="true" />
            <div className="trip-progress-step"><span>2</span><div><strong>Availability check</strong><small>Not requested yet</small></div></div>
            <i aria-hidden="true" />
            <div className="trip-progress-step"><span>3</span><div><strong>Confirm and pay</strong><small>Only after details are clear</small></div></div>
          </div>
        )}
        {chosen.length > 0 && view === "story" ? (
          <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 30, alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.charcoal, margin: "0 0 20px" }}>Your smart day-by-day</h2>
              <SmartPlan chosen={chosen} pax={chosen[0]?.pax || 2} />
              <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
                <Button variant="primary" onClick={() => openInquiry(inquiryDetails)}>
                  <ShieldCheck size={16} />Request availability
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
                <div key={id} className="trip-list-card" style={{ background: c.white, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", display: "flex", flexWrap: "wrap" }}>
                  <div className="trip-list-photo" style={{ width: 140, minWidth: 140, flex: "0 0 140px" }}>
                    <Photo src={activityImage(a)} fallback={grad.ocean} alt={a.title} height={130} zoom={false} />
                  </div>
                  <div className="trip-list-body" style={{ padding: 16, flex: 1, minWidth: 200, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.teal }}>{a.category}</div>
                    <h3 style={{ margin: "3px 0 6px", fontSize: 17, fontWeight: 800, color: c.charcoal }}>{a.title}</h3>
                    <div style={{ display: "flex", gap: 14, color: c.stone, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{a.region}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} />{a.duration}</span>
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, color: c.charcoal, fontSize: 16 }}>{money(a.price)} <span style={{ color: c.stone, fontWeight: 600, fontSize: 13 }}>× {pax}</span></span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Button variant="ghost" size="sm" onClick={() => viewActivity(a.id)}>Details</Button>
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
                <span style={{ fontWeight: 800, color: c.charcoal }}>Estimated deposit after confirmation</span>
                <span style={{ fontWeight: 800, fontSize: 24, color: c.emerald }}>{money(deposit)}</span>
              </div>
              <Button variant="primary" full size="lg" style={{ marginTop: 18 }} onClick={() => openInquiry(inquiryDetails)}>
                <ShieldCheck size={17} />Request availability
              </Button>
              <Button variant="ghost" full size="sm" style={{ marginTop: 10 }} onClick={() => openConcierge({ intent: "trip", activity_titles: chosen.map(({ a }) => a.title) })}>
                <MessageCircle size={15} />Ask about this plan
              </Button>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: c.stone, fontSize: 12.5, marginTop: 14, justifyContent: "center" }}>
                <Calendar size={14} />No payment is taken until details are confirmed
              </div>
            </div>
          </div>
        )}
      </Section>

      <style>{`
        .trip-workspace{border-top:1px solid rgba(127,166,232,.13)}
        .trip-start-intro{text-align:center;max-width:650px;margin:0 auto 28px}.trip-start-intro>span{display:inline-flex;align-items:center;gap:8px;color:${c.teal};font-size:10.5px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.trip-start-intro>span:before{content:"";width:24px;height:1px;background:${c.teal}}.trip-start-intro h2{margin:10px 0 8px;color:#fff;font-size:clamp(25px,3.4vw,34px);font-weight:850;letter-spacing:-.8px;line-height:1.08}.trip-start-intro p{color:${c.stone};font-size:15px;line-height:1.55;margin:0}
        .trip-start-progress{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:36px;list-style:none;margin:0 0 46px;padding:4px 12px 0}.trip-start-progress:before{content:"";position:absolute;top:27px;left:16.5%;right:16.5%;height:2px;background:linear-gradient(90deg,${c.teal},rgba(69,194,218,.7) 50%,${c.gold});box-shadow:0 0 18px rgba(34,211,238,.22)}.trip-start-progress li{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;min-width:0}.trip-start-marker{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#102847;border:1px solid rgba(91,210,229,.5);color:${c.teal};box-shadow:0 0 0 7px ${c.canvas2},0 12px 30px -12px rgba(34,211,238,.75)}.trip-start-marker span{position:absolute;top:-1px;right:calc(50% - 31px);min-width:21px;height:21px;padding:0 4px;border-radius:999px;display:grid;place-items:center;background:${c.gold};color:#071425;border:3px solid ${c.canvas2};font-size:8px;font-weight:950;letter-spacing:.04em}.trip-start-progress li:last-child .trip-start-marker{border-color:rgba(255,208,0,.56);color:${c.gold}}.trip-start-copy{max-width:245px;margin-top:18px}.trip-start-copy h3{margin:0 0 5px;color:#fff;font-size:16px;font-weight:850;letter-spacing:-.2px}.trip-start-copy p{margin:0;color:${c.stone};font-size:13px;line-height:1.48}
        .trip-progress{display:grid;grid-template-columns:1fr minmax(24px,70px) 1fr minmax(24px,70px) 1fr;align-items:center;gap:12px;margin:0 0 46px;padding:18px 20px;border:1px solid ${c.line};border-radius:20px;background:rgba(11,26,46,.45)}
        .trip-progress-step{display:flex;align-items:center;gap:11px;min-width:0;opacity:.58}.trip-progress-step.is-current{opacity:1}
        .trip-progress-step>span{width:34px;height:34px;flex:0 0 34px;border-radius:11px;display:grid;place-items:center;border:1px solid rgba(127,166,232,.28);color:${c.stone};font-size:12px;font-weight:900}
        .trip-progress-step.is-current>span{background:rgba(34,211,238,.12);border-color:rgba(34,211,238,.42);color:${c.teal}}
        .trip-progress-step div{display:grid;gap:2px;min-width:0}.trip-progress-step strong{color:#fff;font-size:13.5px}.trip-progress-step small{color:${c.stone};font-size:11px;line-height:1.25}
        .trip-progress>i{height:1px;background:linear-gradient(90deg,rgba(34,211,238,.4),rgba(127,166,232,.12))}
        @media(min-width:940px){.detail-grid{grid-template-columns:1fr 340px!important}}
        @media(max-width:720px){.trip-start-intro{text-align:left;margin-bottom:25px}.trip-start-intro>span:before{display:none}.trip-start-intro h2{font-size:25px;margin-top:8px}.trip-start-intro p{font-size:14.5px}.trip-start-progress{display:grid;grid-template-columns:1fr;gap:0;margin:0 0 38px;padding:0}.trip-start-progress:before{top:22px;bottom:22px;left:21px;right:auto;width:2px;height:auto;background:linear-gradient(180deg,${c.teal},rgba(69,194,218,.72) 50%,${c.gold})}.trip-start-progress li{display:grid;grid-template-columns:44px minmax(0,1fr);gap:15px;align-items:center;text-align:left;padding:0 0 22px}.trip-start-progress li:last-child{padding-bottom:0}.trip-start-marker{width:44px;height:44px;box-shadow:0 0 0 6px ${c.canvas2},0 10px 24px -12px rgba(34,211,238,.8)}.trip-start-marker span{right:-4px;top:-5px;border-width:2px}.trip-start-copy{max-width:none;margin:0}.trip-start-copy h3{font-size:15.5px}.trip-start-copy p{font-size:12.75px}.trip-progress{grid-template-columns:1fr;margin-bottom:32px;padding:16px}.trip-progress>i{width:1px;height:16px;margin-left:16px}.trip-progress-step small{font-size:11.5px}}
      `}</style>
    </>
  );
}
