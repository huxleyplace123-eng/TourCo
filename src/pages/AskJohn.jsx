import React, { useEffect, useRef, useState } from "react";
import { Send, Check, Plus, ShieldCheck, MessageCircle, Sparkles, MapPin, Compass, ArrowRight, RotateCcw } from "lucide-react";
import { c, grad, money } from "../theme.js";
import { activities } from "../data.js";
import { activityImage } from "../images.js";
import { Button } from "../components/ui.jsx";
import { Photo, useCountUp } from "../motion.jsx";

// ── John's brain: a small rules engine. Each step asks a question, and the
// visitor's answer narrows/scores the activity list. No API needed — it feels
// alive because the itinerary assembles on the right as you talk. ──

const SCRIPT = [
  {
    id: "who",
    john: "¡Pura vida! I'm John — I've guided Costa Rica for 15 years. Let's build your trip together. First: who's coming?",
    chips: [
      { label: "Just us two 💕", value: "couple", match: (a) => a.bestFor?.includes("Couples") },
      { label: "Family with kids 👨‍👩‍👧", value: "family", match: (a) => a.family },
      { label: "Group of friends 🍻", value: "group", match: (a) => a.bestFor?.includes("Groups") },
      { label: "Solo adventure 🎒", value: "solo", match: (a) => a.level !== "High" || a.bestFor?.includes("Adventure") },
    ],
  },
  {
    id: "vibe",
    john: "Love it. What's the energy you're after?",
    chips: [
      { label: "Adrenaline 🔥", value: "thrill", match: (a) => a.level === "High" || /ATV|Rafting|Paragl|Zip/.test(a.category) },
      { label: "Chill & scenic 🌅", value: "chill", match: (a) => a.level === "Easy" },
      { label: "Wildlife & nature 🦥", value: "nature", match: (a) => /Wildlife|Whale|Snorkel|Waterfall/.test(a.category) },
      { label: "On the water 🌊", value: "water", match: (a) => /Fishing|Catamaran|Snorkel|Surf|Whale|Rafting/.test(a.category) },
    ],
  },
  {
    id: "budget",
    john: "Got it. And what feels right per experience?",
    chips: [
      { label: "Keep it easy — under $100", value: "low", match: (a) => a.price < 100 },
      { label: "Mid-range — $100–200", value: "mid", match: (a) => a.price >= 100 && a.price <= 200 },
      { label: "Treat ourselves 💎", value: "high", match: (a) => a.price > 150 },
      { label: "Money's no object", value: "any", match: () => true },
    ],
  },
];

function score(a, answers) {
  let s = a.rating; // baseline by quality
  SCRIPT.forEach((step) => {
    const chosen = step.chips.find((ch) => ch.value === answers[step.id]);
    if (chosen && chosen.match(a)) s += 3;
  });
  return s;
}

function TypingDots() {
  return (
    <div style={{ display: "inline-flex", gap: 4, padding: "12px 16px", background: "#fff", borderRadius: "16px 16px 16px 4px", boxShadow: "0 4px 14px -8px rgba(0,0,0,.25)" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: c.stone, animation: `tnBlink 1.2s ${i * 0.18}s infinite` }} />
      ))}
    </div>
  );
}

function JohnAvatar({ size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: grad.sunset, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.42, color: c.charcoal, flexShrink: 0, boxShadow: "0 6px 16px -6px rgba(0,0,0,.4)" }}>J</div>
  );
}

export function AskJohn({ go, trip, addToTrip, removeFromTrip }) {
  const [msgs, setMsgs] = useState([]); // {from:'john'|'me', text}
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [typing, setTyping] = useState(true);
  const [done, setDone] = useState(false);
  const [suggested, setSuggested] = useState([]); // activity ids John proposed
  const scrollRef = useRef(null);

  const total = trip.reduce((s, g) => s + (activities.find((a) => a.id === g.id)?.price || 0) * g.pax, 0);
  const deposit = useCountUp(Math.round(total * 0.2));

  // John "speaks" the current step's question after a typing beat.
  useEffect(() => {
    if (step >= SCRIPT.length) { finish(); return; }
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "john", text: SCRIPT[step].john }]);
    }, 850);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, suggested]);

  const answer = (step_, chip) => {
    setMsgs((m) => [...m, { from: "me", text: chip.label }]);
    setAnswers((a) => ({ ...a, [step_.id]: chip.value }));
    setStep((s) => s + 1);
  };

  const finish = () => {
    if (done) return;
    setDone(true);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const finalAnswers = answers;
      const ranked = [...activities].sort((a, b) => score(b, finalAnswers) - score(a, finalAnswers)).slice(0, 5);
      setMsgs((m) => [...m, { from: "john", text: "Perfect. Based on that, here's what I'd book for you 👇 Add the ones you love — I'll handle the rest." }]);
      // reveal suggestions one at a time (they "fly in" on the right)
      ranked.forEach((a, i) => setTimeout(() => setSuggested((s) => [...s, a.id]), 400 + i * 320));
    }, 900);
  };

  const restart = () => { setMsgs([]); setStep(0); setAnswers({}); setDone(false); setSuggested([]); setTyping(true); };

  const current = step < SCRIPT.length ? SCRIPT[step] : null;
  const suggestedActs = suggested.map((id) => activities.find((a) => a.id === id)).filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes tnBlink { 0%,60%,100%{ transform: translateY(0); opacity:.4 } 30%{ transform: translateY(-4px); opacity:1 } }
        @keyframes tnFlyIn { from{ opacity:0; transform: translateX(24px) scale(.96) } to{ opacity:1; transform: translateX(0) scale(1) } }
        @keyframes tnPop { 0%{ transform: scale(.9) } 60%{ transform: scale(1.04) } 100%{ transform: scale(1) } }
        .tn-fly { animation: tnFlyIn .5s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>

      <div style={{ background: grad.jungle, padding: "30px 20px 22px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 12% 20%, rgba(34,211,238,.4), transparent 45%)" }} />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
          <JohnAvatar size={54} />
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.gold, fontWeight: 800, fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase" }}>
              <Sparkles size={13} /> Ask John · live trip builder
            </div>
            <h1 style={{ color: "#fff", fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 800, letterSpacing: -0.5, margin: "2px 0 0" }}>Let's plan your Costa Rica trip together</h1>
          </div>
        </div>
      </div>

      <div className="askjohn-grid" style={{ maxWidth: 1180, margin: "0 auto", padding: "20px", display: "grid", gridTemplateColumns: "1fr", gap: 20, alignItems: "start" }}>
        {/* ── Chat column ── */}
        <div style={{ background: c.sand, borderRadius: 22, border: "1px solid rgba(0,0,0,.06)", display: "flex", flexDirection: "column", height: 560, overflow: "hidden" }}>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexDirection: m.from === "me" ? "row-reverse" : "row" }}>
                {m.from === "john" && <JohnAvatar size={32} />}
                <div style={{
                  maxWidth: "78%", padding: "12px 16px", fontSize: 15, lineHeight: 1.5,
                  background: m.from === "me" ? c.emerald : "#fff",
                  color: m.from === "me" ? "#fff" : c.charcoal,
                  borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  boxShadow: "0 4px 14px -8px rgba(0,0,0,.25)",
                }}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <JohnAvatar size={32} /><TypingDots />
              </div>
            )}
          </div>

          {/* Quick-reply chips */}
          <div style={{ padding: 16, borderTop: "1px solid rgba(0,0,0,.06)", background: "#fff", minHeight: 72, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {current && !typing && current.chips.map((ch) => (
              <button key={ch.value} onClick={() => answer(current, ch)} style={{ background: "rgba(47,107,235,.08)", color: c.emerald, border: `1.5px solid rgba(47,107,235,.3)`, borderRadius: 999, padding: "10px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(47,107,235,.16)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(47,107,235,.08)")}
              >{ch.label}</button>
            ))}
            {done && !typing && (
              <div style={{ display: "flex", gap: 8, width: "100%" }}>
                <Button variant="ghost" size="sm" onClick={restart}><RotateCcw size={14} />Start over</Button>
                <Button variant="dark" size="sm" onClick={() => window.alert("Opening WhatsApp concierge…")}><MessageCircle size={14} />Chat with the real John</Button>
              </div>
            )}
            {!current && !done && <span style={{ color: c.stone, fontSize: 13 }}>John is thinking…</span>}
          </div>
        </div>

        {/* ── Live itinerary column ── */}
        <div style={{ position: "sticky", top: 92 }}>
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid rgba(0,0,0,.06)", overflow: "hidden", boxShadow: "0 24px 60px -34px rgba(0,0,0,.4)" }}>
            <div style={{ background: grad.hero, padding: "18px 20px", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Compass size={18} color={c.gold} />
                <span style={{ fontWeight: 800, fontSize: 16 }}>Your trip, building live</span>
              </div>
              <div style={{ fontSize: 13, opacity: .9, marginTop: 2 }}>{trip.length} added · John suggested {suggestedActs.length}</div>
            </div>

            <div style={{ padding: 16, maxHeight: 380, overflowY: "auto" }}>
              {suggestedActs.length === 0 && trip.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 16px", color: c.stone }}>
                  <div style={{ width: 60, height: 60, borderRadius: 999, background: c.sand, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Sparkles size={26} color={c.teal} />
                  </div>
                  <p style={{ fontWeight: 700, color: c.charcoal, margin: "0 0 4px" }}>Answer John's questions</p>
                  <p style={{ fontSize: 13.5, margin: 0 }}>Your personalized itinerary appears here as you chat.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {suggestedActs.map((a, i) => {
                    const added = trip.some((t) => t.id === a.id);
                    return (
                      <div key={a.id} className="tn-fly" style={{ animationDelay: `${i * 0.05}s`, display: "flex", gap: 12, alignItems: "center", padding: 8, borderRadius: 14, background: added ? "rgba(47,107,235,.07)" : c.sand, border: added ? `1.5px solid ${c.emerald}` : "1.5px solid transparent" }}>
                        <div style={{ width: 62, height: 54, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                          <Photo src={activityImage(a)} fallback={grad.ocean} alt={a.title} height={54} zoom={false} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: c.teal }}>{a.category}</div>
                          <div style={{ fontWeight: 800, color: c.charcoal, fontSize: 13.5, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                          <div style={{ color: c.stone, fontSize: 12 }}>{money(a.price)} · {a.region}</div>
                        </div>
                        <button onClick={() => (added ? removeFromTrip(a.id) : addToTrip(a.id))} style={{ width: 34, height: 34, borderRadius: 999, border: "none", cursor: "pointer", flexShrink: 0, background: added ? c.emerald : c.coral, color: added ? "#fff" : c.charcoal, display: "flex", alignItems: "center", justifyContent: "center", animation: "tnPop .3s" }}>
                          {added ? <Check size={16} /> : <Plus size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* deposit footer */}
            <div style={{ padding: 18, borderTop: "1px solid rgba(0,0,0,.06)", background: c.sand }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: c.charcoal, fontSize: 14 }}>Deposit today (20%)</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: c.emerald }}>{money(deposit)}</span>
              </div>
              <Button variant="primary" full onClick={() => go("portal")} disabled={trip.length === 0} style={trip.length === 0 ? { opacity: .5, cursor: "not-allowed" } : {}}>
                Review my trip <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <p style={{ textAlign: "center", color: c.stone, fontSize: 12.5, marginTop: 12 }}>
            Prefer a classic form? <button onClick={() => go("builder")} style={{ background: "none", border: "none", color: c.emerald, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Use the step-by-step builder</button>
          </p>
        </div>
      </div>

      <style>{`@media(min-width:900px){.askjohn-grid{grid-template-columns:1fr 380px!important}}`}</style>
    </>
  );
}
