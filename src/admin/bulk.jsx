// Shared bulk multi-select layer for BOTH CRM workspaces (customers +
// operators). Owns the selection hook, the row/header checkbox, the floating
// action bar, and the email/text compose modal — so "select some rows and act
// on all of them" looks and behaves identically across the two tables.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check, Minus, X, Mail, MessageSquare, MessageCircle, Trash2, Download, Flame,
  CalendarClock, CircleDot, Send, AlertTriangle, ExternalLink, SkipForward,
} from "lucide-react";
import { c, FONT, radius, shadow } from "../theme.js";
import { addDaysIso, todayIso } from "./store.js";

// ── Selection hook ────────────────────────────────────────────────────────────
// `visibleIds` is the id list of the currently filtered/sorted rows. `resetKey`
// is any string the host derives from its filters/search/view — when it changes
// the selection is cleared, so you can never act on rows you can no longer see.
export function useSelection(visibleIds, resetKey) {
  const [selected, setSelected] = useState(() => new Set());

  useEffect(() => { setSelected(new Set()); }, [resetKey]);

  return useMemo(() => {
    const ids = visibleIds.filter((id) => selected.has(id)); // selected AND visible
    const allOn = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
    return {
      selectedIds: ids,
      count: ids.length,
      isSelected: (id) => selected.has(id),
      allVisibleSelected: allOn,
      someVisibleSelected: ids.length > 0,
      toggle: (id) => setSelected((s) => {
        const n = new Set(s);
        if (n.has(id)) n.delete(id); else n.add(id);
        return n;
      }),
      toggleAll: () => setSelected(() => (allOn ? new Set() : new Set(visibleIds))),
      clear: () => setSelected(new Set()),
    };
  }, [selected, visibleIds]);
}

// ── Themed checkbox ── check when on, dash when indeterminate (header). Stops
// propagation so clicking it never opens the row drawer. ──────────────────────
export function SelectCheckbox({ checked, indeterminate, onChange, title, size = 18 }) {
  const mixed = !!indeterminate && !checked;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : !!checked}
      title={title}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`crm-check${checked ? " on" : ""}${mixed ? " mixed" : ""}`}
      style={{ width: size, height: size }}
    >
      {checked ? <Check size={size - 6} strokeWidth={3.5} />
        : mixed ? <Minus size={size - 6} strokeWidth={3.5} /> : null}
    </button>
  );
}

// ── Floating bulk-action bar ── appears only when count >= 1. ─────────────────
function Popover({ open, onToggle, icon, label, children }) {
  return (
    <div style={{ position: "relative" }}>
      <button type="button" className="crm-bulk-btn" aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}>
        {icon} {label}
      </button>
      {open && (
        <div className="crm-bulk-menu" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );
}

export function BulkBar({
  count, onClear, entityLabel = "record",
  statusOptions, onStatus,
  heatOptions, onHeat,
  onFollowUp, onWhatsApp, onEmail, onText, onExport, onDelete,
}) {
  const [menu, setMenu] = useState(null); // "status" | "heat" | "followup" | null
  const pick = (fn) => (...a) => { fn(...a); setMenu(null); };
  const followUps = [["Today", todayIso()], ["+1d", addDaysIso(1)], ["+3d", addDaysIso(3)], ["+1w", addDaysIso(7)]];

  // Close any open popover when the bar loses selection.
  useEffect(() => { if (!count) setMenu(null); }, [count]);
  if (!count) return null;

  return (
    <div className="crm-bulkbar-wrap" onClick={() => setMenu(null)}>
      <div className="crm-bulkbar" onClick={(e) => e.stopPropagation()}>
        <span className="crm-bulkbar-count">
          <span style={{ color: c.gold, fontWeight: 800 }}>{count}</span> selected
        </span>
        <div className="crm-bulkbar-div" />
        <div className="crm-bulkbar-actions">
          <Popover open={menu === "status"} onToggle={() => setMenu((m) => (m === "status" ? null : "status"))}
            icon={<CircleDot size={15} />} label="Status">
            {statusOptions.map((o) => (
              <button key={o.value} className="crm-bulk-menu-item" onClick={() => pick(onStatus)(o.value)}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: o.color || c.stone }} />
                {o.label}
              </button>
            ))}
          </Popover>

          {heatOptions && (
            <Popover open={menu === "heat"} onToggle={() => setMenu((m) => (m === "heat" ? null : "heat"))}
              icon={<Flame size={15} />} label="Heat">
              {heatOptions.map((o) => (
                <button key={o.value || "clear"} className="crm-bulk-menu-item" onClick={() => pick(onHeat)(o.value)}>
                  <span style={{ width: 16, textAlign: "center" }}>{o.emoji || "—"}</span>
                  <span style={{ color: o.color || c.stone }}>{o.label}</span>
                </button>
              ))}
            </Popover>
          )}

          <Popover open={menu === "followup"} onToggle={() => setMenu((m) => (m === "followup" ? null : "followup"))}
            icon={<CalendarClock size={15} />} label="Follow-up">
            {followUps.map(([lab, iso]) => (
              <button key={lab} className="crm-bulk-menu-item" onClick={() => pick(onFollowUp)(iso)}>
                <CalendarClock size={13} style={{ color: c.teal }} /> {lab}
              </button>
            ))}
            <label className="crm-bulk-menu-item" style={{ cursor: "text" }}>
              <span style={{ color: c.stone, fontSize: 12 }}>Pick a date</span>
              <input type="date" onChange={(e) => e.target.value && pick(onFollowUp)(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${c.line}`, borderRadius: 8, color: c.charcoal, fontFamily: FONT, fontSize: 12, padding: "3px 6px" }} />
            </label>
          </Popover>

          <button className="crm-bulk-btn crm-bulk-wa" onClick={onWhatsApp}><MessageCircle size={15} /> WhatsApp</button>
          <button className="crm-bulk-btn" onClick={onEmail}><Mail size={15} /> Email</button>
          <button className="crm-bulk-btn" onClick={onText}><MessageSquare size={15} /> Text</button>
          <button className="crm-bulk-btn" onClick={onExport}><Download size={15} /> Export</button>
          <button className="crm-bulk-btn crm-bulk-danger" onClick={onDelete}><Trash2 size={15} /> Delete</button>
        </div>
        <button className="crm-bulkbar-x" title="Clear selection" aria-label="Clear selection" onClick={onClear}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Email / Text compose modal ────────────────────────────────────────────────
// `recipients`: [{ id, name, email, phone }]. Email mode builds a mailto with
// everyone BCC'd; text mode is fully built but inert (no SMS provider yet).
export function ComposeModal({ mode, entityLabel = "recipient", recipients, onClose, onSend }) {
  const isEmail = mode === "email";
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const channelOf = (r) => (isEmail ? r.email : r.phone);
  const included = recipients.filter((r) => channelOf(r));
  const skipped = recipients.filter((r) => !channelOf(r));
  const canSend = isEmail && included.length > 0;

  const label = { fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 };
  const field = { ...inputBase };

  return (
    <div className="crm-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(4,10,20,.6)", backdropFilter: "blur(3px)", zIndex: 70, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "6vh 12px 8vh" }}>
      <div style={{ width: "min(560px, 100%)", borderRadius: radius.lg, border: `1px solid ${c.line}`, background: c.canvas2, boxShadow: shadow.xl, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${c.line}` }}>
          {isEmail ? <Mail size={18} color={c.teal} /> : <MessageSquare size={18} color={c.gold} />}
          <div style={{ fontSize: 17, fontWeight: 800, flex: 1, marginLeft: 10 }}>
            {isEmail ? "Email" : "Text"} {included.length || recipients.length} {entityLabel}{(included.length || recipients.length) === 1 ? "" : "s"}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 6 }}><X size={20} /></button>
        </div>

        <div style={{ padding: 20, display: "grid", gap: 14 }}>
          {!isEmail && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", borderRadius: radius.sm, background: "rgba(255,208,0,.1)", border: "1px solid rgba(255,208,0,.35)", color: c.gold, fontSize: 12.5, fontWeight: 700 }}>
              <AlertTriangle size={15} /> SMS isn't connected yet — this will send once texting is wired up.
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12.5, color: c.stone }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(34,211,238,.12)", border: `1px solid ${c.teal}55`, color: c.teal, fontWeight: 700 }}>
              {isEmail ? "BCC" : "To"} · {included.length} {included.length === 1 ? entityLabel : `${entityLabel}s`}
            </span>
            {skipped.length > 0 && (
              <span title={skipped.map((r) => r.name).join(", ")} style={{ color: c.stone }}>
                {skipped.length} skipped (no {isEmail ? "email" : "phone"})
              </span>
            )}
          </div>

          <div style={{ fontSize: 12.5, color: c.charcoal, maxHeight: 76, overflowY: "auto", lineHeight: 1.5 }}>
            {included.map((r) => r.name).join(", ") || <span style={{ color: "#F87171" }}>No {isEmail ? "email addresses" : "phone numbers"} in this selection.</span>}
          </div>

          {isEmail && (
            <label>
              <div style={label}>Subject</div>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} style={field} placeholder="A quick note from TicoWild" />
            </label>
          )}
          <label>
            <div style={label}>Message</div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
              style={{ ...field, resize: "vertical", minHeight: 120 }}
              placeholder={isEmail ? "Write your message…" : "Your text message…"} />
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center", padding: "14px 20px", borderTop: `1px solid ${c.line}` }}>
          <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "transparent", color: c.stone, fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Cancel</button>
          <button
            disabled={!canSend}
            title={isEmail ? (canSend ? "" : "No email addresses in this selection") : "Texting isn't connected yet"}
            onClick={() => { if (canSend) { onSend({ subject, body }); } }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: radius.sm, border: "none",
              background: canSend ? c.gold : "rgba(255,255,255,.12)", color: canSend ? c.ink : c.stone,
              fontFamily: FONT, fontWeight: 800, fontSize: 13.5, cursor: canSend ? "pointer" : "not-allowed",
            }}>
            <Send size={15} /> {isEmail ? "Open in mail app" : "Send text"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp guided send ──────────────────────────────────────────────────────
// Bulk WhatsApp from the team's OWN number: compose once, then step through each
// contact — open their chat with the message pre-filled (they tap send in
// WhatsApp), log it, advance. One click per contact keeps every window.open a
// real user gesture (never popup-blocked) and matches WhatsApp's no-silent-bulk
// rule for personal numbers.
const firstNameOf = (name) => String(name || "").trim().split(/\s+/)[0] || "there";
const fillTemplate = (msg, name) => String(msg || "").replace(/\{name\}/g, firstNameOf(name));
const hasDigits = (n) => !!String(n || "").replace(/\D/g, "");

export function WhatsAppSendModal({ recipients, onClose, onSent }) {
  const included = recipients.filter((r) => hasDigits(r.number));
  const skipped = recipients.filter((r) => !hasDigits(r.number));
  const [phase, setPhase] = useState("compose"); // "compose" | "send" | "done"
  const [message, setMessage] = useState("");
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(() => new Set()); // ids whose WhatsApp was opened
  const taRef = useRef(null);

  const current = included[idx];
  const label = { fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 };

  const insertName = () => {
    const ta = taRef.current;
    const s = ta?.selectionStart ?? message.length;
    const e = ta?.selectionEnd ?? message.length;
    setMessage((m) => m.slice(0, s) + "{name}" + m.slice(e));
    if (ta) requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + 6; });
  };
  const openCurrent = () => {
    const href = waHref(current.number, fillTemplate(message, current.name));
    if (href) window.open(href, "_blank", "noopener");
    onSent?.(current.id);
    setDone((d) => new Set(d).add(current.id));
  };
  const next = () => { if (idx + 1 >= included.length) setPhase("done"); else setIdx(idx + 1); };

  const wrap = (children) => (
    <div className="crm-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(4,10,20,.6)", backdropFilter: "blur(3px)", zIndex: 70, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "6vh 12px 8vh" }}>
      <div style={{ width: "min(560px, 100%)", borderRadius: radius.lg, border: `1px solid ${c.line}`, background: c.canvas2, boxShadow: shadow.xl, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
  const head = (title) => (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${c.line}` }}>
      <MessageCircle size={18} color="#25D366" />
      <div style={{ fontSize: 17, fontWeight: 800, flex: 1, marginLeft: 10 }}>{title}</div>
      <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 6 }}><X size={20} /></button>
    </div>
  );

  if (phase === "compose") {
    return wrap(<>
      {head(`WhatsApp ${included.length} ${included.length === 1 ? "contact" : "contacts"}`)}
      <div style={{ padding: 20, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12.5 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(37,211,102,.14)", border: "1px solid rgba(37,211,102,.4)", color: "#25D366", fontWeight: 700 }}>
            {included.length} on WhatsApp
          </span>
          {skipped.length > 0 && (
            <span title={skipped.map((r) => r.name).join(", ")} style={{ color: c.stone }}>
              {skipped.length} skipped (no number)
            </span>
          )}
        </div>
        <label>
          <div style={{ ...label, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Message</span>
            <button type="button" onClick={insertName} style={{ all: "unset", cursor: "pointer", color: c.teal, fontSize: 11.5, fontWeight: 700 }}>+ Insert {"{name}"}</button>
          </div>
          <textarea ref={taRef} value={message} onChange={(e) => setMessage(e.target.value)} rows={6}
            style={{ ...inputBase, resize: "vertical", minHeight: 120 }} placeholder="Hi {name}, this is TicoWild — ..." />
        </label>
        {message.includes("{name}") && included[0] && (
          <div style={{ fontSize: 12.5, color: c.stone }}>
            Preview for <b style={{ color: c.charcoal }}>{firstNameOf(included[0].name)}</b>:{" "}
            <span style={{ color: c.charcoal }}>{fillTemplate(message, included[0].name)}</span>
          </div>
        )}
        {!included.length && <div style={{ color: "#F87171", fontSize: 13 }}>None of the selected {skipped.length === 1 ? "contact has" : "contacts have"} a WhatsApp number.</div>}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "14px 20px", borderTop: `1px solid ${c.line}` }}>
        <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "transparent", color: c.stone, fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Cancel</button>
        <button disabled={!included.length} onClick={() => { setIdx(0); setPhase("send"); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: radius.sm, border: "none",
            background: included.length ? "#25D366" : "rgba(255,255,255,.12)", color: included.length ? "#0B1A2E" : c.stone,
            fontFamily: FONT, fontWeight: 800, fontSize: 13.5, cursor: included.length ? "pointer" : "not-allowed" }}>
          <Send size={15} /> Start sending
        </button>
      </div>
    </>);
  }

  if (phase === "done") {
    return wrap(<>
      {head("All done")}
      <div style={{ padding: "28px 20px", textAlign: "center", display: "grid", gap: 8 }}>
        <div style={{ fontSize: 40 }}>✅</div>
        <div style={{ fontSize: 17, fontWeight: 800 }}>{done.size} contacted on WhatsApp</div>
        <div style={{ color: c.stone, fontSize: 13 }}>Each was logged with today's date.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 20px", borderTop: `1px solid ${c.line}` }}>
        <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontFamily: FONT, fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}>Close</button>
      </div>
    </>);
  }

  // step-through
  const opened = done.has(current.id);
  return wrap(<>
    {head(`Contact ${idx + 1} of ${included.length}`)}
    <div style={{ padding: "16px 20px 6px" }}>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.round((done.size / included.length) * 100)}%`, background: "#25D366", transition: "width .2s ease" }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0 4px" }}>
        {included.map((r, i) => (
          <span key={r.id} title={r.name} style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700,
            border: `1px solid ${done.has(r.id) ? "rgba(37,211,102,.5)" : i === idx ? c.gold : c.line}`,
            background: done.has(r.id) ? "rgba(37,211,102,.12)" : i === idx ? "rgba(255,208,0,.1)" : "transparent",
            color: done.has(r.id) ? "#25D366" : i === idx ? c.gold : c.stone,
          }}>{done.has(r.id) ? "✓ " : ""}{firstNameOf(r.name)}</span>
        ))}
      </div>
    </div>
    <div style={{ padding: "10px 20px 20px" }}>
      <div style={{ padding: "12px 14px", borderRadius: radius.md, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.03)" }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{current.name}</div>
        <div style={{ color: c.stone, fontSize: 12.5, marginTop: 2 }}>{current.number}</div>
        <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap", color: c.charcoal }}>
          {fillTemplate(message, current.name) || <span style={{ color: c.stone }}>(no message — opens an empty chat)</span>}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: `1px solid ${c.line}` }}>
      <button onClick={next} style={{ all: "unset", cursor: "pointer", color: c.stone, fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
        <SkipForward size={13} /> Skip
      </button>
      {opened ? (
        <button onClick={next} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          {idx + 1 >= included.length ? "Finish" : "Next contact"} →
        </button>
      ) : (
        <button onClick={openCurrent} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: radius.sm, border: "none", background: "#25D366", color: "#0B1A2E", fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          <ExternalLink size={15} /> Open WhatsApp for {firstNameOf(current.name)}
        </button>
      )}
    </div>
  </>);
}

const inputBase = {
  width: "100%", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`,
  borderRadius: radius.sm, color: c.charcoal, fontFamily: FONT, fontSize: 14, padding: "9px 12px", outline: "none",
};

// ── Helpers the hosts use ─────────────────────────────────────────────────────
export function downloadCsv(text, filename) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Build a mailto: with every address BCC'd (so recipients can't see each other)
// and open the OS mail client. Returns the count actually addressed.
export function openBulkEmail(emails, subject, body) {
  const list = [...new Set(emails.filter(Boolean))];
  if (!list.length) return 0;
  const url = `mailto:?bcc=${encodeURIComponent(list.join(","))}`
    + `&subject=${encodeURIComponent(subject || "")}`
    + `&body=${encodeURIComponent(body || "")}`;
  window.location.href = url;
  return list.length;
}

// Click-to-chat link for one recipient with the message pre-filled. Null if the
// number has no digits.
export function waHref(number, text) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
