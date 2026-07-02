import React from "react";
import { c, grad, gradText } from "../theme.js";

// ── Button ── (mirrors the original D component: variants + sizes)
export function Button({ children, variant = "primary", onClick, full, size = "md", style = {}, ...rest }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontWeight: 700, borderRadius: 999, cursor: "pointer", border: "none", whiteSpace: "nowrap",
    transition: "transform .15s ease, box-shadow .15s ease, opacity .15s ease",
    width: full ? "100%" : "auto",
    padding: size === "lg" ? "16px 28px" : size === "sm" ? "9px 16px" : "13px 22px",
    fontSize: size === "lg" ? 17 : size === "sm" ? 14 : 15.5,
  };
  const variants = {
    primary: { background: c.gold, color: c.ink, boxShadow: "0 0 0 1px rgba(255,208,0,.4), 0 12px 34px -10px rgba(255,208,0,.6)" },
    dark: { background: `linear-gradient(135deg,${c.teal},${c.emerald})`, color: c.ink, boxShadow: "0 0 0 1px rgba(34,211,238,.4), 0 12px 34px -12px rgba(34,211,238,.7)" },
    light: { background: "rgba(255,255,255,.08)", color: c.charcoal, border: `1px solid ${c.line}` },
    ghost: { background: "rgba(255,255,255,.04)", color: c.charcoal, border: `1.5px solid rgba(255,255,255,.18)` },
    glass: { background: "rgba(255,255,255,.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,.28)", backdropFilter: "blur(10px)" },
    gold: { background: c.gold, color: c.ink, boxShadow: "0 0 0 1px rgba(255,208,0,.4), 0 12px 34px -10px rgba(255,208,0,.6)" },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      {...rest}
    >
      {children}
    </button>
  );
}

// ── Badge ── (pill with optional icon)
export function Badge({ children, bg = "rgba(11,26,46,.55)", color = c.teal, icon: Icon }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, color, fontWeight: 700, fontSize: 12, padding: "5px 11px", borderRadius: 999, lineHeight: 1 }}>
      {Icon && <Icon size={13} />}
      {children}
    </span>
  );
}

// ── Eyebrow label ──
export function Eyebrow({ children }) {
  return (
    <div style={{ color: c.teal, fontWeight: 800, letterSpacing: 1.5, fontSize: 13, textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

// ── Section heading block ──
// `accent` renders the last word of the title in the brand gradient — the
// signature typographic touch used across the app.
export function SectionHead({ eyebrow, title, sub, center, light, accent }) {
  const renderTitle = () => {
    if (!accent || light || typeof title !== "string") return title;
    const words = title.trim().split(" ");
    const last = words.pop();
    return (<>{words.join(" ")} <span style={gradText(grad.ocean)}>{last}</span></>);
  };
  return (
    <div style={{ maxWidth: 720, margin: center ? "0 auto" : 0, textAlign: center ? "center" : "left", marginBottom: 40 }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{ fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.08, fontWeight: 800, letterSpacing: -1, color: light ? "#fff" : c.charcoal, margin: 0 }}>
        {renderTitle()}
      </h2>
      {sub && (
        <p style={{ marginTop: 14, fontSize: 17, lineHeight: 1.6, color: light ? "rgba(255,255,255,.85)" : c.stone }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Section wrapper ──
export function Section({ children, bg, pad = 80, id }) {
  return (
    <section id={id} style={{ background: bg, padding: `${pad}px 20px` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

// ── Form field label ──
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: c.charcoal, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputBase = {
  width: "100%", border: `1.5px solid ${c.line}`, borderRadius: 12, padding: "11px 12px 11px 38px",
  fontSize: 14.5, color: c.charcoal, background: "rgba(255,255,255,.05)", outline: "none", boxSizing: "border-box",
};

export function TextInput({ value, onChange, placeholder, icon: Icon, type = "text" }) {
  return (
    <div style={{ position: "relative" }}>
      {Icon && <Icon size={16} color={c.stone} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputBase} />
    </div>
  );
}

export function Select({ value, onChange, options, icon: Icon }) {
  return (
    <div style={{ position: "relative" }}>
      {Icon && <Icon size={16} color={c.stone} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />}
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputBase, appearance: "none", paddingRight: 34, cursor: "pointer" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
