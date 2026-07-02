import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, MessageCircle, MapPin, Star, Quote, Check, Award, Lock, Phone, DollarSign, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { c, grad, glass, gradText } from "../theme.js";
import { heroImage, personImage, sceneImage } from "../images.js";
import { Section, Eyebrow, Button } from "../components/ui.jsx";
import { Reveal, Photo, CountUpNumber, Magnetic, TiltCard } from "../motion.jsx";

const STATS = [
  { value: 4200, suffix: "+", label: "Adventures booked" },
  { value: 4.9, decimals: 1, suffix: "★", label: "Average operator rating" },
  { value: 50, suffix: "+", label: "Vetted local operators" },
  { value: 98, suffix: "%", label: "Would travel with us again" },
];

const PILLARS = [
  { icon: ShieldCheck, key: "vetted", tag: "Safety first", title: "Only vetted operators", body: "Every tour partner is insured, licensed, and personally checked by our team on the ground. If we wouldn't send our own family, they're not on the platform — period.", points: ["Insurance verified", "Licensed & permitted", "Vetted on-site"] },
  { icon: DollarSign, key: "pricing", tag: "No surprises", title: "Transparent pricing", body: "See real per-person prices upfront. Reserve for just 20%, settle the rest closer to your trip. No inflated tourist markups, no hidden fees, no games — ever.", points: ["Prices shown upfront", "Only 20% to reserve", "Zero hidden fees"] },
  { icon: MessageCircle, key: "concierge", tag: "Real humans", title: "A local in your corner", body: "Message John and the team on WhatsApp anytime. We coordinate every pickup, timing, and change so your days actually flow — no apps, no call centers, just locals who care.", points: ["WhatsApp, day or night", "Under 2-hour replies", "Every detail handled"] },
  { icon: Heart, key: "personal", tag: "Made for you", title: "Built for your kind of trip", body: "Honeymoon, family week, fishing crew, or an adult group weekend — your plan adapts to exactly who you're traveling with. No two TripNest trips are ever the same.", points: ["Tailored to your group", "Paced to your style", "Yours to tweak anytime"] },
];

const REVIEWS = [
  { name: "Sarah & Mike", who: "sarah", trip: "Honeymoon · Manuel Antonio", scene: "personal", body: "John planned every single day around our pace. The private waterfall picnic was the best moment of our entire honeymoon — we still talk about it.", rating: 5 },
  { name: "The Delgado family", who: "delgado", trip: "Family week · Uvita", scene: "vetted", body: "Every activity was safe and genuinely fun for the kids. Having all the transport handled for us was a total lifesaver. We felt looked after the whole week.", rating: 5 },
  { name: "Marcus & the crew", who: "crew", trip: "Group weekend · Tamarindo", scene: "concierge", body: "Fishing, ATVs, a catamaran day, and rides all sorted for a group of 8. It would've been chaos to book ourselves. Best guys' trip we've ever done.", rating: 5 },
  { name: "Emma R.", who: "emma", trip: "Solo adventure · Dominical", scene: "pricing", body: "As a solo traveler I felt safe and never alone. John checked in, the operators were kind, and everything cost exactly what they said. I'm already planning my return.", rating: 5 },
];

const TICKER = [
  "Sarah just reserved a Sunset Catamaran 🌅",
  "A family of 4 is planning Manuel Antonio 🦥",
  "Marcus added Offshore Fishing to his trip 🎣",
  "Emma booked a Waterfall Adventure 💦",
  "3 couples are planning honeymoons right now 💕",
];

function LiveTicker() {
  const [i, setI] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const id = setInterval(() => { ref.current = (ref.current + 1) % TICKER.length; setI(ref.current); }, 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, ...glass, padding: "9px 16px", borderRadius: 999, maxWidth: "100%" }}>
      <span style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: "#37E36B" }} />
        <span style={{ position: "absolute", inset: -3, borderRadius: 999, background: "rgba(55,227,107,.4)", animation: "tnPing 1.8s ease-out infinite" }} />
      </span>
      <span key={i} style={{ color: "#fff", fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", animation: "tnTicker .5s ease both" }}>{TICKER[i]}</span>
    </div>
  );
}

function Stars({ n = 5, size = 14 }) {
  return <span style={{ display: "inline-flex", gap: 2 }}>{Array.from({ length: n }).map((_, k) => <Star key={k} size={size} fill={c.gold} color={c.gold} />)}</span>;
}

const navBtn = { width: 38, height: 38, borderRadius: 999, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

export function Why({ go }) {
  const [active, setActive] = useState(0);
  const auto = useRef();
  useEffect(() => {
    auto.current = setInterval(() => setActive((a) => (a + 1) % REVIEWS.length), 5500);
    return () => clearInterval(auto.current);
  }, []);
  const pick = (n) => { clearInterval(auto.current); setActive((n + REVIEWS.length) % REVIEWS.length); };
  const r = REVIEWS[active];

  return (
    <>
      <style>{`
        @keyframes tnPing { 0%{ transform: scale(1); opacity:.7 } 100%{ transform: scale(2.4); opacity:0 } }
        @keyframes tnTicker { from{ opacity:0; transform: translateY(6px) } to{ opacity:1; transform: translateY(0) } }
        @keyframes tnKen2 { 0%{ transform: scale(1.08) } 100%{ transform: scale(1.18) } }
        @keyframes tnFade { from{ opacity:0; transform: translateY(12px) } to{ opacity:1; transform: translateY(0) } }
      `}</style>

      {/* ── IMMERSIVE HERO ── */}
      <div style={{ position: "relative", overflow: "hidden", minHeight: 640, display: "flex", alignItems: "center" }}>
        <img src={heroImage(1900)} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5, animation: "tnKen2 22s ease-in-out infinite alternate" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,18,46,.75) 0%, rgba(4,18,46,.55) 40%, rgba(4,18,46,.96) 100%)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 60% at 18% 20%, rgba(34,211,238,.22), transparent 55%), radial-gradient(50% 60% at 85% 80%, rgba(255,194,75,.16), transparent 55%)` }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "80px 20px", textAlign: "center", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}><LiveTicker /></div>
          <Eyebrow><span style={{ color: c.gold }}>Why TripNest</span></Eyebrow>
          <h1 style={{ color: "#fff", fontSize: "clamp(40px,7vw,78px)", fontWeight: 800, letterSpacing: -2.5, lineHeight: 0.98, margin: "8px 0 0", textShadow: "0 6px 40px rgba(0,0,0,.5)" }}>
            Adventure, without<br /><span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>the guesswork.</span>
          </h1>
          <p style={{ color: "rgba(243,247,255,.85)", fontSize: 19, lineHeight: 1.6, maxWidth: 620, margin: "22px auto 0" }}>
            We're locals who turned 15 years of guiding into one simple promise: vetted tours, honest prices, and a real human in your corner — from your first message to your last sunset.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 30 }}>
            <Magnetic><Button variant="primary" size="lg" onClick={() => go("build")}>Start planning free <ArrowRight size={18} /></Button></Magnetic>
            <Magnetic strength={0.25}><Button variant="glass" size="lg" onClick={() => go("activities")}>Browse activities</Button></Magnetic>
          </div>
        </div>
      </div>

      {/* ── LIVE STATS ── */}
      <Section bg={c.sand} pad={56}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div style={{ textAlign: "center", ...glass, borderRadius: 20, padding: "30px 14px" }}>
                <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, ...gradText(`linear-gradient(100deg,${c.teal},${c.gold})`) }}>
                  <CountUpNumber value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                </div>
                <div style={{ color: c.stone, fontWeight: 600, fontSize: 14, marginTop: 6 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── MEET JOHN ── */}
      <Section bg={c.sand} pad={40}>
        <TiltCard max={4} radius={28} style={{ overflow: "hidden", border: `1px solid ${c.line}`, background: c.canvas2 }}>
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
            <div style={{ position: "relative", minHeight: 320 }}>
              <Photo src={personImage("john", 900)} fallback={grad.jungle} alt="John, founder of TripNest" height={"100%"} zoom={false} style={{ height: "100%", minHeight: 320 }}
                overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 40%, rgba(7,33,72,.6) 100%)" }} />} />
              <span style={{ position: "absolute", top: 18, left: 18, ...glass, color: "#fff", padding: "7px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} color={c.teal} /> Born & raised in Costa Rica
              </span>
            </div>
            <div style={{ padding: "clamp(24px,4vw,44px)" }}>
              <Eyebrow><span style={{ color: c.gold }}>Meet your concierge</span></Eyebrow>
              <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 800, letterSpacing: -1, margin: "6px 0 14px" }}>Hi, I'm John 👋</h2>
              <p style={{ color: "rgba(243,247,255,.82)", fontSize: 16.5, lineHeight: 1.7, margin: 0 }}>
                I've spent 15 years guiding travelers across every corner of this coast. I started TripNest because I was tired of watching visitors get overcharged, over-scheduled, and handed off to call centers.
              </p>
              <p style={{ color: "rgba(243,247,255,.82)", fontSize: 16.5, lineHeight: 1.7, margin: "14px 0 0" }}>
                So here's my promise: <b style={{ color: "#fff" }}>every operator I list, I'd trust with my own family</b>. Every price is honest. And when you message us, you're talking to a real local who actually knows the place.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive", fontSize: 30, color: c.teal, transform: "rotate(-4deg)" }}>John</span>
                <span style={{ color: c.stone, fontSize: 13.5 }}>Founder & head concierge, TripNest</span>
              </div>
              <div style={{ marginTop: 22 }}>
                <Button variant="dark" onClick={() => window.alert("Opening WhatsApp concierge…")}><MessageCircle size={17} />Message John directly</Button>
              </div>
            </div>
          </div>
        </TiltCard>
      </Section>

      {/* ── PILLARS as cinematic alternating scenes ── */}
      <Section bg={c.sand} pad={40}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <Eyebrow><span style={{ color: c.teal }}>What makes us different</span></Eyebrow>
          <h2 style={{ color: "#fff", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: -1, margin: "6px 0 0" }}>
            Four things we <span style={gradText(grad.ocean)}>never</span> compromise
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {PILLARS.map((p, i) => (
            <Reveal key={p.key} y={40}>
              <div className="why-pillar" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0, borderRadius: 26, overflow: "hidden", border: `1px solid ${c.line}`, background: c.canvas2 }} data-flip={i % 2 === 1}>
                <div style={{ position: "relative", minHeight: 260 }}>
                  <Photo src={sceneImage(p.key, 1000)} fallback={grad[["jungle", "ocean", "reef", "sunset"][i % 4]]} alt={p.title} height={"100%"} zoom style={{ height: "100%", minHeight: 260 }}
                    overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,18,46,.15), rgba(7,33,72,.5))" }} />} />
                  <span style={{ position: "absolute", top: 18, left: 18, ...glass, color: c.teal, padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>{p.tag}</span>
                </div>
                <div style={{ padding: "clamp(24px,4vw,42px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ width: 52, height: 52, borderRadius: 15, background: grad.hero, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px -12px rgba(34,211,238,.6)", marginBottom: 16 }}>
                    <p.icon size={25} color="#fff" />
                  </span>
                  <h3 style={{ color: "#fff", fontSize: "clamp(22px,2.6vw,30px)", fontWeight: 800, letterSpacing: -0.5, margin: "0 0 12px" }}>{p.title}</h3>
                  <p style={{ color: "rgba(243,247,255,.78)", fontSize: 16, lineHeight: 1.65, margin: 0 }}>{p.body}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
                    {p.points.map((pt) => (
                      <span key={pt} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,211,238,.08)", border: "1px solid rgba(34,211,238,.2)", color: c.teal, padding: "7px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12.5 }}>
                        <Check size={13} />{pt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── TESTIMONIAL SPOTLIGHT ── */}
      <Section bg={c.sand} pad={40}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Eyebrow><span style={{ color: c.teal }}>Traveler stories</span></Eyebrow>
          <h2 style={{ color: "#fff", fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: -1, margin: "6px 0 0" }}>
            Trips they'll <span style={gradText(grad.gold)}>never forget</span>
          </h2>
        </div>
        <TiltCard max={3} radius={28} style={{ overflow: "hidden", border: `1px solid ${c.line}`, background: c.canvas2 }}>
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr" }}>
            <div style={{ position: "relative", minHeight: 300 }}>
              <Photo key={r.scene} src={sceneImage(r.scene, 1000)} fallback={grad.ocean} alt="" height={"100%"} zoom={false} style={{ height: "100%", minHeight: 300 }}
                overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,18,46,.2), rgba(7,33,72,.55))" }} />} />
            </div>
            <div key={active} style={{ padding: "clamp(26px,4vw,44px)", display: "flex", flexDirection: "column", justifyContent: "center", animation: "tnFade .5s ease both" }}>
              <Quote size={34} color={c.teal} style={{ opacity: 0.7 }} />
              <p style={{ color: "#fff", fontSize: "clamp(18px,2.2vw,24px)", lineHeight: 1.5, fontWeight: 600, margin: "14px 0 22px" }}>"{r.body}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, overflow: "hidden", flexShrink: 0, border: `2px solid ${c.teal}` }}>
                  <Photo src={personImage(r.who, 120)} fallback={grad.sunset} alt={r.name} height={54} zoom={false} />
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{r.name}</div>
                  <div style={{ color: c.stone, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} />{r.trip}</div>
                </div>
                <div style={{ marginLeft: "auto" }}><Stars n={r.rating} /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
                <button onClick={() => pick(active - 1)} aria-label="Previous" style={navBtn}><ChevronLeft size={18} /></button>
                <div style={{ display: "flex", gap: 7 }}>
                  {REVIEWS.map((_, k) => (
                    <button key={k} onClick={() => pick(k)} aria-label={`Story ${k + 1}`} style={{ width: k === active ? 24 : 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", background: k === active ? c.teal : "rgba(255,255,255,.25)", transition: "all .3s" }} />
                  ))}
                </div>
                <button onClick={() => pick(active + 1)} aria-label="Next" style={navBtn}><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
        </TiltCard>
      </Section>

      {/* ── TRUST WALL ── */}
      <Section bg={c.sand} pad={40}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          {[
            { icon: ShieldCheck, t: "Every operator insured & vetted", s: "We verify licenses and insurance on the ground — not just on paper." },
            { icon: Lock, t: "Secure 20% deposits", s: "Reserve with confidence. Your payment is protected and fully transparent." },
            { icon: Award, t: "4.9★ from real travelers", s: "Thousands of adventures, rated by the people who actually took them." },
            { icon: Phone, t: "A human, not a call center", s: "Message a real local on WhatsApp — usually answered in under 2 hours." },
          ].map((x, i) => (
            <Reveal key={x.t} delay={i * 80}>
              <div style={{ ...glass, borderRadius: 20, padding: 24, height: "100%" }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.25)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <x.icon size={21} color={c.teal} />
                </span>
                <h3 style={{ color: "#fff", fontSize: 16.5, fontWeight: 800, margin: "14px 0 6px" }}>{x.t}</h3>
                <p style={{ color: c.stone, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{x.s}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center", ...glass, borderRadius: 20, padding: "20px 26px", textAlign: "center" }}>
            <ShieldCheck size={26} color={c.gold} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>The TripNest promise:</span>
            <span style={{ color: "rgba(243,247,255,.82)", fontSize: 15.5 }}>if an operator ever falls short of what we promised, we make it right. That's the deal.</span>
          </div>
        </Reveal>
      </Section>

      {/* ── CINEMATIC CLOSING CTA ── */}
      <Section bg={c.sand} pad={64}>
        <div style={{ position: "relative", borderRadius: 32, overflow: "hidden", border: `1px solid ${c.line}`, minHeight: 340, display: "flex", alignItems: "center" }}>
          <img src={heroImage(1600)} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55, animation: "tnKen2 20s ease-in-out infinite alternate" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(4,18,46,.9), rgba(4,18,46,.55))" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 80% at 80% 30%, rgba(34,211,238,.22), transparent 60%)` }} />
          <div style={{ position: "relative", zIndex: 2, padding: "clamp(30px,5vw,56px)", maxWidth: 640 }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(28px,4.5vw,46px)", fontWeight: 800, letterSpacing: -1.5, margin: 0, lineHeight: 1.02 }}>
              Your Costa Rica story<br /><span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>starts with hello.</span>
            </h2>
            <p style={{ color: "rgba(243,247,255,.85)", fontSize: 18, marginTop: 14, maxWidth: 480 }}>Free to plan. Only 20% to reserve. And a real local with you the whole way.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
              <Magnetic><Button variant="primary" size="lg" onClick={() => go("build")}>Build my adventure plan <ArrowRight size={18} /></Button></Magnetic>
              <Magnetic strength={0.25}><Button variant="glass" size="lg" onClick={() => window.alert("Opening WhatsApp concierge…")}><MessageCircle size={18} />Chat with John</Button></Magnetic>
            </div>
          </div>
        </div>
      </Section>

      <style>{`
        @media(min-width:820px){
          .two-col{ grid-template-columns:1fr 1fr!important }
          .why-pillar{ grid-template-columns:1fr 1fr!important }
          .why-pillar[data-flip="true"] > div:first-child{ order:2 }
        }
      `}</style>
    </>
  );
}
