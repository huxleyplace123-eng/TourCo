// Shared CRM UI atoms + the responsive stylesheet, so the customer and
// operator workspaces render temperature, type and mobile cards identically.
import { c, FONT, radius } from "../theme.js";
import {
  TEMPERATURES, TEMPERATURE_META, OPERATOR_TYPES, operatorType,
} from "./crm-shared.js";

// ── Lead-temperature badge ────────────────────────────────────────────────────
export function TempBadge({ temperature, small, showLabel = true }) {
  const t = TEMPERATURE_META[temperature] || TEMPERATURE_META.Warm;
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

// ── Temperature picker ── four one-tap toggles (cold → fire). Fast to set on a
// row or in a drawer; the active heat glows in its color.
export function TempPicker({ value, onChange, size = "md" }) {
  const dim = size === "sm" ? 26 : 30;
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      style={{ display: "inline-flex", gap: 4, background: "rgba(255,255,255,.05)", border: `1px solid ${c.line}`, borderRadius: 999, padding: 3 }}
    >
      {TEMPERATURES.map((t) => {
        const meta = TEMPERATURE_META[t];
        const on = value === t;
        return (
          <button
            key={t}
            onClick={() => onChange(on ? "Warm" : t)}
            title={`${meta.emoji} ${meta.label}`}
            aria-label={`Set ${meta.label}`}
            style={{
              width: dim, height: dim, borderRadius: 999, border: "none", cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: size === "sm" ? 13 : 15, lineHeight: 1,
              background: on ? meta.color : "transparent",
              boxShadow: on ? `0 0 0 1px ${meta.color}, 0 6px 16px -6px ${meta.color}` : "none",
              filter: on ? "none" : "grayscale(.5) opacity(.6)",
              transition: "all .12s ease",
            }}
          >
            {meta.emoji}
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
