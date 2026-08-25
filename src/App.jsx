import React, { useEffect, useState, useLayoutEffect } from "react";
import { ChevronRight } from "lucide-react";
import { c, FONT, grad } from "./theme.js";
import { activities } from "./data.js";
import { Nav } from "./components/Nav.jsx";
import { Footer } from "./components/Footer.jsx";
import { Button } from "./components/ui.jsx";
import { Home } from "./pages/Home.jsx";
import { Activities } from "./pages/Activities.jsx";
import { Detail } from "./pages/Detail.jsx";
import { Packages } from "./pages/Packages.jsx";
import { Build } from "./pages/Build.jsx";
import { Why } from "./pages/Why.jsx";
import { Partner } from "./pages/Partner.jsx";
import { MyTrips } from "./pages/MyTrips.jsx";
import { AskJohn } from "./pages/AskJohn.jsx";
import { Deals } from "./pages/Deals.jsx";
import { ExploreMap } from "./pages/ExploreMap.jsx";
import { MeetTicoPage } from "./pages/MeetTicoPage.jsx";
import { TicoDock } from "./components/TicoDock.jsx";
import { InsiderGuide } from "./pages/InsiderGuide.jsx";
import { SoundscapeControl } from "./components/SoundscapeControl.jsx";
import { ConversionCenter } from "./components/ConversionCenter.jsx";
import { metadataFor, pathFor, routeFromPath } from "./routing.js";

function usePastOpening(page) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => {
      const firstSection = document.querySelector("main")?.firstElementChild;
      const threshold = Math.min(560, Math.max(260, firstSection?.getBoundingClientRect().height * .62 || 360));
      setVisible(window.scrollY > threshold);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [page]);
  return visible;
}

function StickyDeposit({ count, onView, page }) {
  const visible = usePastOpening(page);
  return (
    <div className="mobile-trip-bar" data-visible={visible ? "true" : "false"} style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 55, background: c.emerald, borderRadius: 18, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 16px 40px -14px rgba(47,107,235,.7)" }}>
      <div style={{ color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: .82 }}>{count} saved experience{count === 1 ? "" : "s"}</div>
        <div style={{ fontWeight: 800, fontSize: 14 }}>Review your trip</div>
      </div>
      <Button variant="gold" size="sm" onClick={onView}>View trip <ChevronRight size={15} /></Button>
    </div>
  );
}

function MobilePlanBar({ onStart, page }) {
  const visible = usePastOpening(page);
  return (
    <div className="mobile-plan-bar" data-visible={visible ? "true" : "false"} role="region" aria-label="Start planning">
      <div><strong>Ready to picture your trip?</strong><span>Start with the feeling, not a form.</span></div>
      <Button variant="gold" size="sm" onClick={onStart}>Find my fit <ChevronRight size={15} /></Button>
    </div>
  );
}

function readSavedTrip() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("ticowild.trip.v1") || "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((item) => item && activities.some((activity) => activity.id === item.id))
      .map((item) => ({ id: item.id, pax: Math.max(1, Number(item.pax) || 2) }));
  } catch {
    return [];
  }
}

export default function App() {
  const initialRoute = routeFromPath(window.location.pathname);
  const [page, setPage] = useState(initialRoute.page);
  const [activeId, setActiveId] = useState(initialRoute.activeId);
  const [trip, setTrip] = useState(readSavedTrip); // [{id, pax}]
  const [cartOpen, setCartOpen] = useState(false);
  const [plannerDraft, setPlannerDraft] = useState(null);

  const navigate = (nextPage, nextActiveId = null, { replace = false } = {}) => {
    const resolvedActiveId = nextPage === "detail" ? (nextActiveId || activeId) : null;
    setPage(nextPage);
    setActiveId(resolvedActiveId);
    setCartOpen(false);
    const nextPath = pathFor(nextPage, resolvedActiveId);
    if (window.location.pathname !== nextPath) window.history[replace ? "replaceState" : "pushState"]({}, "", nextPath);
  };
  const go = (p) => navigate(p);

  useEffect(() => {
    const onPopState = () => {
      const route = routeFromPath(window.location.pathname);
      setPage(route.page);
      setActiveId(route.activeId);
      setCartOpen(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const [title, description] = metadataFor(page, activeId);
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${pathFor(page, activeId)}`;
  }, [page, activeId]);

  useEffect(() => {
    window.localStorage.setItem("ticowild.trip.v1", JSON.stringify(trip));
  }, [trip]);
  // Always land at the top of a newly-opened page. Runs AFTER the new page
  // renders (useLayoutEffect + instant scroll), so it isn't undone by the
  // page-enter animation or content reflow — a smooth scroll during a full
  // page swap was leaving visitors mid/bottom of the page.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  }, [page, activeId]);
  const viewActivity = (id) => navigate("detail", id);
  const startPlan = (draft = null) => { setPlannerDraft(draft); go("build"); };
  const consumePlannerDraft = () => setPlannerDraft(null);
  const addToTrip = (id) => { setTrip((t) => (t.some((x) => x.id === id) ? t : [...t, { id, pax: 2 }])); setCartOpen(true); };
  const removeFromTrip = (id) => setTrip((t) => t.filter((x) => x.id !== id));
  const showMobilePlanBar = trip.length === 0 && !["build", "builder", "portal", "partner"].includes(page);

  const shared = { go, addToTrip, trip, viewActivity, removeFromTrip, startPlan, consumePlannerDraft };

  return (
    <ConversionCenter>
    <div className="public-site" style={{ fontFamily: FONT, background: c.sand, color: c.charcoal, minHeight: "100vh", position: "relative" }}>
      {/* app-wide aurora wash + drifting glow */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, background: grad.aurora, pointerEvents: "none", animation: "tnAurora 24s ease-in-out infinite alternate" }} />
      <style>{`@keyframes tnAurora{0%{opacity:.75;transform:translateY(0)}100%{opacity:1;transform:translateY(-14px)}}`}</style>
      <div style={{ position: "relative", zIndex: 1 }}>
      <Nav page={page} go={go} tripCount={trip.length} openTrip={() => (trip.length ? go("portal") : setCartOpen(true))} />

      {/* keyed wrapper → every page fade-rises in on navigation */}
      <main className={`public-page public-page-${page}`} key={page + (page === "detail" ? activeId : "")} style={{ animation: "tnPageIn .45s cubic-bezier(.2,.7,.2,1) both" }}>
        {(page === "home" || page === "today") && <Home {...shared} />}
        {(page === "eat" || page === "guide" || page === "insider") && <InsiderGuide {...shared} />}
        {page === "deals" && <Deals {...shared} />}
        {page === "map" && <ExploreMap {...shared} />}
        {page === "tico" && <MeetTicoPage {...shared} />}
        {page === "activities" && <Activities {...shared} />}
        {page === "detail" && <Detail activeId={activeId} {...shared} />}
        {page === "packages" && <Packages {...shared} />}
        {page === "build" && <Build {...shared} initialPlan={plannerDraft} />}
        {page === "ask" && <AskJohn {...shared} />}
        {page === "builder" && <Build {...shared} initialPlan={plannerDraft} />}
        {page === "why" && <Why {...shared} />}
        {page === "partner" && <Partner {...shared} />}
        {page === "portal" && <MyTrips {...shared} />}
        {page === "john" && <MeetTicoPage {...shared} />}
      </main>
      <style>{`@keyframes tnPageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){[style*="tnPageIn"]{animation:none!important}}`}</style>

      <Footer go={go} />

      {/* Tico — the living macaw companion, present on every page */}
      <TicoDock page={page} go={go} trip={trip} lift={(trip.length > 0 && !["portal", "build", "builder"].includes(page)) || showMobilePlanBar} />
      {(page === "home" || page === "today") && <SoundscapeControl lift={trip.length > 0} />}

      {/* Sticky trip bar */}
      {trip.length > 0 && !["portal", "build", "builder"].includes(page) && <StickyDeposit page={page} count={trip.length} onView={() => go("portal")} />}
      {showMobilePlanBar && <MobilePlanBar page={page} onStart={() => go("build")} />}

      {/* Quick "added to trip" toast/modal */}
      {cartOpen && (
        <div className="trip-added-backdrop" onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,26,46,.5)", zIndex: 70, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 20 }}>
          <div className="trip-added-sheet" onClick={(e) => e.stopPropagation()} style={{ background: c.white, border: `1px solid ${c.line}`, borderRadius: 22, padding: 24, maxWidth: 420, width: "100%", marginBottom: 20, boxShadow: "0 40px 90px -30px rgba(0,0,0,.9)" }}>
            <h3 style={{ margin: "0 0 4px", color: c.charcoal, fontSize: 20, fontWeight: 800 }}>Added to your trip 🎉</h3>
            <p style={{ color: c.stone, fontSize: 14.5, margin: "0 0 16px" }}>
              You have <b style={{ color: c.charcoal }}>{trip.length}</b> saved experience{trip.length !== 1 ? "s" : ""}. Nothing is reserved or charged yet.
            </p>
            <div className="trip-added-actions" style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" full onClick={() => go("portal")}>View my trip <ChevronRight size={16} /></Button>
              <Button variant="ghost" onClick={() => setCartOpen(false)}>Keep browsing</Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </ConversionCenter>
  );
}
