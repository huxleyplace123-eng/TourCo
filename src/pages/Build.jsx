import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Compass, Users, Heart, Calendar, MapPin, Plus, ShieldCheck, MessageCircle, Sparkles } from "lucide-react";
import { c, grad, money } from "../theme.js";
import { activities } from "../data.js";
import { activityImage } from "../images.js";
import { Section, Button, Field, Select, TextInput } from "../components/ui.jsx";
import { Photo, useCountUp } from "../motion.jsx";

const STEPS = ["Trip basics", "Pick activities", "Review & reserve"];

function Stepper({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 30 }}>
      {STEPS.map((label, i) => {
        const done = i < step, active = i === step;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, background: done ? c.emerald : active ? c.charcoal : "rgba(0,0,0,.1)", color: done || active ? "#fff" : c.stone }}>
                {done ? <Check size={15} /> : i + 1}
              </span>
              <span style={{ fontWeight: 700, fontSize: 14, color: active || done ? c.charcoal : c.stone }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ width: 26, height: 2, background: "rgba(0,0,0,.12)" }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Build({ go, trip, addToTrip, viewActivity }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState({ dest: "Manuel Antonio", dates: "", group: "2", type: "Couple / Honeymoon" });

  const chosen = trip.map((t) => activities.find((a) => a.id === t.id)).filter(Boolean);
  const total = trip.reduce((s, g) => s + (activities.find((a) => a.id === g.id)?.price || 0) * g.pax, 0);
  const deposit = useCountUp(Math.round(total * 0.2));

  // Suggested activities based on trip type / destination
  const suggested = activities.filter((a) => {
    if (plan.dest !== "Not sure yet" && a.region !== plan.dest && step === 1) return a.region === plan.dest || true;
    return true;
  });

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <>
      <div style={{ background: grad.hero, padding: "48px 20px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 15% 30%, rgba(34,211,238,.4), transparent 45%)" }} />
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.16)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "5px 11px", borderRadius: 999 }}>
            <Sparkles size={13} /> Build my adventure
          </span>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 800, letterSpacing: -1, margin: "14px 0 6px" }}>Let's plan your Costa Rica trip</h1>
          <p style={{ color: "rgba(255,255,255,.88)", fontSize: 16 }}>Three quick steps. Free to plan — only 20% to reserve.</p>
        </div>
      </div>

      <Section bg={c.sand}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Stepper step={step} />

          {/* STEP 1 — basics */}
          {step === 0 && (
            <div style={{ background: "#fff", borderRadius: 22, padding: 28, border: "1px solid rgba(0,0,0,.06)" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: c.charcoal }}>Tell us the basics</h2>
              <p style={{ color: c.stone, margin: "0 0 22px" }}>Your concierge uses this to tailor every suggestion.</p>
              <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <Field label="Destination"><Select value={plan.dest} onChange={(v) => setPlan({ ...plan, dest: v })} icon={Compass} options={["Manuel Antonio", "Quepos", "Uvita", "Dominical", "Jacó", "Tamarindo", "Guanacaste", "Not sure yet"]} /></Field>
                <Field label="Travel dates"><TextInput value={plan.dates} onChange={(v) => setPlan({ ...plan, dates: v })} icon={Calendar} placeholder="e.g. Jul 12–19" /></Field>
                <Field label="Group size"><Select value={plan.group} onChange={(v) => setPlan({ ...plan, group: v })} icon={Users} options={["1", "2", "3–4", "5–8", "9+"]} /></Field>
                <Field label="Trip type"><Select value={plan.type} onChange={(v) => setPlan({ ...plan, type: v })} icon={Heart} options={["Family", "Couple / Honeymoon", "Adult group weekend", "Fishing trip", "Adventure", "Luxury group"]} /></Field>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                <Button variant="dark" size="lg" onClick={next}>Pick activities <ArrowRight size={18} /></Button>
              </div>
            </div>
          )}

          {/* STEP 2 — pick activities */}
          {step === 1 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: c.charcoal }}>Add what you love</h2>
                  <p style={{ color: c.stone, margin: "4px 0 0" }}>Tap to add. {trip.length} in your trip so far.</p>
                </div>
                <Button variant="ghost" onClick={() => go("activities")}>Browse all <ArrowRight size={15} /></Button>
              </div>
              <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
                {suggested.map((a) => {
                  const added = trip.some((t) => t.id === a.id);
                  return (
                    <div key={a.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: added ? `2px solid ${c.emerald}` : "1px solid rgba(0,0,0,.06)" }}>
                      <Photo src={activityImage(a)} fallback={grad.ocean} alt={a.title} height={110} />
                      <div style={{ padding: 14 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: c.teal }}>{a.category}</div>
                        <div style={{ fontWeight: 800, color: c.charcoal, fontSize: 15, margin: "3px 0 8px", lineHeight: 1.2 }}>{a.title}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, color: c.charcoal, fontSize: 14 }}>{money(a.price)}</span>
                          <Button variant={added ? "dark" : "primary"} size="sm" onClick={() => addToTrip(a.id)}>
                            {added ? <><Check size={14} />Added</> : <><Plus size={14} />Add</>}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <Button variant="ghost" onClick={back}><ArrowLeft size={16} />Back</Button>
                <Button variant="dark" size="lg" onClick={next} disabled={trip.length === 0} style={trip.length === 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
                  Review trip <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — review */}
          {step === 2 && (
            <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22, alignItems: "start" }}>
              <div style={{ background: "#fff", borderRadius: 22, padding: 24, border: "1px solid rgba(0,0,0,.06)" }}>
                <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: c.charcoal }}>Your adventure plan</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: c.stone, fontSize: 13.5, fontWeight: 600, margin: "6px 0 18px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={14} />{plan.dest}</span>
                  {plan.dates && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Calendar size={14} />{plan.dates}</span>}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Users size={14} />{plan.group} people</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Heart size={14} />{plan.type}</span>
                </div>
                {chosen.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30, color: c.stone }}>
                    <p style={{ fontWeight: 700, color: c.charcoal }}>No activities yet</p>
                    <Button variant="ghost" onClick={() => setStep(1)}>Add activities</Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {chosen.map((a) => {
                      const g = trip.find((t) => t.id === a.id);
                      return (
                        <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: 10, borderRadius: 14, background: c.sand }}>
                          <div style={{ width: 64, height: 54, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                            <Photo src={activityImage(a)} fallback={grad.ocean} alt={a.title} height={54} zoom={false} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, color: c.charcoal, fontSize: 14.5, lineHeight: 1.2 }}>{a.title}</div>
                            <div style={{ color: c.stone, fontSize: 12.5 }}>{a.region} · {money(a.price)} × {g?.pax || 2}</div>
                          </div>
                          <div style={{ fontWeight: 800, color: c.charcoal }}>{money(a.price * (g?.pax || 2))}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ position: "sticky", top: 92, background: "#fff", borderRadius: 22, padding: 24, border: "1px solid rgba(0,0,0,.06)", boxShadow: "0 20px 50px -30px rgba(0,0,0,.35)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: c.stone, fontSize: 14, marginBottom: 8 }}>
                  <span>Trip total</span><span style={{ fontWeight: 700, color: c.charcoal }}>{money(total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: "1px dashed rgba(0,0,0,.12)" }}>
                  <span style={{ fontWeight: 800, color: c.charcoal }}>Due today (20%)</span>
                  <span style={{ fontWeight: 800, fontSize: 24, color: c.emerald }}>{money(deposit)}</span>
                </div>
                <Button variant="primary" full size="lg" style={{ marginTop: 18 }} onClick={() => window.alert("Reservation flow — connect payments here.")}>
                  <ShieldCheck size={17} />Reserve for {money(total * 0.2)}
                </Button>
                <Button variant="ghost" full size="sm" style={{ marginTop: 10 }} onClick={() => window.alert("Opening WhatsApp concierge…")}>
                  <MessageCircle size={15} />Send plan to concierge
                </Button>
                <p style={{ textAlign: "center", color: c.stone, fontSize: 12, marginTop: 12, marginBottom: 0 }}>Balance due closer to your travel dates. No spam, ever.</p>
                <Button variant="ghost" full size="sm" style={{ marginTop: 14 }} onClick={back}><ArrowLeft size={15} />Back to activities</Button>
              </div>
            </div>
          )}
        </div>
      </Section>

      <style>{`@media(min-width:820px){.two-col{grid-template-columns:1fr 1fr!important}}@media(min-width:940px){.detail-grid{grid-template-columns:1fr 340px!important}}`}</style>
    </>
  );
}
