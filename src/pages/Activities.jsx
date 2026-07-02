import React, { useState } from "react";
import { Compass, MapPin, Mountain, Star } from "lucide-react";
import { c, grad } from "../theme.js";
import { activities } from "../data.js";
import { Section, Eyebrow, Field, TextInput, Select, Button } from "../components/ui.jsx";
import { ActivityCard } from "../components/ActivityCard.jsx";
import { Reveal } from "../motion.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { pageHero } from "../images.js";

const CATEGORIES = ["All", ...Array.from(new Set(activities.map((a) => a.category)))];
const REGIONS = ["All", ...Array.from(new Set(activities.map((a) => a.region)))];

function Toggle({ on, set, label }) {
  return (
    <button onClick={() => set(!on)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: c.charcoal }}>{label}</span>
      <span style={{ width: 42, height: 24, borderRadius: 999, background: on ? c.emerald : "rgba(0,0,0,.18)", position: "relative", transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: 999, background: c.white, transition: "left .2s" }} />
      </span>
    </button>
  );
}

export function Activities({ go, addToTrip, trip, viewActivity }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [region, setRegion] = useState("All");
  const [level, setLevel] = useState("All");
  const [familyOnly, setFamilyOnly] = useState(false);
  const [privateOnly, setPrivateOnly] = useState(false);
  const [sort, setSort] = useState("Featured");

  let list = activities.filter(
    (a) =>
      (q === "" || a.title.toLowerCase().includes(q.toLowerCase())) &&
      (cat === "All" || a.category === cat) &&
      (region === "All" || a.region === region) &&
      (level === "All" || a.level === level) &&
      (!familyOnly || a.family) &&
      (!privateOnly || a.private)
  );
  if (sort === "Price: low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "Price: high") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "Top rated") list = [...list].sort((a, b) => b.rating - a.rating);

  const reset = () => { setQ(""); setCat("All"); setRegion("All"); setLevel("All"); setFamilyOnly(false); setPrivateOnly(false); };

  return (
    <>
      <PageHero image={pageHero("activities")} eyebrow="Browse activities" title="Every adventure, vetted"
        sub="Add what you love to your trip. We'll handle the coordination and the deposit math." />

      <Section bg={c.sand} pad={36}>
        <div className="filters-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <div style={{ background: c.white, borderRadius: 20, padding: 20, border: "1px solid rgba(255,255,255,.08)", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontWeight: 800, color: c.charcoal, fontSize: 16 }}>Filters</span>
              <button onClick={reset} style={{ background: "none", border: "none", color: c.stone, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Reset</button>
            </div>
            <Field label="Search"><TextInput value={q} onChange={setQ} placeholder="Fishing, surf, catamaran…" icon={Compass} /></Field>
            <Field label="Category"><Select value={cat} onChange={setCat} options={CATEGORIES} icon={Compass} /></Field>
            <Field label="Region"><Select value={region} onChange={setRegion} options={REGIONS} icon={MapPin} /></Field>
            <Field label="Adventure level"><Select value={level} onChange={setLevel} options={["All", "Easy", "Moderate", "High"]} icon={Mountain} /></Field>
            <Field label="Sort by"><Select value={sort} onChange={setSort} options={["Featured", "Price: low", "Price: high", "Top rated"]} icon={Star} /></Field>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              <Toggle on={familyOnly} set={setFamilyOnly} label="Family-friendly" />
              <Toggle on={privateOnly} set={setPrivateOnly} label="Private available" />
            </div>
          </div>

          <div>
            <div style={{ color: c.stone, fontWeight: 600, marginBottom: 14, fontSize: 14 }}>
              {list.length} experience{list.length !== 1 ? "s" : ""}
            </div>
            {list.length === 0 ? (
              <div style={{ background: c.white, borderRadius: 20, padding: 50, textAlign: "center", color: c.stone }}>
                <Compass size={42} color={c.teal} style={{ opacity: .5 }} />
                <p style={{ fontWeight: 700, color: c.charcoal, marginTop: 12 }}>No matches — let's widen the search</p>
                <Button variant="ghost" onClick={reset} style={{ marginTop: 8 }}>Clear filters</Button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
                {list.map((a, i) => (
                  <Reveal key={a.id} delay={(i % 3) * 70}>
                    <ActivityCard a={a} onAdd={addToTrip} onView={viewActivity} inTrip={trip.some((t) => t.id === a.id)} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      <style>{`@media(min-width:980px){.filters-grid{grid-template-columns:280px 1fr!important}}`}</style>
    </>
  );
}
