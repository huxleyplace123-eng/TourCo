import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";
import { c, FONT, radius, shadow, grad } from "../theme.js";
import { hasSupabase } from "./supabase.js";

// Passwordless login. Enter email → we send a one-time link (or, in demo mode,
// continue instantly). No password, ever. Returning users do the exact same
// thing from any device; their trip lives on their account, not the browser.
export default function Login({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const valid = /\S+@\S+\.\S+/.test(email);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    await onSignIn(email.trim());
    setBusy(false);
    setSent(true);
  };

  const input = {
    width: "100%", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`,
    borderRadius: radius.sm, color: c.charcoal, fontFamily: FONT, fontSize: 16, padding: "14px 16px", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: c.sand, fontFamily: FONT, padding: 18,
      backgroundImage: "radial-gradient(60% 60% at 15% 0%, rgba(34,211,238,.12), transparent 60%), radial-gradient(50% 50% at 90% 100%, rgba(255,208,0,.09), transparent 60%)" }}>
      <div style={{ width: "min(420px, 100%)", padding: "36px 32px 30px", borderRadius: radius.xl, background: c.white, border: `1px solid ${c.line}`, boxShadow: shadow.lg, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, color: c.charcoal, marginBottom: 4 }}>
          Tico<span style={{ color: c.gold }}>Wild</span>
        </div>
        {sent ? (
          <>
            <div style={{ width: 60, height: 60, borderRadius: 999, background: "rgba(52,211,153,.14)", border: "1px solid rgba(52,211,153,.4)", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "18px 0 14px" }}>
              <Check size={30} color="#34D399" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: c.charcoal }}>Check your email</h2>
            <p style={{ color: c.stone, fontSize: 14.5, lineHeight: 1.55, margin: "0 auto", maxWidth: 320 }}>
              We sent a one-time sign-in link to <b style={{ color: c.charcoal }}>{email}</b>. Tap it and you're in — no password needed.
            </p>
            <button onClick={() => setSent(false)} style={{ marginTop: 18, background: "none", border: "none", color: c.teal, fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
              Use a different email
            </button>
          </>
        ) : (
          <>
            <div style={{ color: c.stone, fontSize: 13.5, fontWeight: 600, marginBottom: 22 }}>Your trip, all in one place</div>
            <form onSubmit={submit} style={{ display: "grid", gap: 12, textAlign: "left" }}>
              <label style={{ position: "relative", display: "block" }}>
                <Mail size={17} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: c.stone }} />
                <input autoFocus type="email" inputMode="email" autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                  style={{ ...input, paddingLeft: 44 }} />
              </label>
              <button type="submit" disabled={!valid || busy} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px 0", borderRadius: radius.sm, border: "none",
                background: valid && !busy ? c.gold : "rgba(255,208,0,.35)", color: c.ink,
                fontFamily: FONT, fontSize: 15.5, fontWeight: 800, cursor: valid && !busy ? "pointer" : "default",
                boxShadow: valid && !busy ? shadow.glowGold : "none",
              }}>
                {busy ? "Sending…" : <>Email me a sign-in link <ArrowRight size={17} strokeWidth={2.6} /></>}
              </button>
            </form>
            <p style={{ color: c.stone, fontSize: 12, lineHeight: 1.5, margin: "16px auto 0", maxWidth: 320 }}>
              No password to create or remember. We email you a link each time — tap it and you're in from any device.
            </p>
            {!hasSupabase && (
              <div style={{ marginTop: 16, padding: "8px 12px", borderRadius: radius.sm, background: "rgba(255,208,0,.1)", border: "1px solid rgba(255,208,0,.3)", color: c.gold, fontSize: 11.5, fontWeight: 700 }}>
                Demo mode — “send link” signs you straight in. Add Supabase keys for real email login.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
