import React, { useState, useMemo } from "react";
import { MapPin, Star, Utensils, ArrowRight } from "lucide-react";
import { c, grad, glass } from "../theme.js";
import { restaurants, DINING_COLLECTIONS } from "../restaurants.js";
import { restaurantImage, pageHero } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { TiltCard, Photo, Reveal } from "../motion.jsx";

const REGIONS = ["All", ...Array.from(new Set(restaurants.map((r) => r.region)))];

function RestaurantCard({ r }) {
  return (
    <TiltCard style={{ overflow: "hidden", border: `1px solid ${c.line}`, background: c.white, height: "100%", display: "flex", flexDirection: "column" }} radius={18} max={7}>
      <Photo src={restaurantImage(r)} fallback={grad.sunset} alt={r.name} height={150}
        overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.1) 0%, transparent 40%, rgba(11,26,46,.72) 100%)" }} />}>
        <span style={{ position: "absolute", top: 10, left: 10, zIndex: 2, ...glass, color: c.gold, padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>{r.best}</span>
        <span style={{ position: "absolute", bottom: 10, right: 10, zIndex: 2, background: "rgba(11,26,46,.6)", color: "#fff", padding: "4px 9px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{r.price}</span>
      </Photo>
      <div style={{ padding: 15, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.teal }}>{r.cuisine}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: c.charcoal, lineHeight: 1.15 }}>{r.name}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: c.stone, fontWeight: 600 }}><MapPin size={12} />{r.region}</div>
        <p style={{ margin: "4px 0 0", color: c.stone, fontSize: 13, lineHeight: 1.5, flex: 1 }}>{r.blurb}</p>
      </div>
    </TiltCard>
  );
}

export function Restaurants({ go }) {
  const [region, setRegion] = useState("All");
  const [collection, setCollection] = useState("all");

  const list = useMemo(() => restaurants.filter((r) =>
    (region === "All" || r.region === region) &&
    (collection === "all" || r.tags.includes(collection))
  ), [region, collection]);

  return (
    <>
      <PageHero image={pageHero("packages")} eyebrow="Where to eat" title="Restaurants, picked in context"
        sub="Not a directory — the right table for the moment. Best after a tour, best for sunset, best local sodas, best for the kids. All local-tested." />

      <Section bg={c.sand}>
        {/* contextual collection chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          <Chip on={collection === "all"} onClick={() => setCollection("all")}>All spots</Chip>
          {DINING_COLLECTIONS.map((cx) => (
            <Chip key={cx.key} on={collection === cx.tag} onClick={() => setCollection(cx.tag)}>{cx.label}</Chip>
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
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
            {list.map((r, i) => <Reveal key={r.id} delay={(i % 3) * 60}><RestaurantCard r={r} /></Reveal>)}
          </div>
        )}

        {/* concierge nudge */}
        <Reveal>
          <div style={{ marginTop: 30, ...glass, borderRadius: 20, padding: "22px 24px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: grad.sunset, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: c.ink, flexShrink: 0 }}>S</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15.5 }}>Building a trip? Sol pairs dinner to your day.</div>
              <div style={{ color: c.stone, fontSize: 13.5 }}>Tell Sol your plan and get the best table within minutes of each tour.</div>
            </div>
            <Button variant="primary" onClick={() => go("build")}>Build my Costa Rica <ArrowRight size={15} /></Button>
          </div>
        </Reveal>
      </Section>
    </>
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
