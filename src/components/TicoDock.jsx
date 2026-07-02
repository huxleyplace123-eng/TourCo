import React, { useState, useEffect, useRef } from "react";
import { X, MessageCircle } from "lucide-react";
import { c, glass } from "../theme.js";
import { activities } from "../data.js";
import { TicoAvatar } from "./Tico.jsx";
import { ticoPageLine, TICO } from "../intelligence/tico.js";
import { ticoOnAdd, ticoMemory } from "../intelligence/ticoReacts.js";

// ── Tico companion dock ── a quiet, optional macaw in the corner. He NEVER pops
// open over the page or steals attention — Tico's real personality lives on the
// pages themselves (his ranked picks, verdicts, section voice). This is just a
// calm way to open a chat if you want it; a subtle dot shows he has a thought.
export function TicoDock({ page, go, lift = false, trip = [] }) {
  const [open, setOpen] = useState(false);
  const [reaction, setReaction] = useState(null); // {text, mood} — his latest thought, shown only if you tap
  const prevTrip = useRef(trip.length);

  // page change → just close; NEVER auto-open or pulse for attention
  useEffect(() => { setOpen(false); }, [page]);

  // you added something → Tico has a fresh reaction ready, shown as a quiet dot.
  // He does NOT pop open over the page — you see it only if you tap him.
  useEffect(() => {
    if (trip.length > prevTrip.current) {
      const added = trip[trip.length - 1];
      const act = activities.find((a) => a.id === added?.id);
      if (act) setReaction(ticoOnAdd(act, trip));   // stored, not shown, until tapped
    }
    prevTrip.current = trip.length;
  }, [trip]);

  const pageLine = ticoPageLine(page);
  const active = reaction || pageLine;      // reaction to YOU wins over the page greeting
  const { text: line, mood } = active;
  const name = ticoMemory().name;

  return (
    <div style={{ position: "fixed", right: 18, bottom: lift ? 86 : 18, zIndex: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, transition: "bottom .25s ease" }}>
      <style>{`
        @keyframes ticoBob { 0%,100%{ transform: translateY(0) rotate(0) } 50%{ transform: translateY(-4px) rotate(-3deg) } }
        @keyframes ticoPop { from{ opacity:0; transform: translateY(10px) scale(.96) } to{ opacity:1; transform: translateY(0) scale(1) } }
      `}</style>

      {/* speech bubble */}
      {open && (
        <div style={{ ...glass, background: "rgba(10,20,40,.9)", borderRadius: 18, padding: "16px 16px 14px", width: 272, boxShadow: "0 24px 60px -28px rgba(0,0,0,.9)", animation: "ticoPop .28s cubic-bezier(.2,.7,.2,1) both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
            <TicoAvatar size={30} mood={mood} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13.5 }}>{TICO.name}{reaction ? " · reacting" : ""}</div>
              <div style={{ color: c.stone, fontSize: 10.5 }}>{TICO.species}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: c.stone, cursor: "pointer", padding: 2 }}><X size={15} /></button>
          </div>
          <p style={{ color: "rgba(243,247,255,.92)", fontSize: 13, lineHeight: 1.5, margin: "0 0 12px" }}>{line}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setOpen(false); go(trip.length ? "portal" : "build"); }} style={{ flex: 1, background: `linear-gradient(135deg,${c.teal},${c.emerald})`, color: c.ink, border: "none", borderRadius: 10, padding: "9px 10px", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>{trip.length ? "See my trip" : "Plan with Tico"}</button>
            <button onClick={() => window.alert("Opening WhatsApp — chat with a real local guide…")} title="WhatsApp" style={{ background: "rgba(55,227,107,.14)", border: "1px solid rgba(55,227,107,.35)", color: "#37E36B", borderRadius: 10, width: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><MessageCircle size={16} /></button>
          </div>
        </div>
      )}

      {/* the bird button — calm idle bob, never demands attention */}
      <button onClick={() => setOpen((o) => { if (!o) return true; return false; })} aria-label="Chat with Tico"
        style={{ position: "relative", width: 58, height: 58, borderRadius: 999, border: "none", cursor: "pointer", background: "transparent", padding: 0, animation: "ticoBob 5s ease-in-out infinite" }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: "radial-gradient(circle, rgba(34,211,238,.4), transparent 70%)", filter: "blur(4px)" }} />
        <span style={{ position: "relative", display: "inline-flex", width: 58, height: 58, borderRadius: 999, alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px -8px rgba(0,0,0,.7)" }}>
          <TicoAvatar size={58} mood={mood} animate={false} />
        </span>
        {/* subtle dot when he has a fresh thought — no "!", no bounce, just a dot */}
        {reaction && !open && <span style={{ position: "absolute", top: 2, right: 2, width: 12, height: 12, borderRadius: 999, background: c.gold, border: "2px solid #0B1A2E" }} />}
      </button>
    </div>
  );
}
