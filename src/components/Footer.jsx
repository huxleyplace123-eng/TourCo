import React, { useState } from "react";
import { MessageCircle, FileSignature, ShieldCheck, Wallet, Zap, ArrowRight } from "lucide-react";
import { c, grad } from "../theme.js";
import { Logo } from "./Logo.jsx";
import { Button } from "./ui.jsx";
import { OperatorAgreement } from "./OperatorAgreement.jsx";

// ── Operator invite ── a premier full-width band (not a cramped footer column).
function OperatorBand({ onSign }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 26, border: "1px solid rgba(34,211,238,.28)", background: "linear-gradient(115deg, rgba(34,211,238,.12) 0%, rgba(15,36,64,.6) 45%, rgba(11,26,46,.7) 100%)", boxShadow: "0 30px 80px -50px rgba(34,211,238,.6)" }}>
      {/* soft glows */}
      <div aria-hidden style={{ position: "absolute", top: -60, left: -30, width: 260, height: 260, borderRadius: 999, background: "radial-gradient(circle, rgba(34,211,238,.22), transparent 70%)", filter: "blur(10px)" }} />
      <div aria-hidden style={{ position: "absolute", bottom: -70, right: 40, width: 240, height: 240, borderRadius: 999, background: "radial-gradient(circle, rgba(255,208,0,.14), transparent 70%)", filter: "blur(12px)" }} />

      <div className="op-band" style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr", gap: 26, alignItems: "center", padding: "clamp(26px,4vw,40px)" }}>
        {/* left: pitch */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,208,0,.14)", border: "1px solid rgba(255,208,0,.34)", color: c.gold, fontWeight: 800, fontSize: 11.5, letterSpacing: 0.6, textTransform: "uppercase", padding: "6px 12px", borderRadius: 999, marginBottom: 14 }}>
            <Zap size={13} /> For operators
          </div>
          <h3 style={{ color: "#fff", fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.08, margin: 0 }}>
            Run tours, fishing, ATV or a restaurant?<br /><span style={{ color: c.teal }}>List with TicoWild.</span>
          </h3>
          <p style={{ color: "rgba(243,247,255,.8)", fontSize: 15, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 520 }}>
            Reach travelers actively planning their trip, keep 80% collected directly from your guests, and sign the partner agreement online in minutes — review, e-sign, done.
          </p>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 18 }}>
            {[[ShieldCheck, "Vetted-operator badge"], [Wallet, "You keep 80%, paid direct"], [FileSignature, "Sign online, no paperwork"]].map(([Icon, t]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "rgba(243,247,255,.85)", fontSize: 13, fontWeight: 600 }}>
                <Icon size={15} color={c.teal} />{t}
              </span>
            ))}
          </div>
        </div>
        {/* right: CTA */}
        <div className="op-cta" style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <button onClick={onSign} style={{ display: "inline-flex", alignItems: "center", gap: 9, background: grad.gold, color: c.ink, border: "none", borderRadius: 14, padding: "15px 24px", fontWeight: 800, fontSize: 15.5, cursor: "pointer", boxShadow: "0 16px 40px -14px rgba(255,208,0,.7)", whiteSpace: "nowrap" }}>
            <FileSignature size={18} /> Sign the operator agreement <ArrowRight size={17} />
          </button>
          <span style={{ color: c.stone, fontSize: 12.5, paddingLeft: 4 }}>Free to list · ~3 minutes · reviewed by our team</span>
        </div>
      </div>
    </div>
  );
}

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

      {/* premier operator invite band */}
      <div style={{ maxWidth: 1180, margin: "0 auto 44px" }}>
        <OperatorBand onSign={() => setAgreement(true)} />
      </div>

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
      <style>{`@media(min-width:820px){ .op-band{ grid-template-columns: 1.5fr auto!important } .op-cta{ align-items: flex-end!important } }`}</style>
    </footer>
  );
}
