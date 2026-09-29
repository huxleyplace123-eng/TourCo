import React, { useState } from "react";
import { Compass, ChevronRight, Menu, X } from "lucide-react";
import { c } from "../theme.js";
import { Logo } from "./Logo.jsx";
import { Button } from "./ui.jsx";
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
            onClick={openTrip}
            aria-label={`My trip${tripCount > 0 ? `, ${tripCount} saved experience${tripCount === 1 ? "" : "s"}` : ""}`}
            aria-current={page === "portal" ? "page" : undefined}
            style={{ background: page === "portal" ? "rgba(34,211,238,.13)" : "rgba(255,255,255,.06)", border: `1px solid ${page === "portal" ? "rgba(34,211,238,.46)" : c.line}`, color: page === "portal" ? c.teal : "#fff", cursor: "pointer", minHeight: 40, padding: "0 13px", borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap" }}
          >
            <Compass size={17} color={page === "portal" ? c.teal : c.emerald} />
            <span>My Trip</span>
            {tripCount > 0 && (
              <span style={{ background: c.gold, color: c.ink, fontSize: 10.5, fontWeight: 900, minWidth: 19, height: 19, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {tripCount}
              </span>
            )}
          </button>
          <div className="nav-cta" style={{ display: "none" }}>
            <Button variant="primary" size="sm" onClick={() => go("build")}>Plan my trip</Button>
          </div>
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
          <Button variant="primary" full style={{ marginTop: 8 }} onClick={() => { go("build"); setOpen(false); }}>Plan my trip</Button>
        </nav>
      )}
      <style>{`
        .nav-trip-button{transition:background .2s ease,border-color .2s ease,transform .2s ease}
        .nav-trip-button:hover{background:rgba(34,211,238,.11)!important;border-color:rgba(34,211,238,.4)!important;transform:translateY(-1px)}
        .nav-trip-button:focus-visible{outline:3px solid rgba(34,211,238,.42);outline-offset:2px}
        @media(max-width:380px){.nav-trip-button{padding:0 10px!important;font-size:12.5px!important;gap:5px!important}}
        @media(prefers-reduced-motion:reduce){.nav-trip-button{transition:none!important}}
      `}</style>
    </header>
  );
}
