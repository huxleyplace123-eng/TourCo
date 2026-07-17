// OPERATOR PORTAL (prototype) — the scoped, operator-facing view of one
// operator's TicoWild relationship. Opened from the CRM via "Preview portal",
// so the team can see exactly what a partner sees. On the real backend this is
// the same UI behind a per-operator magic-link login; the data comes from
// portal-store (shared with the CRM) instead of localStorage.
import { useMemo, useState } from "react";
import {
  Home, CalendarDays, Ticket, MessageCircle, Building2, ShieldCheck, X,
  Phone, MapPin, Users, Check, ChevronLeft, ChevronRight, Upload, Send, Globe, Mail,
} from "lucide-react";
import { c, FONT, radius, shadow, grad } from "../theme.js";
import { fmtDate } from "./store.js";
import { pct } from "./operators-store.js";
import { TOUR_SEED } from "./operators-data.js";
import { operatorType } from "./crm-shared.js";
import { OperatorAgreement } from "../components/OperatorAgreement.jsx";
import {
  loadPortal, patchPortal, addMessage, setDayAvailability, effectiveProfile, sampleBookings,
} from "./portal-store.js";

const money = (v) => (v === null || v === undefined ? "—" : `$${Math.round(v).toLocaleString()}`);
const p2 = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${p2(m + 1)}-${p2(d)}`;
const todayIso = () => { const d = new Date(); return iso(d.getFullYear(), d.getMonth(), d.getDate()); };

const inputBase = {
  width: "100%", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`,
  borderRadius: radius.sm, color: c.charcoal, fontFamily: FONT, fontSize: 15, padding: "11px 13px", outline: "none",
};
const label = { fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 };

const TABS = [
  { key: "home", label: "Home", Icon: Home },
  { key: "calendar", label: "Calendar", Icon: CalendarDays },
  { key: "bookings", label: "Bookings", Icon: Ticket },
  { key: "tours", label: "Tours", Icon: Ticket },
  { key: "messages", label: "Messages", Icon: MessageCircle },
  { key: "business", label: "My Business", Icon: Building2 },
];

export default function OperatorPortal({ op, onExit }) {
  const [tab, setTab] = useState("home");
  const [portal, setPortal] = useState(() => loadPortal(op.id));
  const sync = () => setPortal(loadPortal(op.id));

  const tours = useMemo(() => TOUR_SEED.filter((t) => t.operatorId === op.id), [op.id]);
  const bookings = useMemo(() => sampleBookings(op, tours), [op.id, tours]);
  const prof = effectiveProfile(op, portal.profile);
  const typeMeta = operatorType(op.type);

  const patch = (p) => { patchPortal(op.id, p); sync(); };
  // A day counts as "open" if it has at least one open hour slot.
  const availableDays = Object.values(portal.availability).filter((day) => day && typeof day === "object" && Object.values(day).includes("open")).length;
  const unread = portal.messages.filter((m) => m.from === "team").length;
  // Live bookings on the calendar = assigned & not declined.
  const calBookings = bookings.filter((b) => portal.bookingResponses[b.id] !== "declined");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: c.sand, color: c.charcoal, fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <style>{`
        .opp-body { flex: 1; overflow-y: auto; }
        .opp-wrap { max-width: 920px; margin: 0 auto; padding: 18px clamp(14px, 4vw, 26px) 40px; }
        .opp-tabs { display: flex; justify-content: center; gap: 4px; overflow-x: auto; padding: 6px clamp(10px,3vw,20px); background: ${c.canvas2}; border-bottom: 1px solid ${c.line}; scrollbar-width: none; }
        .opp-tabs::-webkit-scrollbar { display: none; }
        @media (max-width: 640px) { .opp-tabs { justify-content: flex-start; } }
        .opp-card { border-radius: ${radius.md}px; border: 1px solid ${c.line}; background: ${c.white}; box-shadow: ${shadow.sm}; }
        .opp-cal { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .opp-cal button { aspect-ratio: 1 / 1; }
        .opp-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .opp-grid2 { grid-template-columns: 1fr; } }
        .opp-preview { background: repeating-linear-gradient(45deg, rgba(255,208,0,.12), rgba(255,208,0,.12) 12px, rgba(255,208,0,.05) 12px, rgba(255,208,0,.05) 24px); }
      `}</style>

      {/* preview banner */}
      <div className="opp-preview" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, color: c.gold, borderBottom: `1px solid ${c.line}` }}>
        👁 Preview — this is exactly what {prof.name} sees in their portal
      </div>

      {/* app bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px clamp(14px,4vw,26px)", borderBottom: `1px solid ${c.line}`, background: c.canvas2 }}>
        <Avatar prof={prof} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prof.name}</div>
          <div style={{ color: c.stone, fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: c.gold }}>Tico</span>Wild Partner · {typeMeta.emoji} {typeMeta.label}
          </div>
        </div>
        <button onClick={onExit} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 13px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)", color: c.charcoal, fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <X size={15} /> Exit preview
        </button>
      </div>

      {/* tabs */}
      <div className="opp-tabs">
        {TABS.map(({ key, label: lab, Icon }) => {
          const on = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: radius.pill, border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap",
              background: on ? c.gold : "transparent", color: on ? c.ink : c.stone,
            }}>
              <Icon size={15} /> {lab}
              {key === "messages" && unread > 0 && (
                <span style={{ padding: "0 7px", borderRadius: 999, background: on ? "rgba(11,26,46,.18)" : "rgba(251,112,66,.25)", color: on ? c.ink : "#FB7042", fontSize: 11, fontWeight: 800 }}>{unread}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="opp-body">
        <div className="opp-wrap">
          {tab === "home" && <HomeTab prof={prof} bookings={bookings} responses={portal.bookingResponses} availableDays={availableDays} tours={tours} agreement={portal.agreement} go={setTab} />}
          {tab === "calendar" && <CalendarTab availability={portal.availability} bookings={calBookings} onSetSlot={(date, hour, cur) => patch({ availability: applySlot(portal.availability, date, hour, cur) })} availableDays={availableDays} />}
          {tab === "bookings" && <BookingsTab bookings={bookings} responses={portal.bookingResponses} onRespond={(id, r) => patch({ bookingResponses: { ...portal.bookingResponses, [id]: r } })} />}
          {tab === "tours" && <ToursTab tours={tours} takeRate={op.takeRate} />}
          {tab === "messages" && <MessagesTab messages={portal.messages} onSend={(t) => { addMessage(op.id, "operator", t); sync(); }} name={prof.name} />}
          {tab === "business" && <BusinessTab prof={prof} agreement={portal.agreement} onSave={(profile) => patch({ profile: { ...portal.profile, ...profile } })} onSign={(name) => patch({ agreement: { status: "Signed", signedName: name, signedAt: new Date().toISOString() } })} />}
        </div>
      </div>
    </div>
  );
}

// Per-hour availability cycle: unset → open → closed → unset. Availability is
// nested { "YYYY-MM-DD": { "9": "open" | "closed" } }.
function applySlot(avail, date, hour, cur) {
  const next = { ...avail };
  const day = { ...(next[date] || {}) };
  const order = { undefined: "open", open: "closed", closed: undefined };
  const val = order[cur];
  if (!val) delete day[hour]; else day[hour] = val;
  if (Object.keys(day).length) next[date] = day; else delete next[date];
  return next;
}

// "9:00 AM" / "2:30 PM" → 24h hour integer (9, 14).
function parseHour(t) {
  const m = String(t).match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const pm = /pm/i.test(m[3] || "");
  if (pm && h < 12) h += 12;
  if (!pm && h === 12) h = 0;
  return h;
}

function Avatar({ prof }) {
  const initials = prof.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (prof.logo) return <img src={prof.logo} alt="" style={{ width: 40, height: 40, borderRadius: 11, objectFit: "cover", border: `1px solid ${c.line}` }} />;
  return (
    <div style={{ width: 40, height: 40, borderRadius: 11, background: grad.ocean, color: c.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{initials}</div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 2px 10px" }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{children}</div>
      {right}
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function HomeTab({ prof, bookings, responses, availableDays, tours, agreement, go }) {
  const next = bookings[0];
  const pending = bookings.filter((b) => b.pending && !responses[b.id]).length;
  const stat = (label, value, col, onClick) => (
    <div onClick={onClick} className="opp-card" style={{ padding: "14px 16px", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: col, marginTop: 3 }}>{value}</div>
    </div>
  );
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="opp-card" style={{ padding: "18px 20px", background: grad.hero, color: "#fff", border: "none" }}>
        <div style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}>Welcome back,</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{prof.name.split(/\s+/)[0]} 👋</div>
        <div style={{ fontSize: 13.5, marginTop: 6, opacity: .95 }}>
          {next ? <>Your next TicoWild booking is <b>{fmtDate(next.date)}</b> — {next.guest}, {next.pax} pax.</> : "No upcoming bookings yet."}
        </div>
      </div>

      <div className="opp-grid2">
        {stat("Pending requests", pending, pending ? "#FB7042" : c.stone, () => go("bookings"))}
        {stat("Days open this month", availableDays, c.teal, () => go("calendar"))}
        {stat("Tours listed", tours.length, c.gold, () => go("tours"))}
        {stat("Agreement", agreement.status === "Signed" ? "Signed ✓" : agreement.status, agreement.status === "Signed" ? "#34D399" : c.gold, () => go("business"))}
      </div>

      <div>
        <SectionTitle right={<button onClick={() => go("bookings")} style={linkBtn}>See all</button>}>Upcoming bookings</SectionTitle>
        <div style={{ display: "grid", gap: 10 }}>
          {bookings.slice(0, 3).map((b) => <BookingCard key={b.id} b={b} status={responses[b.id]} compact />)}
        </div>
      </div>
    </div>
  );
}

const linkBtn = { background: "none", border: "none", color: c.teal, fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer" };

// ── Calendar ── month overview → tap a day → hourly slots with live bookings ──
const DAY_HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM … 7 PM
const hourLabel = (h) => { const ap = h < 12 ? "AM" : "PM"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:00 ${ap}`; };

function CalendarTab({ availability, bookings, onSetSlot, availableDays }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayIso());
  const first = new Date(ym.y, ym.m, 1);
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const lead = first.getDay();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthName = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = todayIso();
  const shift = (delta) => setYm(({ y, m }) => { const d = new Date(y, m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });

  // date → { count of bookings, hasOpen }
  const byDay = useMemo(() => {
    const map = {};
    bookings.forEach((b) => { (map[b.date] = map[b.date] || { count: 0 }).count++; });
    return map;
  }, [bookings]);

  const selBookings = bookings.filter((b) => b.date === selected);
  const bookingAtHour = (h) => selBookings.find((b) => parseHour(b.time) === h);
  const daySlots = availability[selected] || {};
  const selDate = new Date(`${selected}T00:00:00`);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* month overview */}
      <div className="opp-card" style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => shift(-1)} style={navBtn}><ChevronLeft size={18} /></button>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{monthName}</div>
        <button onClick={() => shift(1)} style={navBtn}><ChevronRight size={18} /></button>
      </div>

      <div className="opp-card" style={{ padding: "14px 14px 16px" }}>
        <div className="opp-cal" style={{ marginBottom: 6 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", color: c.stone, fontSize: 11, fontWeight: 800, textTransform: "uppercase", paddingBottom: 4 }}>{d}</div>
          ))}
        </div>
        <div className="opp-cal">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const d = iso(ym.y, ym.m, day);
            const info = byDay[d];
            const hasOpen = availability[d] && Object.values(availability[d]).includes("open");
            const isToday = d === today;
            const isSel = d === selected;
            return (
              <button key={i} onClick={() => setSelected(d)} title={info ? `${info.count} booking(s)` : "tap to set hours"}
                style={{
                  border: `1.5px solid ${isSel ? c.gold : isToday ? c.teal : hasOpen ? "rgba(52,211,153,.5)" : c.line}`,
                  background: isSel ? "rgba(255,208,0,.12)" : hasOpen ? "rgba(52,211,153,.1)" : "rgba(255,255,255,.04)",
                  color: c.charcoal, borderRadius: 12, cursor: "pointer", fontFamily: FONT, fontWeight: 800, fontSize: 15,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, minHeight: 46, position: "relative",
                }}>
                {day}
                {info && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 15, height: 15, padding: "0 3px", borderRadius: 999, background: c.gold, color: c.ink, fontSize: 9.5, fontWeight: 800 }}>{info.count}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", color: c.stone, fontSize: 12, fontWeight: 600, marginTop: 12 }}>
          <span><span style={{ color: c.gold }}>●</span> Has bookings</span>
          <span><span style={{ color: "#34D399" }}>●</span> Hours open</span>
          <span><span style={{ color: c.teal }}>◯</span> Today</span>
        </div>
      </div>

      {/* day detail — hourly slots */}
      <div className="opp-card" style={{ padding: "14px 14px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{selDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <span style={{ color: c.stone, fontSize: 12, fontWeight: 700 }}>{selBookings.length} booking{selBookings.length === 1 ? "" : "s"}</span>
        </div>
        <div style={{ color: c.stone, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
          Tap an empty hour to set it <b style={{ color: "#34D399" }}>Open</b> → <b style={{ color: "#FB7042" }}>Closed</b>. Booked hours are locked.
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {DAY_HOURS.map((h) => {
            const bk = bookingAtHour(h);
            const status = daySlots[h];
            if (bk) {
              return (
                <div key={h} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,208,0,.4)", background: "rgba(255,208,0,.1)" }}>
                  <div style={{ width: 58, fontSize: 12, fontWeight: 800, color: c.gold, flexShrink: 0 }}>{bk.time}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5 }}>{bk.guest} · {bk.pax} pax</div>
                    <div style={{ color: c.stone, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bk.tour}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: c.ink, background: c.gold, padding: "3px 9px", borderRadius: 999, flexShrink: 0 }}>BOOKED</span>
                </div>
              );
            }
            const col = status === "open" ? { bg: "rgba(52,211,153,.14)", br: "rgba(52,211,153,.5)", fg: "#34D399", txt: "Open" }
              : status === "closed" ? { bg: "rgba(251,112,66,.12)", br: "rgba(251,112,66,.45)", fg: "#FB7042", txt: "Closed" }
              : { bg: "rgba(255,255,255,.03)", br: c.line, fg: c.stone, txt: "Tap to open" };
            return (
              <button key={h} onClick={() => onSetSlot(selected, h, status)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: `1px solid ${col.br}`, background: col.bg, cursor: "pointer", fontFamily: FONT, textAlign: "left" }}>
                <div style={{ width: 58, fontSize: 12, fontWeight: 800, color: c.stone, flexShrink: 0 }}>{hourLabel(h)}</div>
                <div style={{ flex: 1, color: col.fg, fontWeight: 700, fontSize: 13 }}>{col.txt}</div>
                {status && <span style={{ fontSize: 11, fontWeight: 800, color: col.fg }}>●</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", color: c.charcoal, fontSize: 12.5, fontWeight: 700 }}>{availableDays} day{availableDays === 1 ? "" : "s"} with open hours</div>
    </div>
  );
}
const navBtn = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)", color: c.charcoal, cursor: "pointer" };

// ── Bookings ──────────────────────────────────────────────────────────────────
function BookingCard({ b, status, onRespond, compact }) {
  return (
    <div className="opp-card" style={{ padding: "13px 15px", display: "grid", gap: 9 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>{b.tour}</div>
          <div style={{ color: c.stone, fontSize: 12.5, marginTop: 2, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span><Users size={12} style={{ verticalAlign: -2 }} /> {b.guest} · {b.pax} pax</span>
            <span><MapPin size={12} style={{ verticalAlign: -2 }} /> {b.pickup}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5 }}>{fmtDate(b.date)}</div>
          <div style={{ color: c.teal, fontSize: 12.5, fontWeight: 700 }}>{b.time}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <a href={`tel:${b.maskedPhone.replace(/[^\d+]/g, "")}`} onClick={(e) => e.preventDefault()} title="Masked line — connects without sharing the guest's real number"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.blue, fontSize: 12.5, fontWeight: 700, textDecoration: "none" }}>
          <Phone size={13} /> {b.maskedPhone} <span style={{ color: c.stone, fontWeight: 600 }}>(masked)</span>
        </a>
        {b.operatorNet > 0 && <span style={{ color: c.gold, fontWeight: 800, fontSize: 13 }}>You earn {money(b.operatorNet)}</span>}
      </div>
      {!compact && b.pending && !status && onRespond && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onRespond(b.id, "accepted")} style={{ ...pillBtn, background: "#34D399", color: c.ink, border: "none" }}><Check size={15} /> Accept</button>
          <button onClick={() => onRespond(b.id, "declined")} style={{ ...pillBtn, background: "transparent", color: "#FB7042", border: `1px solid rgba(251,112,66,.5)` }}>Decline</button>
        </div>
      )}
      {status && (
        <div style={{ fontSize: 12.5, fontWeight: 800, color: status === "accepted" ? "#34D399" : "#FB7042" }}>
          {status === "accepted" ? "✓ You accepted this booking" : "✕ You declined — TicoWild has been notified"}
        </div>
      )}
      {compact && b.pending && !status && <div style={{ fontSize: 12, fontWeight: 800, color: "#FB7042" }}>● Needs your response</div>}
    </div>
  );
}
const pillBtn = { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: radius.sm, fontFamily: FONT, fontSize: 13.5, fontWeight: 800, cursor: "pointer" };

function BookingsTab({ bookings, responses, onRespond }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <SectionTitle>Your TicoWild bookings</SectionTitle>
      {bookings.map((b) => <BookingCard key={b.id} b={b} status={responses[b.id]} onRespond={onRespond} />)}
      <div style={{ color: c.stone, fontSize: 12, textAlign: "center", padding: "6px 0" }}>Only bookings TicoWild assigns to you appear here.</div>
    </div>
  );
}

// ── Tours ─────────────────────────────────────────────────────────────────────
function ToursTab({ tours, takeRate }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <SectionTitle right={<span style={{ color: c.gold, fontSize: 12.5, fontWeight: 700 }}>Referral fee {pct(takeRate)}</span>}>Your tours & rates</SectionTitle>
      {tours.length ? tours.map((t) => (
        <div key={t.id} className="opp-card" style={{ padding: "13px 15px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{t.product}</div>
            <div style={{ color: c.stone, fontSize: 12 }}>{t.category}{t.duration ? ` · ${t.duration}` : ""}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 12.5 }}>
            <div>retail <b>{money(t.retail)}</b></div>
            <div style={{ color: c.gold, fontWeight: 700 }}>you net {money(t.suggestedOperatorNet)}</div>
          </div>
        </div>
      )) : <div className="opp-card" style={{ padding: 24, textAlign: "center", color: c.stone }}>No tours listed yet.</div>}
    </div>
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────
function MessagesTab({ messages, onSend, name }) {
  const [draft, setDraft] = useState("");
  const send = () => { const t = draft.trim(); if (t) { onSend(t); setDraft(""); } };
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <SectionTitle>Messages with TicoWild</SectionTitle>
      <div className="opp-card" style={{ padding: 14, display: "grid", gap: 10, minHeight: 240 }}>
        {messages.length ? messages.map((m) => {
          const mine = m.from === "operator";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.4,
                background: mine ? c.gold : "rgba(255,255,255,.06)", color: mine ? c.ink : c.charcoal,
                border: mine ? "none" : `1px solid ${c.line}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, opacity: .7, marginBottom: 2 }}>{mine ? name : "TicoWild team"}</div>
                {m.text}
              </div>
            </div>
          );
        }) : <div style={{ color: c.stone, fontSize: 13, textAlign: "center", padding: "30px 0" }}>No messages yet. Say hello 👋</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Message TicoWild…" style={inputBase} />
        <button onClick={send} style={{ padding: "0 16px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}><Send size={15} /></button>
      </div>
    </div>
  );
}

// ── My Business ───────────────────────────────────────────────────────────────
function BusinessTab({ prof, agreement, onSave, onSign }) {
  const [f, setF] = useState({ name: prof.name, phone: prof.phone, whatsapp: prof.whatsapp, email: prof.email, website: prof.website, blurb: prof.blurb, logo: prof.logo });
  const [saved, setSaved] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const signed = agreement.status === "Signed";
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setSaved(false); };
  const onLogo = (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { setF((x) => ({ ...x, logo: String(r.result) })); setSaved(false); };
    r.readAsDataURL(file);
  };
  const save = () => { onSave(f); setSaved(true); };

  const Row = ({ k, lab, ph }) => (
    <label style={{ display: "block" }}><div style={label}>{lab}</div><input value={f[k]} onChange={set(k)} placeholder={ph} style={inputBase} /></label>
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <SectionTitle>My business</SectionTitle>

      {/* logo */}
      <div className="opp-card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: 16 }}>
        {f.logo
          ? <img src={f.logo} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover", border: `1px solid ${c.line}` }} />
          : <div style={{ width: 64, height: 64, borderRadius: 14, background: grad.ocean, color: c.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22 }}>{(f.name || "?")[0]}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Company logo</div>
          <div style={{ color: c.stone, fontSize: 12, marginBottom: 8 }}>Shown on your bookings and profile.</div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)", color: c.teal, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            <Upload size={14} /> Upload logo
            <input type="file" accept="image/*" onChange={onLogo} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      <div className="opp-card" style={{ padding: "16px" }}>
        <div className="opp-grid2">
          <Row k="name" lab="Company name" ph="Your business name" />
          <Row k="phone" lab="Phone" ph="+506 …" />
          <Row k="whatsapp" lab="WhatsApp" ph="+506 …" />
          <Row k="email" lab="Email" ph="you@company.com" />
          <Row k="website" lab="Website" ph="https://…" />
          <label style={{ display: "block" }}><div style={label}>Short description</div><textarea value={f.blurb} onChange={set("blurb")} placeholder="One line about your tours…" rows={2} style={{ ...inputBase, resize: "vertical" }} /></label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <button onClick={save} style={{ padding: "11px 20px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Save changes</button>
          {saved && <span style={{ color: "#34D399", fontSize: 13, fontWeight: 700 }}><Check size={14} style={{ verticalAlign: -2 }} /> Saved — synced to TicoWild</span>}
        </div>
      </div>

      {/* agreement */}
      <div>
        <SectionTitle>Partner agreement</SectionTitle>
        <div className="opp-card" style={{ padding: "16px", display: "grid", gap: 12, border: `1px solid ${signed ? "rgba(52,211,153,.4)" : c.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={22} color={signed ? "#34D399" : c.gold} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Operator Partner & Booking Fee Agreement</div>
              <div style={{ color: signed ? "#34D399" : c.stone, fontSize: 12.5, fontWeight: 700 }}>
                {signed ? `✓ Signed & completed by ${agreement.signedName} on ${fmtDate(agreement.signedAt)}` : "Not signed yet — required to receive bookings"}
              </div>
            </div>
          </div>
          {signed ? (
            <div style={{ fontSize: 12.5, color: c.stone }}>A signed copy is on file with TicoWild. You downloaded your own copy when you signed.</div>
          ) : (
            <button onClick={() => setShowAgreement(true)}
              style={{ padding: "12px 18px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              Review & sign agreement
            </button>
          )}
        </div>
      </div>

      {showAgreement && (
        <OperatorAgreement
          onClose={() => setShowAgreement(false)}
          onSigned={(info) => onSign(info.signerName || info.legalName || "Operator")}
        />
      )}
    </div>
  );
}
