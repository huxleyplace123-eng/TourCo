import React, { useState } from "react";
import { Compass, ChevronRight, Menu, X } from "lucide-react";
import { c } from "../theme.js";
import { Logo } from "./Logo.jsx";
import { Button } from "./ui.jsx";

const LINKS = [
  ["today", "Today"],
  ["activities", "Activities"],
  ["packages", "Packages"],
  ["john", "John Recommends"],
  ["guide", "Local's Guide"],
  ["why", "Why TicoWild"],
  ["portal", "My Trips"],
];

export function Nav({ page, go, tripCount, openTrip }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 60, background: "rgba(11,26,46,.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid ${c.line}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          <Logo fontSize={22} />
        </button>
        <div className="nav-links" style={{ display: "none", gap: 4, alignItems: "center" }}>
          {LINKS.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} style={{ background: page === id ? "rgba(47,107,235,.08)" : "none", border: "none", cursor: "pointer", padding: "8px 12px", borderRadius: 999, fontWeight: 700, fontSize: 14, color: page === id ? c.emerald : c.charcoal }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={openTrip} style={{ position: "relative", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, cursor: "pointer", width: 40, height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Compass size={18} color={c.emerald} />
            {tripCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, background: c.coral, color: c.charcoal, fontSize: 11, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                {tripCount}
              </span>
            )}
          </button>
          <div className="nav-cta" style={{ display: "none" }}>
            <Button variant="primary" size="sm" onClick={() => go("build")}>Plan my trip</Button>
          </div>
          <button className="nav-burger" onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            {open ? <X size={24} color={c.charcoal} /> : <Menu size={24} color={c.charcoal} />}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${c.line}`, padding: 12, display: "flex", flexDirection: "column", gap: 2, background: "rgba(11,26,46,.96)", backdropFilter: "blur(16px)" }}>
          {LINKS.map(([id, label]) => (
            <button key={id} onClick={() => { go(id); setOpen(false); }} style={{ background: page === id ? "rgba(47,107,235,.08)" : "none", border: "none", cursor: "pointer", padding: "12px 14px", borderRadius: 12, fontWeight: 700, fontSize: 15.5, color: page === id ? c.emerald : c.charcoal, textAlign: "left" }}>
              {label}
            </button>
          ))}
          <Button variant="primary" full style={{ marginTop: 8 }} onClick={() => { go("build"); setOpen(false); }}>Plan my trip</Button>
        </div>
      )}
    </div>
  );
}
