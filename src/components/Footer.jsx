import React from "react";
import { MessageCircle } from "lucide-react";
import { c } from "../theme.js";
import { Logo } from "./Logo.jsx";
import { Button } from "./ui.jsx";

function Col({ title, links, go }) {
  return (
    <div>
      <div style={{ fontWeight: 800, color: "#fff", marginBottom: 12 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map(([id, label]) => (
          <button key={id} onClick={() => go(id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.8)", cursor: "pointer", textAlign: "left", fontSize: 14, padding: 0 }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Footer({ go }) {
  return (
    <footer style={{ background: c.canvas2, borderTop: `1px solid ${c.line}`, color: "rgba(243,247,255,.7)", padding: "50px 20px 30px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 30 }}>
        <div>
          <div style={{ marginBottom: 12 }}><Logo dark fontSize={19} mark={32} /></div>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>
            Costa Rica adventures, planned by locals. Vetted tours, transparent pricing, human support.
          </p>
        </div>
        <Col title="Explore" links={[["activities", "Activities"], ["packages", "Packages"], ["build", "Build My Trip"], ["guide", "Local's Guide"]]} go={go} />
        <Col title="Company" links={[["why", "Why TripNest"], ["partner", "Partner with us"], ["portal", "My Trips"]]} go={go} />
        <div>
          <div style={{ fontWeight: 800, color: "#fff", marginBottom: 12 }}>Support</div>
          <Button variant="gold" size="sm" onClick={() => window.alert("Opening WhatsApp concierge…")}>
            <MessageCircle size={15} />WhatsApp concierge
          </Button>
          <p style={{ fontSize: 13, marginTop: 14 }}>Mon–Sun · 6am–10pm local</p>
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "30px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.12)", fontSize: 13, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span>© 2026 TripNest. A booking & coordination platform — not the tour operator.</span>
        <span>Pura vida 🌿</span>
      </div>
    </footer>
  );
}
