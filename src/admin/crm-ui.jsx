// Shared CRM UI atoms + the responsive stylesheet, so the customer and
// operator workspaces render temperature, type and mobile cards identically.
import { MessageCircle, Mail, Phone, Globe } from "lucide-react";
import { c, FONT, radius } from "../theme.js";
import { normPhone } from "./store.js";
import {
  TEMPERATURES, TEMPERATURE_META, OPERATOR_TYPES, operatorType,
} from "./crm-shared.js";

// ── Contact rail ── one fixed slot per channel so the icons always line up into
// a straight vertical column across rows; a missing channel shows a dimmed,
// non-clickable slot instead of collapsing and shifting everything.
function Slot({ href, title, color, on, onClick, children }) {
  if (!on) return <span className="crm-contact-slot is-off" aria-hidden="true">{children}</span>;
  return (
    <a href={href} title={title} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
      className="crm-contact-slot" style={{ color }} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {children}
    </a>
  );
}

export function CustomerContacts({ cust, onLog, size = 15 }) {
  const phone = normPhone(cust.phone);
  return (
    <span className="crm-contacts" onClick={(e) => e.stopPropagation()}>
      <Slot on={!!phone} href={`https://wa.me/${phone}`} title="WhatsApp" color="#25D366" onClick={() => onLog(cust.id, "whatsapp")}><MessageCircle size={size} /></Slot>
      <Slot on={!!cust.email} href={`mailto:${cust.email}`} title="Email" color={c.stone} onClick={() => onLog(cust.id, "email")}><Mail size={size} /></Slot>
      <Slot on={!!phone} href={`tel:${cust.phone}`} title="Call" color={c.stone} onClick={() => onLog(cust.id, "call")}><Phone size={size} /></Slot>
    </span>
  );
}

export function OperatorContacts({ op, onLog, size = 15 }) {
  const wa = normPhone(op.whatsapp || "");
  return (
    <span className="crm-contacts" onClick={(e) => e.stopPropagation()}>
      <Slot on={!!wa} href={`https://wa.me/${wa}`} title="WhatsApp" color="#25D366" onClick={() => onLog(op.id, "WhatsApp opened")}><MessageCircle size={size} /></Slot>
      <Slot on={!!op.email} href={`mailto:${op.email}`} title={op.email} color={c.stone} onClick={() => onLog(op.id, "Email opened")}><Mail size={size} /></Slot>
      <Slot on={!!op.phone} href={`tel:${op.phone}`} title={op.phone} color={c.stone} onClick={() => onLog(op.id, "Call started")}><Phone size={size} /></Slot>
      <Slot on={!!op.website} href={op.website} title="Website" color={c.stone}><Globe size={size} /></Slot>
    </span>
  );
}

// ── Lead-temperature badge ── renders nothing when unset (blank by default). ──
export function TempBadge({ temperature, small, showLabel = true }) {
  const t = TEMPERATURE_META[temperature];
  if (!t) return null;
  return (
    <span
      title={`${t.emoji} ${t.label} lead`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
        padding: small ? "2px 8px" : "3px 10px", borderRadius: 999,
        border: `1px solid ${t.color}55`, background: `${t.color}1f`, color: t.color,
        fontSize: small ? 11 : 12, fontWeight: 800, whiteSpace: "nowrap", lineHeight: 1.4,
      }}
    >
      <span style={{ fontSize: small ? 11 : 12.5 }}>{t.emoji}</span>
      {showLabel && t.label}
    </span>
  );
}

// ── Temperature picker ── a simple Cold · Medium · Hot segmented control.
// Blank by default; tap a heat to set it (it lights up in its color and, for
// Hot, flickers like a flame); tap the active one again to clear back to none.
export function TempPicker({ value, onChange, size = "md", labels = false }) {
  const h = size === "sm" ? 28 : 32;
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-flex", gap: 3, background: "rgba(0,0,0,.18)",
        border: `1px solid ${c.line}`, borderRadius: 999, padding: 3, width: "fit-content",
      }}
    >
      {TEMPERATURES.map((t) => {
        const meta = TEMPERATURE_META[t];
        const on = value === t;
        return (
          <button
            key={t}
            onClick={() => onChange(on ? "" : t)}
            title={on ? `${meta.label} — tap to clear` : `Set ${meta.label}`}
            aria-label={on ? `Clear ${meta.label}` : `Set ${meta.label}`}
            aria-pressed={on}
            style={{
              height: h, minWidth: h, padding: labels ? "0 12px" : 0, borderRadius: 999, border: "none", cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontFamily: FONT, fontSize: size === "sm" ? 13.5 : 15.5, fontWeight: 800, lineHeight: 1,
              color: on ? "#0B1A2E" : meta.color,
              background: on ? meta.color : "transparent",
              boxShadow: on ? `0 0 0 1px ${meta.color}, 0 8px 20px -8px ${meta.color}` : "none",
              opacity: on ? 1 : 0.5,
              transition: "all .13s ease",
              animation: on && t === "Hot" ? "crmFlame 1.4s ease-in-out infinite" : "none",
            }}
          >
            <span style={{ fontSize: size === "sm" ? 13 : 15 }}>{meta.emoji}</span>
            {labels && <span style={{ fontSize: 12.5 }}>{meta.label}</span>}
          </button>
        );
      })}
    </span>
  );
}

// ── Vendor-type badge ─────────────────────────────────────────────────────────
export function TypeBadge({ type, small }) {
  const t = operatorType(type);
  return (
    <span
      title={t.label}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
        padding: small ? "2px 8px" : "3px 10px", borderRadius: 999,
        border: `1px solid ${t.color}44`, background: `${t.color}18`, color: t.color,
        fontSize: small ? 11 : 12, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.4,
      }}
    >
      <span>{t.emoji}</span> {t.label}
    </span>
  );
}

export function TypeSelect({ value, onChange, style }) {
  return (
    <select
      value={value || "tours"}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`,
        borderRadius: radius.sm, color: c.charcoal, fontFamily: FONT, fontSize: 14,
        padding: "9px 12px", outline: "none", cursor: "pointer", ...style,
      }}
    >
      {OPERATOR_TYPES.map((t) => (
        <option key={t.key} value={t.key}>{t.emoji}  {t.label}</option>
      ))}
    </select>
  );
}

// ── Shared responsive + polish stylesheet ─────────────────────────────────────
// Injected once per workspace. Owns the desktop/mobile switch (`.crm-desk` /
// `.crm-mob`), the mobile card list, sticky mobile action bar, and the small
// refinements that make the whole thing feel like one product.
export const CRM_CSS = `
  :root { --crm-gutter: clamp(12px, 2.5vw, 28px); }
  * { -webkit-tap-highlight-color: transparent; }

  @keyframes crmFlame {
    0%, 100% { box-shadow: 0 0 0 1px #FB7042, 0 8px 20px -8px #FB7042; }
    50% { box-shadow: 0 0 0 1px #FB7042, 0 8px 26px -6px #FBBF24; }
  }

  /* Fixed-width contact-icon rail so the phone/mail/whatsapp buttons line up
     into a straight column across every row, even when a channel is missing. */
  .crm-contacts { display: inline-flex; gap: 6px; justify-content: flex-end; flex-shrink: 0; }
  .crm-contact-slot { width: 34px; height: 34px; border-radius: 10px; display: inline-flex;
    align-items: center; justify-content: center; border: 1px solid ${c.line};
    background: rgba(255,255,255,.05); color: ${c.stone}; text-decoration: none; }
  .crm-contact-slot.is-off { opacity: .28; pointer-events: none; }
  .crm-wrap, .ops-wrap { max-width: 1440px; margin: 0 auto; padding: 18px var(--crm-gutter) 96px; }

  /* card / surface primitives */
  .crm-card { border-radius: ${radius.md}px; border: 1px solid ${c.line}; background: ${c.white}; }

  /* desktop table ↔ mobile cards */
  .crm-desk { display: block; }
  .crm-mob { display: none; }

  /* stat tiles: horizontal snap-scroll on phones, grid on desktop */
  .crm-stats, .ops-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 16px 0 12px; }

  /* mobile record card */
  .crm-mcard { border-radius: ${radius.md}px; border: 1px solid ${c.line}; background: ${c.white};
    box-shadow: 0 4px 18px -8px rgba(0,0,0,.55); padding: 13px 14px; display: grid; gap: 9px; cursor: pointer; }
  .crm-mcard:active { transform: scale(.995); }
  .crm-mcard-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .crm-mcard-name { font-weight: 800; font-size: 15px; line-height: 1.25; }
  .crm-mcard-sub { color: ${c.stone}; font-size: 12.5px; margin-top: 2px; }
  .crm-mcard-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .crm-mcard-actions { display: flex; gap: 8px; }

  select option { color: ${c.ink}; background: #fff; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(.8); }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(127,166,232,.22); border-radius: 999px; }

  @media (max-width: 820px) {
    .crm-desk { display: none; }
    .crm-mob { display: block; }
    .crm-hide-mobile, .ops-hide-mobile { display: none !important; }
    .crm-grid2, .ops-grid2 { grid-template-columns: 1fr !important; }
    .crm-stats, .ops-stats { grid-auto-flow: column; grid-template-columns: none; grid-auto-columns: minmax(46%, 1fr);
      overflow-x: auto; scroll-snap-type: x proximity; padding-bottom: 4px; }
    .crm-stats > *, .ops-stats > * { scroll-snap-align: start; }
    .crm-drawer, .ops-drawer { width: 100vw !important; }
    button, select, input { min-height: 44px; }
    .crm-toolgrow { flex: 1 1 100% !important; max-width: none !important; order: 5; }
  }
`;
