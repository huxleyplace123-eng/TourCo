import { useState } from "react";
import { Lock } from "lucide-react";
import { c, FONT, radius, shadow } from "../theme.js";

// Sign-in gate for the CRM. Credentials are compared as SHA-256 hashes so the
// raw values never appear in the source. NOTE: this is a convenience lock for
// a static site — it keeps the tool private from casual visitors; it is not
// server-grade auth.
const USER_HASH = "64250640ac13ad3004878b0a8c8851a5ec1c15c4e7b604d76fe8c81b8a5f1563";
const PASS_HASH = "6d99a8a8c25a4f11c2f3b417fdf09e5058a05868354026a37bcdcac12ea9bdb0";

export const AUTH_KEY = "ticowild_crm_signed_in";

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Login({ onSuccess }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const [u, p] = await Promise.all([sha256(user.trim().toLowerCase()), sha256(pass)]);
    setBusy(false);
    if (u === USER_HASH && p === PASS_HASH) {
      localStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } else {
      setError(true);
      setPass("");
    }
  };

  const input = {
    width: "100%",
    background: "rgba(255,255,255,.06)",
    border: `1px solid ${error ? "rgba(248,113,113,.55)" : c.line}`,
    borderRadius: radius.sm,
    color: c.charcoal,
    fontFamily: FONT,
    fontSize: 15,
    padding: "12px 14px",
    outline: "none",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: c.sand, fontFamily: FONT, padding: 16,
    }}>
      <form onSubmit={submit} style={{
        width: "min(380px, 100%)", padding: "34px 30px 30px", borderRadius: radius.xl,
        background: c.white, border: `1px solid ${c.line}`, boxShadow: shadow.lg, textAlign: "center",
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: c.charcoal }}>
          Tico<span style={{ color: c.gold }}>Wild</span>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, marginBottom: 24,
          color: c.stone, fontSize: 13, fontWeight: 600,
        }}>
          <Lock size={13} /> Team CRM — sign in
        </div>
        <div style={{ display: "grid", gap: 12, textAlign: "left" }}>
          <input
            autoFocus
            value={user}
            onChange={(e) => { setUser(e.target.value); setError(false); }}
            placeholder="Username"
            autoComplete="username"
            style={input}
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(false); }}
            placeholder="Password"
            autoComplete="current-password"
            style={input}
          />
        </div>
        {error && (
          <div style={{ marginTop: 12, color: "#F87171", fontSize: 13, fontWeight: 600 }}>
            Wrong username or password.
          </div>
        )}
        <button type="submit" disabled={busy || !user || !pass} style={{
          width: "100%", marginTop: 18, padding: "12px 0", borderRadius: radius.sm, border: "none",
          background: busy || !user || !pass ? "rgba(255,208,0,.35)" : c.gold, color: c.ink,
          fontFamily: FONT, fontSize: 15, fontWeight: 800, cursor: busy || !user || !pass ? "default" : "pointer",
          boxShadow: busy || !user || !pass ? "none" : shadow.glowGold,
        }}>
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
