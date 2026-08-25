import React from "react";
import { ArrowRight, CalendarCheck, Check, Compass, Heart, MapPin, MessageCircle, ShieldCheck, Sparkles, Sun, Waves } from "lucide-react";
import { c } from "../theme.js";
import { Button, Section } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";
import { CinematicHero } from "../components/CinematicHero.jsx";
import { useConversion } from "../components/ConversionCenter.jsx";
import { themedSlides } from "../images.js";

const STEPS = [
  { icon: Heart, number: "01", title: "Start with the feeling", body: "Tell us who is traveling and how you want Costa Rica to feel." },
  { icon: MapPin, number: "02", title: "Then shape the route", body: "Once the trip has direction, add where you’ll be and when." },
  { icon: CalendarCheck, number: "03", title: "Confirm before you pay", body: "We check current availability, timing and the final price first." },
];

const SAMPLE_DAYS = [
  { day: "Day 1", icon: Waves, label: "Settle into the coast", title: "Easy arrival + sunset on the water", note: "A relaxed first day with enough room for delays and check-in." },
  { day: "Day 2", icon: Compass, label: "Go wild early", title: "Rainforest and wildlife in the morning", note: "The bigger outing goes first, before the heat and afternoon rain." },
  { day: "Day 3", icon: Sun, label: "Keep one day flexible", title: "Choose the ocean or a waterfall", note: "We confirm conditions and match the day to what feels best." },
];

const JOURNEY = [
  { number: "01", label: "Picture it", detail: "Who is going and how it should feel" },
  { number: "02", label: "Shape it", detail: "Add the route once the trip has direction" },
  { number: "03", label: "Confirm", detail: "Availability, details and final price" },
];

const HOME_STORY_IMAGES = themedSlides("activities", 1000).slice(0, 3);

function Chapter({ number, label }) {
  return (
    <div className="home-chapter" aria-hidden="true">
      <span>{number}</span>
      <i />
      <strong>{label}</strong>
    </div>
  );
}

export function Home({ go }) {
  const { openConcierge } = useConversion();

  return (
    <>
      <CinematicHero go={go} />

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
            <div className="home-support-copy">
              <div className="home-support-label">How it works</div>
              <h2>Here’s what happens next.</h2>
              <p>Start with the kind of trip you want. TicoWild turns that feeling into one plan, then uses your route and dates to make it practical.</p>
            </div>
            <div className="home-steps" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {STEPS.map(({ icon: Icon, number, title, body }) => (
                <div className="home-step-line" key={number}>
                  <div className="home-step-number"><Icon size={18} /><span>{number}</span></div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      <Section className="home-band home-band-plan" bg={c.sand} pad={92}>
        <Chapter number="02" label="See the whole trip" />
        <div className="sample-plan">
          <div className="sample-plan-grid" style={{ display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: "clamp(36px,7vw,86px)", alignItems: "center" }}>
            <Reveal>
              <div>
                <span style={{ color: c.teal, fontWeight: 800, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>One plan, built around you</span>
                <h2 style={{ color: "#fff", fontSize: "clamp(30px,4.4vw,46px)", lineHeight: 1.05, letterSpacing: -1.4, margin: "10px 0 16px" }}>Three days that feel like a trip, not a checklist.</h2>
                <p style={{ color: c.stone, lineHeight: 1.7, fontSize: 16, margin: "0 0 24px" }}>Instead of choosing isolated tours, you see how the days work together around your route, pace and actual dates.</p>
                <Button variant="primary" size="lg" onClick={() => go("build")}><Sparkles size={17} />Build my version</Button>
                <div className="home-story-images" aria-label="Costa Rica trip inspiration">
                  {HOME_STORY_IMAGES.map((image) => (
                    <figure key={image.src}>
                      <img src={image.src} alt={image.label || "Costa Rica experience"} loading="lazy" decoding="async" />
                      <figcaption>{image.label}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </Reveal>
            <div className="sample-plan-timeline">
              {SAMPLE_DAYS.map(({ day, icon: Icon, label, title, note }, index) => (
                <Reveal key={day} delay={index * 80}>
                  <div className="sample-day">
                    <span className="sample-day-icon"><Icon size={19} /></span>
                    <div>
                      <div>{day} · {label}</div>
                      <h3>{title}</h3>
                      <p>{note}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="home-band home-band-close" bg={c.canvas2} pad={88}>
        <Chapter number="03" label="Confirm with confidence" />
        <div className="home-final-grid">
          <div className="home-final-copy">
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: c.teal, fontWeight: 800, marginBottom: 10 }}><ShieldCheck size={20} />Clear before you commit</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(30px,4.5vw,48px)", lineHeight: 1.04, fontWeight: 800, letterSpacing: -1.3, margin: 0 }}>Your trip should feel exciting before you even land.</h2>
            <p style={{ color: c.stone, fontSize: 17, lineHeight: 1.65, margin: "16px 0 0", maxWidth: 610 }}>Start with two quick choices. TicoWild shapes the days, then confirms availability, timing and the final price before you decide.</p>
            <div className="home-final-proof">
              {["Free to plan", "No payment in the planner", "Real details confirmed first"].map((item) => <span key={item}><Check size={15} />{item}</span>)}
            </div>
            <div className="mobile-cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Plan my Costa Rica days <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => openConcierge({ intent: "planning" })}><MessageCircle size={18} />Ask TicoWild</Button>
            </div>
          </div>
          <div className="home-final-mark" aria-hidden="true"><Compass size={84} /></div>
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
        .home-band-plan:before{background:linear-gradient(180deg,rgba(255,255,255,.015),transparent 28%,rgba(34,211,238,.025))}
        .home-band-close:before{background:radial-gradient(55% 90% at 100% 50%,rgba(34,211,238,.14),transparent 68%),radial-gradient(40% 65% at 0% 100%,rgba(255,208,0,.08),transparent 70%)}
        .home-chapter{display:grid;grid-template-columns:auto minmax(34px,72px) auto;align-items:center;gap:12px;width:max-content;margin-bottom:34px;color:${c.stone};text-transform:uppercase;letter-spacing:.13em;font-size:10px;font-weight:900}
        .home-chapter span{color:${c.teal}}.home-chapter i{height:1px;background:linear-gradient(90deg,${c.teal},rgba(34,211,238,.08))}.home-chapter strong{font:inherit;color:${c.stone}}
        .home-step-line{padding:4px 20px 4px 0;border-right:1px solid rgba(127,166,232,.18)}.home-step-line:last-child{border-right:0}.home-step-number{display:flex;align-items:center;gap:10px;color:${c.teal}}.home-step-number span{font-size:11px;font-weight:900;letter-spacing:.1em}.home-step-line h3{color:#fff;font-size:17px;line-height:1.25;margin:18px 0 7px}.home-step-line p{color:${c.stone};font-size:13.5px;line-height:1.55;margin:0}
        .home-support-label{color:${c.stone};font-weight:800;font-size:11px;letter-spacing:.1em;text-transform:uppercase}.home-support-copy h2{color:#fff;font-size:clamp(26px,3vw,38px);line-height:1.08;letter-spacing:-1px;margin:9px 0 13px}.home-support-copy p{color:${c.stone};line-height:1.7;font-size:16px;margin:0}
        .sample-plan{border-top:1px solid rgba(127,166,232,.18);border-bottom:1px solid rgba(127,166,232,.18);padding:clamp(32px,5vw,54px) 0}
        .home-story-images{display:grid;grid-template-columns:1.35fr .85fr;grid-template-rows:repeat(2,86px);gap:8px;margin-top:26px}.home-story-images figure{position:relative;overflow:hidden;border-radius:14px;margin:0;border:1px solid rgba(255,255,255,.12);background:${c.canvas2}}.home-story-images figure:first-child{grid-row:1 / 3}.home-story-images img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}.home-story-images figure:hover img{transform:scale(1.035)}.home-story-images figure:after{content:"";position:absolute;inset:42% 0 0;background:linear-gradient(transparent,rgba(5,15,33,.74))}.home-story-images figcaption{position:absolute;z-index:1;left:10px;right:10px;bottom:8px;color:#fff;font-size:10.5px;font-weight:800;text-shadow:0 1px 8px rgba(0,0,0,.7)}
        .sample-plan-timeline{position:relative}.sample-plan-timeline:before{content:"";position:absolute;left:21px;top:24px;bottom:24px;width:1px;background:linear-gradient(${c.teal},rgba(127,166,232,.18),${c.gold})}
        .sample-day{position:relative;display:grid;grid-template-columns:44px 1fr;gap:18px;padding:18px 0}.sample-day+.sample-day{border-top:1px solid rgba(127,166,232,.12)}.sample-day-icon{position:relative;z-index:1;width:42px;height:42px;border-radius:50%;background:${c.canvas2};border:1px solid rgba(34,211,238,.35);color:${c.teal};display:grid;place-items:center}.sample-day>div>div{color:${c.teal};font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.sample-day h3{color:#fff;font-size:17px;margin:4px 0}.sample-day p{color:${c.stone};font-size:13px;line-height:1.5;margin:0}
        .home-final-grid{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:clamp(36px,7vw,96px);align-items:center}.home-final-proof{display:flex;flex-wrap:wrap;gap:10px 20px;margin-top:22px;color:${c.stone};font-size:13.5px}.home-final-proof span{display:inline-flex;align-items:center;gap:7px}.home-final-proof svg{color:${c.teal}}.home-final-mark{width:240px;height:240px;border-radius:50%;display:grid;place-items:center;color:#fff;background:radial-gradient(circle at 35% 30%,rgba(255,208,0,.85),rgba(34,211,238,.48) 44%,rgba(11,26,46,.18) 72%);box-shadow:0 40px 100px -42px rgba(34,211,238,.9)}
        @media(max-width:980px){.home-intro,.sample-plan-grid,.home-final-grid{grid-template-columns:1fr!important}.home-journey-inner{gap:12px}.home-journey-step small{display:none}.home-final-mark{display:none}}
        @media(max-width:720px){.home-journey{padding:0 16px}.home-journey-inner{min-height:84px;grid-template-columns:1fr auto 1fr auto 1fr;gap:6px}.home-journey-step{display:grid;justify-items:center;text-align:center;gap:5px}.home-journey-step>span{width:30px;height:30px;flex-basis:30px;border-radius:10px}.home-journey-step strong{font-size:11px;line-height:1.15}.home-journey-arrow{width:13px}.home-band-how{padding-top:52px!important;padding-bottom:54px!important}.home-band-how:before{display:none}.home-band-how .home-chapter{display:none}.home-support-label{color:${c.stone};font-size:10px}.home-support-copy h2{font-size:23px;line-height:1.16;letter-spacing:-.45px;margin:7px 0 10px}.home-support-copy p{font-size:14.5px;line-height:1.62}.home-steps{grid-template-columns:1fr!important;gap:0!important}.home-step-line{display:grid;grid-template-columns:42px 1fr;padding:22px 0;border-right:0;border-bottom:1px solid rgba(127,166,232,.15)}.home-step-line:last-child{border-bottom:0}.home-step-number{grid-row:1 / span 2;align-self:start;display:grid;justify-items:center;gap:4px}.home-step-line h3{margin:0 0 6px}.home-step-line p{margin:0}.sample-plan{padding:30px 0}.home-story-images{grid-template-rows:repeat(2,78px);margin-top:22px}.home-story-images figcaption{font-size:9.5px}.sample-day{grid-template-columns:40px 1fr;gap:14px}.sample-day-icon{width:40px;height:40px}.home-final-proof{display:grid;gap:10px}}
      `}</style>
    </>
  );
}
