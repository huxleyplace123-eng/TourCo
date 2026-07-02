import React, { useState } from "react";
import { MessageCircle, FileSignature } from "lucide-react";
import { c } from "../theme.js";
import { Logo } from "./Logo.jsx";
import { Button } from "./ui.jsx";
import { OperatorAgreement } from "./OperatorAgreement.jsx";

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
  const [agreement, setAgreement] = useState(false);
  return (
    <footer style={{ background: c.canvas2, borderTop: `1px solid ${c.line}`, color: "rgba(243,247,255,.7)", padding: "50px 20px 30px" }}>
      {agreement && <OperatorAgreement onClose={() => setAgreement(false)} />}
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 30 }}>
        <div>
          <div style={{ marginBottom: 12 }}><Logo fontSize={22} tagline /></div>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>
            Costa Rica adventures, planned by locals. Vetted tours, transparent pricing, human support.
          </p>
        </div>
        <Col title="Explore" links={[["tico", "Meet Tico"], ["activities", "Activities"], ["eat", "Eat & Drink"], ["deals", "Deals"], ["packages", "Packages"], ["john", "John Recommends"], ["guide", "Local's Guide & Beaches"]]} go={go} />
        <Col title="Company" links={[["why", "Why TicoWild"], ["partner", "Partner with us"], ["build", "Build My Trip"], ["portal", "My Trips"]]} go={go} />
        <div>
          <div style={{ fontWeight: 800, color: "#fff", marginBottom: 12 }}>Operators</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: "0 0 12px" }}>Run tours, fishing, ATV, a restaurant? List with TicoWild — sign the partner agreement online in minutes.</p>
          <button onClick={() => setAgreement(true)} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.35)", color: c.teal, borderRadius: 999, padding: "9px 15px", fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}>
            <FileSignature size={15} />Sign the operator agreement
          </button>
        </div>
        <div>
          <div style={{ fontWeight: 800, color: "#fff", marginBottom: 12 }}>Support</div>
          <Button variant="gold" size="sm" onClick={() => window.alert("Opening WhatsApp concierge…")}>
            <MessageCircle size={15} />WhatsApp concierge
          </Button>
          <p style={{ fontSize: 13, marginTop: 14 }}>Mon–Sun · 6am–10pm local</p>
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "30px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.12)", fontSize: 13, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span>© 2026 TicoWild. A booking & coordination platform — not the tour operator.</span>
        <span>Pura vida 🌿</span>
      </div>
    </footer>
  );
}
