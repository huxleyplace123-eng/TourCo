import React, { useState } from "react";
import { ArrowRight, TrendingUp, Users, ShieldCheck, Check, Send } from "lucide-react";
import { c, grad } from "../theme.js";
import { Section, SectionHead, Eyebrow, Button, Field, TextInput, Select } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";

const PERKS = [
  { icon: Users, title: "Qualified travelers", body: "We send you guests who've already chosen their experience — fewer no-shows, higher-value bookings." },
  { icon: TrendingUp, title: "Fill your calendar", body: "Steady demand across seasons, with a concierge handling the back-and-forth so you can focus on guiding." },
  { icon: ShieldCheck, title: "Fair, transparent terms", body: "Clear commissions, fast payouts, and no exclusivity lock-in. You stay in control of your operation." },
];

const CHECKLIST = ["Licensed & insured in Costa Rica", "Consistent 4.5★+ guest experience", "Responsive within a business day", "A genuine love for what you do"];

export function Partner({ go }) {
  const [form, setForm] = useState({ name: "", operator: "", region: "Manuel Antonio", email: "", type: "Tours & activities" });
  const [sent, setSent] = useState(false);

  return (
    <>
      <div style={{ background: grad.jungle, padding: "56px 20px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 20%, rgba(34,211,238,.4), transparent 45%)" }} />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow><span style={{ color: c.gold }}>For operators</span></Eyebrow>
          <h1 style={{ color: "#fff", fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, letterSpacing: -1, margin: "6px 0 10px" }}>Partner with TripNest</h1>
          <p style={{ color: "rgba(255,255,255,.9)", fontSize: 18, lineHeight: 1.6 }}>
            Join a curated network of Costa Rica's best local operators. We bring the travelers — you deliver the adventure.
          </p>
        </div>
      </div>

      <Section bg={c.sand}>
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 70}>
              <div style={{ background: c.white, borderRadius: 20, padding: 26, height: "100%", border: "1px solid rgba(255,255,255,.08)" }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: grad.sunset, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <p.icon size={23} color={c.charcoal} />
                </span>
                <h3 style={{ margin: "16px 0 8px", fontSize: 19, fontWeight: 800, color: c.charcoal }}>{p.title}</h3>
                <p style={{ margin: 0, color: c.stone, fontSize: 15, lineHeight: 1.6 }}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg={c.sand}>
        <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 30, alignItems: "start" }}>
          <div>
            <SectionHead eyebrow="What we look for" title="Are we a fit?" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CHECKLIST.map((it) => (
                <div key={it} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, color: c.charcoal, fontWeight: 600 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 999, background: grad.jungle, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} color="#fff" />
                  </span>
                  {it}
                </div>
              ))}
            </div>
            <p style={{ color: c.stone, fontSize: 14.5, lineHeight: 1.6, marginTop: 20 }}>
              Sound like you? Send your details and our operator team will reach out within two business days.
            </p>
          </div>

          {/* Apply form */}
          <div style={{ background: c.surface2, borderRadius: 22, padding: 28, border: "1px solid rgba(255,255,255,.08)" }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <span style={{ width: 60, height: 60, borderRadius: 999, background: grad.jungle, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Check size={30} color="#fff" />
                </span>
                <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: c.charcoal }}>Application received!</h3>
                <p style={{ color: c.stone, fontSize: 15 }}>Thanks, {form.name || "partner"}. Our operator team will be in touch within two business days.</p>
                <Button variant="ghost" onClick={() => go("home")} style={{ marginTop: 8 }}>Back to home</Button>
              </div>
            ) : (
              <>
                <h3 style={{ margin: "0 0 18px", fontSize: 20, fontWeight: 800, color: c.charcoal }}>Apply to partner</h3>
                <Field label="Your name"><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Full name" /></Field>
                <Field label="Operator / business name"><TextInput value={form.operator} onChange={(v) => setForm({ ...form, operator: v })} placeholder="e.g. Pura Vida Sportfishing" /></Field>
                <Field label="Primary region"><Select value={form.region} onChange={(v) => setForm({ ...form, region: v })} options={["Manuel Antonio", "Quepos", "Uvita", "Dominical", "Jacó", "Tamarindo", "Guanacaste"]} /></Field>
                <Field label="What you offer"><Select value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["Tours & activities", "Transportation", "Fishing charters", "Water sports", "Luxury / private", "Other"]} /></Field>
                <Field label="Email"><TextInput type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@company.com" /></Field>
                <Button variant="dark" full size="lg" style={{ marginTop: 8 }} onClick={() => setSent(true)}>
                  <Send size={17} />Submit application
                </Button>
              </>
            )}
          </div>
        </div>
      </Section>

      <style>{`@media(min-width:900px){.detail-grid{grid-template-columns:1fr 420px!important}}`}</style>
    </>
  );
}
