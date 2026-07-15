import React, { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Compass,
  Fish,
  MapPin,
  Mountain,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import { c, gradText } from "../theme.js";
import { activities } from "../data.js";
import { Section, Eyebrow, Field, TextInput, Select, Button } from "../components/ui.jsx";
import { ActivityBrowseCard, ActivityBrowseCardStyles } from "../components/ActivityBrowseCard.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { activityImage, themedSlides } from "../images.js";
import { ticoActivityVerdict } from "../intelligence/tico.js";

const COLLECTIONS = [
  {
    id: "ocean-coast",
    number: "01",
    title: "Ocean & Coast",
    kicker: "Saltwater days",
    body: "Surf, sailing, snorkeling, and marine life—curated around the Pacific.",
    icon: Waves,
    accent: c.teal,
    heroId: "a4",
    activityIds: new Set(["a4", "a5", "a6", "a9"]),
  },
  {
    id: "jungle-thrills",
    number: "02",
    title: "Jungle, Wildlife & Thrills",
    kicker: "Costa Rica turned up",
    body: "Canopy, rapids, waterfalls, wildlife, and big-air adventures with approved guides.",
    icon: Mountain,
    accent: "#67E8A5",
    heroId: "a7",
    activityIds: new Set(["a3", "a7", "a8", "a10", "a11", "a12"]),
  },
  {
    id: "signature-days",
    number: "03",
    title: "Private Signature Days",
    kicker: "Made around your people",
    body: "Honeymoons, private yachts, and polished group days that feel entirely your own.",
    icon: Sparkles,
    accent: c.gold,
    heroId: "a16",
    activityIds: new Set(["a14", "a15", "a16"]),
  },
  {
    id: "fishing",
    number: "04",
    title: "Fishing",
    kicker: "Go where the bite is",
    body: "Offshore sportfishing and relaxed inshore trips with approved local captains.",
    icon: Fish,
    accent: c.blue,
    heroId: "a1",
    activityIds: new Set(["a1", "a2"]),
  },
];

const CATALOG_ACTIVITY_IDS = new Set(COLLECTIONS.flatMap((collection) => [...collection.activityIds]));
const CATALOG_ACTIVITIES = activities.filter((activity) => CATALOG_ACTIVITY_IDS.has(activity.id));
const ACTIVITY_BY_ID = new Map(CATALOG_ACTIVITIES.map((activity) => [activity.id, activity]));
const EXACT_CATEGORIES = ["All", ...Array.from(new Set(CATALOG_ACTIVITIES.map((activity) => activity.category)))];
const REGIONS = ["All", ...Array.from(new Set(CATALOG_ACTIVITIES.map((activity) => activity.region)))];

const MARQUEE = [
  [Fish, "Deep-sea fishing"],
  [Waves, "Sunset sailing"],
  [Waves, "Reef snorkeling"],
  [Waves, "Surf lessons"],
  [Fish, "Whale watching"],
  [Mountain, "Jungle ziplining"],
  [Mountain, "White-water rafting"],
  [Mountain, "Waterfall days"],
  [Sparkles, "Private yacht days"],
];

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function scrollToCollection(id) {
  const target = document.getElementById(id === "all" ? "activity-catalog" : `activities-${id}`);
  target?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

function sortActivities(items, sort) {
  const next = [...items];
  if (sort === "Price: low") return next.sort((a, b) => a.price - b.price);
  if (sort === "Price: high") return next.sort((a, b) => b.price - a.price);
  if (sort === "Top rated") return next.sort((a, b) => b.rating - a.rating);
  if (sort === "Rico's ranking") return next.sort((a, b) => ticoActivityVerdict(b).score - ticoActivityVerdict(a).score);
  return next;
}

function ActivityMarquee() {
  const row = [...MARQUEE, ...MARQUEE];
  return (
    <div className="activity-marquee-shell">
      <div className="activity-marquee-row">
        {row.map(([Icon, label], index) => (
          <span key={`${label}-${index}`} className="activity-marquee-pill">
            <Icon size={14} color={c.teal} />{label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Toggle({ on, set, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className="activity-toggle">
      <span>{label}</span>
      <span className="activity-toggle-track" data-on={on ? "true" : "false"} aria-hidden>
        <span className="activity-toggle-knob" />
      </span>
    </button>
  );
}

function CollectionMosaic({ onChoose }) {
  return (
    <Section bg={c.sand} pad={52}>
      <div className="activity-mosaic-heading">
        <Eyebrow><span style={{ color: c.teal }}>Four ways into Costa Rica</span></Eyebrow>
        <h2>Start with the feeling. <span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>We’ll find the day.</span></h2>
        <p>Every experience is offered by an approved partner. Choose a world below, then let Rico narrow it to the one worth your time.</p>
      </div>
      <div className="activity-worlds" aria-label="Activity collections">
        {COLLECTIONS.map((collection) => {
          const availableActivities = [...collection.activityIds]
            .map((id) => ACTIVITY_BY_ID.get(id))
            .filter(Boolean);
          const hero = ACTIVITY_BY_ID.get(collection.heroId) || availableActivities[0];
          const Icon = collection.icon;
          if (!hero) return null;
          return (
            <button
              key={collection.id}
              type="button"
              className="activity-world-card"
              onClick={() => onChoose(collection.id)}
              style={{ "--collection-accent": collection.accent }}
            >
              <img src={activityImage(hero, 1200)} alt="" aria-hidden />
              <span className="activity-world-wash" aria-hidden />
              <span className="activity-world-topline">
                <span className="activity-world-icon"><Icon size={19} /></span>
                <span className="activity-world-number">{collection.number}</span>
              </span>
              <span className="activity-world-copy">
                <span className="activity-world-kicker">{collection.kicker}</span>
                <strong>{collection.title}</strong>
                <span>{collection.body}</span>
                <span className="activity-world-cta">Explore {availableActivities.length} experience{availableActivities.length === 1 ? "" : "s"} <ArrowRight size={15} /></span>
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

export function Activities({ addToTrip, trip, viewActivity }) {
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState("all");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All");
  const [level, setLevel] = useState("All");
  const [familyOnly, setFamilyOnly] = useState(false);
  const [privateOnly, setPrivateOnly] = useState(false);
  const [sort, setSort] = useState("Featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const chooseCollection = (id) => {
    setCollection(id);
    window.setTimeout(() => scrollToCollection(id), 0);
  };

  const reset = () => {
    setQ("");
    setCollection("all");
    setCategory("All");
    setRegion("All");
    setLevel("All");
    setFamilyOnly(false);
    setPrivateOnly(false);
    setSort("Featured");
  };

  const filtered = sortActivities(
    CATALOG_ACTIVITIES.filter((activity) =>
      (q === "" || `${activity.title} ${activity.category} ${activity.region}`.toLowerCase().includes(q.toLowerCase())) &&
      (category === "All" || activity.category === category) &&
      (region === "All" || activity.region === region) &&
      (level === "All" || activity.level === level) &&
      (!familyOnly || activity.family) &&
      (!privateOnly || activity.private)
    ),
    sort,
  );

  const grouped = COLLECTIONS
    .map((item) => ({ ...item, items: filtered.filter((activity) => item.activityIds.has(activity.id)) }))
    .filter((item) => item.items.length > 0);
  const visibleCount = grouped.reduce((total, item) => total + item.items.length, 0);

  const activeFilterCount = [q !== "", category !== "All", region !== "All", level !== "All", familyOnly, privateOnly, sort !== "Featured"].filter(Boolean).length;

  return (
    <>
      <PageHero
        slides={themedSlides("activities")}
        height={380}
        eyebrow="Approved TicoWild experiences"
        title="Choose your kind of wild"
        sub="Four distinct ways to experience Costa Rica—organized by feeling, screened by our team, and ranked with Rico’s honest take."
      >
        <ActivityMarquee />
      </PageHero>

      <CollectionMosaic onChoose={chooseCollection} />

      <nav className="activity-discovery-bar" aria-label="Browse and filter activities">
        <div className="activity-discovery-inner">
          <div className="activity-collection-pills" aria-label="Activity collections">
            <button type="button" aria-pressed={collection === "all"} onClick={() => chooseCollection("all")}>All experiences</button>
            {COLLECTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" aria-pressed={collection === item.id} onClick={() => chooseCollection(item.id)}>
                  <Icon size={14} style={{ color: item.accent }} />{item.title}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="activity-filter-trigger"
            aria-expanded={filtersOpen}
            aria-controls="activity-filter-panel"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal size={16} />Filters{activeFilterCount ? ` · ${activeFilterCount}` : ""}
            <ChevronDown size={15} style={{ transform: filtersOpen ? "rotate(180deg)" : "none" }} />
          </button>
        </div>
        <div id="activity-filter-panel" className="activity-filter-panel" data-open={filtersOpen ? "true" : "false"}>
          <div className="activity-filter-fields">
            <Field label="Search" htmlFor="activity-search"><TextInput id="activity-search" value={q} onChange={setQ} placeholder="Fishing, surf, waterfalls…" icon={Search} /></Field>
            <Field label="Activity type" htmlFor="activity-type"><Select id="activity-type" value={category} onChange={setCategory} options={EXACT_CATEGORIES} icon={Compass} /></Field>
            <Field label="Region" htmlFor="activity-region"><Select id="activity-region" value={region} onChange={setRegion} options={REGIONS} icon={MapPin} /></Field>
            <Field label="Adventure level" htmlFor="activity-level"><Select id="activity-level" value={level} onChange={setLevel} options={["All", "Easy", "Moderate", "High"]} icon={Mountain} /></Field>
            <Field label="Sort by" htmlFor="activity-sort"><Select id="activity-sort" value={sort} onChange={setSort} options={["Featured", "Rico's ranking", "Price: low", "Price: high", "Top rated"]} icon={Star} /></Field>
          </div>
          <div className="activity-filter-options">
            <Toggle on={familyOnly} set={setFamilyOnly} label="Family-friendly" />
            <Toggle on={privateOnly} set={setPrivateOnly} label="Private available" />
            <button type="button" className="activity-reset" onClick={reset}>Reset everything</button>
          </div>
        </div>
      </nav>

      <main id="activity-catalog" className="activity-catalog">
        <ActivityBrowseCardStyles />
        <div className="activity-results-summary">
          <span><ShieldCheck size={15} color={c.teal} />{visibleCount} approved experience{visibleCount === 1 ? "" : "s"}</span>
          <span>{grouped.length} collection{grouped.length === 1 ? "" : "s"} in view</span>
        </div>

        {grouped.length === 0 ? (
          <div className="activity-empty">
            <Compass size={38} color={c.teal} />
            <h2>No experience fits those filters yet.</h2>
            <p>Open the search back up and Rico will put the strongest matches back in view.</p>
            <Button variant="primary" onClick={reset}>Show all experiences</Button>
          </div>
        ) : grouped.map((item) => {
          const Icon = item.icon;
          const ricoPick = [...item.items].sort((a, b) => ticoActivityVerdict(b).score - ticoActivityVerdict(a).score)[0];
          return (
            <section
              key={item.id}
              id={`activities-${item.id}`}
              className="activity-collection-section"
              style={{ "--collection-accent": item.accent }}
            >
              <div className="activity-collection-heading">
                <div className="activity-collection-mark"><Icon size={21} /><span>{item.number}</span></div>
                <div>
                  <div className="activity-collection-eyebrow">{item.kicker} · {item.items.length} match{item.items.length === 1 ? "" : "es"}</div>
                  <h2>{item.title}</h2>
                  <p>{item.body}</p>
                </div>
              </div>
              <div className="activity-card-grid">
                {item.items.map((activity) => (
                  <ActivityBrowseCard
                    key={activity.id}
                    a={activity}
                    ricoPick={activity.id === ricoPick.id}
                    collectionAccent={item.accent}
                    onAdd={addToTrip}
                    onView={viewActivity}
                    inTrip={trip.some((tripItem) => tripItem.id === activity.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <style>{`
        @keyframes activityMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .activity-marquee-shell{margin-top:18px;position:relative;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
        .activity-marquee-row{display:inline-flex;gap:9px;white-space:nowrap;animation:activityMarquee 34s linear infinite}
        .activity-marquee-pill{display:inline-flex;align-items:center;gap:7px;flex-shrink:0;background:rgba(11,26,46,.58);backdrop-filter:blur(9px);border:1px solid rgba(255,255,255,.13);color:#fff;font-weight:750;font-size:12.5px;padding:8px 13px;border-radius:999px}
        .activity-mosaic-heading{max-width:780px;margin-bottom:30px}
        .activity-mosaic-heading h2{color:#fff;font-size:clamp(30px,4.4vw,52px);line-height:1.04;letter-spacing:-1.5px;margin:8px 0 0;text-wrap:balance}
        .activity-mosaic-heading p{color:${c.stone};font-size:16px;line-height:1.65;margin:14px 0 0;max-width:680px}
        .activity-worlds{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:320px;gap:20px}
        .activity-world-card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.12);border-radius:26px;padding:0;cursor:pointer;text-align:left;background:${c.white};color:#fff;isolation:isolate;box-shadow:0 28px 70px -34px rgba(0,0,0,.85);transition:transform .3s cubic-bezier(.2,.75,.2,1),border-color .3s ease,box-shadow .3s ease}
        .activity-world-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.2,.75,.2,1)}
        .activity-world-wash{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,12,28,.12),rgba(5,15,33,.35) 38%,rgba(5,15,33,.96));z-index:1}
        .activity-world-card:after{content:"";position:absolute;inset:auto -12% -58% 25%;height:82%;background:radial-gradient(circle,var(--collection-accent),transparent 66%);opacity:.2;filter:blur(18px);z-index:1}
        .activity-world-topline{position:absolute;z-index:2;top:20px;left:20px;right:20px;display:flex;align-items:center;justify-content:space-between}
        .activity-world-icon{width:42px;height:42px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;color:var(--collection-accent);background:rgba(7,18,39,.7);border:1px solid color-mix(in srgb,var(--collection-accent) 45%,transparent);backdrop-filter:blur(12px)}
        .activity-world-number{font-size:11px;font-weight:900;letter-spacing:1.4px;color:rgba(255,255,255,.76)}
        .activity-world-copy{position:absolute;z-index:2;left:22px;right:22px;bottom:20px;display:flex;flex-direction:column;align-items:flex-start}
        .activity-world-kicker{color:var(--collection-accent);font-size:11.5px;font-weight:900;text-transform:uppercase;letter-spacing:1px}
        .activity-world-copy strong{font-size:clamp(23px,3vw,36px);letter-spacing:-1px;line-height:1.04;margin-top:5px;text-wrap:balance}
        .activity-world-copy>span:nth-of-type(2){color:rgba(243,247,255,.75);font-size:13.5px;line-height:1.48;max-width:540px;margin-top:8px}
        .activity-world-cta{display:inline-flex;align-items:center;gap:6px;color:#fff!important;font-weight:850!important;font-size:12.5px!important;margin-top:13px!important}
        .activity-world-card:hover{transform:translateY(-5px);border-color:color-mix(in srgb,var(--collection-accent) 56%,transparent);box-shadow:0 34px 90px -34px rgba(0,0,0,.95)}
        .activity-world-card:hover img{transform:scale(1.045)}
        .activity-world-card:focus-visible{outline:3px solid var(--collection-accent);outline-offset:3px}
        .activity-discovery-bar{position:sticky;top:64px;z-index:45;background:rgba(7,18,39,.94);border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.1);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
        .activity-discovery-inner{max-width:1240px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:12px}
        .activity-collection-pills{display:flex;align-items:center;gap:7px;overflow-x:auto;scrollbar-width:none;flex:1}.activity-collection-pills::-webkit-scrollbar{display:none}
        .activity-collection-pills button,.activity-filter-trigger{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto;border:1px solid ${c.line};border-radius:999px;background:rgba(255,255,255,.045);color:#fff;padding:8px 12px;font-size:12px;font-weight:800;cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease}
        .activity-collection-pills button[aria-pressed="true"]{background:rgba(34,211,238,.13);border-color:rgba(34,211,238,.48);color:${c.teal}}
        .activity-filter-trigger{display:inline-flex;border-color:rgba(255,208,0,.28);color:${c.gold}}
        .activity-filter-trigger svg{transition:transform .2s ease}
        .activity-filter-panel{max-width:1240px;margin:0 auto;padding:3px 20px 13px;display:none;gap:10px}
        .activity-filter-panel[data-open="true"]{display:grid}
        .activity-filter-fields{display:grid;grid-template-columns:minmax(220px,1.35fr) repeat(4,minmax(145px,1fr));gap:10px}.activity-filter-fields>div{margin-bottom:0!important}
        .activity-filter-options{display:flex;align-items:center;gap:18px;min-height:30px}
        .activity-toggle{display:inline-flex;align-items:center;gap:9px;background:none;border:0;color:#fff;font-weight:750;font-size:12.5px;padding:2px;cursor:pointer}
        .activity-toggle-track{width:38px;height:22px;border-radius:999px;background:rgba(255,255,255,.14);position:relative;transition:background .2s ease}.activity-toggle-track[data-on="true"]{background:${c.teal}}
        .activity-toggle-knob{position:absolute;width:16px;height:16px;left:3px;top:3px;border-radius:50%;background:#fff;transition:transform .2s ease}.activity-toggle-track[data-on="true"] .activity-toggle-knob{transform:translateX(16px)}
        .activity-reset{margin-left:auto;border:0;background:none;color:${c.stone};font-size:12px;font-weight:800;cursor:pointer;padding:7px}
        .activity-catalog{background:${c.sand};padding:20px 0 86px}
        .activity-results-summary{max-width:1180px;margin:0 auto;padding:11px 20px 4px;display:flex;justify-content:space-between;gap:16px;color:${c.stone};font-size:12.5px;font-weight:750}.activity-results-summary span{display:inline-flex;align-items:center;gap:7px}
        .activity-collection-section{max-width:1180px;margin:0 auto;padding:74px 20px 12px;scroll-margin-top:154px;content-visibility:auto;contain-intrinsic-size:0 780px}
        .activity-collection-section+.activity-collection-section{border-top:1px solid rgba(127,166,232,.11)}
        .activity-collection-heading{display:grid;grid-template-columns:66px minmax(0,1fr);gap:20px;align-items:start;max-width:820px;margin-bottom:27px}
        .activity-collection-mark{width:58px;height:58px;border-radius:19px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:var(--collection-accent);background:color-mix(in srgb,var(--collection-accent) 10%,rgba(19,41,74,.9));border:1px solid color-mix(in srgb,var(--collection-accent) 35%,transparent)}
        .activity-collection-mark span{font-size:9.5px;font-weight:900;letter-spacing:1px;color:${c.stone}}
        .activity-collection-eyebrow{color:var(--collection-accent);font-size:11.5px;text-transform:uppercase;letter-spacing:1.05px;font-weight:900}
        .activity-collection-heading h2{color:#fff;font-size:clamp(29px,4vw,46px);line-height:1.03;letter-spacing:-1.3px;margin:6px 0 0;text-wrap:balance}
        .activity-collection-heading p{color:${c.stone};font-size:15px;line-height:1.6;margin:9px 0 0;max-width:660px}
        .activity-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:stretch}
        .activity-empty{max-width:720px;margin:64px auto 10px;padding:62px 28px;text-align:center;border:1px solid ${c.line};border-radius:28px;background:rgba(255,255,255,.035)}
        .activity-empty h2{color:#fff;font-size:28px;margin:14px 0 0}.activity-empty p{color:${c.stone};line-height:1.6;margin:10px auto 22px;max-width:480px}
        @media(max-width:1100px){.activity-filter-fields{grid-template-columns:repeat(3,minmax(0,1fr))}.activity-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:900px){.activity-worlds{grid-auto-rows:300px}.activity-filter-fields{grid-template-columns:repeat(2,minmax(0,1fr))}.activity-filter-options{flex-wrap:wrap}.activity-reset{margin-left:0}}
        @media(max-width:620px){.activity-worlds{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -20px;padding:0 20px 8px;scrollbar-width:none}.activity-worlds::-webkit-scrollbar{display:none}.activity-world-card{flex:0 0 84vw;min-height:330px;scroll-snap-align:start}.activity-world-copy strong{font-size:28px}.activity-discovery-inner{padding-inline:14px}.activity-filter-panel{padding:4px 14px 14px}.activity-filter-fields{grid-template-columns:1fr}.activity-filter-options{align-items:flex-start;flex-direction:column;gap:10px}.activity-collection-section{padding:60px 20px 8px;scroll-margin-top:138px;contain-intrinsic-size:0 1100px}.activity-collection-heading{grid-template-columns:50px minmax(0,1fr);gap:14px}.activity-collection-mark{width:48px;height:48px;border-radius:15px}.activity-card-grid{grid-template-columns:1fr}.activity-results-summary{align-items:flex-start;flex-direction:column;gap:5px;padding-top:14px}.activity-mosaic-heading{margin-bottom:24px}}
        @media(prefers-reduced-motion:reduce){.activity-marquee-row{animation:none}.activity-world-card,.activity-world-card img{transition:none!important}}
      `}</style>
    </>
  );
}
