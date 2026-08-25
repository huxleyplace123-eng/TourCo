import React from "react";
import { X } from "lucide-react";
import { c, glass } from "../theme.js";

// ── Legal content ── plain-English Terms & Privacy for a consumer travel-booking
// platform. Written to fit TicoWild's model (20% deposit, operators deliver the
// service, TicoWild is a booking/coordination platform, not the tour operator).
// Not legal advice — have counsel review before launch.

const UPDATED = "Last updated: August 2026";

const TERMS = [
  { h: "1. Who we are", p: "TicoWild is a Costa Rica travel discovery and planning service. We help travelers explore possible experiences and request current details from independent providers. TicoWild is not itself the tour operator, guide, carrier or activity provider." },
  { h: "2. Requests, prices & payment", p: "Adding an experience or submitting a planning request does not create a reservation and does not charge you. Website prices and deposit figures are planning estimates until TicoWild confirms availability, the operating provider, the final price and payment terms in writing. The public website currently does not collect card payments." },
  { h: "3. Cancellations & refunds", p: "The applicable cancellation, weather and refund terms will be provided with the confirmed offer before payment. Those terms may vary by provider and experience. Do not rely on a general website estimate as a confirmed cancellation policy." },
  { h: "4. Your responsibilities", p: "You agree to provide accurate booking details, arrive on time, follow each operator's safety rules and instructions, and disclose any health, age, weight or ability restrictions that affect participation. Many activities are physical or take place in nature; you take part at your own risk and may be asked to sign the operator's waiver." },
  { h: "5. The experiences", p: "Any confirmed provider is independently owned and responsible for the safety, quality, staffing, equipment, licensing and delivery of its services. Provider identity and the details TicoWild has checked are shared during confirmation." },
  { h: "6. Limitation of liability", p: "To the fullest extent permitted by law, TicoWild is not liable for indirect or consequential damages, or for injury, loss or damage arising from the operator services themselves. Our total liability for any booking is limited to the fees we retained for that booking. Nothing here limits liability that cannot be limited by law." },
  { h: "7. Content & conduct", p: "Reviews, photos and content you submit may be displayed by TicoWild. Don't post anything false, unlawful, or that infringes others' rights. We may edit or remove content and suspend accounts that abuse the platform." },
  { h: "8. Changes & contact", p: "We may update these terms; material changes will be posted here with a new date. Questions can be sent to hello@ticowild.com. Any additional governing terms will be stated in the written confirmation supplied before payment." },
];

const PRIVACY = [
  { h: "1. What we collect", p: "We collect the information you submit in an inquiry, including name, email, optional phone/WhatsApp, trip dates, group size and preferences. Saved-trip selections may also be stored in your browser. Standard hosting and image services may receive basic request data such as browser and IP information." },
  { h: "2. How we use it", p: "We use your information to coordinate and confirm your bookings with operators, provide concierge support, personalize recommendations, send booking-related messages, prevent fraud, and improve TicoWild. We don't sell your personal information." },
  { h: "3. Sharing with providers", p: "When needed to answer or fulfill your request, we may share the minimum relevant details with a potential or confirmed provider. We do not sell your personal information." },
  { h: "4. Payment data", p: "The public website currently does not collect card information. If online payment is introduced, the payment provider and its privacy and security terms will be disclosed before you enter payment information." },
  { h: "5. Cookies & analytics", p: "We use essential cookies to make the site work and limited analytics to understand what's useful. You can control cookies in your browser. Images on the site load from third-party image CDNs, which may log standard request data." },
  { h: "6. Your choices & rights", p: "You can request access to, correction of, or deletion of your personal information, and opt out of non-essential messages, by contacting us. Because your trip data lives in your browser, you can clear it anytime via your browser settings." },
  { h: "7. Data retention & security", p: "We keep personal information only as long as needed to provide our services and meet legal obligations, and we use reasonable safeguards to protect it. No method of transmission is 100% secure, but we work to keep your data safe." },
  { h: "8. Contact", p: "Questions about privacy can be sent to privacy@ticowild.com. We'll post material changes to this policy here with an updated date." },
];

export function LegalModal({ kind, onClose }) {
  const isTerms = kind === "terms";
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const sections = isTerms ? TERMS : PRIVACY;

  return (
    <div className="legal-modal-backdrop" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(5,12,26,.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "24px 14px" }}>
      <div className="legal-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ ...glass, background: "rgba(10,20,40,.97)", borderRadius: 22, width: "min(640px,100%)", boxShadow: "0 40px 100px -40px rgba(0,0,0,.95)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "18px 20px", borderBottom: `1px solid ${c.line}`, background: "linear-gradient(135deg, rgba(34,211,238,.1), transparent)" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{title}</div>
            <div style={{ color: c.stone, fontSize: 12, marginTop: 2 }}>{UPDATED}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: c.stone, cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", padding: "20px 22px" }}>
          {sections.map((s) => (
            <div key={s.h} style={{ marginBottom: 16 }}>
              <h4 style={{ color: c.teal, fontSize: 14.5, fontWeight: 800, margin: "0 0 5px" }}>{s.h}</h4>
              <p style={{ color: "rgba(243,247,255,.82)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{s.p}</p>
            </div>
          ))}
          <p style={{ color: c.stone, fontSize: 11.5, lineHeight: 1.5, marginTop: 20, paddingTop: 14, borderTop: `1px solid ${c.line}` }}>
            These are the terms currently provided for the public planning site. Provider-specific booking, cancellation and safety terms are supplied with any confirmed offer before payment.
          </p>
        </div>
      </div>
    </div>
  );
}
