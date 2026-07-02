import React from "react";
import { X } from "lucide-react";
import { c, glass } from "../theme.js";

// ── Legal content ── plain-English Terms & Privacy for a consumer travel-booking
// platform. Written to fit TicoWild's model (20% deposit, operators deliver the
// service, TicoWild is a booking/coordination platform, not the tour operator).
// Not legal advice — have counsel review before launch.

const UPDATED = "Last updated: July 2026";

const TERMS = [
  { h: "1. Who we are", p: "TicoWild is a travel discovery, booking and concierge platform that connects travelers with independent, vetted local tour operators, guides, drivers, restaurants and experience providers in Costa Rica. TicoWild coordinates and books experiences on your behalf — we are not the tour operator, guide, carrier or provider of the activities themselves." },
  { h: "2. Booking & payment", p: "To reserve an experience you pay a deposit of 20% of the listed price through TicoWild. The remaining 80% is paid directly to the operator at or before the time of service, unless a listing states otherwise. Prices are shown per person unless noted, and may change until a booking is confirmed. All amounts are in USD unless stated." },
  { h: "3. Cancellations & refunds", p: "Each experience carries the operator's cancellation policy, shown before you book. If a tour is cancelled for weather, unsafe conditions or other events outside anyone's control and your deposit isn't fully refunded, a portion may be retained per that policy. If an operator cancels or fails to deliver, you're entitled to a refund of amounts paid to TicoWild for that booking. Contact us and we'll help make it right." },
  { h: "4. Your responsibilities", p: "You agree to provide accurate booking details, arrive on time, follow each operator's safety rules and instructions, and disclose any health, age, weight or ability restrictions that affect participation. Many activities are physical or take place in nature; you take part at your own risk and may be asked to sign the operator's waiver." },
  { h: "5. The experiences", p: "Operators are independently owned and solely responsible for the safety, quality, staffing, equipment, licensing and delivery of their services. We vet our partners and remove those who don't meet our standards, but TicoWild does not control and is not liable for the operators' acts or omissions." },
  { h: "6. Limitation of liability", p: "To the fullest extent permitted by law, TicoWild is not liable for indirect or consequential damages, or for injury, loss or damage arising from the operator services themselves. Our total liability for any booking is limited to the fees we retained for that booking. Nothing here limits liability that cannot be limited by law." },
  { h: "7. Content & conduct", p: "Reviews, photos and content you submit may be displayed by TicoWild. Don't post anything false, unlawful, or that infringes others' rights. We may edit or remove content and suspend accounts that abuse the platform." },
  { h: "8. Changes & contact", p: "We may update these terms; material changes will be posted here with a new date. Questions? Reach us via the WhatsApp concierge or at hello@ticowild.com. These terms are governed by the laws of the applicable jurisdiction stated in your booking confirmation." },
];

const PRIVACY = [
  { h: "1. What we collect", p: "We collect the information you give us — name, email, phone/WhatsApp, trip dates, group size, preferences and booking details — plus basic technical data (device, browser, pages viewed) to run and improve the site. Your saved trip and any name you give Tico are stored on your own device (local storage), not on our servers." },
  { h: "2. How we use it", p: "We use your information to coordinate and confirm your bookings with operators, provide concierge support, personalize recommendations, send booking-related messages, prevent fraud, and improve TicoWild. We don't sell your personal information." },
  { h: "3. Sharing with operators", p: "To fulfill a confirmed booking we share only the details an operator needs (such as your name, party size, date and contact). Operators may use that information solely to deliver your experience — not for unrelated marketing — unless you separately agree." },
  { h: "4. Payment data", p: "Payments are handled by third-party payment processors. TicoWild does not store full card numbers. Those processors handle your payment details under their own security standards and privacy policies." },
  { h: "5. Cookies & analytics", p: "We use essential cookies to make the site work and limited analytics to understand what's useful. You can control cookies in your browser. Images on the site load from third-party image CDNs, which may log standard request data." },
  { h: "6. Your choices & rights", p: "You can request access to, correction of, or deletion of your personal information, and opt out of non-essential messages, by contacting us. Because your trip data lives in your browser, you can clear it anytime via your browser settings." },
  { h: "7. Data retention & security", p: "We keep personal information only as long as needed to provide our services and meet legal obligations, and we use reasonable safeguards to protect it. No method of transmission is 100% secure, but we work to keep your data safe." },
  { h: "8. Contact", p: "Questions about privacy? Contact us via the WhatsApp concierge or at privacy@ticowild.com. We'll post any material changes to this policy here with an updated date." },
];

export function LegalModal({ kind, onClose }) {
  const isTerms = kind === "terms";
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const sections = isTerms ? TERMS : PRIVACY;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(5,12,26,.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "24px 14px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...glass, background: "rgba(10,20,40,.97)", borderRadius: 22, width: "min(640px,100%)", boxShadow: "0 40px 100px -40px rgba(0,0,0,.95)", overflow: "hidden" }}>
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
            This summary is provided for transparency and is not legal advice. TicoWild's full, counsel-reviewed {title.toLowerCase()} governs.
          </p>
        </div>
      </div>
    </div>
  );
}
