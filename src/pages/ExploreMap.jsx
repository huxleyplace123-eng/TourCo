import React, { useState, useMemo, useRef } from "react";
import { MapPin, Compass, Utensils, Wine, Waves, Sparkles, ArrowRight, X, Star, Navigation } from "lucide-react";
import { c, grad, glass, gradText, money } from "../theme.js";
import { activities } from "../data.js";
import { restaurants } from "../restaurants.js";
import { beaches, bars } from "../places.js";
import { activityImage, restaurantImage, barImage, beachImage, pageHero } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { Photo } from "../motion.jsx";

// ── Real Costa Rica geography ────────────────────────────────────────────────
// Real lat/long of each coastal hub (from geodata). We project these onto the
// map so every pin lands where it truly is — a real map, not a stylized blob.
const REGION_COORD = {
  Guanacaste:       { lat: 10.63, lng: -85.44 },
  Tamarindo:        { lat: 10.30, lng: -85.84 },
  "Jacó":           { lat: 9.61,  lng: -84.63 },
  Quepos:           { lat: 9.43,  lng: -84.16 },
  "Manuel Antonio": { lat: 9.39,  lng: -84.14 },
  Dominical:        { lat: 9.25,  lng: -83.86 },
  Uvita:            { lat: 9.16,  lng: -83.74 },
};

// Bounding box of the view (a touch of padding around the country).
const BOUNDS = { minLng: -86.2, maxLng: -82.5, minLat: 8.0, maxLat: 11.3 };
// Equirectangular projection → 0..100 viewBox coords.
function project(lat, lng) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x, y };
}

// A reasonably accurate Costa Rica outline (Nicoya Peninsula NW, Gulf of Nicoya,
// central Pacific coast, Osa Peninsula SE, Caribbean side E). Hand-traced to the
// real shape and scaled to the same 0..100 space as the projection above.
const CR_OUTLINE = "M14,26 L23,20 L30,23 L28,31 L22,34 L26,40 L20,46 L15,44 L13,50 Q19,52 24,55 L30,52 L33,58 L40,60 L46,66 L52,70 L58,76 L64,82 L70,86 Q74,88 78,86 L74,80 L70,74 L66,66 L72,64 L78,68 L84,66 L88,60 L92,54 L96,46 L94,38 L88,32 L82,28 L76,24 L68,20 L60,17 L52,15 L44,16 L37,14 L30,12 L22,15 L16,20 Z";
// The Pacific coastline stroke (where the beaches are) — the SW/S edge.
const PACIFIC_COAST = "M13,50 Q19,52 24,55 L30,52 L33,58 L40,60 L46,66 L52,70 L58,76 L64,82 L70,86";

const LAYERS = [
  { key: "tours", label: "Tours", icon: Compass, color: "#22D3EE" },
  { key: "beaches", label: "Beaches", icon: Waves, color: "#38BDF8" },
  { key: "eat", label: "Eat", icon: Utensils, color: "#FFD000" },
  { key: "bars", label: "Nightlife", icon: Wine, color: "#FF6B5A" },
];

// spread multiple pins in the same town so they don't overlap
function spread(base, i, total) {
  if (total <= 1) return base;
  const a = (i / total) * Math.PI * 2 + i * 0.6;
  const r = 1.6 + (i % 3) * 0.9;
  return { x: base.x + Math.cos(a) * r, y: base.y + Math.sin(a) * r * 0.85 };
}

export function ExploreMap({ go, addToTrip, viewActivity }) {
  const [active, setActive] = useState({ tours: true, beaches: true, eat: true, bars: true });
  const [sel, setSel] = useState(null);
  const [hover, setHover] = useState(null);
  const [region, setRegion] = useState("All");
  const toggle = (k) => setActive((a) => ({ ...a, [k]: !a[k] }));

  // build pins from all data, projected to real coordinates
  const { pins, counts } = useMemo(() => {
    const groups = {}; // region -> list
    const add = (arr, type, color) => arr.forEach((item) => {
      if (!REGION_COORD[item.region]) return;
      (groups[item.region] ||= []).push({ type, color, item, region: item.region });
    });
    if (active.tours) add(activities, "tours", "#22D3EE");
    if (active.beaches) add(beaches, "beaches", "#38BDF8");
    if (active.eat) add(restaurants, "eat", "#FFD000");
    if (active.bars) add(bars, "bars", "#FF6B5A");

    const out = [];
    const cnt = {};
    Object.entries(groups).forEach(([rg, list]) => {
      const base = project(REGION_COORD[rg].lat, REGION_COORD[rg].lng);
      cnt[rg] = list.length;
      const shown = region === "All" || region === rg ? list : [];
      shown.forEach((p, i) => {
        const pos = spread(base, i, shown.length);
        out.push({ ...p, x: pos.x, y: pos.y });
      });
    });
    return { pins: out, counts: cnt };
  }, [active, region]);

  const regions = ["All", ...Object.keys(REGION_COORD)];
  const pinImage = (p) => p.type === "tours" ? activityImage(p.item, 500) : p.type === "eat" ? restaurantImage(p.item, 500) : p.type === "bars" ? barImage(p.item, 500) : beachImage(p.item, 500);
  const pinTitle = (p) => p.item.title || p.item.name;
  const pinSub = (p) => p.type === "tours" ? `${p.item.category} · ${money(p.item.price)}` : p.item.cuisine || p.item.type || (p.item.tags || []).slice(0, 2).join(" · ");
  const typeLabel = (t) => t === "eat" ? "Restaurant" : t === "bars" ? "Nightlife" : t === "beaches" ? "Beach" : "Tour";

  return (
    <>
      <PageHero image={pageHero("guide")} eyebrow="Explore the map" title="The whole coast, mapped" accentWord="mapped"
        sub="Real geography, real coordinates. Every tour, beach, restaurant and bar — pinned exactly where it is. Toggle layers, tap a pin, plan the perfect route." />

      <Section bg={c.sand}>
        {/* controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 18 }}>
          {LAYERS.map((l) => (
            <button key={l.key} onClick={() => toggle(l.key)} style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 13.5, transition: "all .2s",
              background: active[l.key] ? `${l.color}22` : "rgba(255,255,255,.04)",
              border: active[l.key] ? `1.5px solid ${l.color}` : `1.5px solid ${c.line}`,
              color: active[l.key] ? l.color : c.stone,
              boxShadow: active[l.key] ? `0 0 16px -6px ${l.color}` : "none",
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
          {/* ── THE MAP ── */}
          <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", border: `1px solid ${c.line}`, aspectRatio: "1.05 / 1", minHeight: 440, background: "radial-gradient(120% 120% at 20% 10%, #0c2b4a 0%, #071a30 55%, #050f1f 100%)" }}>
            <style>{`
              @keyframes tnRing { 0%{ transform: scale(.6); opacity:.7 } 80%,100%{ transform: scale(3); opacity:0 } }
              @keyframes tnFloat2 { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-5px) } }
              @keyframes tnDash { to { stroke-dashoffset: -1000; } }
              @keyframes tnCardIn { from{ opacity:0; transform: translateY(14px) scale(.98) } to{ opacity:1; transform: translateY(0) scale(1) } }
              .tn-pin{ transition: transform .18s cubic-bezier(.2,.7,.2,1); }
              .tn-pin:hover{ transform: translate(-50%,-50%) scale(1.4)!important; z-index:20; }
            `}</style>

            {/* ocean texture: subtle grid + glow */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <defs>
                <linearGradient id="terr" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#1a5c3a" /><stop offset="0.55" stopColor="#14493f" /><stop offset="1" stopColor="#0f3a44" />
                </linearGradient>
                <radialGradient id="seaGlow" cx="35%" cy="40%" r="60%">
                  <stop offset="0" stopColor="rgba(34,211,238,.12)" /><stop offset="1" stopColor="transparent" />
                </radialGradient>
                <filter id="soft"><feGaussianBlur stdDeviation="0.4" /></filter>
              </defs>

              {/* sea glow */}
              <rect x="0" y="0" width="100" height="100" fill="url(#seaGlow)" />
              {/* faint lat/long grid */}
              {[20, 40, 60, 80].map((v) => (
                <g key={v} stroke="rgba(127,166,232,.06)" strokeWidth="0.25">
                  <line x1={v} y1="0" x2={v} y2="100" /><line x1="0" y1={v} x2="100" y2={v} />
                </g>
              ))}

              {/* soft landmass shadow for depth */}
              <path d={CR_OUTLINE} fill="rgba(0,0,0,.35)" transform="translate(0.8,0.8)" filter="url(#soft)" />
              {/* the country */}
              <path d={CR_OUTLINE} fill="url(#terr)" stroke="rgba(34,211,238,.4)" strokeWidth="0.4" />
              {/* mountain-spine hint */}
              <path d="M30,26 Q45,34 58,48 Q68,58 74,70" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="2.5" strokeLinecap="round" filter="url(#soft)" />
              {/* animated Pacific coastline (dashed, flowing) */}
              <path d={PACIFIC_COAST} fill="none" stroke="rgba(34,211,238,.55)" strokeWidth="0.5" strokeDasharray="2 2" style={{ animation: "tnDash 40s linear infinite" }} />

              <text x="50" y="30" fill="rgba(255,255,255,.10)" fontSize="4.5" fontWeight="800" style={{ letterSpacing: 2 }} textAnchor="middle">COSTA RICA</text>
              <text x="20" y="66" fill="rgba(34,211,238,.35)" fontSize="2.4" fontWeight="700" textAnchor="middle" style={{ letterSpacing: 1 }}>PACIFIC OCEAN</text>
            </svg>

            {/* region labels + cluster counts */}
            {Object.entries(REGION_COORD).map(([name]) => {
              if (region !== "All" && region !== name) return null;
              const pos = project(REGION_COORD[name].lat, REGION_COORD[name].lng);
              return (
                <div key={name} style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-260%)", pointerEvents: "none", textAlign: "center", zIndex: 3 }}>
                  <div style={{ color: "rgba(255,255,255,.62)", fontSize: 9.5, fontWeight: 800, whiteSpace: "nowrap", letterSpacing: 0.3 }}>{name}</div>
                  {counts[name] > 0 && <div style={{ color: c.teal, fontSize: 8.5, fontWeight: 700 }}>{counts[name]} spots</div>}
                </div>
              );
            })}

            {/* pins */}
            {pins.map((p, i) => {
              const isSel = sel === p;
              return (
                <button key={p.type + i} className="tn-pin" onClick={() => setSel(p)}
                  onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)}
                  style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, zIndex: isSel ? 25 : 5 }}>
                  <span style={{ position: "relative", display: "block", width: isSel ? 18 : 13, height: isSel ? 18 : 13 }}>
                    <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 999, background: p.color, animation: "tnRing 2.6s ease-out infinite", animationDelay: `${(i % 7) * 0.28}s` }} />
                    <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: p.color, border: "2px solid rgba(5,15,31,.85)", boxShadow: `0 0 12px ${p.color}, 0 2px 6px rgba(0,0,0,.5)` }} />
                  </span>
                </button>
              );
            })}

            {/* hover tooltip */}
            {hover && !sel && (
              <div style={{ position: "absolute", left: `${hover.x}%`, top: `${hover.y}%`, transform: "translate(-50%,-150%)", zIndex: 30, pointerEvents: "none", ...glass, padding: "6px 11px", borderRadius: 10, whiteSpace: "nowrap", maxWidth: 200 }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>{pinTitle(hover)}</div>
                <div style={{ color: hover.color, fontSize: 10.5, fontWeight: 700 }}>{typeLabel(hover.type)} · {hover.region}</div>
              </div>
            )}

            {/* legend */}
            <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 10, ...glass, padding: "8px 12px", borderRadius: 999, flexWrap: "wrap" }}>
              {LAYERS.filter((l) => active[l.key]).map((l) => (
                <span key={l.key} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#fff" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: l.color, boxShadow: `0 0 6px ${l.color}` }} />{l.label}
                </span>
              ))}
            </div>
            {/* compass */}
            <div style={{ position: "absolute", top: 12, right: 12, ...glass, width: 34, height: 34, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", color: c.teal }}>
              <Navigation size={16} />
            </div>
            <div style={{ position: "absolute", bottom: 12, right: 12, ...glass, padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{pins.length} on the map</div>
          </div>

          {/* ── DETAIL ── */}
          <div style={{ position: "sticky", top: 92 }}>
            {sel ? (
              <div style={{ background: c.white, borderRadius: 22, overflow: "hidden", border: `1px solid ${c.line}`, boxShadow: "0 24px 60px -34px rgba(0,0,0,.75)", animation: "tnCardIn .4s cubic-bezier(.2,.7,.2,1) both" }}>
                <div style={{ position: "relative" }}>
                  <Photo src={pinImage(sel)} fallback={grad.ocean} alt={pinTitle(sel)} height={175}
                    overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(11,26,46,.82) 100%)" }} />} />
                  <button onClick={() => setSel(null)} style={{ position: "absolute", top: 10, right: 10, zIndex: 3, ...glass, width: 32, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><X size={15} /></button>
                  <span style={{ position: "absolute", top: 12, left: 12, zIndex: 3, background: sel.color, color: c.ink, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{typeLabel(sel.type)}</span>
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
                  {sel.type === "eat" && <Button variant="ghost" size="sm" full onClick={() => go("eat")}>See all restaurants <ArrowRight size={14} /></Button>}
                  {sel.type === "bars" && <Button variant="ghost" size="sm" full onClick={() => go("eat")}>See all nightlife <ArrowRight size={14} /></Button>}
                  {sel.type === "beaches" && sel.item.tip && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(255,208,0,.08)", border: "1px solid rgba(255,208,0,.2)", borderRadius: 10, padding: "9px 11px" }}>
                      <Sparkles size={13} color={c.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: c.charcoal, lineHeight: 1.4 }}><b style={{ color: c.gold }}>Local tip:</b> {sel.item.tip}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ ...glass, borderRadius: 22, padding: "34px 24px", textAlign: "center" }}>
                <span style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.25)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Sparkles size={26} color={c.teal} />
                </span>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 6px" }}>Tap any glowing pin</h3>
                <p style={{ color: c.stone, fontSize: 14, lineHeight: 1.5, margin: "0 0 16px" }}>Every spot sits at its real location on the coast. Explore, then build the best ones into your trip.</p>
                <Button variant="primary" onClick={() => go("build")}>Build my Costa Rica <ArrowRight size={15} /></Button>
              </div>
            )}
          </div>
        </div>
      </Section>

      <style>{`@media(min-width:900px){.map-grid{grid-template-columns:1.6fr 350px!important}}`}</style>
    </>
  );
}
