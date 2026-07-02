import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { c } from "../theme.js";
import { Logo } from "./Logo.jsx";
import { Button } from "./ui.jsx";
import { OperatorAgreement } from "./OperatorAgreement.jsx";
import { LegalModal } from "./LegalModal.jsx";

function Col({ title, links, go }) {
  return (
    <div>
      <div style={{ fontWeight: 800, color: "#fff", marginBottom: 12 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map(([id, label, action]) => (
          <button key={id} onClick={() => (action ? action() : go(id))} style={{ background: "none", border: "none", color: "rgba(255,255,255,.8)", cursor: "pointer", textAlign: "left", fontSize: 14, padding: 0 }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Footer({ go }) {
  const [agreement, setAgreement] = useState(false);
  const [legal, setLegal] = useState(null); // "terms" | "privacy" | null
  return (
    <footer style={{ background: c.canvas2, borderTop: `1px solid ${c.line}`, color: "rgba(243,247,255,.7)", padding: "50px 20px 30px" }}>
      {agreement && <OperatorAgreement onClose={() => setAgreement(false)} />}
      {legal && <LegalModal kind={legal} onClose={() => setLegal(null)} />}

      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 30 }}>
        <div>
          <div style={{ marginBottom: 12 }}><Logo fontSize={22} tagline /></div>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>
            Costa Rica adventures, planned by locals. Vetted tours, transparent pricing, human support.
          </p>
        </div>
        <Col title="Explore" links={[["tico", "Meet Tico"], ["activities", "Activities"], ["eat", "Eat & Drink"], ["deals", "Deals"], ["packages", "Packages"], ["john", "John Recommends"], ["guide", "Local's Guide & Beaches"]]} go={go} />
        <Col title="Company" links={[["why", "Why TicoWild"], ["partner", "Partner with us"], ["build", "Build My Trip"], ["portal", "My Trips"], ["operator-agreement", "Operator agreement", () => setAgreement(true)]]} go={go} />
        <div>
          <div style={{ fontWeight: 800, color: "#fff", marginBottom: 12 }}>Support</div>
          <Button variant="gold" size="sm" onClick={() => window.alert("Opening WhatsApp concierge…")}>
            <MessageCircle size={15} />WhatsApp concierge
          </Button>
          <p style={{ fontSize: 13, marginTop: 14 }}>Mon–Sun · 6am–10pm local</p>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "30px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.12)", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <span>© 2026 TicoWild</span>
          <button onClick={() => setLegal("terms")} style={legalLink}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.teal)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(243,247,255,.7)")}>Terms</button>
          <button onClick={() => setLegal("privacy")} style={legalLink}
            onMouseEnter={(e) => (e.currentTarget.style.color = c.teal)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(243,247,255,.7)")}>Privacy Policy</button>
        </div>
        <span>Pura vida 🌿</span>
      </div>
    </footer>
  );
}

const legalLink = { background: "none", border: "none", color: "rgba(243,247,255,.7)", cursor: "pointer", fontSize: 13, padding: 0, transition: "color .15s" };
