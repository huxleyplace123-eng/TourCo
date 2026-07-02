import React, { useState, useMemo } from "react";
import { Tag, Clock, MapPin, ShieldCheck, Sparkles, ArrowRight, Ticket, Check, Lock, Copy, Gift, PiggyBank, Sun } from "lucide-react";
import { c, grad, glass, gradText } from "../theme.js";
import { deals, DEAL_TAGS, freeThings, moneyTips } from "../places.js";
import { pageHero } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { Reveal } from "../motion.jsx";

const PASS_PERKS = [
  "Every verified promo code, ready to use",
  "Green-season & bundle tour savings",
  "Private-transfer flat rates (no surprises)",
  "Hidden Local's Guide — beaches, sodas, safe rides",
  "Every operator reconfirmed before you go",
];

// Copy-to-clipboard promo code chip
function CodeChip({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* ignore */ }
  };
  return (
    <button onClick={copy} title="Copy code" style={{
      display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 10, cursor: "pointer",
      background: copied ? "rgba(55,227,107,.14)" : "rgba(34,211,238,.1)",
      border: copied ? "1px dashed #37E36B" : "1px dashed rgba(34,211,238,.5)",
      color: copied ? "#37E36B" : c.teal, fontWeight: 800, fontSize: 13, letterSpacing: 0.5, fontFamily: "monospace",
    }}>
      {copied ? <><Check size={13} />Copied!</> : <><Copy size={13} />{code}</>}
    </button>
  );
}

function DealCard({ d, featured }) {
  return (
    <div style={{ background: c.white, borderRadius: 18, padding: featured ? 24 : 20, border: featured ? `1.5px solid ${c.gold}` : `1px solid ${c.line}`, height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", boxShadow: featured ? "0 0 40px -16px rgba(255,208,0,.5)" : "none" }}>
      <div aria-hidden style={{ position: "absolute", top: -24, right: -24, width: 100, height: 100, borderRadius: 999, background: featured ? "rgba(255,208,0,.14)" : "rgba(255,208,0,.06)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, position: "relative" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,208,0,.16)", border: "1px solid rgba(255,208,0,.32)", color: c.gold, padding: "5px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 }}>
          <Tag size={12} />{d.save}
        </span>
        <span style={{ fontSize: 11.5, color: c.stone, fontWeight: 700 }}>{d.type}</span>
      </div>
      <h3 style={{ color: "#fff", fontSize: featured ? 21 : 17.5, fontWeight: 800, margin: "13px 0 4px", position: "relative", lineHeight: 1.2 }}>{d.title}</h3>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: c.teal, fontWeight: 600, marginBottom: 8 }}><MapPin size={12} />{d.where}</div>
      <p style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.5, margin: "0 0 14px", flex: 1 }}>{d.detail}</p>
      {d.code && <div style={{ marginBottom: 12 }}><CodeChip code={d.code} /></div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px dashed ${c.line}` }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: c.stone, fontWeight: 600 }}><Clock size={12} />{d.expires}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: c.teal, fontWeight: 700 }}><ShieldCheck size={12} />Verified</span>
      </div>
    </div>
  );
}

export function Deals({ go, trip }) {
  const [tag, setTag] = useState("all");
  const featured = deals.find((d) => d.featured);
  const rest = useMemo(() => deals.filter((d) => !d.featured && (tag === "all" || d.tag === tag)), [tag]);
  const codeCount = deals.filter((d) => d.code).length;
  const unlocked = (trip?.length || 0) > 0;

  return (
    <>
      <PageHero image={pageHero("activities")} eyebrow="Deals, codes & free things" title="Save real money in Costa Rica" accentWord="money"
        sub={`${codeCount} verified promo codes, happy hours, free-to-do gems, and local money-saving tips — plus the Pura Vida Pass you unlock the moment you book.`} />

      <Section bg={c.sand}>
        {/* featured deal */}
        {featured && (
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: c.gold, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <Sparkles size={15} />Deal of the trip
            </div>
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 34 }}>
              <DealCard d={featured} featured />
              {/* Pura Vida Pass compact */}
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, border: `1px solid ${c.line}`, background: grad.hero, color: "#fff", padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 80% at 85% 15%, rgba(255,208,0,.25), transparent 55%)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, ...glass, color: "#fff", padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, marginBottom: 12 }}>
                    <Ticket size={13} />PURA VIDA PASS {unlocked ? "· ACTIVE" : "· LOCKED"} {unlocked ? <Check size={12} color="#37E36B" /> : <Lock size={11} />}
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, margin: "0 0 8px" }}>Book once. Unlock it all.</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {PASS_PERKS.slice(0, 3).map((p) => (
                      <div key={p} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: "rgba(255,255,255,.9)" }}><Check size={14} color={c.gold} style={{ flexShrink: 0, marginTop: 2 }} />{p}</div>
                    ))}
                  </div>
                </div>
                <Button variant="gold" onClick={() => go("build")}>{unlocked ? "View my Pass" : "Build a trip to unlock"} <ArrowRight size={15} /></Button>
              </div>
            </div>
          </Reveal>
        )}

        {/* verified deals + codes */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>Verified deals & promo codes</h2>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,211,238,.1)", border: "1px solid rgba(34,211,238,.25)", color: c.teal, padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
            <ShieldCheck size={13} />CHECKED BY TICOWILD
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
          {DEAL_TAGS.map((dt) => (
            <button key={dt.key} onClick={() => setTag(dt.key)} style={{
              padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all .15s",
              background: tag === dt.key ? "rgba(34,211,238,.14)" : "rgba(255,255,255,.05)",
              border: tag === dt.key ? `1.5px solid ${c.teal}` : `1.5px solid ${c.line}`,
              color: tag === dt.key ? c.teal : c.charcoal,
            }}>{dt.label}</button>
          ))}
        </div>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))" }}>
          {rest.map((d, i) => <Reveal key={d.id} delay={(i % 3) * 55}><DealCard d={d} /></Reveal>)}
        </div>

        {/* Free & nearly-free */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "40px 0 16px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(55,227,107,.14)", border: "1px solid rgba(55,227,107,.3)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Gift size={19} color="#37E36B" /></span>
          <div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>Free & nearly-free</h2>
            <div style={{ color: c.stone, fontSize: 13 }}>The best value in Costa Rica — that nobody advertises.</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
          {freeThings.map((f, i) => (
            <Reveal key={f.id} delay={(i % 3) * 55}>
              <div style={{ background: c.white, borderRadius: 16, padding: 18, border: `1px solid ${c.line}`, height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: 0 }}>{f.title}</h3>
                  <span style={{ background: "rgba(55,227,107,.14)", color: "#37E36B", padding: "3px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap" }}>{f.cost}</span>
                </div>
                <p style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{f.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Money-saving tips */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "40px 0 16px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,208,0,.14)", border: "1px solid rgba(255,208,0,.3)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PiggyBank size={19} color={c.gold} /></span>
          <div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>Local money-saving tips</h2>
            <div style={{ color: c.stone, fontSize: 13 }}>How Ticos actually stretch a trip.</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
          {moneyTips.map((m, i) => (
            <Reveal key={m.id} delay={(i % 3) * 55}>
              <div style={{ background: c.surface2, borderRadius: 16, padding: 18, height: "100%", display: "flex", gap: 12 }}>
                <Sun size={18} color={c.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14.5, marginBottom: 3 }}>{m.tip}</div>
                  <div style={{ color: c.stone, fontSize: 13, lineHeight: 1.45 }}>{m.detail}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <style>{`@media(min-width:820px){.two-col{grid-template-columns:1.5fr 1fr!important}}`}</style>
    </>
  );
}
