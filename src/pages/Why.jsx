import React from "react";
import { ArrowRight, ShieldCheck, MessageCircle, Sparkles, Heart, DollarSign, MapPin, Star, Quote } from "lucide-react";
import { c, grad, gradText } from "../theme.js";
import { Section, SectionHead, Eyebrow, Button } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";

const PILLARS = [
  { icon: ShieldCheck, title: "Only vetted operators", body: "Every tour partner is insured, licensed, and personally checked. If we wouldn't send our own family, they're not on the platform." },
  { icon: DollarSign, title: "Transparent pricing", body: "See per-person prices upfront, pay just 20% to reserve, and settle the rest closer to your trip. No hidden fees, ever." },
  { icon: MessageCircle, title: "Real human concierge", body: "A local you can message on WhatsApp coordinates timing, pickups, and changes — so your days actually flow." },
  { icon: Heart, title: "Built for your kind of trip", body: "Family, honeymoon, fishing crew, or adult group weekend — the plan adapts to who you're traveling with." },
];

const STATS = [
  { n: "50+", l: "Vetted experiences" },
  { n: "4.9★", l: "Average operator rating" },
  { n: "20%", l: "To reserve — that's it" },
  { n: "<2 hrs", l: "Typical concierge reply" },
];

const REVIEWS = [
  { name: "Sarah & Mike", trip: "Honeymoon · Manuel Antonio", body: "John planned everything around our pace. The private waterfall day was the best part of our honeymoon.", grad: "orchid" },
  { name: "The Delgado family", trip: "Family week · Uvita", body: "Every activity was safe and genuinely fun for the kids. The transport being handled for us was a lifesaver.", grad: "jungle" },
  { name: "Bachelor crew of 8", trip: "Group weekend · Tamarindo", body: "Fishing, ATVs, catamaran, and rides sorted for a group of 8. Would've been chaos to book ourselves.", grad: "sunset" },
];

export function Why({ go }) {
  return (
    <>
      <div style={{ background: grad.hero, padding: "56px 20px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 15%, rgba(255,208,0,.3), transparent 45%)" }} />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow><span style={{ color: c.gold }}>Why TripNest</span></Eyebrow>
          <h1 style={{ color: "#fff", fontSize: "clamp(30px,5vw,48px)", fontWeight: 800, letterSpacing: -1, margin: "6px 0 10px" }}>Adventure, without the guesswork</h1>
          <p style={{ color: "rgba(255,255,255,.9)", fontSize: 18, lineHeight: 1.6 }}>
            We're locals who turned years of guiding into one simple promise: vetted tours, honest prices, and a real human in your corner.
          </p>
        </div>
      </div>

      {/* Stats */}
      <Section bg={c.white} pad={44}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
          {STATS.map((s, i) => (
            <Reveal key={s.l} delay={i * 90}>
              <div style={{ textAlign: "center", background: c.sand, borderRadius: 18, padding: "24px 12px" }}>
                <div style={{ fontSize: 30, fontWeight: 800, ...gradText(grad.ocean) }}>{s.n}</div>
                <div style={{ color: c.stone, fontWeight: 600, fontSize: 13.5, marginTop: 4 }}>{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Pillars */}
      <Section bg={c.sand}>
        <SectionHead eyebrow="What makes us different" title="Four things we never compromise on" center accent />
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 80}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 26, height: "100%", border: "1px solid rgba(0,0,0,.05)" }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: grad.jungle, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <p.icon size={23} color="#fff" />
                </span>
                <h3 style={{ margin: "16px 0 8px", fontSize: 19, fontWeight: 800, color: c.charcoal }}>{p.title}</h3>
                <p style={{ margin: 0, color: c.stone, fontSize: 15, lineHeight: 1.6 }}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Reviews */}
      <Section bg={c.white}>
        <SectionHead eyebrow="Traveler stories" title="Trips we're proud of" center />
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {REVIEWS.map((r) => (
            <div key={r.name} style={{ background: c.sand, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
              <Quote size={24} color={c.teal} />
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: c.charcoal, margin: "12px 0 18px", flex: 1 }}>"{r.body}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 999, background: grad[r.grad], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
                  {r.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: c.charcoal, fontSize: 14.5 }}>{r.name}</div>
                  <div style={{ color: c.stone, fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{r.trip}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 1 }}>
                  {[0, 1, 2, 3, 4].map((k) => <Star key={k} size={13} fill={c.gold} color={c.gold} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section bg={c.sand} pad={60}>
        <div style={{ position: "relative", borderRadius: 30, overflow: "hidden", background: grad.hero, padding: "56px 28px", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 80%, rgba(34,211,238,.4), transparent 50%)" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, letterSpacing: -1, margin: 0 }}>Ready when you are</h2>
            <p style={{ color: "rgba(255,255,255,.9)", fontSize: 17, marginTop: 12, maxWidth: 500, marginInline: "auto" }}>Start a free plan — no commitment until you're ready to reserve.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Build my adventure plan <ArrowRight size={18} /></Button>
              <Button variant="glass" size="lg" onClick={() => go("activities")}>Browse activities</Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
