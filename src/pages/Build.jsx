import React, { useState } from "react";
import { Sparkles, Compass, Users, Calendar, Car, Mountain, Waves, RotateCcw, Plus, MessageCircle } from "lucide-react";
import { c, grad, glass, money } from "../theme.js";
import { Section, Button, Field, Select } from "../components/ui.jsx";
import { PageHero } from "../components/PageHero.jsx";
import { pageHero } from "../images.js";
import { SmartPlan } from "../components/SmartPlan.jsx";
import { buildMyCostaRica } from "../intelligence/index.js";
import { Reveal } from "../motion.jsx";

const REGIONS = ["Manuel Antonio", "Quepos", "Uvita", "Dominical", "Jacó", "Tamarindo", "Guanacaste", "Not sure yet"];

function ChipRow({ options, value, onToggle, single }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = single ? value === o.v : value.includes(o.v);
        return (
          <button key={o.v} onClick={() => onToggle(o.v)} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, cursor: "pointer",
            fontWeight: 700, fontSize: 13.5, transition: "all .15s",
            background: on ? "rgba(34,211,238,.14)" : "rgba(255,255,255,.05)",
            border: on ? `1.5px solid ${c.teal}` : `1.5px solid ${c.line}`,
            color: on ? c.teal : c.charcoal,
          }}>
            {o.icon && <o.icon size={14} />}{o.label}
          </button>
        );
      })}
    </div>
  );
}

function buildFlags(form) {
  const out = [...form.fears];
  if (form.avoidLongDrives) out.push("avoidLongDrives");
  if (form.youngKids) out.push("youngKids");
  return out;
}

function solIntro(form, result) {
  const bits = [];
  if (result.brief.inSeason.length) bits.push(`it's ${result.brief.inSeason[0].toLowerCase()} right now, so I built around it`);
  if (form.avoidLongDrives) bits.push("I kept the driving short and grouped each day by area");
  if (form.youngKids) bits.push("everything's paced and safe for the little ones");
  if (form.fears.length) bits.push(`and I steered clear of ${form.fears.join(" & ")}`);
  const tail = bits.length ? ` — ${bits.join(", ")}.` : ".";
  return `I sequenced each day around real drive times, tides, and the weather${tail} Add it to your trip and I'll reconfirm every operator before you go.`;
}

export function Build({ go, trip, addToTrip, removeFromTrip }) {
  const [form, setForm] = useState({
    region: "Manuel Antonio", days: "4", pax: "2", who: "couple", vibe: "nature",
    budget: "mid", avoidLongDrives: false, youngKids: false, fears: [],
  });
  const [result, setResult] = useState(null);
  const [building, setBuilding] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleFear = (v) => setForm((f) => ({ ...f, fears: f.fears.includes(v) ? f.fears.filter((x) => x !== v) : [...f.fears, v] }));

  const build = () => {
    setBuilding(true);
    setTimeout(() => {
      const res = buildMyCostaRica({
        who: form.who, vibe: form.vibe, budget: form.budget,
        region: form.region, days: parseInt(form.days, 10), pax: parseInt(form.pax, 10) || 2,
        avoidLongDrives: form.avoidLongDrives, youngKids: form.youngKids, fears: form.fears,
      });
      setResult(res);
      setBuilding(false);
    }, 900);
  };

  const addAll = () => {
    result?.plan.days.forEach((d) => d.activities.forEach((a) => addToTrip(a.id)));
    go("portal");
  };

  return (
    <>
      <PageHero image={pageHero("packages")} align="center" eyebrow="Build My Costa Rica" title="Your trip, planned around you" accentWord="you"
        sub="Tell Tico where you're staying and how you travel — get a personalized, day-by-day plan built from vetted local operators, real logistics, and live season intelligence." />

      <Section bg={c.sand}>
        {!result ? (
          <div style={{ maxWidth: 760, margin: "0 auto", ...glass, borderRadius: 24, padding: "clamp(22px,4vw,36px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22 }}>
              <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <Field label="Where are you staying?"><Select value={form.region} onChange={(v) => set("region", v)} icon={Compass} options={REGIONS} /></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="How many days?"><Select value={form.days} onChange={(v) => set("days", v)} icon={Calendar} options={["2", "3", "4", "5", "6", "7"]} /></Field>
                  <Field label="Group size"><Select value={form.pax} onChange={(v) => set("pax", v)} icon={Users} options={["1", "2", "3", "4", "5", "6", "8"]} /></Field>
                </div>
              </div>

              <Field label="Who's coming?">
                <ChipRow single value={form.who} onToggle={(v) => set("who", v)} options={[
                  { v: "couple", label: "Couple 💕" }, { v: "family", label: "Family 👨‍👩‍👧" },
                  { v: "group", label: "Group 🍻" }, { v: "solo", label: "Solo 🎒" },
                ]} />
              </Field>

              <Field label="What's your adventure style?">
                <ChipRow single value={form.vibe} onToggle={(v) => set("vibe", v)} options={[
                  { v: "thrill", label: "Adrenaline 🔥" }, { v: "chill", label: "Chill & scenic 🌅" },
                  { v: "nature", label: "Wildlife 🦥" }, { v: "water", label: "On the water 🌊" },
                ]} />
              </Field>

              <Field label="Budget per experience">
                <ChipRow single value={form.budget} onToggle={(v) => set("budget", v)} options={[
                  { v: "low", label: "Under $100" }, { v: "mid", label: "$100–200" }, { v: "high", label: "Treat us 💎" }, { v: "any", label: "No limit" },
                ]} />
              </Field>

              <Field label="Anything Tico should work around?">
                <ChipRow value={buildFlags(form)} onToggle={(v) => {
                  if (v === "avoidLongDrives") set("avoidLongDrives", !form.avoidLongDrives);
                  else if (v === "youngKids") set("youngKids", !form.youngKids);
                  else toggleFear(v);
                }} options={[
                  { v: "avoidLongDrives", label: "Hate long drives", icon: Car },
                  { v: "youngKids", label: "Young kids", icon: Users },
                  { v: "water", label: "Afraid of water", icon: Waves },
                  { v: "heights", label: "Afraid of heights", icon: Mountain },
                  { v: "boats", label: "Get seasick", icon: Waves },
                ]} />
              </Field>

              <Button variant="primary" size="lg" full onClick={build} disabled={building}>
                {building ? <>Tico is building your plan…</> : <><Sparkles size={18} />Build my Costa Rica</>}
              </Button>
              <p style={{ textAlign: "center", color: c.stone, fontSize: 12.5, margin: 0 }}>Free · no signup · powered by TicoWild's local trip brain</p>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <Reveal>
              <div style={{ ...glass, borderRadius: 22, padding: "22px 24px", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 999, background: grad.sunset, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19, color: c.ink }}>S</span>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>Here's your {result.plan.totals.days}-day plan 🌴</div>
                    <div style={{ color: c.stone, fontSize: 13 }}>Built around {form.region} · {form.pax} traveler{form.pax !== "1" ? "s" : ""} · {result.brief.month}</div>
                  </div>
                </div>
                <p style={{ color: "rgba(243,247,255,.85)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{solIntro(form, result)}</p>
              </div>
            </Reveal>

            <SmartPlan chosen={result.plan.days.flatMap((d) => d.activities)} pax={parseInt(form.pax, 10) || 2} />

            <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
              <Button variant="primary" onClick={addAll}><Plus size={16} />Add all to my trip</Button>
              <Button variant="ghost" onClick={() => setResult(null)}><RotateCcw size={15} />Start over</Button>
              <Button variant="ghost" onClick={() => window.alert("Opening WhatsApp concierge…")}><MessageCircle size={15} />Tweak with a local</Button>
            </div>
          </div>
        )}
      </Section>

      <style>{`@media(min-width:720px){.two-col{grid-template-columns:1.3fr 1fr!important}}`}</style>
    </>
  );
}
