import React, { useState, useMemo } from "react";
import { MapPin, Utensils, Wine, ArrowRight, Clock } from "lucide-react";
import { c, grad, glass } from "../theme.js";
import { restaurants, DINING_COLLECTIONS } from "../restaurants.js";
import { bars, BAR_TAGS } from "../places.js";
import { restaurantImage, barImage, pageHero } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { TiltCard, Photo, Reveal } from "../motion.jsx";
import { TicoAvatar, TicoRating, TicoPick, useTicoSpot } from "../components/Tico.jsx";

const REGIONS = ["All", ...Array.from(new Set([...restaurants, ...bars].map((r) => r.region)))];

function RestaurantCard({ r }) {
  const tico = useTicoSpot(r);
  return (
    <TiltCard style={{ overflow: "hidden", border: `1px solid ${c.line}`, background: c.white, height: "100%", display: "flex", flexDirection: "column" }} radius={18} max={7}>
      <Photo src={restaurantImage(r)} fallback={grad.sunset} alt={r.name} height={150}
        overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.1) 0%, transparent 40%, rgba(11,26,46,.72) 100%)" }} />}>
        {tico.isPick ? <span style={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}><TicoPick /></span>
          : <span style={{ position: "absolute", top: 10, left: 10, zIndex: 2, ...glass, color: c.gold, padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>{r.best}</span>}
        <span style={{ position: "absolute", bottom: 10, right: 10, zIndex: 2, background: "rgba(11,26,46,.6)", color: "#fff", padding: "4px 9px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{r.price}</span>
      </Photo>
      <div style={{ padding: 15, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: c.teal }}>{r.cuisine}</span>
          <span title={`Tico says: ${tico.label}`}><TicoRating score={tico.score} mood={tico.mood} /></span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: c.charcoal, lineHeight: 1.15 }}>{r.name}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: c.stone, fontWeight: 600 }}><MapPin size={12} />{r.region}</div>
        <p style={{ margin: "4px 0 0", color: c.stone, fontSize: 13, lineHeight: 1.5, flex: 1 }}>{r.blurb}</p>
        {tico.take && <div style={{ display: "flex", gap: 7, alignItems: "flex-start", background: "rgba(34,211,238,.06)", border: "1px solid rgba(34,211,238,.18)", borderRadius: 11, padding: "8px 10px", marginTop: 2 }}><TicoAvatar size={18} glow={false} mood={tico.takeMood} animate={false} /><span style={{ fontSize: 12, lineHeight: 1.4, color: c.charcoal, fontStyle: "italic" }}>{tico.take}</span></div>}
      </div>
    </TiltCard>
  );
}

function BarCard({ b }) {
  const tico = useTicoSpot(b);
  return (
    <TiltCard style={{ overflow: "hidden", border: `1px solid ${c.line}`, background: c.white, height: "100%", display: "flex", flexDirection: "column" }} radius={18} max={7}>
      <Photo src={barImage(b)} fallback={grad.orchid} alt={b.name} height={150}
        overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.1) 0%, transparent 40%, rgba(11,26,46,.72) 100%)" }} />}>
        {b.happy && <span style={{ position: "absolute", top: 10, left: 10, zIndex: 2, background: c.gold, color: c.ink, padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={11} />{b.happy}</span>}
        {tico.isPick && <span style={{ position: "absolute", bottom: 10, left: 10, zIndex: 2 }}><TicoPick /></span>}
      </Photo>
      <div style={{ padding: 15, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: c.teal }}>{b.type}</span>
          <span title={`Tico says: ${tico.label}`}><TicoRating score={tico.score} mood={tico.mood} /></span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: c.charcoal, lineHeight: 1.15 }}>{b.name}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: c.stone, fontWeight: 600 }}><MapPin size={12} />{b.region}</div>
        <p style={{ margin: "4px 0 0", color: c.stone, fontSize: 13, lineHeight: 1.5, flex: 1 }}>{b.blurb}</p>
        {tico.take && <div style={{ display: "flex", gap: 7, alignItems: "flex-start", background: "rgba(34,211,238,.06)", border: "1px solid rgba(34,211,238,.18)", borderRadius: 11, padding: "8px 10px", marginTop: 2 }}><TicoAvatar size={18} glow={false} mood={tico.takeMood} animate={false} /><span style={{ fontSize: 12, lineHeight: 1.4, color: c.charcoal, fontStyle: "italic" }}>{tico.take}</span></div>}
      </div>
    </TiltCard>
  );
}

export function Restaurants({ go }) {
  const [mode, setMode] = useState("eat"); // 'eat' | 'drink'
  const [region, setRegion] = useState("All");
  const [collection, setCollection] = useState("all");

  const collections = mode === "eat" ? DINING_COLLECTIONS : BAR_TAGS;
  const source = mode === "eat" ? restaurants : bars;
  const list = useMemo(() => source.filter((r) =>
    (region === "All" || r.region === region) &&
    (collection === "all" || r.tags.includes(collection))
  ), [mode, region, collection, source]);

  const switchMode = (m) => { setMode(m); setCollection("all"); };

  return (
    <>
      <PageHero image={pageHero("packages")} eyebrow="Where to eat & drink" title="Dining & nightlife, in context"
        sub="Not a directory — the right spot for the moment. Best after a tour, best for sunset, best local sodas, best happy hours. All local-tested." />

      <Section bg={c.sand}>
        {/* Eat / Drink toggle */}
        <div style={{ display: "inline-flex", gap: 6, background: "rgba(255,255,255,.05)", border: `1px solid ${c.line}`, padding: 5, borderRadius: 999, marginBottom: 18 }}>
          <ModeBtn on={mode === "eat"} icon={Utensils} label="Eat" onClick={() => switchMode("eat")} />
          <ModeBtn on={mode === "drink"} icon={Wine} label="Drink & nightlife" onClick={() => switchMode("drink")} />
        </div>

        {/* contextual collection chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          <Chip on={collection === "all"} onClick={() => setCollection("all")}>{mode === "eat" ? "All spots" : "All bars"}</Chip>
          {collections.map((cx) => (
            <Chip key={cx.key} on={collection === (cx.tag || cx.key)} onClick={() => setCollection(cx.tag || cx.key)}>{cx.label}</Chip>
          ))}
        </div>
        {/* region row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
          {REGIONS.map((rg) => (
            <button key={rg} onClick={() => setRegion(rg)} style={{
              padding: "7px 13px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 12.5, transition: "all .15s",
              background: rg === region ? c.teal : "rgba(255,255,255,.05)", color: rg === region ? c.ink : c.charcoal,
              border: rg === region ? "none" : `1px solid ${c.line}`,
            }}>{rg}</button>
          ))}
        </div>

        <div style={{ color: c.stone, fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{list.length} spot{list.length !== 1 ? "s" : ""}</div>
        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50, color: c.stone }}>
            <Utensils size={38} color={c.teal} style={{ opacity: 0.5 }} />
            <p style={{ fontWeight: 700, color: c.charcoal, marginTop: 12 }}>No spots match — try another filter</p>
            <Button variant="ghost" onClick={() => { setRegion("All"); setCollection("all"); }}>Clear filters</Button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
            {list.map((r, i) => <Reveal key={r.id} delay={(i % 3) * 60}>{mode === "eat" ? <RestaurantCard r={r} /> : <BarCard b={r} />}</Reveal>)}
          </div>
        )}

        {/* concierge nudge */}
        <Reveal>
          <div style={{ marginTop: 30, ...glass, borderRadius: 20, padding: "22px 24px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <TicoAvatar size={44} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15.5 }}>Building a trip? Tico pairs dinner to your day.</div>
              <div style={{ color: c.stone, fontSize: 13.5 }}>Tell Tico your plan and get the best table within minutes of each tour.</div>
            </div>
            <Button variant="primary" onClick={() => go("build")}>Build my Costa Rica <ArrowRight size={15} /></Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

function ModeBtn({ on, icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999, border: "none", cursor: "pointer",
      fontWeight: 700, fontSize: 13.5, transition: "all .2s",
      background: on ? c.teal : "transparent", color: on ? c.ink : c.charcoal,
    }}><Icon size={15} />{label}</button>
  );
}

function Chip({ on, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all .15s",
      background: on ? "rgba(34,211,238,.14)" : "rgba(255,255,255,.05)",
      border: on ? `1.5px solid ${c.teal}` : `1.5px solid ${c.line}`,
      color: on ? c.teal : c.charcoal,
    }}>{children}</button>
  );
}
