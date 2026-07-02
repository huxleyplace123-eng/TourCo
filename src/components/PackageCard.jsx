import React from "react";
import { Check, ArrowRight, Clock, Users } from "lucide-react";
import { c, grad, money } from "../theme.js";
import { Button } from "./ui.jsx";
import { Lift } from "../motion.jsx";

// Package card — gradient header banner + inclusions list.
export function PackageCard({ p, onView }) {
  return (
    <Lift style={{ background: "#fff", overflow: "hidden", border: "1px solid rgba(0,0,0,.04)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: grad[p.gradKey] || grad.ocean, padding: "22px 20px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 15%, rgba(255,255,255,.25), transparent 45%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.2)", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
              <Clock size={12} />{p.length}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.2)", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
              <Users size={12} />{p.bestFor}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{p.title}</h3>
        </div>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
        <p style={{ color: c.stone, fontSize: 14.5, lineHeight: 1.55, margin: "0 0 14px" }}>{p.blurb}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {p.items.map((it) => (
            <div key={it} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: c.charcoal, fontWeight: 600 }}>
              <span style={{ width: 18, height: 18, borderRadius: 999, background: "rgba(47,107,235,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={11} color={c.emerald} />
              </span>
              {it}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: c.stone, fontWeight: 600 }}>from</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: c.charcoal }}>{money(p.price)}<span style={{ fontSize: 13, color: c.stone, fontWeight: 600 }}>/person</span></div>
          </div>
          <Button variant="dark" size="sm" onClick={() => onView(p)}>See plan <ArrowRight size={15} /></Button>
        </div>
      </div>
    </Lift>
  );
}
