import React from "react";
import { ArrowRight, CalendarCheck, Check, Compass, MapPin, MessageCircle, Route, Search, ShieldCheck, Sparkles } from "lucide-react";
import { c, grad, glass } from "../theme.js";
import { pageHero } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { Reveal } from "../motion.jsx";
import { useConversion } from "../components/ConversionCenter.jsx";

const STEPS = [
  { icon: MapPin, title: "Share the shape of your trip", body: "Where you are staying, your dates, who is traveling and the kind of day you want." },
  { icon: Route, title: "We narrow the choices", body: "TicoWild uses the route, pace and season to suggest a smaller set of experiences that fit together." },
  { icon: CalendarCheck, title: "We confirm the real details", body: "Availability, starting time, pickup, operator and final price are checked before you are asked to pay." },
];

const CLEAR = [
  { icon: Search, title: "What the website shows", items: ["A curated starting selection", "Estimated pricing", "Typical duration and difficulty", "Seasonal and route guidance"] },
  { icon: ShieldCheck, title: "What TicoWild confirms", items: ["Current availability", "The operating partner", "Exact pickup and starting time", "Final price and next steps"] },
];

export function Why({ go }) {
  const { openConcierge } = useConversion();
  return (
    <>
      <PageHero
        image={pageHero("why")}
        eyebrow="How TicoWild works"
        title="Less searching. Better Costa Rica days."
        sub="TicoWild helps you turn a giant list of possible tours into a smaller plan that fits where you are staying, how you travel and how much time you actually have."
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
          <Button variant="primary" size="lg" onClick={() => go("build")}>Start my plan <ArrowRight size={18} /></Button>
          <Button variant="glass" size="lg" onClick={() => openConcierge({ intent: "planning" })}><MessageCircle size={18} />Ask Rico</Button>
        </div>
      </PageHero>

      <Section bg={c.sand} pad={68}>
        <div style={{ textAlign: "center", maxWidth: 670, margin: "0 auto 36px" }}>
          <span style={{ color: c.teal, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>Three simple steps</span>
          <h2 style={{ color: "#fff", fontSize: "clamp(30px,4.6vw,46px)", lineHeight: 1.06, letterSpacing: -1.3, margin: "9px 0 12px" }}>From “what should we do?” to a plan that makes sense.</h2>
          <p style={{ color: c.stone, fontSize: 16, lineHeight: 1.7, margin: 0 }}>The planner is free. Adding something to a trip does not reserve it or charge you.</p>
        </div>
        <div className="why-step-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 80}>
              <div style={{ ...glass, borderRadius: 22, padding: 24, height: "100%" }}>
                <span style={{ width: 48, height: 48, borderRadius: 15, background: index === 2 ? "rgba(255,208,0,.13)" : "rgba(34,211,238,.12)", color: index === 2 ? c.gold : c.teal, display: "grid", placeItems: "center" }}><Icon size={22} /></span>
                <div style={{ color: "rgba(255,255,255,.25)", fontWeight: 900, fontSize: 13, marginTop: 21 }}>0{index + 1}</div>
                <h3 style={{ color: "#fff", fontSize: 19, margin: "5px 0 8px" }}>{title}</h3>
                <p style={{ color: c.stone, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.sand} pad={54}>
        <div className="why-clear-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {CLEAR.map(({ icon: Icon, title, items }, index) => (
            <Reveal key={title} delay={index * 90}>
              <div style={{ background: index ? grad.hero : c.canvas2, border: `1px solid ${c.line}`, borderRadius: 24, padding: "clamp(24px,4vw,38px)", height: "100%" }}>
                <span style={{ color: index ? c.gold : c.teal, display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase" }}><Icon size={18} />{title}</span>
                <div style={{ display: "grid", gap: 13, marginTop: 22 }}>
                  {items.map((item) => <div key={item} style={{ color: "rgba(255,255,255,.84)", display: "flex", alignItems: "center", gap: 10, fontSize: 15 }}><Check size={16} color={index ? c.gold : c.teal} />{item}</div>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.sand} pad={68}>
        <Reveal>
          <div className="why-difference" style={{ display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: "clamp(30px,7vw,86px)", alignItems: "center", padding: "clamp(26px,5vw,50px)", borderRadius: 28, ...glass }}>
            <div style={{ width: "min(220px,60vw)", aspectRatio: 1, borderRadius: 999, margin: "0 auto", background: "radial-gradient(circle at 34% 28%, rgba(255,208,0,.9), rgba(34,211,238,.58) 42%, rgba(11,26,46,.2) 70%)", boxShadow: "0 35px 90px -35px rgba(34,211,238,.8)", display: "grid", placeItems: "center" }}>
              <Compass size={72} color="#fff" strokeWidth={1.3} />
            </div>
            <div>
              <span style={{ color: c.gold, fontSize: 12, fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase" }}>The real difference</span>
              <h2 style={{ color: "#fff", fontSize: "clamp(29px,4.4vw,45px)", lineHeight: 1.05, letterSpacing: -1.2, margin: "9px 0 14px" }}>We are not trying to show you everything.</h2>
              <p style={{ color: c.stone, fontSize: 16.5, lineHeight: 1.72, margin: 0 }}>Instead of scrolling through hundreds of nearly identical listings, you get a smaller set of experiences that fit your route, pace and available time.</p>
              <div style={{ marginTop: 22 }}><Button variant="primary" onClick={() => go("activities")}><Sparkles size={16} />Explore the curated list</Button></div>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section bg={c.sand} pad={68}>
        <div style={{ borderRadius: 28, background: grad.hero, padding: "clamp(28px,5vw,54px)", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(28px,4.5vw,44px)", margin: 0, letterSpacing: -1.2 }}>Start with the trip you want to remember.</h2>
          <p style={{ color: "rgba(255,255,255,.75)", fontSize: 16.5, lineHeight: 1.65, maxWidth: 560, margin: "13px auto 24px" }}>Choose the feeling first. Your destination and dates come next, once the plan has a direction.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" onClick={() => go("build")}>Build my plan <ArrowRight size={18} /></Button>
            <Button variant="glass" size="lg" onClick={() => openConcierge({ intent: "planning" })}><MessageCircle size={18} />Ask Rico</Button>
          </div>
        </div>
      </Section>

      <style>{`@media(max-width:760px){.why-step-grid,.why-clear-grid,.why-difference{grid-template-columns:1fr!important}}`}</style>
    </>
  );
}
