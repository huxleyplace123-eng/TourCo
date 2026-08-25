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

export function Home({ go, addToTrip, trip, viewActivity, startPlan }) {
  const featured = activities.slice(0, 4);
  const { openConcierge } = useConversion();

  return (
    <>
      <CinematicHero go={go} onStartPlan={startPlan} />

      <Section bg={c.sand} pad={68}>
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

      <Section bg={c.sand} pad={54}>
        <div className="section-action-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <SectionHead eyebrow="A few places to start" title="Experiences worth building a day around" accent />
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

      <Section bg={c.sand} pad={68}>
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

      <Section bg={c.sand} pad={58}>
        <div className="home-trust" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 30, alignItems: "center", borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}`, padding: "38px 0" }}>
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

      <Section bg={c.sand} pad={70}>
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
        @media(max-width:980px){.home-intro,.sample-plan-grid{grid-template-columns:1fr!important}.home-featured-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:720px){.home-steps{grid-template-columns:1fr!important}.home-steps>div{min-height:0!important}.home-featured-grid{grid-template-columns:1fr!important}.home-featured-grid>*:nth-child(n+3){display:none!important}.home-trust{grid-template-columns:1fr!important}.home-trust button{width:100%}.sample-day{grid-template-columns:52px 1fr!important;padding:14px!important}}
      `}</style>
    </>
  );
}
