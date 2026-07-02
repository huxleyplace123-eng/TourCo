import React, { useState, useMemo } from "react";
import { Tag, Clock, MapPin, ShieldCheck, Sparkles, ArrowRight, Ticket, Check, Lock } from "lucide-react";
import { c, grad, glass, gradText } from "../theme.js";
import { deals, DEAL_TAGS } from "../places.js";
import { pageHero } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { Reveal } from "../motion.jsx";

const PASS_PERKS = [
  "Verified restaurant & bar happy-hour deals",
  "Green-season & bundle tour savings",
  "Private-transfer flat rates (no surprises)",
  "Hidden Local's Guide — beaches, sodas, safe rides",
  "Every operator reconfirmed before you go",
];

export function Deals({ go, trip }) {
  const [tag, setTag] = useState("all");
  const list = useMemo(() => deals.filter((d) => tag === "all" || d.tag === tag), [tag]);
  const unlocked = (trip?.length || 0) > 0;

  return (
    <>
      <PageHero image={pageHero("activities")} eyebrow="Deals & the Pura Vida Pass" title="Real savings, verified" accentWord="verified"
        sub="No fake coupons. Real happy hours, green-season tour pricing, and bundle savings — plus the Pura Vida Pass you unlock the moment you book." />

      <Section bg={c.sand}>
        {/* ── Pura Vida Pass ── */}
        <Reveal>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, border: `1px solid ${c.line}`, background: c.canvas2, padding: "clamp(24px,4vw,36px)", marginBottom: 32 }}>
            <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 80% at 85% 15%, rgba(255,208,0,.16), transparent 55%), radial-gradient(50% 80% at 10% 90%, rgba(34,211,238,.16), transparent 55%)` }} />
            <div className="two-col" style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr", gap: 24, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, ...glass, color: c.gold, padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: 0.5, marginBottom: 14 }}>
                  <Ticket size={14} />THE PURA VIDA PASS
                </div>
                <h2 style={{ color: "#fff", fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 800, letterSpacing: -1, margin: "0 0 10px" }}>
                  Book once. <span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>Unlock Costa Rica.</span>
                </h2>
                <p style={{ color: "rgba(243,247,255,.82)", fontSize: 15.5, lineHeight: 1.6, margin: "0 0 16px" }}>
                  Reserve any experience with your 20% deposit and your Pura Vida Pass unlocks — a bundle of local perks, savings, and insider access that lasts your whole trip.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
                  {PASS_PERKS.map((p) => (
                    <div key={p} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, color: c.charcoal }}>
                      <Check size={15} color={c.teal} style={{ flexShrink: 0, marginTop: 2 }} />{p}
                    </div>
                  ))}
                </div>
                <Button variant="primary" onClick={() => go("build")}>{unlocked ? "View my Pura Vida Pass" : "Build a trip to unlock"} <ArrowRight size={16} /></Button>
              </div>
              {/* the pass card */}
              <div style={{ position: "relative" }}>
                <div style={{ borderRadius: 20, overflow: "hidden", background: grad.hero, padding: "22px 22px 20px", color: "#fff", boxShadow: "0 30px 70px -30px rgba(0,0,0,.8)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, opacity: .85, fontWeight: 700, letterSpacing: 1 }}>PURA VIDA PASS</div>
                      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>TicoWild</div>
                    </div>
                    {unlocked
                      ? <span style={{ ...glass, padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5 }}><Check size={12} color="#37E36B" />ACTIVE</span>
                      : <span style={{ ...glass, padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5 }}><Lock size={12} />LOCKED</span>}
                  </div>
                  <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ fontSize: 13, opacity: .85 }}>{unlocked ? "Perks unlocked for your trip" : "Unlocks on your first booking"}</div>
                    <Sparkles size={22} color={c.gold} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Verified deals ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>Verified deals right now</h2>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,211,238,.1)", border: "1px solid rgba(34,211,238,.25)", color: c.teal, padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
            <ShieldCheck size={13} />CHECKED BY TICOWILD
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
          {DEAL_TAGS.map((d) => (
            <button key={d.key} onClick={() => setTag(d.key)} style={{
              padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all .15s",
              background: tag === d.key ? "rgba(34,211,238,.14)" : "rgba(255,255,255,.05)",
              border: tag === d.key ? `1.5px solid ${c.teal}` : `1.5px solid ${c.line}`,
              color: tag === d.key ? c.teal : c.charcoal,
            }}>{d.label}</button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
          {list.map((d, i) => (
            <Reveal key={d.id} delay={(i % 3) * 60}>
              <div style={{ background: c.white, borderRadius: 18, padding: 20, border: `1px solid ${c.line}`, height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
                <div aria-hidden style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: 999, background: "rgba(255,208,0,.08)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, position: "relative" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,208,0,.14)", border: "1px solid rgba(255,208,0,.3)", color: c.gold, padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                    <Tag size={12} />{d.save}
                  </span>
                  <span style={{ fontSize: 11.5, color: c.stone, fontWeight: 700 }}>{d.type}</span>
                </div>
                <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "14px 0 4px", position: "relative" }}>{d.title}</h3>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: c.teal, fontWeight: 600, marginBottom: 8 }}><MapPin size={12} />{d.where}</div>
                <p style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.5, margin: "0 0 14px", flex: 1 }}>{d.detail}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px dashed ${c.line}` }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: c.stone, fontWeight: 600 }}><Clock size={12} />{d.expires}</span>
                  <button onClick={() => go(d.tag === "food" ? "eat" : "build")} style={{ background: "none", border: "none", color: c.gold, fontWeight: 800, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {d.tag === "food" ? "See spot" : "Use it"} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <style>{`@media(min-width:820px){.two-col{grid-template-columns:1.4fr 1fr!important}}`}</style>
    </>
  );
}
