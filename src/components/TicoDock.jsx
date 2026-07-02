import React, { useState, useEffect, useRef } from "react";
import { X, Send, ArrowRight } from "lucide-react";
import { c, glass } from "../theme.js";
import { TicoAvatar } from "./Tico.jsx";
import { TICO } from "../intelligence/tico.js";
import { ticoAnswer, ticoGreeting, CHAT_SUGGESTIONS } from "../intelligence/ticoChat.js";

// ── Tico chatbot ── a real, always-available chat in the corner. It knows the
// app + Costa Rica (booking, deposit, best time, activities, safety, regions…)
// via an offline keyword brain — no API, no cost. Tap the bird → chat opens.
export function TicoDock({ page, go, lift = false, trip = [] }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([{ from: "tico", text: ticoGreeting(), mood: "happy" }]);
  const bodyRef = useRef(null);

  // page change → close the window (never auto-opens over the page)
  useEffect(() => { setOpen(false); }, [page]);
  // keep scrolled to the latest message
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, open]);

  const ask = (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    const a = ticoAnswer(q);
    setMsgs((m) => [...m, { from: "me", text: q }, { from: "tico", text: a.text, action: a.action, mood: "happy" }]);
    setInput("");
  };

  return (
    <div style={{ position: "fixed", right: 18, bottom: lift ? 86 : 18, zIndex: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, transition: "bottom .25s ease" }}>
      <style>{`
        @keyframes ticoBob { 0%,100%{ transform: translateY(0) rotate(0) } 50%{ transform: translateY(-4px) rotate(-3deg) } }
        @keyframes ticoPop { from{ opacity:0; transform: translateY(14px) scale(.97) } to{ opacity:1; transform: translateY(0) scale(1) } }
        @keyframes ticoMsg { from{ opacity:0; transform: translateY(6px) } to{ opacity:1; transform: translateY(0) } }
      `}</style>

      {/* ── chat window ── */}
      {open && (
        <div style={{ ...glass, background: "rgba(10,20,40,.95)", borderRadius: 20, width: "min(340px, calc(100vw - 32px))", boxShadow: "0 30px 70px -28px rgba(0,0,0,.95)", animation: "ticoPop .28s cubic-bezier(.2,.7,.2,1) both", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "min(560px, calc(100vh - 120px))" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderBottom: `1px solid ${c.line}`, background: "linear-gradient(135deg, rgba(34,211,238,.12), transparent)" }}>
            <TicoAvatar size={34} mood="happy" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>{TICO.name}<span style={{ width: 6, height: 6, borderRadius: 999, background: "#37E36B", boxShadow: "0 0 8px #37E36B" }} /></div>
              <div style={{ color: c.stone, fontSize: 10.5 }}>Ask me anything · always here</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" style={{ background: "none", border: "none", color: c.stone, cursor: "pointer", padding: 2 }}><X size={17} /></button>
          </div>

          {/* messages */}
          <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {msgs.map((m, i) => (
              m.from === "me" ? (
                <div key={i} style={{ alignSelf: "flex-end", maxWidth: "82%", background: `linear-gradient(135deg,${c.teal},${c.emerald})`, color: c.ink, fontWeight: 600, fontSize: 13, lineHeight: 1.45, padding: "9px 12px", borderRadius: "14px 14px 4px 14px", animation: "ticoMsg .25s ease both" }}>{m.text}</div>
              ) : (
                <div key={i} style={{ alignSelf: "flex-start", maxWidth: "88%", display: "flex", gap: 8, animation: "ticoMsg .25s ease both" }}>
                  <TicoAvatar size={24} glow={false} mood={m.mood || "happy"} animate={false} />
                  <div>
                    <div style={{ background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, color: "rgba(243,247,255,.95)", fontSize: 13, lineHeight: 1.5, padding: "9px 12px", borderRadius: "14px 14px 14px 4px" }}>{m.text}</div>
                    {m.action && (
                      <button onClick={() => { setOpen(false); go(m.action.page); }} style={{ marginTop: 7, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,208,0,.14)", border: "1px solid rgba(255,208,0,.4)", color: c.gold, fontWeight: 800, fontSize: 12, padding: "6px 11px", borderRadius: 999, cursor: "pointer" }}>{m.action.label} <ArrowRight size={12} /></button>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* suggestion chips (only before the user has asked anything) */}
          {msgs.length <= 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 14px 10px" }}>
              {CHAT_SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} style={{ background: "rgba(34,211,238,.1)", border: "1px solid rgba(34,211,238,.28)", color: c.teal, fontSize: 11.5, fontWeight: 700, padding: "6px 10px", borderRadius: 999, cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          )}

          {/* input */}
          <div style={{ display: "flex", gap: 8, padding: "10px 12px", borderTop: `1px solid ${c.line}` }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="Ask Tico anything…" style={{ flex: 1, background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: 12, padding: "10px 12px", color: "#fff", fontSize: 13.5, outline: "none" }} />
            <button onClick={() => ask()} aria-label="Send" style={{ flexShrink: 0, width: 40, background: `linear-gradient(135deg,${c.teal},${c.emerald})`, color: c.ink, border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Send size={16} /></button>
          </div>
        </div>
      )}

      {/* ── the bird button — calm idle bob ── */}
      <button onClick={() => setOpen((o) => !o)} aria-label="Chat with Tico"
        style={{ position: "relative", width: 58, height: 58, borderRadius: 999, border: "none", cursor: "pointer", background: "transparent", padding: 0, animation: "ticoBob 5s ease-in-out infinite" }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: "radial-gradient(circle, rgba(34,211,238,.4), transparent 70%)", filter: "blur(4px)" }} />
        <span style={{ position: "relative", display: "inline-flex", width: 58, height: 58, borderRadius: 999, alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px -8px rgba(0,0,0,.7)" }}>
          <TicoAvatar size={58} mood="happy" animate={false} />
        </span>
      </button>
    </div>
  );
}
