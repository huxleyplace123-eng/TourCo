import React, { useState, useMemo } from "react";
import { Tag, Clock, MapPin, ShieldCheck, Sparkles, ArrowRight, Ticket, Check, Lock, Copy, Gift, PiggyBank, Sun } from "lucide-react";
import { c, grad, glass, gradText } from "../theme.js";
import { deals, DEAL_TAGS, freeThings, moneyTips } from "../places.js";
import { pageHero, dealImage, themedSlides } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { Reveal, Photo } from "../motion.jsx";
import { TicoAvatar } from "../components/Tico.jsx";
import { ticoDealTake } from "../intelligence/tico.js";

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

// Compact, image-topped deal card — scannable, no wasted space.
function DealCard({ d }) {
  const dealTake = ticoDealTake(d);
  return (
    <div style={{ background: c.white, borderRadius: 16, overflow: "hidden", border: `1px solid ${c.line}`, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative" }}>
        <Photo src={dealImage(d)} fallback={grad.sunset} alt={d.title} height={112}
          overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.05) 0%, transparent 40%, rgba(11,26,46,.55) 100%)" }} />}>
          <span style={{ position: "absolute", top: 9, left: 9, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 4, background: c.gold, color: c.ink, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, boxShadow: "0 0 16px -4px rgba(255,208,0,.7)" }}>
            <Tag size={11} />{d.save}
          </span>
          {d.price && <span style={{ position: "absolute", bottom: 9, right: 9, zIndex: 2, background: "rgba(11,26,46,.65)", color: "#fff", padding: "3px 9px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{d.price}</span>}
        </Photo>
      </div>
      <div style={{ padding: "12px 14px 13px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 11, color: c.teal, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.3 }}>{d.type}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, color: c.stone, fontWeight: 700 }}><ShieldCheck size={11} color={c.teal} />Verified</span>
        </div>
        <h3 style={{ color: "#fff", fontSize: 15.5, fontWeight: 800, margin: "0 0 3px", lineHeight: 1.2 }}>{d.title}</h3>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: c.stone, fontWeight: 600, marginBottom: 7 }}><MapPin size={11} />{d.where}</div>
        <p style={{ color: c.stone, fontSize: 12.5, lineHeight: 1.45, margin: "0 0 9px", flex: 1 }}>{d.detail}</p>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 10 }}>
          <TicoAvatar size={16} glow={false} mood={dealTake.mood} animate={false} />
          <span style={{ fontSize: 11.5, lineHeight: 1.35, color: c.charcoal, fontStyle: "italic", opacity: 0.9 }}>{dealTake.text}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {d.code ? <CodeChip code={d.code} /> : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: c.stone, fontWeight: 600 }}><Clock size={11} />{d.expires}</span>}
          {d.code && <span style={{ fontSize: 11, color: c.stone, fontWeight: 600, whiteSpace: "nowrap" }}>{d.expires}</span>}
        </div>
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
      <PageHero slides={themedSlides("deals")} eyebrow="Deals, codes & free things" title="Real Costa Rica savings" accentWord="savings"
        sub={`${codeCount} verified promo codes, happy hours, free-to-do gems, and local money-saving tips — plus the Pura Vida Pass you unlock the moment you book.`} />

      <Section bg={c.sand}>
        {/* featured deal */}
        {featured && (
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: c.gold, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <Sparkles size={15} />Deal of the trip
            </div>
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 34, alignItems: "stretch" }}>
              {/* featured wide card: image left, content right */}
              <div style={{ display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden", border: `1.5px solid ${c.gold}`, background: c.white, boxShadow: "0 0 44px -18px rgba(255,208,0,.55)" }}>
                <div className="feat-split" style={{ display: "grid", gridTemplateColumns: "1fr", flex: 1 }}>
                  <div style={{ position: "relative", minHeight: 150 }}>
                    <Photo src={dealImage(featured)} fallback={grad.hero} alt={featured.title} height={"100%"} zoom={false} style={{ height: "100%", minHeight: 150 }}
                      overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(11,26,46,.5) 100%)" }} />} />
                    <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 5, background: c.gold, color: c.ink, padding: "5px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 }}><Tag size={12} />{featured.save}</span>
                  </div>
                  <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, color: c.teal, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>{featured.type} · biggest saver</span>
                    <h3 style={{ color: "#fff", fontSize: 21, fontWeight: 800, margin: "6px 0 6px", lineHeight: 1.15 }}>{featured.title}</h3>
                    <p style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.5, margin: "0 0 14px" }}>{featured.detail}</p>
                    <div><CodeChip code={featured.code} /></div>
                  </div>
                </div>
              </div>
              {/* Pura Vida Pass */}
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, border: `1px solid ${c.line}`, background: grad.hero, color: "#fff", padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 80% at 85% 15%, rgba(255,208,0,.25), transparent 55%)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, ...glass, color: "#fff", padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, marginBottom: 12 }}>
                    <Ticket size={13} />PURA VIDA PASS {unlocked ? "· ACTIVE" : "· LOCKED"} {unlocked ? <Check size={12} color="#37E36B" /> : <Lock size={11} />}
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, margin: "0 0 10px" }}>Book once. Unlock it all.</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
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
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>
          {rest.map((d, i) => <Reveal key={d.id} delay={(i % 4) * 50}><DealCard d={d} /></Reveal>)}
        </div>

        {/* Free & nearly-free */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "40px 0 16px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(55,227,107,.14)", border: "1px solid rgba(55,227,107,.3)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Gift size={19} color="#37E36B" /></span>
          <div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>Free & nearly-free</h2>
            <div style={{ color: c.stone, fontSize: 13 }}>The best value in Costa Rica — that nobody advertises.</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
          {freeThings.map((f, i) => (
            <Reveal key={f.id} delay={(i % 3) * 55}>
              <div style={{ background: c.white, borderRadius: 16, overflow: "hidden", border: `1px solid ${c.line}`, height: "100%", display: "flex", flexDirection: "column" }}>
                {/* vivid photo top */}
                <div style={{ position: "relative" }}>
                  <Photo src={f.photo} fallback={grad.jungle} alt={f.title} height={128}
                    overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.05) 0%, transparent 45%, rgba(11,26,46,.6) 100%)" }} />} />
                  <span style={{ position: "absolute", top: 9, right: 9, zIndex: 2, background: "#37E36B", color: c.ink, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 0 14px -3px rgba(55,227,107,.8)" }}>{f.cost}</span>
                </div>
                <div style={{ padding: "13px 15px 15px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ color: "#fff", fontSize: 15.5, fontWeight: 800, margin: "0 0 5px", lineHeight: 1.2 }}>{f.title}</h3>
                  <p style={{ color: c.stone, fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>{f.detail}</p>
                </div>
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
        <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
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

      <style>{`
        @media(min-width:820px){
          .two-col{grid-template-columns:1.5fr 1fr!important}
          .feat-split{grid-template-columns:0.9fr 1.1fr!important}
        }
      `}</style>
    </>
  );
}
