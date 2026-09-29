import React, { useState } from "react";
import { ArrowRight, TrendingUp, Users, ShieldCheck, Check, Send } from "lucide-react";
import { c, grad } from "../theme.js";
import { Section, SectionHead, Eyebrow, Button, Field, TextInput, Select } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { pageHero } from "../images.js";

const PERKS = [
  { icon: Users, title: "Qualified travelers", body: "We send you guests who've already chosen their experience — fewer no-shows, higher-value bookings." },
  { icon: TrendingUp, title: "Fill your calendar", body: "Steady demand across seasons, with a concierge handling the back-and-forth so you can focus on guiding." },
  { icon: ShieldCheck, title: "Fair, transparent terms", body: "Clear commissions, fast payouts, and no exclusivity lock-in. You stay in control of your operation." },
];

const CHECKLIST = ["Licensed & insured in Costa Rica", "Consistent 4.5★+ guest experience", "Responsive within a business day", "A genuine love for what you do"];

export function Partner({ go }) {
  const [form, setForm] = useState({ name: "", operator: "", region: "Manuel Antonio", email: "", type: "Tours & activities" });
  const [error, setError] = useState("");

  const beginApplication = () => {
    if (!form.name.trim() || !form.operator.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setError("Add your name, business name, and a valid email to continue.");
      return;
    }
    sessionStorage.setItem("ticowild_partner_draft", JSON.stringify({
      contactName: form.name.trim(), companyName: form.operator.trim(), email: form.email.trim(),
      regions: [form.region], categories: [form.type],
    }));
    window.location.assign("/partners/");
  };

  return (
    <>
      <PageHero image={pageHero("partner")} align="center" eyebrow="For operators" title="Partner with TicoWild" accentWord="TicoWild"
        sub="Join a curated network of Costa Rica's best local operators. We bring the travelers — you deliver the adventure." />

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
            <SectionHead eyebrow="Requirements" title="TicoWild partner requirements" />
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
            <>
                <h3 style={{ margin: "0 0 18px", fontSize: 20, fontWeight: 800, color: c.charcoal }}>Apply to partner</h3>
                <Field label="Your name"><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Full name" /></Field>
                <Field label="Operator / business name"><TextInput value={form.operator} onChange={(v) => setForm({ ...form, operator: v })} placeholder="e.g. Pura Vida Sportfishing" /></Field>
                <Field label="Primary region"><Select value={form.region} onChange={(v) => setForm({ ...form, region: v })} options={["Manuel Antonio", "Quepos", "Uvita", "Dominical", "Jacó", "Tamarindo", "Guanacaste"]} /></Field>
                <Field label="What you offer"><Select value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={["Tours & activities", "Transportation", "Fishing charters", "Water sports", "Luxury / private", "Other"]} /></Field>
                <Field label="Email"><TextInput type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@company.com" /></Field>
                {error&&<div role="alert" style={{ marginTop:10,padding:"10px 12px",borderRadius:12,border:"1px solid rgba(248,113,113,.3)",background:"rgba(248,113,113,.08)",color:"#FCA5A5",fontSize:12.5 }}>{error}</div>}
                <Button variant="dark" full size="lg" style={{ marginTop: 8 }} onClick={beginApplication}>
                  <Send size={17} />Continue secure application
                </Button>
                <p style={{ margin:"10px 0 0",color:c.stone,fontSize:11.5,textAlign:"center",lineHeight:1.5 }}>You’ll create a secure partner account, sign the agreement, and submit the complete application in the Partner Center.</p>
              </>
          </div>
        </div>
      </Section>

      <style>{`@media(min-width:900px){.detail-grid{grid-template-columns:1fr 420px!important}}`}</style>
    </>
  );
}
