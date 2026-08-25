import React, { useEffect, useState } from "react";
import { Sparkles, Heart, Users, Calendar, Car, Mountain, Waves, RotateCcw, Plus, MessageCircle, ArrowDown, ArrowUp, ArrowRight, ChevronLeft, MapPinned, Trash2 } from "lucide-react";
import { c, grad, glass } from "../theme.js";
import { Section, Button, Field, Select } from "../components/ui.jsx";
import { BuildHero } from "../components/BuildHero.jsx";
import { SmartPlan } from "../components/SmartPlan.jsx";
import { buildMyCostaRica } from "../intelligence/index.js";
import { Reveal } from "../motion.jsx";
import { useConversion } from "../components/ConversionCenter.jsx";

const REGIONS = ["San José", "La Fortuna", "Manuel Antonio", "Quepos", "Uvita", "Dominical", "Jacó", "Tamarindo", "Guanacaste", "Not sure yet"];
const DAY_MS = 86_400_000;
const dateInputStyle = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,.055)", border: `1.5px solid ${c.line}`, borderRadius: 12, color: c.charcoal, padding: "12px 13px", fontSize: 14, outline: "none", colorScheme: "dark" };

function nightsBetween(arrival, departure) {
  if (!arrival || !departure) return 0;
  const start = Date.parse(`${arrival}T00:00:00Z`), end = Date.parse(`${departure}T00:00:00Z`);
  return Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, Math.round((end - start) / DAY_MS)) : 0;
}

function initialForm(initialPlan) {
  const multi = initialPlan?.dest === "Multiple stops";
  const destination = !initialPlan?.dest || initialPlan.dest === "Not sure yet" || multi ? "Manuel Antonio" : initialPlan.dest;
  const group = Math.max(1, parseInt(initialPlan?.group, 10) || 2);
  const type = String(initialPlan?.type || "").toLowerCase();
  return {
    arrival: initialPlan?.arrival || "",
    departure: initialPlan?.departure || "",
    stops: multi
      ? [{ region: "Manuel Antonio", nights: 3 }, { region: "Uvita", nights: 2 }]
      : [{ region: destination, nights: 4 }],
    pax: String(group), who: type.includes("family") ? "family" : type.includes("group") ? "group" : "couple",
    vibe: type.includes("fishing") ? "water" : type.includes("adventure") ? "thrill" : "nature",
    budget: type.includes("luxury") ? "high" : "mid", avoidLongDrives: false, youngKids: false, fears: [],
  };
}

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
  if (form.stops.length > 1) bits.push(`I kept your stops in the order you chose: ${form.stops.map((stop) => stop.region).join(" → ")}`);
  if (result.brief.inSeason.length) bits.push(`the seasonal pattern favors ${result.brief.inSeason[0].toLowerCase()}, so I built around it`);
  if (form.avoidLongDrives) bits.push("I kept the driving short and grouped each day by area");
  if (form.youngKids) bits.push("everything's paced and safe for the little ones");
  if (form.fears.length) bits.push(`and I steered clear of ${form.fears.join(" & ")}`);
  const tail = bits.length ? ` — ${bits.join(", ")}.` : ".";
  return `I sequenced each day using TicoWild's typical drive-time and seasonal planning model${tail} Add it to your trip and TicoWild will confirm the current timing, conditions, operator and availability.`;
}

export function Build({ go, trip, addToTrip, removeFromTrip, initialPlan, consumePlannerDraft }) {
  const { openConcierge } = useConversion();
  const [form, setForm] = useState(() => initialForm(initialPlan));
  const [stage, setStage] = useState(initialPlan ? 1 : 0);
  const [result, setResult] = useState(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialPlan) consumePlannerDraft?.();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleFear = (v) => setForm((f) => ({ ...f, fears: f.fears.includes(v) ? f.fears.filter((x) => x !== v) : [...f.fears, v] }));

  const updateStop = (index, patch) => setForm((current) => ({ ...current, stops: current.stops.map((stop, i) => i === index ? { ...stop, ...patch } : stop) }));
  const addStop = () => setForm((current) => {
    if (current.stops.length >= 5) return current;
    const unused = REGIONS.find((region) => region !== "Not sure yet" && !current.stops.some((stop) => stop.region === region)) || "Not sure yet";
    return { ...current, stops: [...current.stops, { region: unused, nights: 2 }] };
  });
  const removeStop = (index) => setForm((current) => current.stops.length === 1 ? current : ({ ...current, stops: current.stops.filter((_, i) => i !== index) }));
  const moveStop = (index, direction) => setForm((current) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= current.stops.length) return current;
    const stops = [...current.stops];
    [stops[index], stops[nextIndex]] = [stops[nextIndex], stops[index]];
    return { ...current, stops };
  });

  const build = () => {
    const dateNights = nightsBetween(form.arrival, form.departure);
    if ((form.arrival && !form.departure) || (!form.arrival && form.departure)) {
      setError("Choose both arrival and departure dates so Rico can pace the trip correctly.");
      return;
    }
    if (form.arrival && dateNights < 1) {
      setError("Departure must be after arrival.");
      return;
    }
    setError("");
    setBuilding(true);
    setTimeout(() => {
      const routeNights = form.stops.reduce((sum, stop) => sum + Number(stop.nights || 0), 0);
      const days = Math.max(1, Math.min(14, dateNights || routeNights || 4));
      const res = buildMyCostaRica({
        who: form.who, vibe: form.vibe, budget: form.budget,
        region: form.stops[0]?.region, regions: form.stops.map((stop) => stop.region), stops: form.stops,
        days, pax: parseInt(form.pax, 10) || 2,
        monthIdx: form.arrival ? new Date(`${form.arrival}T12:00:00`).getMonth() : undefined,
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
      <BuildHero />

      <Section bg={c.sand}>
        {!result ? (
          <div className="trip-builder-form" style={{ maxWidth: 760, margin: "0 auto", ...glass, borderRadius: 24, padding: "clamp(22px,4vw,36px)" }}>
            <div className="planner-progress" aria-label={`Planning step ${stage + 1} of 3`}>
              {["The feeling", "The shape", "Final touches"].map((label, index) => (
                <div key={label} className={index <= stage ? "is-active" : ""}><span>{index + 1}</span><strong>{label}</strong></div>
              ))}
            </div>

            {stage === 0 && (
              <div className="planner-stage">
                <div className="planner-stage-heading">
                  <span><Heart size={15} />No logistics yet</span>
                  <h2>What should this trip feel like?</h2>
                  <p>Start with the people and the energy. We’ll ask where you’re going after the trip has a direction.</p>
                </div>
                <Field label="Who are you sharing it with?">
                  <ChipRow single value={form.who} onToggle={(v) => set("who", v)} options={[
                    { v: "couple", label: "Couple 💕" }, { v: "family", label: "Family 👨‍👩‍👧" },
                    { v: "group", label: "Friends 🍻" }, { v: "solo", label: "Solo 🎒" },
                  ]} />
                </Field>
                <Field label="Which feeling sounds most like your Costa Rica?">
                  <ChipRow single value={form.vibe} onToggle={(v) => set("vibe", v)} options={[
                    { v: "thrill", label: "Big adventure 🔥" }, { v: "chill", label: "Slow and scenic 🌅" },
                    { v: "nature", label: "Wildlife and rainforest 🦥" }, { v: "water", label: "Ocean and rivers 🌊" },
                  ]} />
                </Field>
                <Button variant="primary" size="lg" full onClick={() => setStage(1)}>Shape this trip <ArrowRight size={18} /></Button>
                <p className="planner-reassurance">No city, dates or signup needed yet</p>
              </div>
            )}

            {stage === 1 && (
              <div className="planner-stage">
                <div className="planner-stage-heading">
                  <span><MapPinned size={15} />Now make it practical</span>
                  <h2>Where does this trip take shape?</h2>
                  <p>Use what you know. “Not sure yet” works too, and dates can stay blank while you explore.</p>
                </div>
                <Field label="Your route or home base">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {form.stops.map((stop, index) => (
                      <div key={`${index}-${stop.region}`} className="route-stop-grid" style={{ display: "grid", gridTemplateColumns: "38px minmax(0,1fr) 112px auto", gap: 10, alignItems: "center", background: "rgba(255,255,255,.045)", border: `1px solid ${c.line}`, borderRadius: 16, padding: 11 }}>
                        <span style={{ width: 36, height: 36, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: index === 0 ? grad.sunset : "rgba(34,211,238,.12)", color: index === 0 ? c.ink : c.teal, fontWeight: 900, fontSize: 12 }}>{String(index + 1).padStart(2, "0")}</span>
                        <Select value={stop.region} onChange={(value) => updateStop(index, { region: value })} icon={MapPinned} options={REGIONS} />
                        <Select value={String(stop.nights)} onChange={(value) => updateStop(index, { nights: Number(value) })} icon={Calendar} options={["1", "2", "3", "4", "5", "6", "7"]} />
                        <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                          <button type="button" aria-label={`Move ${stop.region} earlier`} onClick={() => moveStop(index, -1)} disabled={index === 0} style={routeIconButton}><ArrowUp size={14} /></button>
                          <button type="button" aria-label={`Move ${stop.region} later`} onClick={() => moveStop(index, 1)} disabled={index === form.stops.length - 1} style={routeIconButton}><ArrowDown size={14} /></button>
                          <button type="button" aria-label={`Remove ${stop.region}`} onClick={() => removeStop(index)} disabled={form.stops.length === 1} style={{ ...routeIconButton, color: c.orchid }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    <div className="route-summary" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <button type="button" onClick={addStop} disabled={form.stops.length >= 5} style={{ background: "none", border: "none", color: c.teal, fontWeight: 800, cursor: form.stops.length >= 5 ? "not-allowed" : "pointer", opacity: form.stops.length >= 5 ? .45 : 1, padding: "5px 0", display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={15} />Add another stop</button>
                      <span style={{ color: c.stone, fontSize: 12.5 }}>{form.stops.map((stop) => stop.region).join(" → ")} · {nightsBetween(form.arrival, form.departure) || form.stops.reduce((sum, stop) => sum + Number(stop.nights), 0)} nights</span>
                    </div>
                  </div>
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }} className="trip-date-grid">
                  <Field label="Arrival date (optional)"><input type="date" aria-label="Arrival date" value={form.arrival} onChange={(e) => set("arrival", e.target.value)} style={dateInputStyle} /></Field>
                  <Field label="Departure date (optional)"><input type="date" aria-label="Departure date" min={form.arrival || undefined} value={form.departure} onChange={(e) => set("departure", e.target.value)} style={dateInputStyle} /></Field>
                </div>
                <Field label="How many travelers?"><Select value={form.pax} onChange={(v) => set("pax", v)} icon={Users} options={["1", "2", "3", "4", "5", "6", "8", "10"]} /></Field>
                <div className="planner-stage-actions"><Button variant="ghost" onClick={() => setStage(0)}><ChevronLeft size={16} />Back</Button><Button variant="primary" onClick={() => setStage(2)}>Final touches <ArrowRight size={17} /></Button></div>
              </div>
            )}

            {stage === 2 && (
              <div className="planner-stage">
                <div className="planner-stage-heading">
                  <span><Sparkles size={15} />Make it yours</span>
                  <h2>Anything that changes the right answer?</h2>
                  <p>These details help Rico avoid generic recommendations and build days that fit the people actually going.</p>
                </div>
                <Field label="Comfortable budget per experience">
                  <ChipRow single value={form.budget} onToggle={(v) => set("budget", v)} options={[
                    { v: "low", label: "Under $100" }, { v: "mid", label: "$100–200" }, { v: "high", label: "Treat us 💎" }, { v: "any", label: "Keep it open" },
                  ]} />
                </Field>
                <Field label="Anything Rico should work around?">
                  <ChipRow value={buildFlags(form)} onToggle={(v) => {
                    if (v === "avoidLongDrives") set("avoidLongDrives", !form.avoidLongDrives);
                    else if (v === "youngKids") set("youngKids", !form.youngKids);
                    else toggleFear(v);
                  }} options={[
                    { v: "avoidLongDrives", label: "Hate long drives", icon: Car },
                    { v: "youngKids", label: "Young kids", icon: Users },
                    { v: "water", label: "Avoid deep water", icon: Waves },
                    { v: "heights", label: "Avoid heights", icon: Mountain },
                    { v: "boats", label: "Get seasick", icon: Waves },
                  ]} />
                </Field>
                <div className="planner-summary"><strong>{form.who === "group" ? "Friends" : form.who} · {form.vibe}</strong><span>{form.stops.map((stop) => stop.region).join(" → ")} · {form.pax} traveler{form.pax === "1" ? "" : "s"}</span></div>
                <div className="planner-stage-actions"><Button variant="ghost" onClick={() => setStage(1)}><ChevronLeft size={16} />Back</Button><Button variant="primary" size="lg" onClick={build} disabled={building}>{building ? <>Rico is building your plan…</> : <><Sparkles size={18} />Build my Costa Rica</>}</Button></div>
                {error && <p role="alert" style={{ color: c.orchid, background: "rgba(255,90,77,.08)", border: "1px solid rgba(255,90,77,.24)", borderRadius: 12, padding: "10px 12px", fontSize: 13.5, margin: 0 }}>{error}</p>}
                <p className="planner-reassurance">Free · no signup · no payment</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <Reveal>
              <div style={{ ...glass, borderRadius: 22, padding: "22px 24px", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 999, background: grad.sunset, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 19, color: c.ink }}>S</span>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>Here's your {result.plan.totals.days}-day plan 🌴</div>
                    <div style={{ color: c.stone, fontSize: 13 }}>Built through {form.stops.map((stop) => stop.region).join(" → ")} · {form.pax} traveler{form.pax !== "1" ? "s" : ""} · {result.brief.month}</div>
                  </div>
                </div>
                <p style={{ color: "rgba(243,247,255,.85)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{solIntro(form, result)}</p>
              </div>
            </Reveal>

            <SmartPlan chosen={result.plan.days.flatMap((d) => d.activities)} pax={parseInt(form.pax, 10) || 2} planOverride={result.plan} />

            <div className="mobile-cta-row" style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
              <Button variant="primary" onClick={addAll}><Plus size={16} />Add all to my trip</Button>
              <Button variant="ghost" onClick={() => setResult(null)}><RotateCcw size={15} />Start over</Button>
              <Button variant="ghost" onClick={() => openConcierge({ intent: "planning", destination: form.stops.map((stop) => stop.region).join(", "), arrival: form.arrival, departure: form.departure, travelers: form.pax })}><MessageCircle size={15} />Tweak with TicoWild</Button>
            </div>
          </div>
        )}
      </Section>

      <style>{`
        .planner-progress{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:32px}.planner-progress>div{position:relative;display:flex;align-items:center;gap:8px;color:${c.stone};font-size:11px}.planner-progress>div:after{content:"";position:absolute;left:0;right:0;bottom:-10px;height:2px;border-radius:99px;background:${c.line}}.planner-progress>div.is-active{color:#fff}.planner-progress>div.is-active:after{background:linear-gradient(90deg,${c.teal},${c.gold})}.planner-progress span{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:rgba(127,166,232,.12);font-weight:900}.planner-progress .is-active span{background:${c.teal};color:${c.ink}}
        .planner-stage{display:grid;gap:22px}.planner-stage-heading{max-width:630px}.planner-stage-heading>span{display:inline-flex;align-items:center;gap:6px;color:${c.teal};font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.planner-stage-heading h2{color:#fff;font-size:clamp(27px,4vw,38px);line-height:1.05;letter-spacing:-1px;margin:10px 0}.planner-stage-heading p{color:${c.stone};font-size:15px;line-height:1.6;margin:0;max-width:590px}.planner-stage-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:4px}.planner-reassurance{text-align:center;color:${c.stone};font-size:12.5px;margin:0}.planner-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 16px;border-radius:14px;background:rgba(34,211,238,.07);border:1px solid rgba(34,211,238,.2)}.planner-summary strong{color:#fff;text-transform:capitalize}.planner-summary span{color:${c.stone};font-size:12.5px}
        @media(max-width:680px){.planner-progress strong{font-size:10px}.planner-progress>div{gap:5px}.planner-stage-actions{display:grid;grid-template-columns:auto minmax(0,1fr)}.planner-stage-actions .tico-button:last-child{width:100%}.trip-date-grid{grid-template-columns:1fr!important}.route-stop-grid{grid-template-columns:36px minmax(0,1fr)!important}.route-stop-grid>div:last-child{grid-column:2}.route-stop-grid>div:nth-child(3){grid-column:2}}
        @media(max-width:380px){.planner-progress strong{display:none}.planner-progress>div{justify-content:center}.planner-stage-actions{grid-template-columns:1fr}.planner-stage-actions .tico-button{width:100%}}
      `}</style>
    </>
  );
}

const routeIconButton = { width: 30, height: 30, borderRadius: 9, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)", color: c.stone, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0 };
