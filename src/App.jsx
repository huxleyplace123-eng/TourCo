import React, { useState } from "react";
import { MessageCircle, ChevronRight } from "lucide-react";
import { c, FONT, money } from "./theme.js";
import { activities } from "./data.js";
import { Nav } from "./components/Nav.jsx";
import { Footer } from "./components/Footer.jsx";
import { Button } from "./components/ui.jsx";
import { Home } from "./pages/Home.jsx";

// Pages not yet rebuilt render a friendly placeholder so the nav always works.
function Placeholder({ title, go }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: c.charcoal }}>{title}</h1>
      <p style={{ color: c.stone, fontSize: 17, lineHeight: 1.6 }}>
        This page is being rebuilt into the new editable project. The Home page is live —
        the rest are coming next.
      </p>
      <Button variant="dark" onClick={() => go("home")}>Back to home</Button>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [trip, setTrip] = useState([]); // [{id, pax}]
  const [cartOpen, setCartOpen] = useState(false);

  const go = (p) => { setPage(p); setCartOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const viewActivity = (id) => { setActiveId(id); go("detail"); };
  const addToTrip = (id) => { setTrip((t) => (t.some((x) => x.id === id) ? t : [...t, { id, pax: 2 }])); setCartOpen(true); };
  const total = trip.reduce((s, g) => s + (activities.find((a) => a.id === g.id)?.price || 0) * g.pax, 0);

  const shared = { go, addToTrip, trip, viewActivity };

  return (
    <div style={{ fontFamily: FONT, background: c.white, color: c.charcoal, minHeight: "100vh" }}>
      <Nav page={page} go={go} tripCount={trip.length} openTrip={() => setCartOpen(true)} />

      {page === "home" && <Home {...shared} />}
      {page !== "home" && page !== "detail" && (
        <Placeholder title={titleFor(page)} go={go} />
      )}
      {page === "detail" && <Placeholder title="Activity detail" go={go} />}

      <Footer go={go} />

      {/* Floating WhatsApp button */}
      <button onClick={() => window.alert("Opening WhatsApp concierge…")} style={{ position: "fixed", right: 18, bottom: trip.length ? 86 : 18, zIndex: 50, width: 56, height: 56, borderRadius: 999, background: "#25D366", border: "none", cursor: "pointer", boxShadow: "0 12px 30px -8px rgba(37,211,102,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MessageCircle size={26} color="#fff" />
      </button>

      {/* Sticky trip bar */}
      {trip.length > 0 && (
        <div style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 55, background: c.emerald, borderRadius: 18, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 16px 40px -14px rgba(47,107,235,.7)" }}>
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 12, opacity: .85 }}>{trip.length} activit{trip.length === 1 ? "y" : "ies"} · 20% deposit</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{money(total * 0.2)} <span style={{ fontSize: 12, opacity: .8, fontWeight: 600 }}>today</span></div>
          </div>
          <Button variant="gold" size="sm" onClick={() => setCartOpen(true)}>View trip <ChevronRight size={15} /></Button>
        </div>
      )}

      {cartOpen && (
        <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,46,143,.5)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 380, width: "100%" }}>
            <h3 style={{ margin: 0, color: c.charcoal }}>Your trip ({trip.length})</h3>
            <p style={{ color: c.stone, fontSize: 14 }}>Full cart is being rebuilt next. Deposit today: <b style={{ color: c.emerald }}>{money(total * 0.2)}</b></p>
            <Button variant="ghost" full onClick={() => setCartOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function titleFor(p) {
  return {
    activities: "Activities", packages: "Packages", john: "John Recommends",
    guide: "Local's Guide", why: "Why TripNest", portal: "My Trips",
    build: "Build my trip", partner: "Partner with us",
  }[p] || "TripNest";
}
