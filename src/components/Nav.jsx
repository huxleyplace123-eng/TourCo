import React, { useState } from "react";
import { Compass, Menu, Sparkles, X } from "lucide-react";
import { c } from "../theme.js";
import { Logo } from "./Logo.jsx";
import { pathFor } from "../routing.js";

const LINKS = [
  ["tico", "Meet Rico"],
  ["activities", "Activities"],
  ["insider", "Insider Guide"],
  ["map", "Explore Map"],
  ["deals", "Deals"],
];

export function Nav({ page, go, tripCount, openTrip }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-nav" style={{ position: "sticky", top: 0, zIndex: 60, background: "rgba(11,26,46,.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid ${c.line}` }}>
      <div className="site-nav-inner" style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <a href="/" onClick={(event) => { event.preventDefault(); go("home"); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Logo fontSize={22} />
        </a>
        <div className="nav-links" style={{ display: "none", gap: 4, alignItems: "center" }}>
          {LINKS.map(([id, label]) => (
            <a key={id} href={pathFor(id)} onClick={(event) => { event.preventDefault(); go(id); }} style={{ background: page === id ? "rgba(47,107,235,.08)" : "none", cursor: "pointer", padding: "8px 12px", borderRadius: 999, fontWeight: 700, fontSize: 14, color: page === id ? c.emerald : c.charcoal, textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="nav-trip-button"
            onClick={tripCount > 0 ? openTrip : () => go("build")}
            aria-label={tripCount > 0 ? `My trip, ${tripCount} saved experience${tripCount === 1 ? "" : "s"}` : "Plan my trip"}
            aria-current={tripCount > 0 && page === "portal" ? "page" : undefined}
            data-mode={tripCount > 0 ? "saved" : "plan"}
            style={{ background: tripCount > 0 ? (page === "portal" ? "rgba(34,211,238,.13)" : "rgba(255,255,255,.06)") : c.gold, border: `1px solid ${tripCount > 0 ? (page === "portal" ? "rgba(34,211,238,.46)" : c.line) : "rgba(255,208,0,.58)"}`, color: tripCount > 0 ? (page === "portal" ? c.teal : "#fff") : c.ink, cursor: "pointer", minHeight: 42, padding: "0 16px", borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontWeight: 850, fontSize: 13.5, whiteSpace: "nowrap", boxShadow: tripCount > 0 ? "none" : "0 10px 26px -12px rgba(255,208,0,.8)" }}
          >
            {tripCount > 0 ? <Compass size={17} color={page === "portal" ? c.teal : c.emerald} /> : <Sparkles size={16} />}
            <span>{tripCount > 0 ? "My trip" : "Plan my trip"}</span>
            {tripCount > 0 && (
              <span style={{ background: c.gold, color: c.ink, fontSize: 10.5, fontWeight: 900, minWidth: 19, height: 19, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {tripCount}
              </span>
            )}
          </button>
          <button className="nav-burger" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            {open ? <X size={24} color={c.charcoal} /> : <Menu size={24} color={c.charcoal} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav-menu" aria-label="Main navigation" style={{ borderTop: `1px solid ${c.line}`, padding: 12, display: "flex", flexDirection: "column", gap: 2, background: "rgba(11,26,46,.96)", backdropFilter: "blur(16px)" }}>
          {LINKS.map(([id, label]) => (
            <a key={id} href={pathFor(id)} onClick={(event) => { event.preventDefault(); go(id); setOpen(false); }} style={{ background: page === id ? "rgba(47,107,235,.08)" : "none", cursor: "pointer", padding: "12px 14px", borderRadius: 12, fontWeight: 700, fontSize: 15.5, color: page === id ? c.emerald : c.charcoal, textAlign: "left", textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </nav>
      )}
      <style>{`
        .nav-trip-button{transition:background .2s ease,border-color .2s ease,transform .2s ease}
        .nav-trip-button:hover{transform:translateY(-1px);filter:brightness(1.04)}
        .nav-trip-button[data-mode="saved"]:hover{background:rgba(34,211,238,.11)!important;border-color:rgba(34,211,238,.4)!important}
        .nav-trip-button:focus-visible{outline:3px solid rgba(34,211,238,.42);outline-offset:2px}
        @media(max-width:820px){.nav-trip-button{min-height:38px!important;padding:0 12px!important;font-size:12.5px!important;gap:5px!important}.nav-trip-button svg{width:14px;height:14px}}
        @media(max-width:380px){.nav-trip-button{padding:0 10px!important;font-size:12.5px!important;gap:5px!important}}
        @media(prefers-reduced-motion:reduce){.nav-trip-button{transition:none!important}}
      `}</style>
    </header>
  );
}
