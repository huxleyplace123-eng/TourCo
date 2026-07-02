import React, { useState, useMemo } from "react";
import { Compass, Utensils, Wine, Waves, Sparkles, ArrowRight, X, Navigation, Trees, Droplets, Bird, Mountain, Plane, Building2 } from "lucide-react";
import { c, grad, glass, gradText, money } from "../theme.js";
import { activities } from "../data.js";
import { restaurants } from "../restaurants.js";
import { beaches, bars } from "../places.js";
import { landmarks, LANDMARK_LAYERS } from "../mapPoints.js";
import { activityImage, restaurantImage, barImage, beachImage, pageHero } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { MapHero } from "../components/MapHero.jsx";
import { Photo } from "../motion.jsx";

// Real coastal hubs (lat/long) for the tours/eat/bars/beaches clusters.
const REGION_COORD = {
  Guanacaste: { lat: 10.63, lng: -85.44 }, Tamarindo: { lat: 10.30, lng: -85.84 },
  "Jacó": { lat: 9.61, lng: -84.63 }, Quepos: { lat: 9.43, lng: -84.16 },
  "Manuel Antonio": { lat: 9.39, lng: -84.14 }, Dominical: { lat: 9.25, lng: -83.86 }, Uvita: { lat: 9.16, lng: -83.74 },
};

// Bounds widened to fit the WHOLE country (Corcovado far SW → Caribbean E,
// Nicoya NW → southern border). Everything projects to real position.
const BOUNDS = { minLng: -86.4, maxLng: -82.4, minLat: 8.2, maxLat: 11.3 };
function project(lat, lng) {
  return {
    x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100,
    y: (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100,
  };
}

const CR_OUTLINE = "M12,30 L22,22 L30,25 L28,33 L21,36 L26,42 L19,47 L14,45 L12,52 Q18,54 23,57 L30,54 L33,60 L40,62 L47,68 L53,72 L59,78 L65,84 L71,88 Q75,90 79,88 L75,82 L71,76 L67,68 L73,66 L79,70 L85,68 L90,62 L94,55 L97,47 L95,39 L89,33 L83,29 L77,25 L69,21 L60,18 L52,16 L44,17 L36,15 L28,13 L20,17 Z";

const ACTIVITY_LAYERS = [
  { key: "tours", label: "Tours", icon: Compass, color: "#22D3EE" },
  { key: "beaches", label: "Beaches", icon: Waves, color: "#38BDF8" },
  { key: "eat", label: "Eat", icon: Utensils, color: "#FFD000" },
  { key: "bars", label: "Nightlife", icon: Wine, color: "#FF6B5A" },
];
const LM_ICON = { trees: Trees, droplets: Droplets, bird: Bird, mountain: Mountain, plane: Plane, building: Building2 };

function spread(base, i, total) {
  if (total <= 1) return base;
  const a = (i / total) * Math.PI * 2 + i * 0.6;
  const r = 1.3 + (i % 3) * 0.8;
  return { x: base.x + Math.cos(a) * r, y: base.y + Math.sin(a) * r * 0.85 };
}

export function ExploreMap({ go, addToTrip, viewActivity }) {
  const [active, setActive] = useState({ tours: true, beaches: true, eat: false, bars: false, park: true, waterfall: true, wildlife: true, view: false, airport: true, town: false });
  const [sel, setSel] = useState(null);
  const [hover, setHover] = useState(null);
  const toggle = (k) => setActive((a) => ({ ...a, [k]: !a[k] }));

  // activity/eat/bar/beach pins (clustered by region)
  const clusterPins = useMemo(() => {
    const groups = {};
    const addSet = (arr, type) => arr.forEach((item) => { if (REGION_COORD[item.region]) (groups[item.region] ||= []).push({ type, item }); });
    if (active.tours) addSet(activities, "tours");
    if (active.beaches) addSet(beaches, "beaches");
    if (active.eat) addSet(restaurants, "eat");
    if (active.bars) addSet(bars, "bars");
    const color = { tours: "#22D3EE", beaches: "#38BDF8", eat: "#FFD000", bars: "#FF6B5A" };
    const out = [];
    Object.entries(groups).forEach(([rg, list]) => {
      const base = project(REGION_COORD[rg].lat, REGION_COORD[rg].lng);
      list.forEach((p, i) => { const pos = spread(base, i, list.length); out.push({ ...p, color: color[p.type], x: pos.x, y: pos.y, region: rg }); });
    });
    return out;
  }, [active]);

  // landmark pins (each at its own real coordinate)
  const landmarkPins = useMemo(() => {
    const colorFor = Object.fromEntries(LANDMARK_LAYERS.map((l) => [l.key, l.color]));
    return landmarks.filter((l) => active[l.kind]).map((l) => {
      const pos = project(l.lat, l.lng);
      return { type: l.kind, item: l, color: colorFor[l.kind], x: pos.x, y: pos.y, region: l.name, landmark: true };
    });
  }, [active]);

  const allPins = [...clusterPins, ...landmarkPins];

  const pinImage = (p) => p.type === "tours" ? activityImage(p.item, 500) : p.type === "eat" ? restaurantImage(p.item, 500) : p.type === "bars" ? barImage(p.item, 500) : (p.type === "beaches" ? beachImage(p.item, 500) : null);
  const pinTitle = (p) => p.item.title || p.item.name;
  const typeLabel = (t) => ({ eat: "Restaurant", bars: "Nightlife", beaches: "Beach", tours: "Tour", park: "National Park", waterfall: "Waterfall", wildlife: "Wildlife", view: "Viewpoint", airport: "Airport", town: "Town" }[t] || t);
  const pinSub = (p) => p.type === "tours" ? `${p.item.category} · ${money(p.item.price)}` : p.item.cuisine || p.item.type || typeLabel(p.type);

  return (
    <>
      <MapHero />

      <Section bg={c.sand}>
        {/* two rows of layer toggles: experiences + places */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
          {ACTIVITY_LAYERS.map((l) => <LayerBtn key={l.key} l={l} on={active[l.key]} onClick={() => toggle(l.key)} />)}
          {LANDMARK_LAYERS.map((l) => <LayerBtn key={l.key} l={{ ...l, icon: LM_ICON[l.icon] }} on={active[l.key]} onClick={() => toggle(l.key)} />)}
        </div>

        <div className="map-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, alignItems: "start" }}>
          {/* ── THE MAP ── */}
          <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", border: `1px solid ${c.line}`, aspectRatio: "1.15 / 1", minHeight: 460, background: "radial-gradient(120% 120% at 25% 12%, #0c2b4a 0%, #071a30 55%, #050f1f 100%)" }}>
            <style>{`
              @keyframes tnRadar { 0%{ transform: rotate(0deg); opacity:.5 } 100%{ transform: rotate(360deg); opacity:.5 } }
              @keyframes tnPinFloat { 0%,100%{ transform: translate(-50%,-50%) } 50%{ transform: translate(-50%,-54%) } }
              @keyframes tnGlowDrift { 0%,100%{ opacity:.5; transform: translate(0,0) } 50%{ opacity:.85; transform: translate(2%,-2%) } }
              @keyframes tnCardIn { from{ opacity:0; transform: translateY(14px) scale(.98) } to{ opacity:1; transform: translateY(0) scale(1) } }
              .tn-pin{ transition: transform .18s cubic-bezier(.2,.7,.2,1); }
              .tn-pin:hover{ transform: translate(-50%,-50%) scale(1.5)!important; z-index:20; }
            `}</style>

            {/* slow drifting ambient glow (replaces the running dash) */}
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(45% 45% at 30% 35%, rgba(34,211,238,.14), transparent 60%), radial-gradient(40% 40% at 78% 72%, rgba(127,166,232,.12), transparent 60%)", animation: "tnGlowDrift 14s ease-in-out infinite" }} />
            {/* slow radar sweep centered on the coast */}
            <div aria-hidden style={{ position: "absolute", left: "42%", top: "58%", width: "120%", height: "120%", transform: "translate(-50%,-50%)", pointerEvents: "none", background: "conic-gradient(from 0deg, rgba(34,211,238,.10), transparent 30%, transparent 100%)", borderRadius: "50%", animation: "tnRadar 18s linear infinite" }} />

            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <defs>
                <linearGradient id="terr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1a5c3a" /><stop offset="0.55" stopColor="#14493f" /><stop offset="1" stopColor="#0f3a44" /></linearGradient>
                <filter id="soft"><feGaussianBlur stdDeviation="0.4" /></filter>
              </defs>
              {[16, 32, 48, 64, 80].map((v) => (<g key={v} stroke="rgba(127,166,232,.05)" strokeWidth="0.22"><line x1={v} y1="0" x2={v} y2="100" /><line x1="0" y1={v} x2="100" y2={v} /></g>))}
              <path d={CR_OUTLINE} fill="rgba(0,0,0,.35)" transform="translate(0.8,0.8)" filter="url(#soft)" />
              <path d={CR_OUTLINE} fill="url(#terr)" stroke="rgba(34,211,238,.4)" strokeWidth="0.4" />
              <path d="M28,28 Q45,36 58,50 Q68,60 74,72" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="2.5" strokeLinecap="round" filter="url(#soft)" />
              <text x="52" y="34" fill="rgba(255,255,255,.09)" fontSize="4.2" fontWeight="800" style={{ letterSpacing: 2 }} textAnchor="middle">COSTA RICA</text>
              <text x="20" y="70" fill="rgba(34,211,238,.32)" fontSize="2.3" fontWeight="700" textAnchor="middle" style={{ letterSpacing: 1 }}>PACIFIC OCEAN</text>
              <text x="88" y="30" fill="rgba(127,166,232,.28)" fontSize="2" fontWeight="700" textAnchor="middle" style={{ letterSpacing: 1 }}>CARIBBEAN</text>
            </svg>

            {/* pins */}
            {allPins.map((p, i) => {
              const isSel = sel === p;
              const Ico = p.landmark ? LM_ICON[LANDMARK_LAYERS.find((l) => l.key === p.type)?.icon] : null;
              return (
                <button key={p.type + i} className="tn-pin" onClick={() => setSel(p)} onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)}
                  style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, zIndex: isSel ? 25 : (p.landmark ? 8 : 5), animation: p.landmark ? `tnPinFloat ${5 + (i % 4)}s ease-in-out infinite` : "none" }}>
                  {p.landmark ? (
                    // landmark = labeled chip with icon
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(5,15,31,.7)", border: `1.5px solid ${p.color}`, borderRadius: 999, padding: "3px 7px 3px 4px", boxShadow: `0 0 10px -2px ${p.color}` }}>
                      <span style={{ width: 16, height: 16, borderRadius: 999, background: `${p.color}33`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{Ico && <Ico size={10} color={p.color} />}</span>
                      <span style={{ color: "#fff", fontSize: 8.5, fontWeight: 700, whiteSpace: "nowrap", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis" }}>{p.item.name.replace(/ (National Park|N\.P\.|Intl.*|Airstrip.*|Airport.*)/, "")}</span>
                    </span>
                  ) : (
                    // experience = glowing dot
                    <span style={{ position: "relative", display: "block", width: 12, height: 12 }}>
                      <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 999, background: p.color, opacity: 0.35, transform: "scale(2)", filter: "blur(2px)" }} />
                      <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: p.color, border: "2px solid rgba(5,15,31,.85)", boxShadow: `0 0 10px ${p.color}` }} />
                    </span>
                  )}
                </button>
              );
            })}

            {hover && !sel && !hover.landmark && (
              <div style={{ position: "absolute", left: `${hover.x}%`, top: `${hover.y}%`, transform: "translate(-50%,-160%)", zIndex: 30, pointerEvents: "none", ...glass, padding: "6px 11px", borderRadius: 10, whiteSpace: "nowrap" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>{pinTitle(hover)}</div>
                <div style={{ color: hover.color, fontSize: 10.5, fontWeight: 700 }}>{typeLabel(hover.type)} · {hover.region}</div>
              </div>
            )}

            {/* legend */}
            <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 9, ...glass, padding: "8px 12px", borderRadius: 14, flexWrap: "wrap", maxWidth: "70%" }}>
              {[...ACTIVITY_LAYERS, ...LANDMARK_LAYERS].filter((l) => active[l.key]).map((l) => (
                <span key={l.key} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color: "#fff" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: l.color, boxShadow: `0 0 6px ${l.color}` }} />{l.label}
                </span>
              ))}
            </div>
            <div style={{ position: "absolute", top: 12, right: 12, ...glass, width: 34, height: 34, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", color: c.teal }}><Navigation size={16} /></div>
            <div style={{ position: "absolute", bottom: 12, right: 12, ...glass, padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{allPins.length} on the map</div>
          </div>

          {/* ── DETAIL ── */}
          <div style={{ position: "sticky", top: 92 }}>
            {sel ? (
              <div style={{ background: c.white, borderRadius: 22, overflow: "hidden", border: `1px solid ${c.line}`, boxShadow: "0 24px 60px -34px rgba(0,0,0,.75)", animation: "tnCardIn .4s cubic-bezier(.2,.7,.2,1) both" }}>
                {pinImage(sel) ? (
                  <div style={{ position: "relative" }}>
                    <Photo src={pinImage(sel)} fallback={grad.ocean} alt={pinTitle(sel)} height={170} overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(11,26,46,.82) 100%)" }} />} />
                    <span style={{ position: "absolute", top: 12, left: 12, zIndex: 3, background: sel.color, color: c.ink, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{typeLabel(sel.type)}</span>
                    <button onClick={() => setSel(null)} style={closeBtn}><X size={15} /></button>
                  </div>
                ) : (
                  // landmark header (no photo) — colored band
                  <div style={{ position: "relative", padding: "18px 18px 14px", background: `linear-gradient(135deg, ${sel.color}22, transparent)` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: sel.color, color: c.ink, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>{typeLabel(sel.type)}</span>
                    <button onClick={() => setSel(null)} style={closeBtn}><X size={15} /></button>
                  </div>
                )}
                <div style={{ padding: pinImage(sel) ? 18 : "0 18px 18px" }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: c.charcoal }}>{pinTitle(sel)}</h3>
                  {!sel.landmark && <div style={{ color: c.stone, fontSize: 13, marginBottom: 8 }}>{pinSub(sel)}</div>}
                  <p style={{ color: c.stone, fontSize: 13.5, lineHeight: 1.5, margin: "0 0 14px" }}>{sel.item.blurb || sel.item.desc}</p>
                  {sel.type === "tours" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="primary" size="sm" full onClick={() => addToTrip(sel.item.id)}>Add to trip</Button>
                      <Button variant="ghost" size="sm" onClick={() => viewActivity(sel.item.id)}>Details</Button>
                    </div>
                  )}
                  {(sel.type === "eat" || sel.type === "bars") && <Button variant="ghost" size="sm" full onClick={() => go("eat")}>See all in Eat & Drink <ArrowRight size={14} /></Button>}
                  {(sel.type === "beaches" || sel.landmark) && <Button variant="ghost" size="sm" full onClick={() => go("build")}>Plan a trip around it <ArrowRight size={14} /></Button>}
                </div>
              </div>
            ) : (
              <div style={{ ...glass, borderRadius: 22, padding: "34px 24px", textAlign: "center" }}>
                <span style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.25)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Sparkles size={26} color={c.teal} /></span>
                <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 6px" }}>Explore the whole country</h3>
                <p style={{ color: c.stone, fontSize: 14, lineHeight: 1.5, margin: "0 0 16px" }}>Toggle layers, tap a pin. Parks, waterfalls, wildlife, airports and every experience — at its real location.</p>
                <Button variant="primary" onClick={() => go("build")}>Build my Costa Rica <ArrowRight size={15} /></Button>
              </div>
            )}
          </div>
        </div>
      </Section>

      <style>{`@media(min-width:900px){.map-grid{grid-template-columns:1.6fr 340px!important}}`}</style>
    </>
  );
}

const closeBtn = { position: "absolute", top: 10, right: 10, zIndex: 3, background: "rgba(5,15,31,.55)", backdropFilter: "blur(8px)", width: 32, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", border: "none" };

function LayerBtn({ l, on, onClick }) {
  const Icon = l.icon;
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 12.5, transition: "all .18s",
      background: on ? `${l.color}22` : "rgba(255,255,255,.04)",
      border: on ? `1.5px solid ${l.color}` : `1.5px solid ${c.line}`,
      color: on ? l.color : c.stone,
      boxShadow: on ? `0 0 14px -6px ${l.color}` : "none",
    }}><Icon size={14} />{l.label}</button>
  );
}
