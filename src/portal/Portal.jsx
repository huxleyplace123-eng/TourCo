import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  CalendarDays, MessageCircle, User, MapPin, Clock, Check, Hourglass, Send, LogOut, Backpack, ShieldCheck,
  QrCode, X, LifeBuoy, ChevronRight, Navigation, ExternalLink,
} from "lucide-react";
import { c, FONT, radius, shadow, grad } from "../theme.js";
import {
  getTrip, getMessages, sendMessage, getProfile, saveProfile, activityPhoto, tripStages,
} from "./portalData.js";
import GuestMeetingMap, { guestDirectionsUrl } from "./GuestMeetingMap.jsx";

const money = (n) => (n || n === 0 ? `$${Math.round(n).toLocaleString()}` : "—");
const fmt = (iso) => { const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`); return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); };
const daysUntil = (iso) => { const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`); const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((d - t) / 86400000); };

const TABS = [
  { key: "trip", label: "My Trip", Icon: CalendarDays },
  { key: "messages", label: "Messages", Icon: MessageCircle },
  { key: "account", label: "Account", Icon: User },
];

const input = { width: "100%", boxSizing: "border-box", background: "#fff", border: "1px solid #DDE2E6", borderRadius: radius.sm, color: "#172532", fontFamily: FONT, fontSize: 15, padding: "12px 13px", outline: "none" };
const label = { fontSize: 11.5, fontWeight: 800, color: "#65727D", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 };

export default function Portal({ email, onSignOut }) {
  const [tab, setTab] = useState("trip");
  const [trip, setTrip] = useState(undefined);
  const [tripError, setTripError] = useState("");
  const loadTrip = () => { setTrip(undefined); setTripError(""); getTrip().then(setTrip).catch((err) => { setTrip(null); setTripError(err.message); }); };
  useEffect(() => { loadTrip(); }, []);

  return (
    <div className="customer-portal" style={{ minHeight: "100vh", background: "#F5F4F0", color: "#172532", fontFamily: FONT }}>
      <style>{`
        .pt-wrap{max-width:1120px;margin:0 auto;padding:28px clamp(16px,4vw,32px) 70px}
        .customer-app-bar{position:sticky;top:0;z-index:12;background:rgba(255,255,255,.94)!important;border-bottom:1px solid #E5E7E9!important;backdrop-filter:blur(16px)}
        .customer-brand{color:#172532;font-size:23px!important;letter-spacing:-.05em!important}
        .customer-brand span{color:#0A8174!important}
        .customer-signout{border-color:#E1E4E7!important;background:#fff!important;color:#53616D!important}
        .pt-tabs{position:sticky;top:59px;z-index:10;display:flex;justify-content:center;gap:7px;padding:10px clamp(10px,3vw,20px);background:rgba(255,255,255,.94);border-bottom:1px solid #E5E7E9;backdrop-filter:blur(16px)}
        .pt-tabs button{min-height:42px;padding-inline:20px!important;color:#56636F!important}
        .pt-tabs button[data-active="true"]{background:#13283D!important;color:#fff!important;box-shadow:0 8px 20px rgba(19,40,61,.16)}
        .pt-card{border-radius:20px;border:1px solid #E4E7E9!important;background-color:#fff!important;color:#172532!important;box-shadow:0 12px 35px rgba(19,40,61,.07)!important}
        .guest-trip-view{gap:22px!important}
        .guest-trip-hero{position:relative;min-height:250px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;padding:30px!important;border-radius:28px!important;background-position:center!important;background-size:cover!important;color:#fff!important;box-shadow:0 22px 55px rgba(19,40,61,.18)!important}
        .guest-trip-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,24,38,.08),rgba(10,24,38,.82));pointer-events:none}
        .guest-trip-hero>*{position:relative;z-index:1}
        .guest-trip-eyebrow{display:inline-flex;align-self:flex-start;margin-bottom:auto;padding:7px 11px;border:1px solid rgba(255,255,255,.48);border-radius:999px;background:rgba(255,255,255,.92);color:#0A8174;font-size:10px!important;font-weight:900!important;letter-spacing:.08em;text-transform:uppercase;opacity:1!important}
        .guest-trip-title{font-size:clamp(30px,5vw,48px)!important;line-height:1!important;letter-spacing:-.055em!important}
        .guest-trip-meta{font-size:14px!important;opacity:.94!important}
        .guest-progress{padding:18px 20px!important;border-radius:18px!important}
        .guest-progress-label{color:#687581!important}
        .guest-progress-label.is-done{color:#172532!important}
        .guest-progress-bar{background:#E7E9EB!important}
        .guest-progress-bar.is-done{background:#0A8174!important}
        .guest-itinerary-heading{margin:4px 2px 0;color:#687581;font-size:11px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
        .guest-itinerary-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px!important}
        .guest-day{min-width:0}
        .guest-day-date{margin:0 2px 8px!important;color:#314251!important;font-size:13px!important}
        .guest-booking-card{overflow:hidden;margin:0!important;border-radius:22px!important;transition:transform .18s ease,box-shadow .18s ease}
        .guest-booking-card[data-clickable="true"]:hover{transform:translateY(-3px);box-shadow:0 18px 40px rgba(19,40,61,.13)!important}
        .guest-booking-photo{height:190px!important}
        .guest-booking-body{padding:15px 17px 16px!important;gap:10px!important}
        .guest-booking-body span{color:#63707B!important}
        .guest-booking-body .guest-booking-time{color:#172532!important}
        .guest-booking-action{color:#0A8174!important;font-size:13px!important}
        .guest-payment{padding:20px 22px!important}
        .guest-payment span{color:#63707B!important}
        .guest-payment b{color:#172532}
        .guest-trust{color:#65727D!important}
        .guest-booking-overlay{background:rgba(13,27,40,.62)!important;backdrop-filter:blur(8px)!important}
        .guest-booking-modal{background:#fff!important;color:#172532!important;border:1px solid rgba(255,255,255,.8)!important;box-shadow:0 35px 100px rgba(10,24,38,.34)!important}
        .guest-booking-header{background:#fff;border-bottom:1px solid #E5E7E9!important;color:#172532}
        .guest-booking-header button{color:#50606D!important}
        .guest-booking-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;align-items:stretch}
        .guest-voucher-qr{display:block;width:176px;height:176px}
        .guest-booking-summary,.guest-meeting-panel{padding:18px;border:1px solid #E5E7E9;border-radius:20px;background:#FAFAF8;color:#172532}
        .guest-booking-facts{display:grid;gap:9px;margin-top:16px;text-align:left}
        .guest-booking-facts>div{display:grid;gap:3px;padding:10px 11px;border-radius:12px;background:#fff;border:1px solid #E5E7E9;font-size:12.5px}
        .guest-booking-facts b{color:#0A8174;font-size:9px;letter-spacing:.08em;text-transform:uppercase}
        .guest-booking-facts span{color:#172532;font-weight:700;line-height:1.4}
        .guest-meeting-panel{display:grid;grid-template-rows:auto minmax(260px,1fr) auto auto;gap:13px;padding:14px}
        .guest-meeting-copy{padding:4px 5px 0}
        .guest-meeting-kicker{display:flex;align-items:center;gap:7px;color:#0A8174;font-size:10px;font-weight:900;letter-spacing:.1em}
        .guest-meeting-copy h3{margin:7px 0 5px;color:#172532;font-size:21px;letter-spacing:-.03em}
        .guest-meeting-copy p{margin:0;color:#66727C;font-size:12.5px;line-height:1.55}
        .guest-directions-button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 16px;border-radius:13px;background:${c.gold};color:${c.ink};font-size:13px;font-weight:900;text-decoration:none;box-shadow:${shadow.glowGold}}
        .guest-directions-button:hover{transform:translateY(-1px);filter:brightness(1.03)}
        .guest-privacy-note{display:flex;align-items:flex-start;gap:7px;padding:0 4px;color:#66727C;font-size:10.5px;line-height:1.45}
        .guest-privacy-note svg{flex:0 0 auto;color:#34D399;margin-top:1px}
        .guest-message-bubble{background:#F2F4F4!important;color:#172532!important;border:1px solid #E3E6E8!important;box-shadow:0 4px 14px rgba(19,40,61,.045)}
        .guest-message-bubble[data-mine="true"]{background:#13283D!important;color:#fff!important;border-color:#13283D!important}
        @media(max-width:700px){
          .pt-tabs{justify-content:flex-start;overflow-x:auto}
          .pt-wrap{padding:18px 12px 92px}
          .guest-trip-hero{min-height:220px;padding:22px!important;border-radius:22px!important}
          .guest-trip-title{font-size:31px!important}
          .guest-progress{overflow-x:auto;padding:15px 12px!important}
          .guest-progress>div{min-width:480px}
          .guest-itinerary-grid{grid-template-columns:1fr;gap:15px!important}
          .guest-booking-photo{height:180px!important}
          .guest-booking-modal{max-height:calc(100dvh - 20px)!important;border-radius:20px!important}
          .guest-booking-layout{grid-template-columns:1fr;gap:12px;padding:12px!important}
          .guest-booking-summary,.guest-meeting-panel{padding:14px;border-radius:17px}
          .guest-voucher-qr{width:138px;height:138px}
          .guest-booking-facts{grid-template-columns:1fr 1fr;gap:7px}
          .guest-booking-facts>div:last-child{grid-column:1/-1}
          .guest-meeting-panel{grid-template-rows:auto 240px auto auto}
          .guest-meeting-copy h3{font-size:19px}
          .guest-directions-button{min-height:48px}
        }
      `}</style>

      {/* app bar */}
      <div className="customer-app-bar" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px clamp(14px,4vw,26px)" }}>
        <div className="customer-brand" style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, flex: 1 }}>Tico<span>Wild</span></div>
        <button className="customer-signout" onClick={onSignOut} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: radius.sm, fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <LogOut size={15} /> Sign out
        </button>
      </div>

      <div className="pt-tabs">
        {TABS.map(({ key, label: lab, Icon }) => {
          const on = tab === key;
          return (
            <button key={key} data-active={on} onClick={() => setTab(key)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: radius.pill, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", background: "transparent" }}>
              <Icon size={15} /> {lab}
            </button>
          );
        })}
      </div>

      <div className="pt-wrap">
        {tab === "trip" && <TripTab trip={trip} error={tripError} onRetry={loadTrip} />}
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
  const directionsUrl = guestDirectionsUrl(booking);
  useEffect(() => {
    const payload = `ticowild:voucher:${booking.id}`;
    QRCode.toDataURL(payload, { margin: 1, width: 320, color: { dark: "#0B1A2E", light: "#ffffff" } }).then(setQr).catch(() => {});
  }, [booking.id]);
  return (
    <div className="guest-booking-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(4,10,20,.7)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div className="pt-card guest-booking-modal" style={{ width: "min(920px,100%)", maxHeight: "calc(100dvh - 36px)", background: c.canvas2, overflow: "auto" }}>
        <div className="guest-booking-header" style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${c.line}` }}>
          <div style={{ flex: 1, fontWeight: 800, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 }}><QrCode size={17} color={c.gold} /> Your booking details</div>
          <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 4 }}><X size={20} /></button>
        </div>
        <div className="guest-booking-layout" style={{ padding: 20 }}>
          <div className="guest-booking-summary" style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#34D399", fontWeight: 800, fontSize: 13, marginBottom: 14 }}><Check size={15} /> Confirmed</div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 12, display: "inline-block" }}>
              {qr ? <img className="guest-voucher-qr" src={qr} alt="voucher QR" /> : <div className="guest-voucher-qr" />}
            </div>
            <div style={{ fontWeight: 800, fontSize: 19, marginTop: 15 }}>{booking.name}</div>
            <div style={{ color: c.stone, fontSize: 13.5, marginTop: 2 }}>{booking.operator}</div>
            <div className="guest-booking-facts">
              <div><b>When</b><span>{fmt(booking.date)}, {booking.time}</span></div>
              <div><b>Guests</b><span>{trip?.travelers || 2}</span></div>
              <div><b>Bring</b><span>{booking.bring}</span></div>
            </div>
            <div style={{ marginTop: 14, padding: "9px 12px", borderRadius: radius.sm, background: "rgba(255,208,0,.1)", border: "1px solid rgba(255,208,0,.3)", color: c.gold, fontSize: 12.5, fontWeight: 700 }}>
              Show this QR to your guide on arrival. It works offline.
            </div>
          </div>
          <div className="guest-meeting-panel">
            <div className="guest-meeting-copy">
              <div className="guest-meeting-kicker"><Navigation size={14} /> YOUR MEETING POINT</div>
              <h3>{booking.meetingPoint?.name || booking.meet}</h3>
              <p>{booking.meetingPoint?.instructions || booking.meet}</p>
            </div>
            <GuestMeetingMap booking={booking} />
            {directionsUrl && <a className="guest-directions-button" href={directionsUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open turn-by-turn directions</a>}
            <div className="guest-privacy-note"><ShieldCheck size={14} /> Only the booking information you need is shown here. Private operator CRM information stays private.</div>
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

function TripTab({ trip, error, onRetry }) {
  const [voucher, setVoucher] = useState(null);
  if (trip === undefined) return <PortalNotice title="Loading your trip…" body="Getting the latest itinerary and confirmations." />;
  if (error) return <PortalNotice title="We couldn't load your trip" body={error} action="Try again" onAction={onRetry} tone="error" />;
  if (!trip) return <PortalNotice title="Your trip is ready for the next step" body="There is no itinerary on this account yet. Your TicoWild concierge will add it here as soon as planning begins." />;
  const until = daysUntil(trip.start);
  const stageIdx = tripStages.indexOf(trip.status === "Confirmed" ? "Confirmed" : trip.status);
  const balance = trip.total - trip.deposit;
  const heroPhoto = trip.days?.[0]?.items?.[0]?.photo;
  return (
    <div className="guest-trip-view" style={{ display: "grid", gap: 16 }}>
      {/* hero */}
      <div className="pt-card guest-trip-hero" style={{ padding: "20px 22px", backgroundImage: `url(${activityPhoto(heroPhoto, 1400)})`, color: "#fff", border: "none" }}>
        <div className="guest-trip-eyebrow" style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}>Confirmed Costa Rica journey</div>
        <div className="guest-trip-title" style={{ fontSize: 24, fontWeight: 800, margin: "3px 0 8px" }}>{trip.title}</div>
        <div className="guest-trip-meta" style={{ fontSize: 14, opacity: .95 }}>
          {trip.region} · {trip.travelers} travelers<br />
          {fmt(trip.start)} – {fmt(trip.end)} · {until > 0 ? <b>{until} days to go 🌴</b> : until === 0 ? <b>Today!</b> : "In progress"}
        </div>
      </div>

      {/* status stepper */}
      <div className="pt-card guest-progress" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
          {tripStages.map((s, i) => {
            const done = i <= stageIdx;
            return (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div className={`guest-progress-bar ${done ? "is-done" : ""}`} style={{ height: 4, borderRadius: 999, margin: "0 2px 7px" }} />
                <div className={`guest-progress-label ${done ? "is-done" : ""}`} style={{ fontSize: 10.5, fontWeight: 700 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* itinerary */}
      <div>
        <div className="guest-itinerary-heading">Your itinerary</div>
        <div className="guest-itinerary-grid" style={{ display: "grid", gap: 12 }}>
          {trip.days.map((day) => (
            <div className="guest-day" key={day.date}>
              <div className="guest-day-date" style={{ fontWeight: 800, fontSize: 13.5, margin: "4px 2px 8px" }}>{fmt(day.date)}</div>
              {day.items.map((it) => {
                const confirmed = it.status === "Confirmed";
                return (
                  <div key={it.id} className="pt-card guest-booking-card" data-clickable={confirmed} onClick={() => confirmed && setVoucher({ ...it, date: day.date })}
                    style={{ overflow: "hidden", marginBottom: 10, cursor: confirmed ? "pointer" : "default" }}>
                    <div className="guest-booking-photo" style={{ position: "relative", height: 130 }}>
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
                    <div className="guest-booking-body" style={{ padding: "12px 15px", display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
                        <span className="guest-booking-time" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}><Clock size={14} color="#0A8174" /> {it.time}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: c.stone }}><MapPin size={14} color={c.teal} /> {it.meet}</span>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, color: c.stone, fontSize: 12.5 }}>
                        <Backpack size={14} color={c.gold} /> Bring: {it.bring}
                      </div>
                      <div style={{ marginTop: 2, paddingTop: 9, borderTop: `1px solid ${c.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {confirmed
                          ? <span className="guest-booking-action" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 13 }}><MapPin size={15} /> View meeting point & voucher <ChevronRight size={14} /></span>
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
      <div className="pt-card guest-payment" style={{ padding: "16px 18px" }}>
        <div style={{ ...label }}>Payment</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "3px 0" }}><span style={{ color: c.stone }}>Trip total</span><b>{money(trip.total)}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "3px 0" }}><span style={{ color: c.stone }}>Deposit paid (20%)</span><b style={{ color: "#34D399" }}>{money(trip.deposit)} ✓</b></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0 0", marginTop: 6, borderTop: `1px solid ${c.line}` }}><span style={{ color: c.stone }}>Balance (to operators on arrival)</span><b style={{ color: c.gold }}>{money(balance)}</b></div>
      </div>

      <div className="guest-trust" style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 12.5 }}>
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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { getMessages().then(setMessages).catch((err) => setError(err.message)); }, []);
  const send = async () => { const t = draft.trim(); if (!t || busy) return; setBusy(true); setError(""); try { setMessages(await sendMessage(t)); setDraft(""); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...label, marginLeft: 2 }}>Chat with your TicoWild concierge</div>
      <div className="pt-card" style={{ padding: 14, display: "grid", gap: 10, minHeight: 300 }}>
        {messages.length ? messages.map((m) => {
          const mine = m.from === "customer";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div className="guest-message-bubble" data-mine={mine} style={{ maxWidth: "80%", padding: "10px 13px", borderRadius: 14, fontSize: 14, lineHeight: 1.45 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, opacity: .7, marginBottom: 2 }}>{mine ? "You" : "TicoWild concierge"}</div>
                {m.text}
              </div>
            </div>
          );
        }) : <div style={{ color: c.stone, textAlign: "center", padding: "30px 0" }}>Say hello 👋</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Message your concierge…" style={input} />
        <button onClick={send} disabled={busy} aria-label="Send message" style={{ padding: "0 16px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontWeight: 800, cursor: busy ? "wait" : "pointer", display: "inline-flex", alignItems: "center", opacity: busy ? .65 : 1 }}><Send size={16} /></button>
      </div>
      {error&&<div role="alert" style={{ padding:"10px 12px",borderRadius:radius.sm,border:"1px solid rgba(248,113,113,.28)",background:"rgba(248,113,113,.08)",color:"#FCA5A5",fontSize:12.5 }}>{error}</div>}
      <div style={{ color: c.stone, fontSize: 12, textAlign: "center" }}>A real human on the TicoWild team replies here — and on WhatsApp.</div>
    </div>
  );
}

// ── Account ─────────────────────────────────────────────────────────────────
function AccountTab({ email }) {
  const [f, setF] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(() => { getProfile(email).then((p) => setF({ ...p, email: p.email || email })).catch((err)=>setError(err.message)); }, [email]);
  if (!f) return error?<PortalNotice title="We couldn't load your profile" body={error} tone="error"/>:<PortalNotice title="Loading your account…" body="Getting your saved traveler details."/>;
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setSaved(false); };
  const save = async () => { setBusy(true);setError("");try{setF(await saveProfile(f));setSaved(true);}catch(err){setError(err.message);}finally{setBusy(false);} };
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
          <button onClick={save} disabled={busy} style={{ padding: "11px 20px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: busy ? "wait" : "pointer", opacity: busy ? .65 : 1 }}>{busy ? "Saving…" : "Save"}</button>
          {saved && <span style={{ color: "#34D399", fontSize: 13, fontWeight: 700 }}><Check size={14} style={{ verticalAlign: -2 }} /> Saved</span>}
        </div>
        {error&&<div role="alert" style={{ padding:"10px 12px",borderRadius:radius.sm,border:"1px solid rgba(248,113,113,.28)",background:"rgba(248,113,113,.08)",color:"#FCA5A5",fontSize:12.5 }}>{error}</div>}
      </div>
      <div style={{ color: c.stone, fontSize: 12, textAlign: "center" }}>Signed in as {email} · your inbox is your login — nothing to remember.</div>
    </div>
  );
}

function PortalNotice({ title, body, action, onAction, tone }) {
  return <div className="pt-card" style={{ padding:"clamp(28px,7vw,52px) 22px",textAlign:"center",background:tone==="error"?"linear-gradient(145deg,rgba(248,113,113,.08),#13294A)":"linear-gradient(145deg,rgba(34,211,238,.08),#13294A)" }}><div style={{ width:46,height:46,borderRadius:15,margin:"0 auto 14px",display:"grid",placeItems:"center",background:tone==="error"?"rgba(248,113,113,.12)":"rgba(34,211,238,.12)",color:tone==="error"?"#FCA5A5":c.teal,fontSize:20 }}>✦</div><h2 style={{ margin:"0 0 7px",fontSize:21 }}>{title}</h2><p style={{ maxWidth:500,margin:"0 auto",color:c.stone,fontSize:13.5,lineHeight:1.65 }}>{body}</p>{action&&<button onClick={onAction} style={{ marginTop:17,padding:"10px 16px",border:0,borderRadius:radius.sm,background:c.gold,color:c.ink,fontWeight:850,cursor:"pointer" }}>{action}</button>}</div>;
}
