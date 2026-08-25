import React from "react";
import { ArrowRight, CalendarCheck, Check, Compass, MapPin, MessageCircle, Route, ShieldCheck, Sparkles, Sun, Waves } from "lucide-react";
import { c, grad, glass } from "../theme.js";
import { activities } from "../data.js";
import { Button, Section, SectionHead } from "../components/ui.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";
import { Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";
import { useConversion } from "../components/ConversionCenter.jsx";

const STEPS = [
  { icon: MapPin, number: "01", title: "Tell us where you’ll be", body: "Share your dates, stops and the kind of trip you want." },
  { icon: Route, number: "02", title: "Get a plan that fits", body: "We narrow the options and arrange the days around your route." },
  { icon: CalendarCheck, number: "03", title: "Confirm before you pay", body: "We check current availability, timing and the final price first." },
];

const SAMPLE_DAYS = [
  { day: "Day 1", icon: Waves, label: "Settle into the coast", title: "Easy arrival + sunset on the water", note: "A relaxed first day with enough room for delays and check-in." },
  { day: "Day 2", icon: Compass, label: "Go wild early", title: "Rainforest and wildlife in the morning", note: "The bigger outing goes first, before the heat and afternoon rain." },
  { day: "Day 3", icon: Sun, label: "Keep one day flexible", title: "Choose the ocean or a waterfall", note: "We confirm conditions and match the day to what feels best." },
];

const JOURNEY = [
  { number: "01", label: "Tell us", detail: "Where, who and what kind of trip" },
  { number: "02", label: "See your fit", detail: "A few choices that work together" },
  { number: "03", label: "Confirm", detail: "Availability, details and final price" },
];

function Chapter({ number, label }) {
  return (
    <div className="home-chapter" aria-hidden="true">
      <span>{number}</span>
      <i />
      <strong>{label}</strong>
    </div>
  );
}

export function Home({ go, addToTrip, trip, viewActivity, startPlan }) {
  const featured = activities.slice(0, 4);
  const { openConcierge } = useConversion();

  return (
    <>
      <CinematicHero go={go} onStartPlan={startPlan} />

      <div className="home-journey" aria-label="How planning works">
        <div className="home-journey-inner">
          {JOURNEY.map((item, index) => (
            <React.Fragment key={item.number}>
              <div className="home-journey-step">
                <span>{item.number}</span>
                <div><strong>{item.label}</strong><small>{item.detail}</small></div>
              </div>
              {index < JOURNEY.length - 1 && <ArrowRight className="home-journey-arrow" size={18} aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Section className="home-band home-band-how" bg={c.canvas2} pad={84}>
        <Chapter number="01" label="Start simply" />
        <Reveal>
          <div className="home-intro" style={{ display: "grid", gridTemplateColumns: "minmax(0,.8fr) minmax(0,1.2fr)", gap: "clamp(30px,6vw,78px)", alignItems: "start" }}>
            <div>
              <div style={{ color: c.teal, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>How TicoWild works</div>
              <h2 style={{ color: "#fff", fontSize: "clamp(30px,4.7vw,48px)", lineHeight: 1.04, letterSpacing: -1.5, margin: "10px 0 14px" }}>A better trip starts with fewer, better choices.</h2>
              <p style={{ color: c.stone, lineHeight: 1.7, fontSize: 16.5, margin: 0 }}>You do not need another list of hundreds of tours. Tell us where you are staying and we will help you choose experiences that actually fit the trip.</p>
            </div>
            <div className="home-steps" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {STEPS.map(({ icon: Icon, number, title, body }) => (
                <div key={number} style={{ ...glass, borderRadius: 20, padding: 20, minHeight: 210, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(34,211,238,.12)", color: c.teal, display: "grid", placeItems: "center" }}><Icon size={20} /></span>
                    <span style={{ color: "rgba(255,255,255,.22)", fontSize: 25, fontWeight: 800 }}>{number}</span>
                  </div>
                  <h3 style={{ color: "#fff", fontSize: 16.5, lineHeight: 1.25, margin: "22px 0 8px" }}>{title}</h3>
                  <p style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      <Section className="home-band home-band-discover" bg={c.sand} pad={82}>
        <Chapter number="02" label="Choose what fits" />
        <div className="section-action-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <SectionHead eyebrow="A short list, not endless scrolling" title="Experiences worth building a day around" accent sub="Each one shows the starting price, location, time needed and who it fits best, so you can decide quickly." />
          <Button variant="ghost" onClick={() => go("activities")}>See all experiences <ArrowRight size={16} /></Button>
        </div>
        <div className="responsive-card-grid home-featured-grid" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
          {featured.map((activity, index) => (
            <Reveal key={activity.id} delay={index * 70}>
              <ActivityCard compact a={activity} onAdd={addToTrip} onView={viewActivity} inTrip={trip.some((item) => item.id === activity.id)} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="home-band home-band-plan" bg={c.canvas2} pad={86}>
        <Chapter number="03" label="See the whole day" />
        <div className="sample-plan" style={{ position: "relative", overflow: "hidden", borderRadius: 30, background: grad.hero, border: `1px solid ${c.line}`, padding: "clamp(24px,5vw,50px)" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 88% 12%, rgba(255,208,0,.2), transparent 38%), radial-gradient(circle at 8% 88%, rgba(34,211,238,.2), transparent 42%)" }} />
          <div className="sample-plan-grid" style={{ position: "relative", display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: "clamp(28px,6vw,72px)", alignItems: "center" }}>
            <Reveal>
              <div>
                <span style={{ color: c.gold, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>What planning looks like</span>
                <h2 style={{ color: "#fff", fontSize: "clamp(30px,4.4vw,46px)", lineHeight: 1.05, letterSpacing: -1.4, margin: "10px 0 16px" }}>Three days that feel like a trip, not a checklist.</h2>
                <p style={{ color: "rgba(255,255,255,.74)", lineHeight: 1.7, fontSize: 16, margin: "0 0 24px" }}>This is the difference: the experiences fit the route, the pace and each other. Your final plan changes around your actual dates and interests.</p>
                <Button variant="primary" size="lg" onClick={() => go("build")}><Sparkles size={17} />Build my version</Button>
              </div>
            </Reveal>
            <div style={{ display: "grid", gap: 12 }}>
              {SAMPLE_DAYS.map(({ day, icon: Icon, label, title, note }, index) => (
                <Reveal key={day} delay={index * 80}>
                  <div className="sample-day" style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 16, alignItems: "center", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.13)", borderRadius: 18, padding: 16 }}>
                    <span style={{ width: 54, height: 54, borderRadius: 16, background: index === 1 ? "rgba(255,208,0,.17)" : "rgba(34,211,238,.14)", color: index === 1 ? c.gold : c.teal, display: "grid", placeItems: "center" }}><Icon size={23} /></span>
                    <div>
                      <div style={{ color: c.teal, fontSize: 11.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase" }}>{day} · {label}</div>
                      <h3 style={{ color: "#fff", fontSize: 17, margin: "4px 0 4px" }}>{title}</h3>
                      <p style={{ color: "rgba(255,255,255,.62)", fontSize: 13, lineHeight: 1.45, margin: 0 }}>{note}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="home-band home-band-confirm" bg={c.sand} pad={82}>
        <Chapter number="04" label="Know before you commit" />
        <div className="home-trust" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 30, alignItems: "center", padding: "clamp(26px,4vw,40px)", borderRadius: 26, background: "linear-gradient(125deg,rgba(34,211,238,.11),rgba(255,255,255,.035) 55%,rgba(255,208,0,.08))", border: `1px solid ${c.line}` }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: c.teal, fontWeight: 800, marginBottom: 8 }}><ShieldCheck size={20} />Clear before you commit</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(25px,3.8vw,38px)", letterSpacing: -1, margin: "0 0 10px" }}>Availability, timing and the final price are confirmed first.</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "9px 18px", color: c.stone, fontSize: 14 }}>
              {["No payment in the planning form", "Ask a real person", "Know what happens next"].map((item) => <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={14} color={c.teal} />{item}</span>)}
            </div>
          </div>
          <Button variant="ghost" size="lg" onClick={() => openConcierge({ intent: "planning" })}><MessageCircle size={17} />Ask a question</Button>
        </div>
      </Section>

      <Section className="home-band home-band-close" bg={c.canvas2} pad={88}>
        <div className="closing-cta" style={{ position: "relative", borderRadius: 30, overflow: "hidden", background: grad.hero, padding: "60px 28px", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 20%, rgba(255,208,0,.28), transparent 50%)" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 800, letterSpacing: -1, margin: 0 }}>Tell us where you’re staying. We’ll help shape the days.</h2>
            <p style={{ color: "rgba(255,255,255,.78)", fontSize: 17, lineHeight: 1.6, marginTop: 14, maxWidth: 600, marginInline: "auto" }}>Start with a simple plan or ask about one experience. Either way, the details are confirmed before you commit.</p>
            <div className="mobile-cta-row" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 26 }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Plan my Costa Rica days <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => openConcierge({ intent: "planning" })}><MessageCircle size={18} />Ask TicoWild</Button>
            </div>
          </div>
        </div>
      </Section>

      <style>{`
        .home-journey{position:relative;background:#081525;border-bottom:1px solid rgba(127,166,232,.18);padding:0 20px}
        .home-journey-inner{max-width:1180px;margin:0 auto;min-height:108px;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;gap:22px}
        .home-journey-step{display:flex;align-items:center;gap:14px;min-width:0}
        .home-journey-step>span{width:38px;height:38px;flex:0 0 38px;border-radius:12px;display:grid;place-items:center;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.26);color:${c.teal};font-size:11px;font-weight:900;letter-spacing:.08em}
        .home-journey-step div{display:grid;gap:3px;min-width:0}.home-journey-step strong{color:#fff;font-size:14px}.home-journey-step small{color:${c.stone};font-size:11.5px;line-height:1.35}
        .home-journey-arrow{color:rgba(127,166,232,.45)}
        .home-band{position:relative;isolation:isolate;border-bottom:1px solid rgba(127,166,232,.13)}
        .home-band:before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none}
        .home-band-how:before{background:radial-gradient(55% 70% at 0% 35%,rgba(34,211,238,.08),transparent 70%)}
        .home-band-discover:before{background:radial-gradient(45% 65% at 100% 30%,rgba(127,166,232,.09),transparent 70%)}
        .home-band-plan:before{background:linear-gradient(180deg,rgba(255,255,255,.015),transparent 28%,rgba(34,211,238,.025))}
        .home-band-confirm:before{background:radial-gradient(55% 90% at 50% 100%,rgba(255,208,0,.055),transparent 70%)}
        .home-chapter{display:grid;grid-template-columns:auto minmax(34px,72px) auto;align-items:center;gap:12px;width:max-content;margin-bottom:34px;color:${c.stone};text-transform:uppercase;letter-spacing:.13em;font-size:10px;font-weight:900}
        .home-chapter span{color:${c.teal}}.home-chapter i{height:1px;background:linear-gradient(90deg,${c.teal},rgba(34,211,238,.08))}.home-chapter strong{font:inherit;color:${c.stone}}
        @media(max-width:980px){.home-intro,.sample-plan-grid{grid-template-columns:1fr!important}.home-featured-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.home-journey-inner{gap:12px}.home-journey-step small{display:none}}
        @media(max-width:720px){.home-journey{padding:0 16px}.home-journey-inner{min-height:84px;grid-template-columns:1fr auto 1fr auto 1fr;gap:6px}.home-journey-step{display:grid;justify-items:center;text-align:center;gap:5px}.home-journey-step>span{width:30px;height:30px;flex-basis:30px;border-radius:10px}.home-journey-step strong{font-size:11px;line-height:1.15}.home-journey-arrow{width:13px}.home-chapter{margin-bottom:24px}.home-steps{grid-template-columns:1fr!important}.home-steps>div{min-height:0!important}.home-featured-grid{grid-template-columns:1fr!important}.home-featured-grid>*:nth-child(n+3){display:none!important}.home-trust{grid-template-columns:1fr!important}.home-trust button{width:100%}.sample-day{grid-template-columns:52px 1fr!important;padding:14px!important}}
      `}</style>
    </>
  );
}
