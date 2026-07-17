import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  CalendarDays, MessageCircle, User, MapPin, Clock, Check, Hourglass, Send, LogOut, Backpack, ShieldCheck,
  QrCode, X, LifeBuoy, ChevronRight,
} from "lucide-react";
import { c, FONT, radius, shadow, grad } from "../theme.js";
import {
  getTrip, getMessages, sendMessage, getProfile, saveProfile, activityPhoto, tripStages,
} from "./portalData.js";

const money = (n) => (n || n === 0 ? `$${Math.round(n).toLocaleString()}` : "—");
const fmt = (iso) => { const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`); return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); };
const daysUntil = (iso) => { const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`); const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((d - t) / 86400000); };

const TABS = [
  { key: "trip", label: "My Trip", Icon: CalendarDays },
  { key: "messages", label: "Messages", Icon: MessageCircle },
  { key: "account", label: "Account", Icon: User },
];

const input = { width: "100%", background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: radius.sm, color: c.charcoal, fontFamily: FONT, fontSize: 15, padding: "11px 13px", outline: "none" };
const label = { fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 };

export default function Portal({ email, onSignOut }) {
  const [tab, setTab] = useState("trip");
  const [trip, setTrip] = useState(null);
  useEffect(() => { getTrip().then(setTrip); }, []);

  return (
    <div style={{ minHeight: "100vh", background: c.sand, color: c.charcoal, fontFamily: FONT }}>
      <style>{`
        .pt-wrap{max-width:760px;margin:0 auto;padding:16px clamp(14px,4vw,26px) 40px}
        .pt-tabs{position:sticky;top:0;z-index:5;display:flex;justify-content:center;gap:4px;padding:8px clamp(10px,3vw,20px);background:${c.canvas2};border-bottom:1px solid ${c.line}}
        .pt-card{border-radius:${radius.md}px;border:1px solid ${c.line};background:${c.white};box-shadow:${shadow.sm}}
        @media(max-width:560px){.pt-tabs{justify-content:flex-start;overflow-x:auto}}
      `}</style>

      {/* app bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px clamp(14px,4vw,26px)", borderBottom: `1px solid ${c.line}`, background: c.canvas2 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, flex: 1 }}>Tico<span style={{ color: c.gold }}>Wild</span></div>
        <button onClick={onSignOut} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)", color: c.stone, fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <LogOut size={15} /> Sign out
        </button>
      </div>

      <div className="pt-tabs">
        {TABS.map(({ key, label: lab, Icon }) => {
          const on = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: radius.pill, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", background: on ? c.gold : "transparent", color: on ? c.ink : c.stone }}>
              <Icon size={15} /> {lab}
            </button>
          );
        })}
      </div>

      <div className="pt-wrap">
        {tab === "trip" && <TripTab trip={trip} />}
        {tab === "messages" && <MessagesTab />}
        {tab === "account" && <AccountTab email={email} />}
      </div>

      {tab !== "messages" && (
        <button onClick={() => setTab("messages")} title="Chat with your concierge"
          style={{ position: "fixed", right: 18, bottom: 18, zIndex: 40, display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 16px", borderRadius: 999, border: "none", background: c.gold, color: c.ink,
            fontFamily: FONT, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: shadow.glowGold }}>
          <LifeBuoy size={17} /> Need help?
        </button>
      )}
    </div>
  );
}

// ── Voucher ── QR + details a guest shows their guide on arrival ──────────────
function Voucher({ booking, trip, onClose }) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    const payload = `ticowild:voucher:${booking.id}`;
    QRCode.toDataURL(payload, { margin: 1, width: 320, color: { dark: "#0B1A2E", light: "#ffffff" } }).then(setQr).catch(() => {});
  }, [booking.id]);
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(4,10,20,.7)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div className="pt-card" style={{ width: "min(360px,100%)", background: c.canvas2, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${c.line}` }}>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 }}><QrCode size={17} color={c.gold} /> Your voucher</div>
          <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#34D399", fontWeight: 800, fontSize: 13, marginBottom: 14 }}><Check size={15} /> Confirmed</div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 14, display: "inline-block" }}>
            {qr ? <img src={qr} alt="voucher QR" style={{ width: 200, height: 200, display: "block" }} /> : <div style={{ width: 200, height: 200 }} />}
          </div>
          <div style={{ fontWeight: 800, fontSize: 17, marginTop: 16 }}>{booking.name}</div>
          <div style={{ color: c.stone, fontSize: 13.5, marginTop: 2 }}>{booking.operator}</div>
          <div style={{ display: "grid", gap: 4, marginTop: 14, textAlign: "left", fontSize: 13.5 }}>
            <div><b>When</b> · {fmt(booking.date)}, {booking.time}</div>
            <div><b>Meet</b> · {booking.meet}</div>
            <div><b>Guests</b> · {trip?.travelers || 2}</div>
            <div style={{ color: c.stone }}><b style={{ color: c.charcoal }}>Bring</b> · {booking.bring}</div>
          </div>
          <div style={{ marginTop: 16, padding: "9px 12px", borderRadius: radius.sm, background: "rgba(255,208,0,.1)", border: "1px solid rgba(255,208,0,.3)", color: c.gold, fontSize: 12.5, fontWeight: 700 }}>
            Show this QR to your guide on arrival. Works offline.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── My Trip ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const confirmed = status === "Confirmed";
  const col = confirmed ? "#34D399" : c.gold;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, border: `1px solid ${col}55`, background: `${col}1f`, color: col, fontSize: 12, fontWeight: 800 }}>
      {confirmed ? <Check size={13} /> : <Hourglass size={12} />} {status}
    </span>
  );
}

function TripTab({ trip }) {
  const [voucher, setVoucher] = useState(null);
  if (!trip) return <div style={{ padding: 40, textAlign: "center", color: c.stone }}>Loading your trip…</div>;
  const until = daysUntil(trip.start);
  const stageIdx = tripStages.indexOf(trip.status === "Confirmed" ? "Confirmed" : trip.status);
  const balance = trip.total - trip.deposit;
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* hero */}
      <div className="pt-card" style={{ padding: "20px 22px", background: grad.hero, color: "#fff", border: "none" }}>
        <div style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}>{trip.region} · {trip.travelers} travelers</div>
        <div style={{ fontSize: 24, fontWeight: 800, margin: "3px 0 6px" }}>{trip.title}</div>
        <div style={{ fontSize: 14, opacity: .95 }}>
          {fmt(trip.start)} – {fmt(trip.end)} · {until > 0 ? <b>{until} days to go 🌴</b> : until === 0 ? <b>Today!</b> : "In progress"}
        </div>
      </div>

      {/* status stepper */}
      <div className="pt-card" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
          {tripStages.map((s, i) => {
            const done = i <= stageIdx;
            return (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 4, borderRadius: 999, background: done ? c.gold : "rgba(255,255,255,.12)", margin: "0 2px 7px" }} />
                <div style={{ fontSize: 10.5, fontWeight: 700, color: done ? c.charcoal : c.stone }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* itinerary */}
      <div>
        <div style={{ ...label, marginLeft: 2 }}>Your itinerary</div>
        <div style={{ display: "grid", gap: 12 }}>
          {trip.days.map((day) => (
            <div key={day.date}>
              <div style={{ fontWeight: 800, fontSize: 13.5, margin: "4px 2px 8px", color: c.blue }}>{fmt(day.date)}</div>
              {day.items.map((it) => {
                const confirmed = it.status === "Confirmed";
                return (
                  <div key={it.id} className="pt-card" onClick={() => confirmed && setVoucher({ ...it, date: day.date })}
                    style={{ overflow: "hidden", marginBottom: 10, cursor: confirmed ? "pointer" : "default" }}>
                    <div style={{ position: "relative", height: 130 }}>
                      <img src={activityPhoto(it.photo, 800)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(11,26,46,.9), transparent 60%)" }} />
                      <div style={{ position: "absolute", left: 14, bottom: 12, right: 14, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                        <div>
                          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{it.name}</div>
                          <div style={{ color: "rgba(255,255,255,.85)", fontSize: 12.5 }}>{it.operator}</div>
                        </div>
                        <StatusBadge status={it.status} />
                      </div>
                    </div>
                    <div style={{ padding: "12px 15px", display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.charcoal, fontWeight: 700 }}><Clock size={14} color={c.teal} /> {it.time}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.stone }}><MapPin size={14} color={c.teal} /> {it.meet}</span>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, color: c.stone, fontSize: 12.5 }}>
                        <Backpack size={14} color={c.gold} /> Bring: {it.bring}
                      </div>
                      <div style={{ marginTop: 2, paddingTop: 9, borderTop: `1px solid ${c.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {confirmed
                          ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.gold, fontWeight: 800, fontSize: 13 }}><QrCode size={15} /> View voucher <ChevronRight size={14} /></span>
                          : <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.stone, fontWeight: 700, fontSize: 12.5 }}><Hourglass size={13} /> TicoWild is confirming this with the operator</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* payment summary */}
      <div className="pt-card" style={{ padding: "16px 18px" }}>
        <div style={{ ...label }}>Payment</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "3px 0" }}><span style={{ color: c.stone }}>Trip total</span><b>{money(trip.total)}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "3px 0" }}><span style={{ color: c.stone }}>Deposit paid (20%)</span><b style={{ color: "#34D399" }}>{money(trip.deposit)} ✓</b></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0 0", marginTop: 6, borderTop: `1px solid ${c.line}` }}><span style={{ color: c.stone }}>Balance (to operators on arrival)</span><b style={{ color: c.gold }}>{money(balance)}</b></div>
      </div>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center", color: c.stone, fontSize: 12.5 }}>
        <ShieldCheck size={15} color="#34D399" /> Vetted local operators · TicoWild coordinates every confirmation
      </div>

      {voucher && <Voucher booking={voucher} trip={trip} onClose={() => setVoucher(null)} />}
    </div>
  );
}

// ── Messages ────────────────────────────────────────────────────────────────
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  useEffect(() => { getMessages().then(setMessages); }, []);
  const send = async () => { const t = draft.trim(); if (!t) return; setDraft(""); setMessages(await sendMessage(t)); };
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...label, marginLeft: 2 }}>Chat with your TicoWild concierge</div>
      <div className="pt-card" style={{ padding: 14, display: "grid", gap: 10, minHeight: 300 }}>
        {messages.length ? messages.map((m) => {
          const mine = m.from === "customer";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", padding: "10px 13px", borderRadius: 14, fontSize: 14, lineHeight: 1.45, background: mine ? c.gold : "rgba(255,255,255,.06)", color: mine ? c.ink : c.charcoal, border: mine ? "none" : `1px solid ${c.line}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, opacity: .7, marginBottom: 2 }}>{mine ? "You" : "TicoWild concierge"}</div>
                {m.text}
              </div>
            </div>
          );
        }) : <div style={{ color: c.stone, textAlign: "center", padding: "30px 0" }}>Say hello 👋</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Message your concierge…" style={input} />
        <button onClick={send} style={{ padding: "0 16px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center" }}><Send size={16} /></button>
      </div>
      <div style={{ color: c.stone, fontSize: 12, textAlign: "center" }}>A real human on the TicoWild team replies here — and on WhatsApp.</div>
    </div>
  );
}

// ── Account ─────────────────────────────────────────────────────────────────
function AccountTab({ email }) {
  const [f, setF] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { getProfile(email).then((p) => setF({ ...p, email: p.email || email })); }, [email]);
  if (!f) return <div style={{ padding: 40, textAlign: "center", color: c.stone }}>Loading…</div>;
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setSaved(false); };
  const save = async () => { await saveProfile(f); setSaved(true); };
  const Row = ({ k, lab, ph, type }) => (
    <label style={{ display: "block" }}><div style={label}>{lab}</div><input type={type || "text"} value={f[k] || ""} onChange={set(k)} placeholder={ph} style={input} /></label>
  );
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ ...label, marginLeft: 2 }}>Your details</div>
      <div className="pt-card" style={{ padding: 16, display: "grid", gap: 12 }}>
        <Row k="name" lab="Full name" ph="Your name" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Row k="email" lab="Email" ph="you@email.com" type="email" />
          <Row k="phone" lab="Phone / WhatsApp" ph="+1 …" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Row k="country" lab="Country" ph="USA" />
          <Row k="travelers" lab="Travelers" ph="2" />
        </div>
        <label style={{ display: "block" }}><div style={label}>Anything we should know?</div><textarea value={f.notes || ""} onChange={set("notes")} rows={2} placeholder="Dietary needs, mobility, celebrating something…" style={{ ...input, resize: "vertical" }} /></label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={save} style={{ padding: "11px 20px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Save</button>
          {saved && <span style={{ color: "#34D399", fontSize: 13, fontWeight: 700 }}><Check size={14} style={{ verticalAlign: -2 }} /> Saved</span>}
        </div>
      </div>
      <div style={{ color: c.stone, fontSize: 12, textAlign: "center" }}>Signed in as {email} · your inbox is your login — nothing to remember.</div>
    </div>
  );
}
