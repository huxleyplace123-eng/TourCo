import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { c } from "../theme.js";
import { Logo } from "./Logo.jsx";
import { Button } from "./ui.jsx";
import { OperatorAgreement } from "./OperatorAgreement.jsx";
import { LegalModal } from "./LegalModal.jsx";
import { useConversion } from "./ConversionCenter.jsx";
import { pathFor } from "../routing.js";

function Col({ title, links, go }) {
  return (
    <div className="footer-col">
      <div style={{ fontWeight: 800, color: "#fff", marginBottom: 8, fontSize: 13 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {links.map(([id, label, action]) => (
          <a key={id} href={action ? "#" : pathFor(id)} onClick={(event) => { event.preventDefault(); action ? action() : go(id); }} style={{ color: "rgba(255,255,255,.72)", cursor: "pointer", textAlign: "left", fontSize: 12.5, lineHeight: 1.4, padding: 0, textDecoration: "none" }}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

export function Footer({ go }) {
  const { openConcierge } = useConversion();
  const [agreement, setAgreement] = useState(false);
  const [legal, setLegal] = useState(null); // "terms" | "privacy" | null
  return (
    <footer className="site-footer" style={{ background: c.canvas2, borderTop: `1px solid ${c.line}`, color: "rgba(243,247,255,.68)", padding: "34px 20px 20px" }}>
      {agreement && <OperatorAgreement onClose={() => setAgreement(false)} />}
      {legal && <LegalModal kind={legal} onClose={() => setLegal(null)} />}

      <div className="footer-grid" style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 22 }}>
        <div className="footer-brand">
          <div style={{ marginBottom: 8 }}><Logo fontSize={18} tagline /></div>
          <p style={{ fontSize: 12.5, lineHeight: 1.48, maxWidth: 220, margin: 0 }}>
            Curated Costa Rica experiences, route-aware planning and a clear human handoff.
          </p>
        </div>
        <Col title="Explore" links={[["tico", "Meet Rico"], ["activities", "Activities"], ["insider", "Insider Guide"], ["deals", "Deals"], ["packages", "Collections"]]} go={go} />
        <Col title="Company" links={[["why", "Why TicoWild"], ["partner", "Partner with us"], ["build", "Build My Trip"], ["portal", "My Trips"], ["operator-agreement", "Operator agreement", () => setAgreement(true)]]} go={go} />
        <div className="footer-support">
          <div style={{ fontWeight: 800, color: "#fff", marginBottom: 8, fontSize: 13 }}>Support</div>
          <Button variant="gold" size="sm" onClick={() => openConcierge({ intent: "support" })}>
            <MessageCircle size={15} />Ask Rico
          </Button>
          <p style={{ fontSize: 11.5, marginTop: 9 }}>Trip questions and current availability</p>
        </div>
      </div>

      <div className="footer-bottom" style={{ maxWidth: 1180, margin: "22px auto 0", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
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

const legalLink = { background: "none", border: "none", color: "rgba(243,247,255,.7)", cursor: "pointer", fontSize: 11, padding: 0, transition: "color .15s" };
