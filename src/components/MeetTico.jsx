import React, { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { c, glass, grad } from "../theme.js";
import { TicoFace } from "./TicoFace.jsx";
import { LIFE } from "../intelligence/ticoPersona.js";
import { rememberTraveler, ticoMemory } from "../intelligence/ticoReacts.js";

// ── Meet Tico ── the one-time intro where a visitor BONDS with the character.
// Tico introduces himself, his story, how he rates, and asks your name so he can
// remember you. Shows once (localStorage). This is the moment he stops being a
// mascot and becomes "my guide."
export function MeetTico({ onClose }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(ticoMemory().name || "");

  const steps = [
    { mood: "happy",   title: "¡Hola! I'm Tico.",
      body: `A scarlet macaw. I grew up in the almond trees above ${"Manuel Antonio"}, and I've flown this whole coast more times than I can count. Now I help travelers see MY Costa Rica — the real one.` },
    { mood: "proud",   title: "I don't do tourist traps.",
      body: "Everything I recommend, I actually rate — with feeling. A 10 means I'd fly across the country for it. A shrug means I've got better for you. I'll always tell you the truth, mae." },
    { mood: "excited", title: "Let's make it yours.",
      body: "Tell me your vibe and I'll build a trip around you — the right thing at the right time of day, no wasted hours in a van. What should I call you?" },
  ];
  const s = steps[step];
  const last = step === steps.length - 1;

  const finish = () => {
    if (name.trim()) rememberTraveler({ name: name.trim(), met: true });
    else rememberTraveler({ met: true });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(5,12,26,.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...glass, background: "rgba(10,22,44,.94)", borderRadius: 26, padding: "30px 26px 26px", width: "100%", maxWidth: 420, position: "relative", boxShadow: "0 50px 120px -40px rgba(0,0,0,.95)", textAlign: "center" }}>
        <button onClick={finish} aria-label="Skip" style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: c.stone, cursor: "pointer" }}><X size={18} /></button>

        {/* Tico, big and alive */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
          <div aria-hidden style={{ position: "absolute", inset: -18, borderRadius: 999, background: "radial-gradient(circle, rgba(34,211,238,.35), transparent 70%)", filter: "blur(6px)" }} />
          <div style={{ position: "relative" }}><TicoFace size={104} mood={s.mood} /></div>
        </div>

        <h2 style={{ color: "#fff", fontSize: 23, fontWeight: 800, margin: "6px 0 8px", letterSpacing: -0.4 }}>{s.title}</h2>
        <p style={{ color: "rgba(243,247,255,.85)", fontSize: 14.5, lineHeight: 1.55, margin: "0 auto 18px", maxWidth: 340 }}>{s.body}</p>

        {last && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" maxLength={24}
            onKeyDown={(e) => e.key === "Enter" && finish()}
            style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 15, marginBottom: 14, outline: "none" }} />
        )}

        {/* progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          {steps.map((_, i) => <span key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 999, background: i === step ? c.teal : "rgba(255,255,255,.2)", transition: "all .2s" }} />)}
        </div>

        <button onClick={() => (last ? finish() : setStep(step + 1))}
          style={{ width: "100%", background: last ? `linear-gradient(135deg,${c.gold},#FFDE4D)` : `linear-gradient(135deg,${c.teal},${c.emerald})`, color: c.ink, border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          {last ? <>Let's go{name.trim() ? `, ${name.trim()}` : ""} <ArrowRight size={17} /></> : <>Next <ArrowRight size={16} /></>}
        </button>
        {!last && <button onClick={finish} style={{ background: "none", border: "none", color: c.stone, fontSize: 12.5, marginTop: 12, cursor: "pointer" }}>skip intro</button>}
      </div>
    </div>
  );
}

// Whether to show the intro (hasn't met Tico yet).
export function shouldMeetTico() {
  return !ticoMemory().met;
}
