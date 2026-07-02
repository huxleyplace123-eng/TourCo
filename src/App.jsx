import React, { useState, useLayoutEffect } from "react";
import { ChevronRight } from "lucide-react";
import { c, FONT, money, grad } from "./theme.js";
import { activities } from "./data.js";
import { Nav } from "./components/Nav.jsx";
import { Footer } from "./components/Footer.jsx";
import { Button } from "./components/ui.jsx";
import { useCountUp } from "./motion.jsx";
import { Home } from "./pages/Home.jsx";
import { Activities } from "./pages/Activities.jsx";
import { Detail } from "./pages/Detail.jsx";
import { Packages } from "./pages/Packages.jsx";
import { Build } from "./pages/Build.jsx";
import { Guide } from "./pages/Guide.jsx";
import { Why } from "./pages/Why.jsx";
import { Partner } from "./pages/Partner.jsx";
import { MyTrips } from "./pages/MyTrips.jsx";
import { John } from "./pages/John.jsx";
import { AskJohn } from "./pages/AskJohn.jsx";
import { Restaurants } from "./pages/Restaurants.jsx";
import { Deals } from "./pages/Deals.jsx";
import { ExploreMap } from "./pages/ExploreMap.jsx";
import { MeetTicoPage } from "./pages/MeetTicoPage.jsx";
import { TicoDock } from "./components/TicoDock.jsx";

function StickyDeposit({ total, count, onView }) {
  const shown = useCountUp(Math.round(total * 0.2));
  return (
    <div style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 55, background: c.emerald, borderRadius: 18, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 16px 40px -14px rgba(47,107,235,.7)" }}>
      <div style={{ color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: .85 }}>{count} activit{count === 1 ? "y" : "ies"} · 20% deposit</div>
        <div style={{ fontWeight: 800, fontSize: 17 }}>{money(shown)} <span style={{ fontSize: 12, opacity: .8, fontWeight: 600 }}>today</span></div>
      </div>
      <Button variant="gold" size="sm" onClick={onView}>View trip <ChevronRight size={15} /></Button>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [trip, setTrip] = useState([]); // [{id, pax}]
  const [cartOpen, setCartOpen] = useState(false);

  const go = (p) => { setPage(p); setCartOpen(false); };
  // Always land at the top of a newly-opened page. Runs AFTER the new page
  // renders (useLayoutEffect + instant scroll), so it isn't undone by the
  // page-enter animation or content reflow — a smooth scroll during a full
  // page swap was leaving visitors mid/bottom of the page.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  }, [page, activeId]);
  const viewActivity = (id) => { setActiveId(id); go("detail"); };
  const addToTrip = (id) => { setTrip((t) => (t.some((x) => x.id === id) ? t : [...t, { id, pax: 2 }])); setCartOpen(true); };
  const removeFromTrip = (id) => setTrip((t) => t.filter((x) => x.id !== id));
  const total = trip.reduce((s, g) => s + (activities.find((a) => a.id === g.id)?.price || 0) * g.pax, 0);

  const shared = { go, addToTrip, trip, viewActivity, removeFromTrip };

  return (
    <div style={{ fontFamily: FONT, background: c.sand, color: c.charcoal, minHeight: "100vh", position: "relative" }}>
      {/* app-wide aurora wash + drifting glow */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, background: grad.aurora, pointerEvents: "none", animation: "tnAurora 24s ease-in-out infinite alternate" }} />
      <style>{`@keyframes tnAurora{0%{opacity:.75;transform:translateY(0)}100%{opacity:1;transform:translateY(-14px)}}`}</style>
      <div style={{ position: "relative", zIndex: 1 }}>
      <Nav page={page} go={go} tripCount={trip.length} openTrip={() => (trip.length ? go("portal") : setCartOpen(true))} />

      {/* keyed wrapper → every page fade-rises in on navigation */}
      <div key={page + (page === "detail" ? activeId : "")} style={{ animation: "tnPageIn .45s cubic-bezier(.2,.7,.2,1) both" }}>
        {(page === "home" || page === "today") && <Home {...shared} />}
        {page === "eat" && <Restaurants {...shared} />}
        {page === "deals" && <Deals {...shared} />}
        {page === "map" && <ExploreMap {...shared} />}
        {page === "tico" && <MeetTicoPage {...shared} />}
        {page === "activities" && <Activities {...shared} />}
        {page === "detail" && <Detail activeId={activeId} {...shared} />}
        {page === "packages" && <Packages {...shared} />}
        {page === "build" && <Build {...shared} />}
        {page === "ask" && <AskJohn {...shared} />}
        {page === "builder" && <Build {...shared} />}
        {page === "guide" && <Guide {...shared} />}
        {page === "why" && <Why {...shared} />}
        {page === "partner" && <Partner {...shared} />}
        {page === "portal" && <MyTrips {...shared} />}
        {page === "john" && <John {...shared} />}
      </div>
      <style>{`@keyframes tnPageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){[style*="tnPageIn"]{animation:none!important}}`}</style>

      <Footer go={go} />

      {/* Tico — the living macaw companion, present on every page */}
      <TicoDock page={page} go={go} trip={trip} lift={trip.length > 0 && !["portal", "build", "builder"].includes(page)} />

      {/* Sticky trip bar */}
      {trip.length > 0 && !["portal", "build", "builder"].includes(page) && <StickyDeposit total={total} count={trip.length} onView={() => go("portal")} />}

      {/* Quick "added to trip" toast/modal */}
      {cartOpen && (
        <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,26,46,.5)", zIndex: 70, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: c.white, border: `1px solid ${c.line}`, borderRadius: 22, padding: 24, maxWidth: 420, width: "100%", marginBottom: 20, boxShadow: "0 40px 90px -30px rgba(0,0,0,.9)" }}>
            <h3 style={{ margin: "0 0 4px", color: c.charcoal, fontSize: 20, fontWeight: 800 }}>Added to your trip 🎉</h3>
            <p style={{ color: c.stone, fontSize: 14.5, margin: "0 0 16px" }}>
              You have <b style={{ color: c.charcoal }}>{trip.length}</b> experience{trip.length !== 1 ? "s" : ""}. Deposit today: <b style={{ color: c.emerald }}>{money(total * 0.2)}</b>
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" full onClick={() => go("portal")}>View my trip <ChevronRight size={16} /></Button>
              <Button variant="ghost" onClick={() => setCartOpen(false)}>Keep browsing</Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
