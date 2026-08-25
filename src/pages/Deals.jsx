import React, { useMemo, useState } from "react";
import { ArrowRight, Check, Clock, Copy, Gift, MapPin, PiggyBank, ShieldCheck, Sun, Tag } from "lucide-react";
import { c, grad } from "../theme.js";
import { deals, DEAL_TAGS, freeThings, moneyTips } from "../places.js";
import { dealImage, themedSlides } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { Reveal, Photo } from "../motion.jsx";

const CHAPTERS = [
  { id: "deals", label: "Offers & codes", icon: Tag },
  { id: "free", label: "Free & low-cost", icon: Gift },
  { id: "tips", label: "Money-saving tips", icon: PiggyBank },
];

function CodeChip({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* The code remains visible if clipboard access is unavailable. */ }
  };
  return (
    <button type="button" onClick={copy} title="Copy code" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 10, cursor: "pointer", background: copied ? "rgba(55,227,107,.14)" : "rgba(34,211,238,.1)", border: copied ? "1px dashed #37E36B" : "1px dashed rgba(34,211,238,.5)", color: copied ? "#37E36B" : c.teal, fontWeight: 800, fontSize: 13, letterSpacing: .5, fontFamily: "monospace" }}>
      {copied ? <><Check size={13} />Copied</> : <><Copy size={13} />{code}</>}
    </button>
  );
}

function DealCard({ deal }) {
  return (
    <article style={{ background: c.white, borderRadius: 18, overflow: "hidden", border: `1px solid ${c.line}`, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative" }}>
        <Photo src={dealImage(deal)} fallback={grad.sunset} alt={deal.title} height={132} overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(11,26,46,.05),rgba(11,26,46,.58))" }} />} />
        <span style={{ position: "absolute", top: 10, left: 10, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 4, background: c.gold, color: c.ink, padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900 }}><Tag size={11} />{deal.save}</span>
        {deal.price && <span style={{ position: "absolute", right: 10, bottom: 10, zIndex: 2, color: "#fff", background: "rgba(11,26,46,.72)", borderRadius: 999, padding: "4px 9px", fontSize: 12, fontWeight: 800 }}>{deal.price}</span>}
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={{ color: c.teal, fontSize: 11, fontWeight: 900, letterSpacing: .6, textTransform: "uppercase" }}>{deal.type}</span>
        <h3 style={{ color: "#fff", fontSize: 17, margin: "5px 0", lineHeight: 1.2 }}>{deal.title}</h3>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, color: c.stone, fontSize: 12.5 }}><MapPin size={12} />{deal.where}</div>
        <p style={{ color: c.stone, fontSize: 13, lineHeight: 1.5, margin: "10px 0 14px", flex: 1 }}>{deal.detail}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          {deal.code ? <CodeChip code={deal.code} /> : <span style={{ color: c.teal, fontSize: 12, fontWeight: 800 }}>Ask for the listed offer</span>}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: c.stone, fontSize: 11.5 }}><Clock size={11} />Timing: {deal.expires}</span>
        </div>
      </div>
    </article>
  );
}

export function Deals({ go, embedded = false, section = "deals" }) {
  const [chapter, setChapter] = useState(section);
  const [tag, setTag] = useState("all");
  const active = embedded ? section : chapter;
  const visibleDeals = useMemo(() => deals.filter((deal) => tag === "all" || deal.tag === tag), [tag]);
  const codeCount = deals.filter((deal) => deal.code).length;

  return (
    <>
      {!embedded && <PageHero slides={themedSlides("deals")} eyebrow="Listed savings" title="Spend less on the right things" accentWord="less" sub={`${deals.length} listed offers, ${codeCount} promo codes, plus free stops and practical ways to make the trip go further.`} />}

      <Section bg={c.sand} pad={embedded ? 26 : 54}>
        {!embedded && (
          <div className="deals-chapter-tabs" role="tablist" aria-label="Savings guide sections" style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 24 }}>
            {CHAPTERS.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={active === id} onClick={() => setChapter(id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, border: active === id ? `1px solid ${c.teal}` : `1px solid ${c.line}`, background: active === id ? "rgba(34,211,238,.13)" : "rgba(255,255,255,.05)", color: active === id ? c.teal : "#fff", padding: "10px 15px", fontWeight: 800, cursor: "pointer" }}><Icon size={15} />{label}</button>)}
          </div>
        )}

        {active === "deals" && (
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,208,0,.08)", border: "1px solid rgba(255,208,0,.24)", borderRadius: 16, padding: 14, marginBottom: 22 }}>
              <ShieldCheck size={18} color={c.gold} style={{ flexShrink: 0, marginTop: 1 }} />
              <div><strong style={{ color: "#fff", fontSize: 13.5 }}>Listed offers, not guaranteed prices</strong><div style={{ color: c.stone, fontSize: 12.5, lineHeight: 1.5, marginTop: 3 }}>Offer details can change. TicoWild confirms the current terms with the provider before you rely on a discount or make a payment.</div></div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {DEAL_TAGS.map((item) => <button key={item.key} type="button" onClick={() => setTag(item.key)} style={{ padding: "8px 13px", borderRadius: 999, cursor: "pointer", fontWeight: 750, fontSize: 13, background: tag === item.key ? "rgba(34,211,238,.14)" : "rgba(255,255,255,.05)", border: tag === item.key ? `1px solid ${c.teal}` : `1px solid ${c.line}`, color: tag === item.key ? c.teal : c.charcoal }}>{item.label}</button>)}
            </div>
            <div className="mobile-break-grid" style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
              {visibleDeals.map((deal, index) => <Reveal key={deal.id} delay={(index % 4) * 45}><DealCard deal={deal} /></Reveal>)}
            </div>
          </div>
        )}

        {active === "free" && (
          <div>
            <div style={{ marginBottom: 22 }}><h2 style={{ color: "#fff", fontSize: 28, margin: 0 }}>Free and low-cost stops</h2><p style={{ color: c.stone, lineHeight: 1.55, margin: "7px 0 0" }}>Good trip memories do not all need another tour booking.</p></div>
            <div className="mobile-break-grid" style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
              {freeThings.map((item, index) => <Reveal key={item.id} delay={(index % 3) * 45}><article style={{ background: c.white, borderRadius: 18, overflow: "hidden", border: `1px solid ${c.line}`, height: "100%" }}><div style={{ position: "relative" }}><Photo src={item.photo} fallback={grad.jungle} alt={item.title} height={142} /><span style={{ position: "absolute", top: 10, right: 10, zIndex: 2, background: "#37E36B", color: c.ink, padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 900 }}>{item.cost}</span></div><div style={{ padding: 16 }}><h3 style={{ color: "#fff", fontSize: 17, margin: "0 0 6px" }}>{item.title}</h3><p style={{ color: c.stone, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{item.detail}</p></div></article></Reveal>)}
            </div>
          </div>
        )}

        {active === "tips" && (
          <div>
            <div style={{ marginBottom: 22 }}><h2 style={{ color: "#fff", fontSize: 28, margin: 0 }}>Practical ways to spend less</h2><p style={{ color: c.stone, lineHeight: 1.55, margin: "7px 0 0" }}>Small choices that can protect more of the budget for the experiences you care about.</p></div>
            <div className="mobile-break-grid" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
              {moneyTips.map((item, index) => <Reveal key={item.id} delay={(index % 3) * 45}><article style={{ background: c.surface2, borderRadius: 18, border: `1px solid ${c.line}`, padding: 19, height: "100%", display: "flex", gap: 12 }}><Sun size={19} color={c.gold} style={{ flexShrink: 0, marginTop: 2 }} /><div><h3 style={{ color: "#fff", fontSize: 15.5, margin: "0 0 5px" }}>{item.tip}</h3><p style={{ color: c.stone, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{item.detail}</p></div></article></Reveal>)}
            </div>
          </div>
        )}

        {!embedded && <div style={{ marginTop: 34, textAlign: "center" }}><Button variant="primary" size="lg" onClick={() => go("build")}>Plan around my route <ArrowRight size={17} /></Button></div>}
      </Section>
    </>
  );
}
