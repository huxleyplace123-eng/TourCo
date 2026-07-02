import React, { useState, useMemo } from "react";
import { MapPin, Compass, Utensils, Wine, Waves, Sparkles, Star, ArrowRight, X } from "lucide-react";
import { c, grad, glass, gradText, money } from "../theme.js";
import { activities } from "../data.js";
import { restaurants } from "../restaurants.js";
import { beaches, bars } from "../places.js";
import { activityImage, restaurantImage, barImage, beachImage } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { pageHero } from "../images.js";
import { Photo, Reveal } from "../motion.jsx";

// Stylized coast layout — each region gets an x/y on the map (south→north along
// the Pacific). Hand-placed to feel like the real coastline curve.
const REGION_POS = {
  Uvita: { x: 30, y: 82 },
  Dominical: { x: 34, y: 72 },
  Quepos: { x: 42, y: 60 },
  "Manuel Antonio": { x: 46, y: 55 },
  Jacó: { x: 55, y: 42 },
  Tamarindo: { x: 66, y: 24 },
  Guanacaste: { x: 74, y: 14 },
};

const LAYERS = [
  { key: "tours", label: "Tours", icon: Compass, color: "#22D3EE" },
  { key: "beaches", label: "Beaches", icon: Waves, color: "#38BDF8" },
  { key: "eat", label: "Eat", icon: Utensils, color: "#FFD000" },
  { key: "bars", label: "Nightlife", icon: Wine, color: "#FF6B5A" },
];

// jitter pins within a region so they don't stack perfectly
function jitter(pos, i) {
  const a = (i * 137.5) * (Math.PI / 180);
  const r = 2.4 + (i % 3) * 1.3;
  return { x: pos.x + Math.cos(a) * r, y: pos.y + Math.sin(a) * r * 0.7 };
}

export function ExploreMap({ go, addToTrip, viewActivity }) {
  const [active, setActive] = useState({ tours: true, beaches: true, eat: true, bars: true });
  const [sel, setSel] = useState(null); // selected pin
  const [region, setRegion] = useState("All");

  const toggle = (k) => setActive((a) => ({ ...a, [k]: !a[k] }));

  // build the pin list from all data
  const pins = useMemo(() => {
    const out = [];
    const push = (arr, type, color) => arr.forEach((item, i) => {
      const pos = REGION_POS[item.region]; if (!pos) return;
      if (region !== "All" && item.region !== region) return;
      const j = jitter(pos, out.filter((p) => p.region === item.region).length);
      out.push({ type, color, item, x: j.x, y: j.y, region: item.region });
    });
    if (active.tours) push(activities, "tours", "#22D3EE");
    if (active.beaches) push(beaches, "beaches", "#38BDF8");
    if (active.eat) push(restaurants, "eat", "#FFD000");
    if (active.bars) push(bars, "bars", "#FF6B5A");
    return out;
  }, [active, region]);

  const regions = ["All", ...Object.keys(REGION_POS)];

  const pinImage = (p) => p.type === "tours" ? activityImage(p.item, 500) : p.type === "eat" ? restaurantImage(p.item, 500) : p.type === "bars" ? barImage(p.item, 500) : beachImage(p.item, 500);
  const pinTitle = (p) => p.item.title || p.item.name;
  const pinSub = (p) => p.type === "tours" ? `${p.item.category} · ${money(p.item.price)}` : p.item.cuisine || p.item.type || (p.item.tags || []).slice(0, 2).join(" · ");

  return (
    <>
      <PageHero image={pageHero("guide")} eyebrow="Explore the map" title="See the whole coast at a glance" accentWord="glance"
        sub="Every tour, beach, restaurant and bar — pinned by region. Toggle layers, tap a pin, and see what's worth the drive." />

      <Section bg={c.sand}>
        {/* layer toggles + region */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 18 }}>
          {LAYERS.map((l) => (
            <button key={l.key} onClick={() => toggle(l.key)} style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 13.5, transition: "all .15s",
              background: active[l.key] ? `${l.color}22` : "rgba(255,255,255,.04)",
              border: active[l.key] ? `1.5px solid ${l.color}` : `1.5px solid ${c.line}`,
              color: active[l.key] ? l.color : c.stone,
            }}>
              <l.icon size={15} />{l.label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {regions.map((rg) => (
              <button key={rg} onClick={() => setRegion(rg)} style={{
                padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 12, transition: "all .15s",
                background: rg === region ? c.teal : "rgba(255,255,255,.05)", color: rg === region ? c.ink : c.charcoal,
                border: rg === region ? "none" : `1px solid ${c.line}`,
              }}>{rg}</button>
            ))}
          </div>
        </div>

        <div className="map-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, alignItems: "start" }}>
          {/* ── the map ── */}
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", border: `1px solid ${c.line}`, background: "linear-gradient(160deg,#0a1e3a,#0b1a2e)", aspectRatio: "1 / 1", minHeight: 420 }}>
            <style>{`
              @keyframes tnPinPulse { 0%{ transform: scale(1); opacity:.6 } 70%,100%{ transform: scale(2.6); opacity:0 } }
              @keyframes tnMapFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-4px) } }
              .tn-pin:hover .tn-pin-dot { transform: scale(1.35); }
            `}</style>
            {/* sea shimmer */}
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 30% 30%, rgba(34,211,238,.10), transparent 60%), radial-gradient(50% 50% at 80% 80%, rgba(127,166,232,.10), transparent 60%)" }} />
            {/* stylized landmass */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <defs>
                <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#123a2a" /><stop offset="1" stopColor="#0e2f40" />
                </linearGradient>
              </defs>
              {/* coastline: land on the upper-right, ocean lower-left */}
              <path d="M40,100 C46,80 44,70 52,58 C58,48 60,42 70,32 C80,22 84,16 100,6 L100,100 Z" fill="url(#land)" stroke="rgba(34,211,238,.35)" strokeWidth="0.5" />
              {/* faint contour lines */}
              <path d="M40,100 C46,80 44,70 52,58 C58,48 60,42 70,32 C80,22 84,16 100,6" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="0.4" />
              <text x="82" y="55" fill="rgba(255,255,255,.14)" fontSize="4" fontWeight="800" style={{ letterSpacing: 1 }}>COSTA RICA</text>
            </svg>

            {/* region labels */}
            {Object.entries(REGION_POS).map(([name, pos]) => (
              (region === "All" || region === name) && (
                <div key={name} style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-140%)", color: "rgba(255,255,255,.5)", fontSize: 10, fontWeight: 700, pointerEvents: "none", whiteSpace: "nowrap" }}>{name}</div>
              )
            ))}

            {/* pins */}
            {pins.map((p, i) => (
              <button key={p.type + i} className="tn-pin" onClick={() => setSel(p)} title={pinTitle(p)}
                style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, zIndex: sel === p ? 10 : 2 }}>
                <span style={{ position: "relative", display: "block", width: 14, height: 14 }}>
                  <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 999, background: p.color, animation: "tnPinPulse 2.4s ease-out infinite", animationDelay: `${(i % 6) * 0.3}s` }} />
                  <span className="tn-pin-dot" style={{ position: "absolute", inset: 0, borderRadius: 999, background: p.color, border: "2px solid rgba(11,26,46,.7)", boxShadow: `0 0 10px ${p.color}`, transition: "transform .18s" }} />
                </span>
              </button>
            ))}

            {/* count badge */}
            <div style={{ position: "absolute", bottom: 12, left: 12, ...glass, padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#fff" }}>{pins.length} spots on the map</div>
          </div>

          {/* ── selected pin detail ── */}
          <div style={{ position: "sticky", top: 92 }}>
            {sel ? (
              <div style={{ background: c.white, borderRadius: 22, overflow: "hidden", border: `1px solid ${c.line}`, boxShadow: "0 24px 60px -34px rgba(0,0,0,.7)", animation: "tnMapFloat 5s ease-in-out infinite" }}>
                <div style={{ position: "relative" }}>
                  <Photo src={pinImage(sel)} fallback={grad.ocean} alt={pinTitle(sel)} height={170}
                    overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(11,26,46,.8) 100%)" }} />} />
                  <button onClick={() => setSel(null)} style={{ position: "absolute", top: 10, right: 10, zIndex: 3, ...glass, width: 32, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><X size={15} /></button>
                  <span style={{ position: "absolute", top: 12, left: 12, zIndex: 3, background: sel.color, color: c.ink, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{sel.type === "eat" ? "Restaurant" : sel.type === "bars" ? "Nightlife" : sel.type === "beaches" ? "Beach" : "Tour"}</span>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.teal, display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{sel.region}</div>
                  <h3 style={{ margin: "4px 0 6px", fontSize: 19, fontWeight: 800, color: c.charcoal }}>{pinTitle(sel)}</h3>
                  <div style={{ color: c.stone, fontSize: 13, marginBottom: 10 }}>{pinSub(sel)}</div>
                  <p style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.5, margin: "0 0 14px" }}>{sel.item.blurb || sel.item.desc}</p>
                  {sel.type === "tours" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="primary" size="sm" full onClick={() => addToTrip(sel.item.id)}>Add to trip</Button>
                      <Button variant="ghost" size="sm" onClick={() => viewActivity(sel.item.id)}>Details</Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ ...glass, borderRadius: 22, padding: "34px 24px", textAlign: "center" }}>
                <span style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.25)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Sparkles size={26} color={c.teal} />
                </span>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 6px" }}>Tap any pin</h3>
                <p style={{ color: c.stone, fontSize: 14, lineHeight: 1.5, margin: "0 0 16px" }}>Explore tours, beaches, restaurants and nightlife across the coast — then build them into your trip.</p>
                <Button variant="primary" onClick={() => go("build")}>Build my Costa Rica <ArrowRight size={15} /></Button>
              </div>
            )}
          </div>
        </div>
      </Section>

      <style>{`@media(min-width:900px){.map-grid{grid-template-columns:1.5fr 360px!important}}`}</style>
    </>
  );
}
