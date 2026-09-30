import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  CalendarDays, MessageCircle, User, MapPin, Clock, Check, Hourglass, Send, LogOut, Backpack, ShieldCheck,
  QrCode, X, LifeBuoy, ChevronRight, Navigation, ExternalLink, Sparkles, Route, ArrowLeft,
  KeyRound, MailCheck, Smartphone, Headphones, LockKeyhole, CheckCircle2,
  CalendarPlus, Share2, ListChecks, ClipboardCheck, Search, SlidersHorizontal,
  LayoutDashboard, Map as MapIcon, FolderOpen, Users, CreditCard, FileText, ReceiptText, BellRing,
} from "lucide-react";
import { c, FONT, radius, shadow, grad } from "../theme.js";
import {
  getTrip, getMessages, sendMessage, getProfile, saveProfile, sendSecureSignInLink, changePassword, activityPhoto, DEMO_TRIP,
} from "./portalData.js";
import GuestMeetingMap, { guestDirectionsUrl } from "./GuestMeetingMap.jsx";
import { Logo } from "../components/Logo.jsx";

const money = (n) => (n || n === 0 ? `$${Math.round(n).toLocaleString()}` : "—");
const fmt = (iso) => { const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`); return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); };
const daysUntil = (iso) => { const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`); const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((d - t) / 86400000); };

const calendarTime = (date, time) => {
  const match = String(time || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return String(date || "").replaceAll("-", "");
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(date).replaceAll("-", "")}T${String(hour).padStart(2, "0")}${match[2]}00`;
};

const downloadTripCalendar = (trip, bookings) => {
  const escape = (value) => String(value || "").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  const events = bookings.map((item) => [
    "BEGIN:VEVENT", `UID:${escape(item.id)}@ticowild.com`,
    `DTSTART:${calendarTime(item.date, item.time)}`, `SUMMARY:${escape(item.name)} · TicoWild`,
    `LOCATION:${escape(item.meetingPoint?.name || item.meet)}`,
    `DESCRIPTION:${escape(`${item.operator} | Meet: ${item.meet} | Bring: ${item.bring}`)}`, "END:VEVENT",
  ].join("\r\n")).join("\r\n");
  const file = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TicoWild//Traveler Portal//EN", `X-WR-CALNAME:${escape(trip.title)}`, events, "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([file], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ticowild-trip.ics";
  anchor.click();
  URL.revokeObjectURL(url);
};

const downloadPaymentSummary = (trip) => {
  const balance = Number(trip.total || 0) - Number(trip.deposit || 0);
  const summary = [
    "TICOWILD TRIP PAYMENT SUMMARY", "", trip.title, `${trip.region} | ${fmt(trip.start)} – ${fmt(trip.end)}`, "",
    `Trip total: ${money(trip.total)}`, `Deposit paid: ${money(trip.deposit)}`, `Remaining balance: ${money(balance)}`, "",
    "Your TicoWild portal is the source of truth for current trip and payment details.",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([summary], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ticowild-payment-summary.txt";
  anchor.click();
  URL.revokeObjectURL(url);
};

const TABS = [
  { key: "trip", label: "My Trip", mobileLabel: "Trip", Icon: CalendarDays },
  { key: "messages", label: "Messages", mobileLabel: "Concierge", Icon: MessageCircle },
  { key: "account", label: "Account", mobileLabel: "Account", Icon: User },
];

const input = { width: "100%", boxSizing: "border-box", background: "#fff", border: "1px solid #DDE2E6", borderRadius: radius.sm, color: "#172532", fontFamily: FONT, fontSize: 15, padding: "12px 13px", outline: "none" };
const label = { fontSize: 11.5, fontWeight: 800, color: "#65727D", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 };

export default function Portal({ email, onSignOut }) {
  const [tab, setTab] = useState("trip");
  const [trip, setTrip] = useState(undefined);
  const [sampleMode, setSampleMode] = useState(() => new URLSearchParams(window.location.search).get("sample") === "1");
  const [tripError, setTripError] = useState("");
  const loadTrip = () => { setTrip(undefined); setTripError(""); getTrip().then(setTrip).catch((err) => { setTrip(null); setTripError(err.message); }); };
  useEffect(() => { loadTrip(); }, []);
  const displayedTrip = sampleMode && trip !== undefined ? DEMO_TRIP : trip;
  const toggleSample = (on) => {
    setSampleMode(on);
    const url = new URL(window.location.href);
    if (on) url.searchParams.set("sample", "1"); else url.searchParams.delete("sample");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="customer-portal" style={{ minHeight: "100vh", background: "#F2F1EC", color: "#172532", fontFamily: FONT }}>
      <style>{`
        .pt-wrap{max-width:1180px;margin:0 auto;padding:14px clamp(16px,3vw,34px) 64px}
        .customer-app-bar{position:sticky;top:0;z-index:12;display:grid!important;grid-template-columns:1fr auto 1fr;background:#0C2133!important;border-bottom:1px solid rgba(255,255,255,.08)!important;backdrop-filter:blur(16px)}
        .customer-brand{display:flex;align-items:center}.customer-brand>span{padding:0;background:transparent;box-shadow:none}
        .customer-signout{justify-self:end;border-color:rgba(255,255,255,.18)!important;background:rgba(255,255,255,.07)!important;color:#fff!important}
        .pt-tabs{z-index:10;justify-content:center;gap:5px;padding:0;background:transparent;border:0;backdrop-filter:none}.pt-tabs-desktop{position:static;display:flex}.pt-tabs-mobile{display:none}
        .pt-tabs button{min-height:36px;padding-inline:17px!important;color:rgba(255,255,255,.68)!important}
        .pt-tabs button[data-active="true"]{background:rgba(34,211,238,.13)!important;color:#fff!important;box-shadow:inset 0 0 0 1px rgba(34,211,238,.34)}
        .pt-tab-icon{display:contents}.pt-tab-label:after{content:""}
        .pt-card{border-radius:20px;border:1px solid #E4E7E9!important;background-color:#fff!important;color:#172532!important;box-shadow:0 12px 35px rgba(19,40,61,.07)!important}
        .guest-trip-view{gap:11px!important}
        .guest-sample-bar{display:flex;align-items:center;gap:9px;padding:8px 12px;border:1px solid #BFE3DE;border-radius:12px;background:#EAF7F5;color:#173C39;box-shadow:0 6px 18px rgba(10,129,116,.07)}
        .guest-sample-bar>svg{flex:0 0 auto;color:#0A8174}
        .guest-sample-copy{display:grid;gap:2px;flex:1;font-size:12.5px;color:#536C68}
        .guest-sample-copy b{color:#173C39;font-size:13.5px}
        .guest-sample-exit{display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border:1px solid #B7D8D3;border-radius:10px;background:#fff;color:#173C39;font:800 12px ${FONT};cursor:pointer}
        .trip-section-nav{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;padding:6px;border:1px solid #E2E6E8;border-radius:17px;background:rgba(255,255,255,.9);box-shadow:0 10px 28px rgba(19,40,61,.055)}.trip-section-nav button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:0 10px;border:0;border-radius:12px;background:transparent;color:#65747E;font:800 10.5px ${FONT};cursor:pointer;white-space:nowrap}.trip-section-nav button[data-active="true"]{background:#13283D;color:#fff;box-shadow:0 8px 18px rgba(19,40,61,.17)}
        .trip-section-page{display:grid;gap:16px;animation:skeletonEnter .2s ease both}.trip-section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:5px 2px 1px}.trip-section-heading>div{display:grid;gap:4px}.trip-section-heading span{color:#0A8174;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.trip-section-heading h1{margin:0;font-size:31px;line-height:1;letter-spacing:-.05em}.trip-section-heading p{max-width:600px;margin:0;color:#6D7B85;font-size:11.5px;line-height:1.5}.trip-section-heading-badge{padding:7px 10px;border-radius:999px;background:#EAF6F4;color:#08786D;font-size:10px;font-weight:850;white-space:nowrap}
        .portal-enterprise-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.portal-enterprise-card{padding:20px!important}.portal-enterprise-card-head{display:flex;align-items:flex-start;gap:11px;margin-bottom:16px}.portal-enterprise-card-icon{display:grid;place-items:center;flex:0 0 40px;width:40px;height:40px;border-radius:13px;background:#EAF6F4;color:#087E71}.portal-enterprise-card-head>div:not(.portal-enterprise-card-icon){display:grid;gap:3px;flex:1}.portal-enterprise-card-head h2{margin:0;font-size:17px;letter-spacing:-.03em}.portal-enterprise-card-head p{margin:0;color:#74818A;font-size:10.5px;line-height:1.45}.portal-enterprise-action{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:0 13px;border:0;border-radius:12px;background:#13283D;color:#fff;font:850 11px ${FONT};cursor:pointer}.portal-enterprise-action.secondary{border:1px solid #D9DFE2;background:#fff;color:#344752}
        .document-list,.traveler-list,.support-list,.payment-timeline{display:grid;gap:8px}.document-row,.traveler-row,.support-row,.payment-step{display:flex;align-items:center;gap:11px;padding:11px;border:1px solid #E5E8E9;border-radius:13px;background:#FAFAF8}.document-row-icon,.traveler-row-icon,.support-row-icon,.payment-step-icon{display:grid;place-items:center;flex:0 0 auto;width:34px;height:34px;border-radius:11px;background:#E9F5F2;color:#087F71}.document-row>div,.traveler-row>div,.support-row>div,.payment-step>div{display:grid;gap:2px;min-width:0;flex:1}.document-row b,.traveler-row b,.support-row b,.payment-step b{font-size:11.5px}.document-row span,.traveler-row span,.support-row span,.payment-step span{color:#75818A;font-size:9.8px;line-height:1.4}.document-row button,.support-row button{display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:10px;background:#fff;color:#425560;cursor:pointer}.document-row[data-pending="true"] .document-row-icon{background:#FFF6CF;color:#A77C00}
        .traveler-party-hero{display:flex;align-items:center;gap:16px;padding:20px;border-radius:18px;background:linear-gradient(135deg,#13283D,#0D6A61);color:#fff}.traveler-party-count{display:grid;place-items:center;width:70px;height:70px;border:1px solid rgba(255,255,255,.2);border-radius:22px;background:rgba(255,255,255,.12);font-size:27px;font-weight:900}.traveler-party-hero>div:nth-child(2){display:grid;gap:3px;flex:1}.traveler-party-hero b{font-size:18px}.traveler-party-hero span{color:rgba(255,255,255,.7);font-size:10.5px}.traveler-party-hero button{min-height:40px;padding:0 13px;border:0;border-radius:11px;background:#FFD000;color:#172532;font:850 10.5px ${FONT};cursor:pointer}
        .payment-hero{display:grid;grid-template-columns:1.2fr repeat(2,.7fr);gap:1px;overflow:hidden;border-radius:18px;background:#DDE3E4}.payment-hero>div{display:grid;gap:3px;padding:20px;background:#13283D;color:#fff}.payment-hero>div:not(:first-child){background:#fff;color:#172532}.payment-hero span{color:rgba(255,255,255,.65);font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.payment-hero>div:not(:first-child) span{color:#75818A}.payment-hero b{font-size:25px;letter-spacing:-.05em}.payment-hero small{color:#35CFA2;font-size:9.5px;font-weight:800}.payment-step[data-done="true"] .payment-step-icon{background:#E5F6F1;color:#078A73}.payment-step[data-next="true"] .payment-step-icon{background:#FFF6CF;color:#A77C00}
        .support-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:20px;padding:24px;border-radius:22px;background:linear-gradient(135deg,#13283D,#0A8174);color:#fff}.support-hero-copy{display:grid;gap:6px}.support-hero-copy span{color:#FFD000;font-size:9.5px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.support-hero-copy h2{margin:0;font-size:25px;letter-spacing:-.04em}.support-hero-copy p{max-width:600px;margin:0;color:rgba(255,255,255,.72);font-size:11.5px;line-height:1.5}.support-hero button{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 15px;border:0;border-radius:13px;background:#FFD000;color:#172532;font:900 11.5px ${FONT};cursor:pointer}
        .guest-empty{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(330px,.95fr);min-height:470px;overflow:hidden;border-radius:28px!important}
        .guest-empty-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(30px,5vw,58px)}
        .guest-empty-kicker{display:inline-flex;align-items:center;gap:7px;color:#0A8174;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
        .guest-empty h1{max-width:600px;margin:13px 0 14px;font-size:clamp(34px,5vw,55px);line-height:.98;letter-spacing:-.06em}
        .guest-empty-copy>p{max-width:560px;margin:0;color:#60707B;font-size:15px;line-height:1.65}
        .guest-empty-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
        .guest-empty-primary,.guest-empty-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 17px;border-radius:13px;font:850 13px ${FONT};cursor:pointer}
        .guest-empty-primary{border:0;background:#13283D;color:#fff;box-shadow:0 12px 26px rgba(19,40,61,.18)}
        .guest-empty-secondary{border:1px solid #D7DDE1;background:#fff;color:#314251}
        .guest-empty-proof{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:30px}
        .guest-empty-proof div{display:grid;gap:4px;padding-top:13px;border-top:1px solid #DDE3E5}
        .guest-empty-proof b{font-size:12px;color:#263846}
        .guest-empty-proof span{font-size:11px;line-height:1.45;color:#75818A}
        .guest-empty-visual{position:relative;display:flex;align-items:center;justify-content:center;min-height:470px;padding:35px;background:linear-gradient(155deg,#153047,#0A8174)}
        .guest-empty-visual:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 85% 15%,rgba(255,255,255,.18),transparent 36%),radial-gradient(circle at 15% 90%,rgba(255,208,0,.16),transparent 32%)}
        .guest-preview-phone{position:relative;width:min(330px,100%);padding:11px;border-radius:30px;background:#F8F8F5;box-shadow:0 30px 70px rgba(3,14,24,.38);transform:rotate(2deg)}
        .guest-preview-photo{height:190px;border-radius:21px;background-position:center;background-size:cover;overflow:hidden}
        .guest-preview-photo:after{content:"";display:block;width:100%;height:100%;background:linear-gradient(0deg,rgba(10,25,38,.65),transparent 60%)}
        .guest-preview-details{display:grid;gap:9px;padding:15px 10px 10px}
        .guest-preview-chip{display:inline-flex;align-items:center;gap:5px;justify-self:start;padding:5px 8px;border-radius:999px;background:#DCF5EF;color:#08776B;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
        .guest-preview-details b{font-size:20px;letter-spacing:-.04em}
        .guest-preview-details span{display:flex;align-items:center;gap:6px;color:#65737D;font-size:11.5px}
        .guest-trip-hero{position:relative;min-height:250px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;padding:30px!important;border-radius:28px!important;background-position:center!important;background-size:cover!important;color:#fff!important;box-shadow:0 22px 55px rgba(19,40,61,.18)!important}
        .guest-trip-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,24,38,.08),rgba(10,24,38,.82));pointer-events:none}
        .guest-trip-hero>*{position:relative;z-index:1}
        .journey-overview{display:grid;grid-template-columns:250px minmax(0,1fr);overflow:hidden;border:1px solid #E1E6E8;border-radius:21px;background:#fff;box-shadow:0 15px 38px rgba(19,40,61,.09)}
        .journey-overview .guest-trip-hero{min-height:250px;padding:16px!important;border-radius:0!important;box-shadow:none!important}
        .journey-control-panel{display:grid;grid-template-columns:minmax(0,1fr) 205px;grid-template-areas:"intro glance" "status status" "next next";gap:10px 14px;padding:17px 18px;background:#fff;color:#172532}
        .journey-trip-intro{grid-area:intro;display:grid;align-content:start;gap:5px;min-width:0}.journey-trip-intro h1{margin:0;color:#13283D;font-size:27px;line-height:1;letter-spacing:-.045em}.journey-trip-meta{display:flex;flex-wrap:wrap;gap:7px 13px;color:#667681;font-size:10.5px}.journey-trip-meta span{display:inline-flex;align-items:center;gap:5px}.journey-trip-meta svg{color:#0A8174}
        .journey-control-kicker{display:flex;align-items:center;gap:7px;color:#0A8174;font-size:9px;font-weight:900;letter-spacing:.11em;text-transform:uppercase}
        .journey-glance{grid-area:glance;display:grid;grid-template-columns:1fr 1fr;gap:7px}.journey-glance>div{display:grid;align-content:center;gap:2px;padding:9px 10px;border:1px solid #DDE6E7;border-radius:12px;background:#F6F8F7}.journey-glance b{color:#13283D;font-size:20px;line-height:1;letter-spacing:-.04em}.journey-glance span{color:#718089;font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.07em}
        .journey-status{grid-area:status;display:grid;grid-template-columns:34px 170px minmax(0,1fr);align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid #DCE5E6;border-radius:13px;background:#F3F8F7}
        .journey-status-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#FFD000;color:#13283D}
        .journey-status-copy{display:grid;gap:2px;min-width:0}.journey-status-copy span,.journey-status-detail span{color:#718089;font-size:8px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.journey-status-copy b{color:#13283D;font-size:13px;letter-spacing:-.02em}
        .journey-status-detail{display:grid;gap:1px;padding-left:11px;border-left:1px solid #D5E0E0;text-align:left}.journey-status-detail b{color:#314651;font-size:10.5px}.journey-status-detail small{color:#718089;font-size:8.5px}
        .journey-control-panel .guest-next-up{grid-area:next;display:grid;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:10px;padding:9px!important;border:1px solid #E0E5E7!important;border-radius:13px!important;background:#FAFAF8!important;box-shadow:none!important}
        .journey-control-panel .guest-next-photo{width:48px;height:48px;border-radius:11px}
        .journey-control-panel .guest-next-kicker{color:#0A8174}.journey-control-panel .guest-next-copy h2{color:#13283D;font-size:14px}.journey-control-panel .guest-next-facts{flex-direction:row;color:#6A7983;gap:8px;font-size:9px}
        .journey-control-panel .guest-next-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.journey-control-panel .guest-next-actions button{min-height:34px;padding:0 9px;font-size:9.5px}.journey-control-panel .guest-next-primary{background:#13283D;color:#fff}.journey-control-panel .guest-next-secondary{border-color:#D7DEE1;background:#fff;color:#324853}
        .simple-preview-note{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 11px;border:1px solid #CFE4E1;border-radius:11px;background:#F1F9F7;color:#45645F;font-size:10.5px}.simple-preview-note svg{color:#0A8174}.simple-preview-note b{color:#173C39}.simple-preview-note button{display:inline-flex;align-items:center;gap:5px;margin-left:auto;padding:6px 9px;border:1px solid #C9DAD8;border-radius:9px;background:#fff;color:#314C49;font:800 10px ${FONT};cursor:pointer}
        .simple-trip-summary{display:grid;grid-template-columns:118px minmax(0,1fr) auto;align-items:center;gap:17px;padding:13px;border:1px solid #E0E5E7;border-radius:20px;background:#fff;box-shadow:0 12px 32px rgba(19,40,61,.075)}.simple-trip-photo{width:118px;height:82px;border-radius:14px;object-fit:cover}.simple-trip-copy{display:grid;gap:5px;min-width:0}.simple-eyebrow{display:flex;align-items:center;gap:6px;color:#087E71;font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.simple-trip-copy h1{margin:0;color:#13283D;font-size:27px;line-height:1;letter-spacing:-.045em}.simple-trip-meta{display:flex;flex-wrap:wrap;gap:6px 14px;color:#6B7983;font-size:10.5px}.simple-trip-meta span{display:inline-flex;align-items:center;gap:5px}.simple-trip-meta svg{color:#0A8174}.simple-countdown{display:grid;place-items:center;align-content:center;width:88px;height:72px;border-radius:15px;background:#13283D;color:#fff}.simple-countdown b{font-size:26px;line-height:1;letter-spacing:-.04em}.simple-countdown span{margin-top:3px;color:rgba(255,255,255,.65);font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
        .simple-home-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.7fr);gap:12px}.simple-next-card,.simple-status-card{padding:16px;border:1px solid #E0E5E7;border-radius:19px;background:#fff;box-shadow:0 11px 30px rgba(19,40,61,.065)}.simple-card-label{display:flex;align-items:center;gap:7px;margin-bottom:11px;color:#087E71;font-size:9.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.simple-next-content{display:grid;grid-template-columns:105px minmax(0,1fr) auto;align-items:center;gap:14px}.simple-next-content img{width:105px;height:78px;border-radius:13px;object-fit:cover}.simple-next-copy{display:grid;gap:5px;min-width:0}.simple-next-copy h2{margin:0;color:#13283D;font-size:20px;letter-spacing:-.035em}.simple-next-facts{display:flex;flex-wrap:wrap;gap:6px 12px;color:#687782;font-size:10.5px}.simple-next-facts span{display:inline-flex;align-items:center;gap:5px}.simple-next-actions{display:grid;gap:7px}.simple-next-actions button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;padding:0 12px;border-radius:11px;font:850 10.5px ${FONT};white-space:nowrap;cursor:pointer}.simple-next-actions button:first-child{border:0;background:#13283D;color:#fff}.simple-next-actions button:last-child{border:1px solid #D9E0E2;background:#fff;color:#40535E}
        .simple-status-card{display:grid;gap:11px}.simple-status-row{display:flex;align-items:center;gap:10px}.simple-status-icon{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:11px;background:#FFD000;color:#13283D}.simple-status-copy{display:grid;gap:2px;flex:1}.simple-status-copy span{color:#75828A;font-size:8.5px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.simple-status-copy b{color:#13283D;font-size:13px}.simple-progress{height:6px;overflow:hidden;border-radius:999px;background:#E7EBEC}.simple-progress span{display:block;height:100%;border-radius:inherit;background:#0A8174}.simple-status-caption{color:#6C7A83;font-size:9.5px}.simple-concierge-button{display:flex;align-items:center;gap:9px;width:100%;padding:10px;border:0;border-radius:13px;background:#F1F7F5;color:#173A37;text-align:left;cursor:pointer}.simple-concierge-avatar{display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;border-radius:10px;background:#0A8174;color:#fff;font-size:10px;font-weight:900}.simple-concierge-button span:nth-child(2){display:grid;gap:1px;flex:1}.simple-concierge-button small{color:#71807E;font-size:8.5px}.simple-concierge-button b{font-size:11px}.simple-concierge-button>svg{color:#0A8174}
        .premium-journey-grid{display:grid;grid-template-columns:minmax(0,1.45fr) 330px;gap:14px;align-items:start}.premium-itinerary{padding:20px;border:1px solid #E0E5E7;border-radius:21px;background:#fff;box-shadow:0 13px 34px rgba(19,40,61,.07)}.premium-itinerary-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.premium-itinerary-head>div{display:grid;gap:3px}.premium-itinerary-head span{color:#087E71;font-size:9px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.premium-itinerary-head h2{margin:0;color:#13283D;font-size:24px;line-height:1;letter-spacing:-.04em}.premium-itinerary-head p{margin:0;color:#74818A;font-size:10.5px}.premium-itinerary-head button{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid #DCE2E4;border-radius:10px;background:#fff;color:#344A56;font:850 10px ${FONT};cursor:pointer}.premium-itinerary-list{display:grid;gap:8px}.premium-activity-row{display:grid;grid-template-columns:92px minmax(0,1fr) auto;align-items:center;gap:12px;padding:9px;border:1px solid #E5E8E9;border-radius:15px;background:#FAFAF8;text-align:left;transition:transform .16s ease,border-color .16s ease}.premium-activity-row[data-ready="true"]{cursor:pointer}.premium-activity-row[data-ready="true"]:hover{transform:translateY(-1px);border-color:#BFD8D3}.premium-activity-row img{width:92px;height:66px;border-radius:11px;object-fit:cover}.premium-activity-copy{display:grid;gap:3px;min-width:0}.premium-activity-date{color:#0A8174;font-size:8.5px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}.premium-activity-copy h3{margin:0;color:#172B3B;font-size:15px;letter-spacing:-.025em}.premium-activity-copy p{display:flex;flex-wrap:wrap;gap:5px 10px;margin:0;color:#71808A;font-size:9.5px}.premium-activity-copy p span{display:inline-flex;align-items:center;gap:4px}.premium-activity-state{display:grid;justify-items:end;gap:7px}.premium-activity-state span{display:inline-flex;align-items:center;gap:5px;padding:5px 7px;border-radius:999px;background:#E9F5F2;color:#08796D;font-size:8px;font-weight:900;text-transform:uppercase}.premium-activity-state span[data-pending="true"]{background:#FFF6D5;color:#8A6900}.premium-activity-state .premium-detail-link{padding:0;background:transparent;color:#536670;font-size:8px;text-transform:none}.premium-activity-state svg{color:#6C7B84}.premium-sidebar{display:grid;gap:12px;position:sticky;top:70px}.premium-sidebar .simple-status-card{box-shadow:0 13px 34px rgba(19,40,61,.07)}.trip-command.is-compact .trip-command-main{padding:17px 18px 11px}.trip-command.is-compact .trip-command-copy h2{font-size:21px}.trip-command.is-compact .trip-command-copy p{font-size:10px}.trip-command.is-compact .trip-tool-actions{grid-template-columns:1fr 1fr;padding:0 14px 15px;gap:7px}.trip-command.is-compact .trip-tool-action{min-height:48px;padding:7px 9px;font-size:10px}.trip-command.is-compact .trip-tool-icon{width:30px;height:30px}.trip-command.is-compact .trip-tool-panel{margin:0 10px 10px;padding:12px}.trip-command.is-compact .trip-pass-grid,.trip-command.is-compact .packing-list{grid-template-columns:1fr}
        .guest-trip-eyebrow{display:inline-flex;align-self:flex-start;margin-bottom:auto;padding:7px 11px;border:1px solid rgba(255,255,255,.48);border-radius:999px;background:rgba(255,255,255,.92);color:#0A8174;font-size:10px!important;font-weight:900!important;letter-spacing:.08em;text-transform:uppercase;opacity:1!important}
        .guest-trip-title{max-width:650px;font-size:clamp(32px,3.5vw,44px)!important;line-height:.95!important;letter-spacing:-.055em!important}
        .guest-trip-meta{font-size:14px!important;opacity:.94!important}
        .guest-progress{padding:18px 20px!important;border-radius:18px!important}
        .guest-progress-label{color:#687581!important}
        .guest-progress-label.is-done{color:#172532!important}
        .guest-progress-bar{background:#E7E9EB!important}
        .guest-progress-bar.is-done{background:#0A8174!important}
        .guest-next-up{display:grid;grid-template-columns:150px minmax(0,1fr) auto;align-items:center;gap:18px;padding:12px!important;overflow:hidden}
        .guest-next-photo{height:106px;border-radius:14px;object-fit:cover;width:100%}
        .guest-next-copy{min-width:0;display:grid;gap:6px}
        .guest-next-kicker{display:flex;align-items:center;gap:6px;color:#0A8174;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
        .guest-next-copy h2{margin:0;font-size:21px;letter-spacing:-.035em}
        .guest-next-facts{display:flex;flex-wrap:wrap;gap:7px 14px;color:#63717C;font-size:12.5px}
        .guest-next-facts span{display:inline-flex;align-items:center;gap:5px}
        .guest-next-actions{display:grid;gap:7px}
        .guest-next-actions button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:0 13px;border-radius:11px;font:800 12px ${FONT};cursor:pointer;white-space:nowrap}
        .guest-next-primary{border:0;background:#13283D;color:#fff}
        .guest-next-secondary{border:1px solid #DDE2E5;background:#fff;color:#43525E}
        .trip-command{position:relative;overflow:hidden;padding:0!important;border:1px solid #DFE4E5!important;background:#fff!important;color:#172532!important;box-shadow:0 15px 42px rgba(19,40,61,.08)!important}
        .overview-tools-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.65fr);gap:15px;align-items:stretch}.overview-tools-grid .trip-command{height:100%}.overview-tools-grid .trip-concierge-card{height:100%;box-sizing:border-box;flex-direction:column;align-items:flex-start;padding:22px}.overview-tools-grid .trip-concierge-copy{flex:0}.overview-tools-grid .trip-concierge-copy b{font-size:19px}.overview-tools-grid .trip-concierge-copy small{margin-top:4px;line-height:1.45}.overview-tools-grid .trip-concierge-action{width:100%;box-sizing:border-box;justify-content:center;margin-top:auto}
        .trip-command:before{display:none}
        .trip-command-main{position:relative;display:block;padding:24px 26px 18px}
        .trip-command-copy{display:grid;align-content:start;gap:7px;max-width:620px}.trip-command-kicker{display:flex;align-items:center;gap:7px;color:#0A8174;font-size:10px;font-weight:900;letter-spacing:.11em;text-transform:uppercase}.trip-command-copy h2{margin:0;color:#13283D;font-size:27px;line-height:1;letter-spacing:-.045em}.trip-command-copy p{margin:0;color:#687782;font-size:12.5px;line-height:1.55}
        .trip-back{display:inline-flex;align-items:center;justify-self:start;gap:7px;margin:0;padding:9px 12px;border:1px solid #DDE3E5;border-radius:12px;background:#fff;color:#344752;font:850 11.5px ${FONT};cursor:pointer}
        .trip-tool-actions{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:0 26px 24px}.trip-tool-action{display:flex;align-items:center;gap:10px;min-height:58px;padding:9px 13px;border:1px solid #E3E7E8;border-radius:15px;background:#F7F8F6;color:#233744;font:850 11.5px ${FONT};cursor:pointer;text-align:left;transition:transform .18s ease,background .18s ease,color .18s ease}.trip-tool-action:hover,.trip-tool-action[data-active="true"]{border-color:#13283D;background:#13283D;color:#fff;transform:translateY(-2px)}.trip-tool-icon{display:grid;place-items:center;flex:0 0 auto;width:34px;height:34px;border-radius:11px;background:#E4F3F0;color:#087E71}.trip-tool-action:hover .trip-tool-icon,.trip-tool-action[data-active="true"] .trip-tool-icon{background:#FFD000;color:#13283D}
        .trip-tool-panel{position:relative;margin:0 12px 12px;padding:17px;border:1px solid #E4E8E9;border-radius:18px;background:#FAFAF8;color:#172532;animation:skeletonEnter .2s ease both}.trip-tool-panel-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:13px}.trip-tool-panel-head>div{display:grid;gap:2px;flex:1}.trip-tool-panel-head b{font-size:15px}.trip-tool-panel-head span{color:#71808A;font-size:10.5px}.trip-tool-panel-head button{display:grid;place-items:center;width:30px;height:30px;border:0;border-radius:9px;background:#F1F3F3;color:#53636E;cursor:pointer}
        .trip-pass-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.trip-pass{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;min-width:0;padding:11px;border:1px solid #E5E8E9;border-radius:13px;background:#FAFAF8;text-align:left;color:#172532;cursor:pointer}.trip-pass:disabled{cursor:default;opacity:.7}.trip-pass-icon{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:#E7F5F2;color:#087D70}.trip-pass-copy{display:grid;gap:2px;min-width:0}.trip-pass-copy b,.trip-pass-copy span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.trip-pass-copy b{font-size:11px}.trip-pass-copy span{color:#73808A;font-size:9.5px}.trip-pass>svg{color:#99A3A9}
        .packing-progress{display:flex;align-items:center;gap:11px;margin-bottom:12px;padding:11px 12px;border-radius:13px;background:#F2F8F7}.packing-progress-ring{display:grid;place-items:center;width:37px;height:37px;border-radius:50%;background:#0A8174;color:#fff;font-size:10px;font-weight:900}.packing-progress div{display:grid;gap:2px}.packing-progress b{font-size:11.5px}.packing-progress span{color:#6F7D85;font-size:10px}.packing-list{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.packing-item{display:flex;align-items:center;gap:9px;min-height:42px;padding:8px 10px;border:1px solid #E5E8E9;border-radius:12px;background:#fff;color:#334550;font:750 11px ${FONT};cursor:pointer;text-align:left}.packing-item[data-checked="true"]{border-color:#B9E2D9;background:#F1FAF8;color:#0A756A}.packing-check{display:grid;place-items:center;flex:0 0 auto;width:20px;height:20px;border:1.5px solid #C7CFD3;border-radius:7px}.packing-item[data-checked="true"] .packing-check{border-color:#0A8174;background:#0A8174;color:#fff}
        .trip-tool-toast{position:relative;margin:0 26px 18px;padding:9px 12px;border:1px solid #CAE4DF;border-radius:12px;background:#EFF8F6;color:#17665E;font-size:10.5px;font-weight:750;text-align:center}
        .itinerary-finder{display:grid;gap:12px;padding:16px!important}.itinerary-finder-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.itinerary-finder-title{display:flex;align-items:center;gap:9px}.itinerary-finder-title>span{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:#EAF6F4;color:#087E71}.itinerary-finder-title div{display:grid;gap:1px}.itinerary-finder-title b{font-size:13px}.itinerary-finder-title small{color:#71808A;font-size:9.5px}.itinerary-result-count{padding:5px 8px;border-radius:999px;background:#F1F4F4;color:#63717A;font-size:9.5px;font-weight:850}
        .itinerary-search{position:relative}.itinerary-search>svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#72808A}.itinerary-search input{width:100%;min-height:45px;box-sizing:border-box;padding:0 38px;border:1px solid #DDE2E5;border-radius:13px;background:#FAFAF8;color:#172532;font:700 12px ${FONT};outline:none}.itinerary-search input::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}.itinerary-search input:focus{border-color:#0A8174;box-shadow:0 0 0 3px rgba(10,129,116,.1)}.itinerary-search button{position:absolute;right:7px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:30px;height:30px;border:0;border-radius:9px;background:#EEF1F1;color:#65737C;cursor:pointer}
        .itinerary-filters{display:flex;align-items:center;gap:7px;overflow:auto;padding-bottom:1px}.itinerary-filter-label{display:flex;align-items:center;gap:5px;margin-right:2px;color:#74818A;font-size:9.5px;font-weight:850;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}.itinerary-filter{min-height:34px;padding:0 12px;border:1px solid #DDE2E5;border-radius:999px;background:#fff;color:#5F6E78;font:800 10.5px ${FONT};cursor:pointer;white-space:nowrap}.itinerary-filter[data-active="true"]{border-color:#13283D;background:#13283D;color:#fff}.itinerary-empty{display:grid;place-items:center;gap:5px;padding:35px 18px;border:1px dashed #D5DBDE;border-radius:18px;background:#FAFAF8;text-align:center}.itinerary-empty svg{color:#0A8174}.itinerary-empty b{font-size:14px}.itinerary-empty span{color:#73808A;font-size:11px}.itinerary-empty button{margin-top:5px;padding:8px 11px;border:0;border-radius:10px;background:#13283D;color:#fff;font:800 10.5px ${FONT};cursor:pointer}
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
        .guest-booking-hero{position:relative;display:flex;align-items:flex-end;min-height:230px;padding:26px;background-position:center;background-size:cover;color:#fff;overflow:hidden}.guest-booking-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,20,31,.08),rgba(7,20,31,.86))}.guest-booking-hero-copy{position:relative;z-index:1;display:grid;gap:5px}.guest-booking-hero-status{display:inline-flex;align-items:center;justify-self:start;gap:6px;padding:6px 9px;border:1px solid rgba(255,255,255,.35);border-radius:999px;background:rgba(9,129,114,.88);font-size:10px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}.guest-booking-hero h2{margin:0;font-size:32px;line-height:1;letter-spacing:-.045em}.guest-booking-hero p{margin:0;color:rgba(255,255,255,.78);font-size:12px}.guest-booking-hero-meta{display:flex;flex-wrap:wrap;gap:12px;margin-top:4px}.guest-booking-hero-meta span{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:750}
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
        .consumer-section-label{margin:0 2px;color:#687581;font-size:10.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
        .concierge-shell{overflow:hidden;border-radius:26px!important}
        .concierge-head{display:flex;align-items:center;gap:14px;padding:18px 20px;border-bottom:1px solid #E6E9EA;background:linear-gradient(135deg,#F7FBFA,#fff)}
        .concierge-avatar{position:relative;display:grid;place-items:center;width:48px;height:48px;border-radius:16px;background:#13283D;color:#fff;font-size:18px;font-weight:900;box-shadow:0 8px 22px rgba(19,40,61,.18);overflow:visible}
        .concierge-avatar img{width:48px;height:48px;border-radius:15px;display:block}
        .concierge-avatar:after{content:"";position:absolute;right:-2px;bottom:-2px;width:11px;height:11px;border:3px solid #fff;border-radius:50%;background:#25B889}
        .concierge-title{display:grid;gap:3px;flex:1}
        .concierge-title b{font-size:16px;letter-spacing:-.02em}
        .concierge-title span{color:#687681;font-size:11.5px}
        .concierge-assurance{display:flex;align-items:center;gap:6px;color:#0A8174;font-size:11px;font-weight:800}
        .trip-concierge-card{display:flex;align-items:center;gap:14px;width:100%;padding:18px 20px;border:0;border-radius:21px;background:linear-gradient(135deg,#10293D,#0B5E59);color:#fff;text-align:left;box-shadow:0 18px 46px rgba(19,40,61,.16);cursor:pointer}.trip-concierge-card:hover{transform:translateY(-2px)}.trip-concierge-avatar{position:relative;display:grid;place-items:center;flex:0 0 48px;width:48px;height:48px;border-radius:16px;background:#FFD000;color:#13283D;font-size:15px;font-weight:900}.trip-concierge-avatar:after{content:"";position:absolute;right:-2px;bottom:-2px;width:10px;height:10px;border:3px solid #0D5653;border-radius:50%;background:#37D7A4}.trip-concierge-copy{display:grid;gap:2px;min-width:0;flex:1}.trip-concierge-copy span{color:#FFD000;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.trip-concierge-copy b{color:#fff;font-size:15px}.trip-concierge-copy small{color:rgba(255,255,255,.66);font-size:10.5px}.trip-concierge-action{display:inline-flex;align-items:center;gap:7px;padding:10px 12px;border-radius:12px;background:#FFD000;color:#13283D;font-size:11px;font-weight:900}
        .concierge-thread{display:grid;gap:13px;min-height:330px;max-height:480px;overflow:auto;padding:22px;background:#FCFCFA}
        .guest-message-row{display:grid;gap:4px}
        .guest-message-row[data-mine="true"]{justify-items:end}
        .guest-message-meta{padding:0 5px;color:#8A949C;font-size:9.5px;font-weight:700}
        .concierge-quick{display:flex;gap:7px;overflow-x:auto;padding:0 18px 12px;background:#FCFCFA;scrollbar-width:none}
        .concierge-quick::-webkit-scrollbar{display:none}
        .concierge-quick button{flex:0 0 auto;padding:8px 11px;border:1px solid #DDE3E5;border-radius:999px;background:#fff;color:#4E5F6B;font:750 11px ${FONT};cursor:pointer}
        .concierge-compose{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;padding:14px;border-top:1px solid #E4E8E9;background:#fff}
        .concierge-compose input{min-height:48px!important;background:#F7F8F7!important}
        .concierge-compose button{width:48px;border:0;border-radius:14px;background:#13283D;color:#fff;display:grid;place-items:center;cursor:pointer}
        .account-view{display:grid;gap:18px}
        .account-hero{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:18px;padding:24px!important;background:linear-gradient(135deg,#13283D,#0D655F)!important;color:#fff!important;border:0!important}
        .account-avatar{display:grid;place-items:center;width:66px;height:66px;border-radius:22px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);font-size:23px;font-weight:900;letter-spacing:-.04em}
        .account-identity{display:grid;gap:4px;min-width:0}
        .account-identity span{color:rgba(255,255,255,.7);font-size:11px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
        .account-identity h1{margin:0;font-size:25px;letter-spacing:-.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .account-identity p{margin:0;color:rgba(255,255,255,.75);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .account-completion{display:grid;gap:6px;width:170px}
        .account-completion div{display:flex;justify-content:space-between;gap:10px;font-size:10.5px;font-weight:800}
        .account-completion-track{height:7px!important;border-radius:999px;background:rgba(255,255,255,.16)!important;overflow:hidden}
        .account-completion-track i{display:block;height:100%;border-radius:inherit;background:#FFD000}
        .account-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:18px;align-items:start}
        .account-stack{display:grid;gap:18px}
        .account-card{padding:22px!important}
        .account-card-head{display:flex;align-items:flex-start;gap:11px;margin-bottom:19px}
        .account-card-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#EAF6F4;color:#0A8174}
        .account-card-head div:nth-child(2){display:grid;gap:3px;flex:1}
        .account-card-head h2{margin:0;font-size:17px;letter-spacing:-.025em}
        .account-card-head p{margin:0;color:#76828B;font-size:11.5px;line-height:1.45}
        .account-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .account-field-wide{grid-column:1/-1}
        .account-readonly{background:#F3F5F5!important;color:#697780!important;cursor:not-allowed}
        .account-save-row{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px;padding-top:17px;border-top:1px solid #E5E8EA}
        .account-save{min-height:44px;padding:0 18px;border:0;border-radius:12px;background:#13283D;color:#fff;font:850 13px ${FONT};cursor:pointer}
        .account-saved{display:inline-flex;align-items:center;gap:5px;color:#07896F;font-size:12px;font-weight:800}
        .security-status{display:flex;align-items:center;gap:10px;padding:13px;border:1px solid #CDE8E3;border-radius:14px;background:#F1FAF8}
        .security-status svg{color:#078B78;flex:0 0 auto}
        .security-status div{display:grid;gap:2px}
        .security-status b{font-size:12.5px}
        .security-status span{color:#63736F;font-size:10.5px;line-height:1.4}
        .security-list{display:grid;margin:15px 0}
        .security-row{display:flex;align-items:center;gap:10px;padding:12px 1px;border-bottom:1px solid #E8EAEB}
        .security-row:last-child{border-bottom:0}
        .security-row svg{color:#6D7B85}
        .security-row div{display:grid;gap:2px;min-width:0;flex:1}
        .security-row b{font-size:11.5px}
        .security-row span{color:#7B878F;font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .account-secondary-action{width:100%;min-height:43px;border:1px solid #D8DEE2;border-radius:12px;background:#fff;color:#314451;font:800 12px ${FONT};cursor:pointer}
        .account-danger-action{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:42px;margin-top:9px;border:0;border-radius:12px;background:#F3F5F5;color:#596771;font:800 12px ${FONT};cursor:pointer}
        .account-mobile-save{display:none}
        .password-action{margin-top:9px;border-color:#13283D;background:#13283D;color:#fff}
        .password-success{margin-top:10px;padding:10px 12px;border-radius:12px;background:#EFF9F6;color:#087662;font-size:11px;font-weight:800}
        .password-modal-backdrop{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:18px;background:rgba(6,20,32,.62);backdrop-filter:blur(7px)}
        .password-modal{width:min(430px,100%);padding:25px;border-radius:24px;background:#fff;box-shadow:0 30px 90px rgba(0,0,0,.3)}
        .password-modal-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px}.password-modal-head>div:first-child{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#EAF6F4;color:#087F71}.password-modal-head>div:nth-child(2){flex:1}.password-modal h2{margin:0 0 4px;font-size:20px}.password-modal p{margin:0;color:#6F7C84;font-size:11.5px;line-height:1.5}.password-modal-close{border:0;background:#F3F5F5;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;cursor:pointer}.password-modal-fields{display:grid;gap:12px}.password-modal-actions{display:grid;grid-template-columns:.7fr 1.3fr;gap:9px;margin-top:18px}.password-modal-actions button{min-height:45px;border-radius:12px;font:850 12px ${FONT};cursor:pointer}.password-cancel{border:1px solid #DDE2E4;background:#fff;color:#52616B}.password-submit{border:0;background:#13283D;color:#fff}.password-submit:disabled{opacity:.45;cursor:default}
        .account-help{padding:20px!important;background:linear-gradient(145deg,#FFF8D7,#fff)!important;border-color:#F2E5A0!important}
        .account-help h3{margin:0 0 6px;font-size:16px;letter-spacing:-.025em}
        .account-help p{margin:0 0 14px;color:#6E6B5F;font-size:11.5px;line-height:1.55}
        .account-help button{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border:0;border-radius:11px;background:#13283D;color:#fff;font:800 11.5px ${FONT};cursor:pointer}
        .portal-skeleton{display:grid;gap:16px;animation:skeletonEnter .25s ease both}.portal-skeleton-block{position:relative;overflow:hidden;border:1px solid #E5E8E9;border-radius:22px;background:#E9ECEC}.portal-skeleton-block:after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent);animation:portalShimmer 1.25s ease-in-out infinite}.portal-skeleton-hero{height:250px;background:linear-gradient(135deg,#DCE4E5,#C8D4D6)}.portal-skeleton-progress{height:62px;border-radius:18px}.portal-skeleton-row{display:grid;grid-template-columns:150px 1fr;gap:16px}.portal-skeleton-thumb{height:130px}.portal-skeleton-copy{height:130px}.portal-skeleton-account-hero{height:114px;background:linear-gradient(135deg,#D2DCDE,#B9CCCA)}.portal-skeleton-columns{display:grid;grid-template-columns:1.35fr .65fr;gap:18px}.portal-skeleton-panel{height:440px}.portal-skeleton-security{height:360px}@keyframes portalShimmer{to{transform:translateX(100%)}}@keyframes skeletonEnter{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @media(max-width:700px){
          .customer-app-bar{display:flex!important;min-height:52px;padding:7px 12px!important}
          .customer-signout{padding:8px 10px!important;font-size:11.5px!important}
          .pt-tabs-desktop{display:none}.pt-tabs-mobile{position:fixed;top:auto;bottom:0;left:0;right:0;z-index:50;display:grid;grid-template-columns:repeat(3,1fr);gap:3px;padding:7px 10px calc(7px + env(safe-area-inset-bottom));border-top:1px solid rgba(19,40,61,.1);border-bottom:0;background:rgba(255,255,255,.96);box-shadow:0 -12px 32px rgba(19,40,61,.11);backdrop-filter:blur(20px);overflow:visible}
          .pt-tabs button{display:flex!important;min-height:56px!important;flex-direction:column;justify-content:center;gap:3px!important;padding:3px 5px!important;border-radius:15px!important;color:#70808A!important;font-size:0!important}
          .pt-tabs button[data-active="true"]{background:transparent!important;color:#13283D!important;box-shadow:none!important}
          .pt-tab-icon{display:grid;place-items:center;width:38px;height:27px;border-radius:999px;transition:transform .2s ease,background .2s ease,color .2s ease}
          .pt-tabs button[data-active="true"] .pt-tab-icon{transform:translateY(-1px);background:#13283D;color:#fff;box-shadow:0 7px 15px rgba(19,40,61,.2)}
          .pt-tab-label{font-size:10.5px;font-weight:850;line-height:1.05}.pt-tab-label-text{display:none}.pt-tab-label:after{content:attr(data-mobile)}
          .pt-tabs::-webkit-scrollbar,.guest-progress::-webkit-scrollbar{display:none}
          .pt-wrap{padding:10px 10px calc(100px + env(safe-area-inset-bottom))}
          .guest-sample-bar{align-items:flex-start}
          .guest-sample-exit span{display:none}
          .trip-section-nav{display:flex;gap:5px;overflow-x:auto;padding:5px;scrollbar-width:none}.trip-section-nav::-webkit-scrollbar{display:none}.trip-section-nav button{flex:0 0 auto;min-width:91px;min-height:44px}.trip-section-heading{align-items:flex-start;flex-direction:column;gap:9px}.trip-section-heading h1{font-size:27px}.trip-section-heading p{font-size:11px}.portal-enterprise-grid{grid-template-columns:1fr}.portal-enterprise-card{padding:16px!important}.traveler-party-hero{align-items:flex-start;flex-wrap:wrap;padding:17px}.traveler-party-count{width:58px;height:58px;border-radius:18px;font-size:22px}.traveler-party-hero button{width:100%}.payment-hero{grid-template-columns:1fr 1fr}.payment-hero>div:first-child{grid-column:1/-1}.payment-hero>div{padding:16px}.support-hero{grid-template-columns:1fr;padding:19px}.support-hero button{justify-content:center}.trip-section-heading-badge{align-self:flex-start}
          .guest-empty{grid-template-columns:1fr;min-height:0}
          .guest-empty-copy{padding:31px 22px 26px}
          .guest-empty h1{font-size:36px}
          .guest-empty-proof{grid-template-columns:1fr;gap:8px;margin-top:24px}
          .guest-empty-proof div{grid-template-columns:120px 1fr;align-items:start;padding-top:9px}
          .guest-empty-visual{min-height:350px;padding:28px}
          .guest-preview-phone{max-width:290px}
          .guest-trip-hero{min-height:220px;padding:22px!important;border-radius:22px!important}
          .journey-overview{grid-template-columns:1fr;min-height:0;border-radius:19px}.journey-overview .guest-trip-hero{min-height:140px;padding:13px!important;border-radius:0!important}.journey-control-panel{grid-template-columns:1fr;grid-template-areas:"intro" "glance" "status" "next";gap:10px;padding:14px}.journey-trip-intro h1{font-size:24px}.journey-trip-meta{gap:6px 10px}.journey-glance{margin:0}.journey-status{grid-template-columns:32px minmax(0,1fr);padding:10px}.journey-status-mark{width:32px;height:32px;border-radius:10px}.journey-status-copy b{font-size:12.5px}.journey-status-detail{grid-column:1/-1;padding:7px 0 0;border-top:1px solid #D5E0E0;border-left:0}.journey-status-detail small{display:block}.journey-control-panel .guest-next-up{grid-template-columns:50px minmax(0,1fr);gap:9px;padding:9px!important}.journey-control-panel .guest-next-photo{width:50px;height:50px}.journey-control-panel .guest-next-facts{flex-direction:column;gap:2px}.journey-control-panel .guest-next-actions{grid-column:1/-1;grid-template-columns:1fr 1fr}.journey-control-panel .guest-next-actions button{min-height:42px;padding:0 7px}
          .simple-trip-summary{grid-template-columns:76px minmax(0,1fr);gap:11px;padding:11px}.simple-trip-photo{width:76px;height:76px}.simple-trip-copy h1{font-size:21px}.simple-trip-meta{display:grid;gap:4px}.simple-countdown{grid-column:1/-1;display:flex;justify-content:flex-start;gap:5px;width:auto;height:auto;padding:8px 10px}.simple-countdown b{font-size:18px}.simple-countdown span{margin:0}.simple-home-grid{grid-template-columns:1fr}.simple-next-card,.simple-status-card{padding:13px}.simple-next-content{grid-template-columns:68px minmax(0,1fr);gap:10px}.simple-next-content img{width:68px;height:68px}.simple-next-copy h2{font-size:17px}.simple-next-facts{display:grid;gap:3px}.simple-next-actions{grid-column:1/-1;grid-template-columns:1fr 1fr}.simple-next-actions button{min-height:43px;padding:0 8px}.simple-status-card{gap:10px}.trip-command-main{padding:17px 18px 11px}.trip-command-copy h2{font-size:21px}.trip-command-copy p{display:none}.trip-tool-actions{padding:0 14px 17px}.premium-journey-grid{grid-template-columns:1fr}.premium-itinerary{padding:14px}.premium-itinerary-head{align-items:flex-start}.premium-itinerary-head h2{font-size:22px}.premium-itinerary-head p{display:none}.premium-activity-row{grid-template-columns:76px minmax(0,1fr);gap:10px}.premium-activity-row img{width:76px;height:62px}.premium-activity-state{grid-column:2;display:flex;align-items:center;justify-content:space-between}.premium-sidebar{position:static}.trip-command.is-compact .trip-tool-actions{grid-template-columns:1fr 1fr}
          .guest-trip-title{font-size:31px!important}
          .guest-progress{overflow:hidden;padding:15px 9px!important}
          .guest-progress>div{min-width:0}
          .guest-progress-label{font-size:9px!important;line-height:1.15}
          .guest-next-up{grid-template-columns:92px minmax(0,1fr);gap:12px}
          .guest-next-photo{height:92px}
          .guest-next-actions{grid-column:1/-1;grid-template-columns:1fr 1fr}
          .guest-next-copy h2{font-size:18px}
          .trip-command-main{padding:22px 18px 18px}.trip-command-copy h2{font-size:25px}.trip-tool-actions{grid-template-columns:repeat(2,1fr);padding:0 18px 18px}.trip-tool-action{min-height:55px}.trip-tool-panel{margin:0 8px 8px;padding:14px}.trip-pass-grid{grid-template-columns:1fr}.packing-list{grid-template-columns:1fr}.trip-tool-toast{margin:0 18px 14px}
          .overview-tools-grid{grid-template-columns:1fr;gap:12px}.overview-tools-grid .trip-concierge-card{height:auto;flex-direction:row;align-items:center;padding:14px}.overview-tools-grid .trip-concierge-copy{flex:1}.overview-tools-grid .trip-concierge-copy b{font-size:14px}.overview-tools-grid .trip-concierge-action{width:auto;margin-top:0}
          .itinerary-finder{padding:13px!important}.itinerary-finder-head{align-items:flex-start}.itinerary-finder-title small{max-width:190px;line-height:1.3}.itinerary-filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;overflow:visible;padding:0}.itinerary-filter-label{display:none}.itinerary-filter{min-height:40px;padding:0 6px;white-space:normal;line-height:1.15}
          .guest-itinerary-grid{grid-template-columns:1fr;gap:15px!important}
          .guest-booking-photo{height:180px!important}
          .guest-booking-modal{max-height:calc(100dvh - 20px)!important;border-radius:20px!important}.guest-booking-hero{min-height:190px;padding:20px}.guest-booking-hero h2{font-size:27px}.guest-booking-hero-meta{gap:8px}
          .guest-booking-layout{grid-template-columns:1fr;gap:12px;padding:12px!important}
          .guest-booking-summary,.guest-meeting-panel{padding:14px;border-radius:17px}
          .guest-voucher-qr{width:138px;height:138px}
          .guest-booking-facts{grid-template-columns:1fr 1fr;gap:7px}
          .guest-booking-facts>div:last-child{grid-column:1/-1}
          .guest-meeting-panel{grid-template-rows:auto 240px auto auto}
          .guest-meeting-copy h3{font-size:19px}
          .guest-directions-button{min-height:48px}
          .customer-help{display:none!important}
          .concierge-head{padding:15px}
          .concierge-assurance{display:none}
          .concierge-thread{min-height:360px;max-height:none;padding:17px 13px}
          .concierge-compose{position:sticky;bottom:calc(70px + env(safe-area-inset-bottom));padding:11px;box-shadow:0 -10px 24px rgba(19,40,61,.06)}
          .trip-concierge-card{padding:14px}.trip-concierge-action span{display:none}
          .account-hero{grid-template-columns:auto minmax(0,1fr);gap:13px;padding:19px!important}
          .account-avatar{width:54px;height:54px;border-radius:18px;font-size:19px}
          .account-identity h1{font-size:20px;white-space:normal;line-height:1.1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
          .account-completion{grid-column:1/-1;width:auto}
          .account-grid{grid-template-columns:1fr;gap:14px}
          .account-stack{gap:14px}
          .account-card{padding:18px!important}
          .account-fields{grid-template-columns:1fr;gap:12px}
          .account-field-wide{grid-column:auto}
          .account-save-row{align-items:flex-start;flex-direction:column-reverse}.account-save-row>div{display:none!important}
          .account-mobile-save{position:fixed;left:12px;right:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:46;display:flex;align-items:center;gap:10px;padding:9px;border:1px solid rgba(19,40,61,.1);border-radius:17px;background:rgba(255,255,255,.96);box-shadow:0 16px 42px rgba(19,40,61,.2);backdrop-filter:blur(18px);animation:skeletonEnter .2s ease both}.account-mobile-save span{flex:1;padding-left:5px;color:#53636E;font-size:10.5px;font-weight:750}.account-mobile-save button{min-height:44px;padding:0 16px;border:0;border-radius:12px;background:#13283D;color:#fff;font:850 12px ${FONT};cursor:pointer}
          .password-modal-backdrop{place-items:end center;padding:0}.password-modal{width:100%;box-sizing:border-box;border-radius:24px 24px 0 0;padding:24px 20px calc(24px + env(safe-area-inset-bottom))}
          .portal-skeleton-hero{height:245px}.portal-skeleton-progress{height:50px}.portal-skeleton-row{grid-template-columns:88px 1fr;gap:12px}.portal-skeleton-thumb,.portal-skeleton-copy{height:110px}.portal-skeleton-account-hero{height:150px}.portal-skeleton-columns{grid-template-columns:1fr;gap:14px}.portal-skeleton-panel{height:520px}.portal-skeleton-security{height:390px}
        }
        @media(prefers-reduced-motion:reduce){.portal-skeleton-block:after,.portal-skeleton{animation:none!important}.pt-tab-icon{transition:none!important}}
      `}</style>

      {/* app bar */}
      <div className="customer-app-bar" style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px clamp(12px,3vw,22px)" }}>
        <div className="customer-brand"><Logo fontSize={20} surface="dark" /></div>
        <div className="pt-tabs pt-tabs-desktop">
          {TABS.map(({ key, label: lab, mobileLabel, Icon }) => {
            const on = tab === key;
            return (
              <button key={key} data-active={on} onClick={() => setTab(key)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: radius.pill, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", background: "transparent" }}>
                <span className="pt-tab-icon"><Icon size={16} /></span><span className="pt-tab-label" data-mobile={mobileLabel}><span className="pt-tab-label-text">{lab}</span></span>
              </button>
            );
          })}
        </div>
        <button className="customer-signout" onClick={onSignOut} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: radius.sm, fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
      <div className="pt-tabs pt-tabs-mobile">
        {TABS.map(({ key, label: lab, mobileLabel, Icon }) => {
          const on = tab === key;
          return (
            <button key={key} data-active={on} onClick={() => setTab(key)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: radius.pill, border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", background: "transparent" }}>
              <span className="pt-tab-icon"><Icon size={16} /></span><span className="pt-tab-label" data-mobile={mobileLabel}><span className="pt-tab-label-text">{lab}</span></span>
            </button>
          );
        })}
      </div>

      <div className="pt-wrap">
        {tab === "trip" && <TripTab trip={displayedTrip} error={sampleMode ? "" : tripError} onRetry={loadTrip} sampleMode={sampleMode} onPreviewSample={() => toggleSample(true)} onExitSample={() => toggleSample(false)} onMessage={() => setTab("messages")} onAccount={() => setTab("account")} />}
        {tab === "messages" && <MessagesTab trip={displayedTrip} />}
        {tab === "account" && <AccountTab email={email} onSignOut={onSignOut} onMessage={() => setTab("messages")} />}
      </div>

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
          <div style={{ flex: 1, fontWeight: 800, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8 }}><Sparkles size={17} color="#0A8174" /> Activity details</div>
          <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 4 }}><X size={20} /></button>
        </div>
        <div className="guest-booking-hero" style={{ backgroundImage: `url(${activityPhoto(booking.photo, 1200)})` }}>
          <div className="guest-booking-hero-copy">
            <div className="guest-booking-hero-status"><Check size={13}/> Confirmed experience</div>
            <h2>{booking.name}</h2>
            <p>Operated by {booking.operator}</p>
            <div className="guest-booking-hero-meta"><span><CalendarDays size={14}/>{fmt(booking.date)} · {booking.time}</span><span><Users size={14}/>{trip?.travelers || 2} travelers</span></div>
          </div>
        </div>
        <div className="guest-booking-layout" style={{ padding: 20 }}>
          <div className="guest-booking-summary" style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#087E71", fontWeight: 900, fontSize: 11, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".07em" }}><QrCode size={15} /> Mobile activity pass</div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 12, display: "inline-block" }}>
              {qr ? <img className="guest-voucher-qr" src={qr} alt="voucher QR" /> : <div className="guest-voucher-qr" />}
            </div>
            <div className="guest-booking-facts">
              <div><b>When</b><span>{fmt(booking.date)}, {booking.time}</span></div>
              <div><b>Bring</b><span>{booking.bring}</span></div>
              {booking.price > 0 && <div><b>Activity value</b><span>{money(booking.price)}</span></div>}
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

function EmptyTripState({ onPreviewSample, onMessage }) {
  const preview = DEMO_TRIP.days[0].items[0];
  return (
    <section className="pt-card guest-empty">
      <div className="guest-empty-copy">
        <div className="guest-empty-kicker"><Sparkles size={15} /> Your TicoWild journey</div>
        <h1>Your whole Costa Rica adventure, one tap away.</h1>
        <p>When planning begins, this becomes your travel command center—not another booking list. Every activity, exact meeting point, confirmation, and concierge conversation lives here.</p>
        <div className="guest-empty-actions">
          <button className="guest-empty-primary" onClick={onPreviewSample}><Sparkles size={16} /> Preview a sample trip</button>
          <button className="guest-empty-secondary" onClick={onMessage}><MessageCircle size={16} /> Message your concierge</button>
        </div>
        <div className="guest-empty-proof">
          <div><b>Day by day</b><span>A calm timeline for every tour and transfer.</span></div>
          <div><b>Meet with confidence</b><span>Exact pins, pickup notes, and directions.</span></div>
          <div><b>Human backup</b><span>Your TicoWild concierge is always close.</span></div>
        </div>
      </div>
      <div className="guest-empty-visual" aria-hidden="true">
        <div className="guest-preview-phone">
          <div className="guest-preview-photo" style={{ backgroundImage: `url(${activityPhoto(preview.photo, 800)})` }} />
          <div className="guest-preview-details">
            <div className="guest-preview-chip"><Check size={11} /> Confirmed</div>
            <b>{preview.name}</b>
            <span><Clock size={13} /> {preview.time}</span>
            <span><MapPin size={13} /> {preview.meetingPoint.name}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TripCommandCenter({ trip, bookings, onVoucher, compact = false }) {
  const storageKey = `ticowild_packing_${trip.id}`;
  const packing = [...bookings.flatMap((item) => String(item.bring || "").split(",").map((part) => part.trim()).filter(Boolean)).reduce((items, item) => {
    const key = item.toLocaleLowerCase();
    if (!items.has(key)) items.set(key, item.replace(/\b\w/g, (letter) => letter.toUpperCase()));
    return items;
  }, new Map()).values()];
  const [panel, setPanel] = useState("");
  const [notice, setNotice] = useState("");
  const [packed, setPacked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const setPacking = (item) => {
    const next = packed.includes(item) ? packed.filter((value) => value !== item) : [...packed, item];
    setPacked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  const share = async () => {
    const data = { title: trip.title, text: `My TicoWild Costa Rica journey: ${trip.region}, ${fmt(trip.start)} – ${fmt(trip.end)}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(`${data.text}\n${data.url}`); setNotice("Private trip link copied to your clipboard."); }
    } catch (error) { if (error?.name !== "AbortError") setNotice("Your trip is ready to share from this page."); }
  };
  const packPercent = packing.length ? Math.round((packed.length / packing.length) * 100) : 100;
  const togglePanel = (name) => { setPanel((current) => current === name ? "" : name); setNotice(""); };
  return (
    <section className={`pt-card trip-command${compact ? " is-compact" : ""}`} aria-label="Trip essentials">
      <div className="trip-command-main">
        <div className="trip-command-copy"><div className="trip-command-kicker"><Sparkles size={13}/> Quick access</div><h2>Your trip tools</h2><p>Passes, packing, calendar, and sharing in one place.</p></div>
      </div>
      <div className="trip-tool-actions">
        <button className="trip-tool-action" data-active={panel === "passes"} onClick={() => togglePanel("passes")}><span className="trip-tool-icon"><ClipboardCheck size={17}/></span><span>Trip passes</span></button>
        <button className="trip-tool-action" data-active={panel === "packing"} onClick={() => togglePanel("packing")}><span className="trip-tool-icon"><ListChecks size={17}/></span><span>Packing list</span></button>
        <button className="trip-tool-action" onClick={() => { downloadTripCalendar(trip, bookings); setNotice("Trip calendar downloaded. Open it to add every activity."); }}><span className="trip-tool-icon"><CalendarPlus size={17}/></span><span>Add calendar</span></button>
        <button className="trip-tool-action" onClick={share}><span className="trip-tool-icon"><Share2 size={17}/></span><span>Share journey</span></button>
      </div>
      {panel === "passes" && <div className="trip-tool-panel"><div className="trip-tool-panel-head"><div><b>Your trip wallet</b><span>Open any confirmed pass for its QR code, meeting pin, and arrival details.</span></div><button onClick={() => setPanel("")} aria-label="Close trip wallet"><X size={15}/></button></div><div className="trip-pass-grid">{bookings.map((item) => <button key={item.id} className="trip-pass" disabled={item.status !== "Confirmed"} onClick={() => item.status === "Confirmed" && onVoucher(item)}><span className="trip-pass-icon">{item.status === "Confirmed" ? <QrCode size={16}/> : <Hourglass size={15}/>}</span><span className="trip-pass-copy"><b>{item.name}</b><span>{item.status === "Confirmed" ? `${fmt(item.date)} · Ready to open` : "TicoWild is coordinating this"}</span></span><ChevronRight size={14}/></button>)}</div></div>}
      {panel === "packing" && <div className="trip-tool-panel"><div className="trip-tool-panel-head"><div><b>Your smart packing list</b><span>Built automatically from every experience in this itinerary and saved on this device.</span></div><button onClick={() => setPanel("")} aria-label="Close packing list"><X size={15}/></button></div><div className="packing-progress"><div className="packing-progress-ring">{packPercent}%</div><div><b>{packed.length === packing.length ? "You are packed" : `${packing.length - packed.length} items still to pack`}</b><span>Tap each item as it goes into your bag.</span></div></div><div className="packing-list">{packing.map((item) => <button key={item} className="packing-item" data-checked={packed.includes(item)} onClick={() => setPacking(item)}><span className="packing-check">{packed.includes(item) && <Check size={13}/>}</span>{item}</button>)}</div></div>}
      {notice && <div className="trip-tool-toast">{notice}</div>}
    </section>
  );
}

function PortalSectionHeading({ eyebrow, title, body, badge }) {
  return <div className="trip-section-heading"><div><span>{eyebrow}</span><h1>{title}</h1><p>{body}</p></div>{badge && <div className="trip-section-heading-badge">{badge}</div>}</div>;
}

function DocumentsSection({ trip, bookings, onVoucher, onPayments }) {
  const confirmed = bookings.filter((item) => item.status === "Confirmed");
  return <div className="trip-section-page"><PortalSectionHeading eyebrow="Travel wallet" title="Documents & passes" body="Every trip document a traveler may need, organized around the itinerary instead of buried in email." badge={`${confirmed.length} passes ready`} />
    <div className="portal-enterprise-grid">
      <section className="pt-card portal-enterprise-card"><div className="portal-enterprise-card-head"><div className="portal-enterprise-card-icon"><QrCode size={19}/></div><div><h2>Activity passes</h2><p>Confirmed bookings open into an offline-ready QR pass and exact meeting point.</p></div></div><div className="document-list">{bookings.map((item) => <div className="document-row" data-pending={item.status !== "Confirmed"} key={item.id}><span className="document-row-icon">{item.status === "Confirmed" ? <QrCode size={16}/> : <Hourglass size={15}/>}</span><div><b>{item.name}</b><span>{item.status === "Confirmed" ? `${fmt(item.date)} · Pass ready` : "Awaiting operator confirmation"}</span></div>{item.status === "Confirmed" && <button onClick={() => onVoucher(item)} aria-label={`Open ${item.name} pass`}><ChevronRight size={15}/></button>}</div>)}</div></section>
      <div style={{display:"grid",gap:14}}>
        <section className="pt-card portal-enterprise-card"><div className="portal-enterprise-card-head"><div className="portal-enterprise-card-icon"><CalendarPlus size={19}/></div><div><h2>Trip calendar</h2><p>Download every scheduled activity, location, and preparation note into the traveler’s calendar.</p></div></div><button className="portal-enterprise-action" onClick={() => downloadTripCalendar(trip, bookings)}><CalendarPlus size={15}/> Download complete calendar</button></section>
        <section className="pt-card portal-enterprise-card"><div className="portal-enterprise-card-head"><div className="portal-enterprise-card-icon"><ReceiptText size={19}/></div><div><h2>Payment records</h2><p>Review deposit, remaining balance, and download a portable trip payment summary.</p></div></div><button className="portal-enterprise-action secondary" onClick={onPayments}><ReceiptText size={15}/> View payments & receipts</button></section>
      </div>
    </div>
  </div>;
}

function TravelersSection({ trip, onAccount }) {
  const travelers = Array.from({ length: Math.max(1, Number(trip.travelers || 1)) }, (_, index) => index);
  const share = async () => {
    const data = { title: trip.title, text: `Our TicoWild journey: ${trip.region}, ${fmt(trip.start)} – ${fmt(trip.end)}`, url: window.location.href };
    try { if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(`${data.text}\n${data.url}`); } catch { /* customer cancelled */ }
  };
  return <div className="trip-section-page"><PortalSectionHeading eyebrow="Travel party" title="Travelers" body="A clear view of who TicoWild is coordinating, with personal trip preferences kept in the lead traveler’s private account." badge={`${trip.travelers} travelers`} />
    <div className="traveler-party-hero"><div className="traveler-party-count">{trip.travelers}</div><div><b>Your Costa Rica travel party</b><span>One shared itinerary, one source of truth, and concierge support connected to the entire journey.</span></div><button onClick={share}><Share2 size={14}/> Share trip with your party</button></div>
    <div className="portal-enterprise-grid"><section className="pt-card portal-enterprise-card"><div className="portal-enterprise-card-head"><div className="portal-enterprise-card-icon"><Users size={19}/></div><div><h2>Party members</h2><p>The live trip uses names from the secured traveler record. Sample mode protects real personal information.</p></div></div><div className="traveler-list">{travelers.map((index) => <div className="traveler-row" key={index}><span className="traveler-row-icon"><User size={16}/></span><div><b>{index === 0 ? "Lead traveler" : `Travel companion ${index + 1}`}</b><span>{index === 0 ? "Manages the trip account and concierge conversation" : "Included in tour counts and operator coordination"}</span></div><CheckCircle2 size={16} color="#0A8174"/></div>)}</div></section>
      <section className="pt-card portal-enterprise-card"><div className="portal-enterprise-card-head"><div className="portal-enterprise-card-icon"><ClipboardCheck size={19}/></div><div><h2>Traveler preferences</h2><p>Dietary needs, mobility considerations, celebrations, phone, country, and pickup preferences stay in the private profile.</p></div></div><button className="portal-enterprise-action" onClick={onAccount}><User size={15}/> Review traveler profile</button></section></div>
  </div>;
}

function PaymentsSection({ trip }) {
  const balance = Number(trip.total || 0) - Number(trip.deposit || 0);
  return <div className="trip-section-page"><PortalSectionHeading eyebrow="Transparent trip finances" title="Payments & receipts" body="Customers can understand what has been paid, what remains, and how the remaining balance is handled without contacting support." badge="Deposit recorded" />
    <div className="payment-hero"><div><span>Trip total</span><b>{money(trip.total)}</b><small>Complete journey value</small></div><div><span>Deposit paid</span><b>{money(trip.deposit)}</b><small style={{color:"#078A73"}}>Recorded ✓</small></div><div><span>Remaining</span><b>{money(balance)}</b><small style={{color:"#A77C00"}}>To operators on arrival</small></div></div>
    <div className="portal-enterprise-grid"><section className="pt-card portal-enterprise-card"><div className="portal-enterprise-card-head"><div className="portal-enterprise-card-icon"><CreditCard size={19}/></div><div><h2>Payment timeline</h2><p>A plain-language view of the customer’s financial progress.</p></div></div><div className="payment-timeline"><div className="payment-step" data-done="true"><span className="payment-step-icon"><Check size={16}/></span><div><b>Deposit received</b><span>{money(trip.deposit)} credited toward this journey</span></div></div><div className="payment-step" data-next="true"><span className="payment-step-icon"><Clock size={16}/></span><div><b>Remaining trip balance</b><span>{money(balance)} payable to participating operators on arrival</span></div></div></div></section>
      <section className="pt-card portal-enterprise-card"><div className="portal-enterprise-card-head"><div className="portal-enterprise-card-icon"><ReceiptText size={19}/></div><div><h2>Portable records</h2><p>Keep a local payment summary for travel planning, expense records, or sharing with the travel party.</p></div></div><button className="portal-enterprise-action" onClick={() => downloadPaymentSummary(trip)}><FileText size={15}/> Download payment summary</button></section></div>
  </div>;
}

function SupportSection({ bookings, onMessage }) {
  const pending = bookings.filter((item) => item.status !== "Confirmed");
  const needs = [
    ["Pickup or meeting help", "Ask about timing, directions, transfers, or where to meet.", Navigation],
    ["Change a trip detail", "Request traveler, timing, accessibility, or booking changes.", CalendarDays],
    ["Operator confirmation", pending.length ? `${pending.length} activity is still being coordinated by TicoWild.` : "Every activity is currently confirmed.", BellRing],
  ];
  return <div className="trip-section-page"><PortalSectionHeading eyebrow="Human support" title="Help throughout the journey" body="The support experience keeps every request attached to the trip so travelers never need to repeat booking details." badge="Concierge connected" />
    <div className="support-hero"><div className="support-hero-copy"><span>TicoWild concierge</span><h2>A real local team is with you</h2><p>Questions, changes, pickup coordination, and operator follow-up stay in one private conversation connected to this journey.</p></div><button onClick={onMessage}><MessageCircle size={16}/> Message concierge</button></div>
    <section className="pt-card portal-enterprise-card"><div className="portal-enterprise-card-head"><div className="portal-enterprise-card-icon"><LifeBuoy size={19}/></div><div><h2>What can we help with?</h2><p>Choose a need and continue with the concierge without searching for a separate support channel.</p></div></div><div className="support-list">{needs.map(([title, body, Icon]) => <div className="support-row" key={title}><span className="support-row-icon"><Icon size={16}/></span><div><b>{title}</b><span>{body}</span></div><button onClick={onMessage} aria-label={`Ask concierge about ${title}`}><ChevronRight size={15}/></button></div>)}</div></section>
    <div className="guest-trust"><ShieldCheck size={15} color="#34D399"/> For immediate danger, contact local emergency services first, then notify TicoWild.</div>
  </div>;
}

function TripTab({ trip, error, onRetry, sampleMode, onPreviewSample, onExitSample, onMessage, onAccount }) {
  const [voucher, setVoucher] = useState(null);
  const [tripSection, setTripSection] = useState("overview");
  const [itineraryQuery, setItineraryQuery] = useState("");
  const [itineraryFilter, setItineraryFilter] = useState("all");
  if (trip === undefined) return <PortalSkeleton type="trip" />;
  if (error) return <PortalNotice title="We couldn't load your trip" body={error} action="Try again" onAction={onRetry} tone="error" />;
  if (!trip) return <EmptyTripState onPreviewSample={onPreviewSample} onMessage={onMessage} />;
  const until = daysUntil(trip.start);
  const heroPhoto = trip.days?.[0]?.items?.[0]?.photo;
  const bookings = trip.days.flatMap((day) => day.items.map((item) => ({ ...item, date: day.date })));
  const confirmedCount = bookings.filter((item) => item.status === "Confirmed").length;
  const allExperiencesReady = confirmedCount === bookings.length;
  const nextUp = bookings.find((item) => item.status === "Confirmed") || bookings[0];
  const concierge = trip.concierge || { name: "TicoWild Concierge Team", role: "Local trip coordination", availability: "Available in your private trip conversation" };
  const conciergeInitials = concierge.name === "TicoWild Concierge Team" ? "TW" : concierge.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const normalizedQuery = itineraryQuery.trim().toLocaleLowerCase();
  const matchesItinerary = (item) => {
    const statusMatches = itineraryFilter === "all" || (itineraryFilter === "confirmed" ? item.status === "Confirmed" : item.status !== "Confirmed");
    const searchText = [item.name, item.operator, item.meet, item.bring, item.meetingPoint?.name].filter(Boolean).join(" ").toLocaleLowerCase();
    return statusMatches && (!normalizedQuery || searchText.includes(normalizedQuery));
  };
  const visibleDays = trip.days.map((day) => ({ ...day, items: day.items.filter(matchesItinerary) })).filter((day) => day.items.length);
  const visibleCount = visibleDays.reduce((total, day) => total + day.items.length, 0);
  const resetItinerary = () => { setItineraryQuery(""); setItineraryFilter("all"); };
  return (
    <div className="guest-trip-view" style={{ display: "grid", gap: 16 }}>
      {sampleMode && (
        <div className="simple-preview-note">
          <Sparkles size={14}/><b>Sample preview</b><span>Example trip data · Nothing has been added to your account.</span>
          <button onClick={onExitSample}><ArrowLeft size={12}/> Exit</button>
        </div>
      )}
      {tripSection === "overview" && <div className="trip-section-page">
      <section className="simple-trip-summary" aria-label="Trip summary">
        <img className="simple-trip-photo" src={activityPhoto(heroPhoto, 600)} alt="" />
        <div className="simple-trip-copy">
          <div className="simple-eyebrow"><Sparkles size={12}/> Your upcoming trip</div>
          <h1>{trip.title}</h1>
          <div className="simple-trip-meta">
            <span><MapPin size={12}/>{trip.region}</span>
            <span><CalendarDays size={12}/>{fmt(trip.start)} – {fmt(trip.end)}</span>
            <span><Users size={12}/>{trip.travelers} travelers</span>
          </div>
        </div>
        <div className="simple-countdown"><b>{until > 0 ? until : until === 0 ? "Today" : "Live"}</b><span>{until > 0 ? "days to go" : "trip status"}</span></div>
      </section>

      <div className="premium-journey-grid">
        <section className="premium-itinerary">
          <div className="premium-itinerary-head"><div><span>Your journey</span><h2>Upcoming itinerary</h2><p>Everything scheduled for your Costa Rica trip.</p></div><button onClick={() => { setTripSection("itinerary"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>View full itinerary <ChevronRight size={13}/></button></div>
          <div className="premium-itinerary-list">
            {bookings.map((item) => {
              const ready = item.status === "Confirmed";
              return <div key={item.id} className="premium-activity-row" data-ready={ready} onClick={() => ready && setVoucher(item)}>
                <img src={activityPhoto(item.photo, 400)} alt="" />
                <div className="premium-activity-copy"><span className="premium-activity-date">{fmt(item.date)} · {item.time}</span><h3>{item.name}</h3><p><span><MapPin size={11}/>{item.meet}</span><span>{item.operator}</span></p></div>
                <div className="premium-activity-state"><span data-pending={!ready}>{ready ? <CheckCircle2 size={11}/> : <Hourglass size={11}/>} {ready ? "Ready" : "Confirming"}</span>{ready && <span className="premium-detail-link">Meeting details <ChevronRight size={12}/></span>}</div>
              </div>;
            })}
          </div>
        </section>
        <aside className="premium-sidebar">
          <section className="simple-status-card">
            <div className="simple-status-row"><span className="simple-status-icon"><Check size={18}/></span><span className="simple-status-copy"><span>Trip status</span><b>{allExperiencesReady ? "Everything is confirmed" : `${confirmedCount} of ${bookings.length} experiences confirmed`}</b></span></div>
            <div className="simple-progress"><span style={{width:`${bookings.length ? Math.round((confirmedCount / bookings.length) * 100) : 0}%`}} /></div>
            <div className="simple-status-caption">{allExperiencesReady ? "You are ready to go." : "TicoWild is confirming the remaining activity."}</div>
            <button className="simple-concierge-button" onClick={onMessage}><span className="simple-concierge-avatar">{conciergeInitials}</span><span><b>Message {concierge.name}</b><small>Your Costa Rica concierge</small></span><ChevronRight size={15}/></button>
          </section>
          <TripCommandCenter compact trip={trip} bookings={bookings} onVoucher={setVoucher} />
        </aside>
      </div>
      </div>}

      {/* itinerary */}
      {tripSection === "itinerary" && <div className="trip-section-page">
        <button className="trip-back" onClick={() => { setTripSection("overview"); window.scrollTo({ top: 0, behavior: "smooth" }); }}><ArrowLeft size={14}/> Back to trip</button>
        <PortalSectionHeading eyebrow="Day-by-day journey" title="Your itinerary" body="Search and filter every activity, pickup point, operator, and preparation detail in this trip." badge={`${bookings.length} activities`} />
      <div>
        <div className="guest-itinerary-heading">Your itinerary</div>
        <div className="pt-card itinerary-finder">
          <div className="itinerary-finder-head"><div className="itinerary-finder-title"><span><Search size={16}/></span><div><b>Find anything in your trip</b><small>Search activities, operators, pickup points, or what to bring.</small></div></div><span className="itinerary-result-count">{visibleCount} {visibleCount === 1 ? "result" : "results"}</span></div>
          <div className="itinerary-search"><Search size={15}/><input type="search" value={itineraryQuery} onChange={(event) => setItineraryQuery(event.target.value)} placeholder="Try “Tamarindo,” “swimsuit,” or an operator…" aria-label="Search your itinerary" />{itineraryQuery && <button onClick={() => setItineraryQuery("")} aria-label="Clear itinerary search"><X size={14}/></button>}</div>
          <div className="itinerary-filters"><span className="itinerary-filter-label"><SlidersHorizontal size={12}/> Filter</span>{[["all","Everything"],["confirmed","Confirmed"],["pending","In coordination"]].map(([key, text]) => <button key={key} className="itinerary-filter" data-active={itineraryFilter === key} onClick={() => setItineraryFilter(key)}>{text}</button>)}</div>
        </div>
        <div className="guest-itinerary-grid" style={{ display: "grid", gap: 12 }}>
          {visibleDays.map((day) => (
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
        {!visibleCount && <div className="itinerary-empty"><Search size={22}/><b>No trip details match that search</b><span>Try a different word or show the complete itinerary.</span><button onClick={resetItinerary}>Show everything</button></div>}
      </div>
      </div>}

      <div className="guest-trust" style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 12.5 }}>
        <ShieldCheck size={15} color="#34D399" /> Vetted local operators · TicoWild coordinates every confirmation
      </div>

      {voucher && <Voucher booking={voucher} trip={trip} onClose={() => setVoucher(null)} />}
    </div>
  );
}

// ── Messages ────────────────────────────────────────────────────────────────
function MessagesTab({ trip }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { getMessages().then(setMessages).catch((err) => setError(err.message)); }, []);
  const send = async () => { const t = draft.trim(); if (!t || busy) return; setBusy(true); setError(""); try { setMessages(await sendMessage(t)); setDraft(""); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const time = (value) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
  const prompts = ["What should I pack?", "Confirm my pickup", "I need help with my trip"];
  const concierge = trip?.concierge || { name: "TicoWild Concierge Team", role: "Local trip coordination", availability: "Available in your private trip conversation" };
  const conciergeInitials = concierge.name === "TicoWild Concierge Team" ? "TW" : concierge.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="consumer-section-label">Your trip support</div>
      <section className="pt-card concierge-shell">
        <div className="concierge-head">
          <div className="concierge-avatar">{conciergeInitials}</div>
          <div className="concierge-title"><b>{concierge.name}</b><span>{concierge.role} · {concierge.availability}</span></div>
          <div className="concierge-assurance"><ShieldCheck size={15} /> Assigned to your trip</div>
        </div>
        <div className="concierge-thread">
          {messages.length ? messages.map((m) => {
            const mine = m.from === "customer";
            return (
              <div className="guest-message-row" data-mine={mine} key={m.id}>
                <div className="guest-message-meta">{mine ? "You" : concierge.name}{m.at ? ` · ${time(m.at)}` : ""}</div>
                <div className="guest-message-bubble" data-mine={mine} style={{ maxWidth: "min(78%,560px)", padding: "11px 14px", borderRadius: 15, fontSize: 13.5, lineHeight: 1.5 }}>{m.text}</div>
              </div>
            );
          }) : <div style={{ color: c.stone, textAlign: "center", padding: "40px 0" }}>Start a conversation with your Costa Rica concierge.</div>}
        </div>
        <div className="concierge-quick">{prompts.map((prompt) => <button key={prompt} onClick={() => setDraft(prompt)}>{prompt}</button>)}</div>
        <div className="concierge-compose">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Message your concierge…" style={input} />
          <button onClick={send} disabled={busy || !draft.trim()} aria-label="Send message" style={{ opacity: busy || !draft.trim() ? .45 : 1 }}><Send size={18} /></button>
        </div>
      </section>
      {error&&<div role="alert" style={{ padding:"10px 12px",borderRadius:radius.sm,border:"1px solid #F1B9B5",background:"#FFF3F2",color:"#B42318",fontSize:12.5 }}>{error}</div>}
      <div style={{ color: c.stone, fontSize: 11.5, textAlign: "center" }}>Messages stay connected to your trip so the whole TicoWild team can help without making you repeat yourself.</div>
    </div>
  );
}

// ── Account ─────────────────────────────────────────────────────────────────
function AccountTab({ email, onSignOut, onMessage }) {
  const [f, setF] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [linkState,setLinkState]=useState("");
  const [passwordOpen,setPasswordOpen]=useState(false);
  const [newPassword,setNewPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [passwordBusy,setPasswordBusy]=useState(false);
  const [passwordMessage,setPasswordMessage]=useState("");
  useEffect(() => { getProfile(email).then((p) => setF({ ...p, email: p.email || email })).catch((err)=>setError(err.message)); }, [email]);
  if (!f) return error?<PortalNotice title="We couldn't load your profile" body={error} tone="error"/>:<PortalSkeleton type="account" />;
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setSaved(false); setDirty(true); };
  const save = async () => { if(!dirty)return;setBusy(true);setError("");try{setF(await saveProfile(f));setSaved(true);setDirty(false);}catch(err){setError(err.message);}finally{setBusy(false);} };
  const sendLink = async () => { setLinkState("sending");setError("");try{await sendSecureSignInLink(email);setLinkState("sent");}catch(err){setError(err.message);setLinkState("");} };
  const updatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    if (newPassword.length < 8) return setPasswordMessage("Use at least 8 characters.");
    if (newPassword !== confirmPassword) return setPasswordMessage("The passwords do not match.");
    setPasswordBusy(true);
    try {
      await changePassword(newPassword);
      setNewPassword("");setConfirmPassword("");setPasswordOpen(false);setPasswordMessage("Password updated successfully.");
    } catch (err) { setPasswordMessage(err.message || "We could not update your password."); }
    finally { setPasswordBusy(false); }
  };
  const initials = String(f.name || email || "TW").split(/\s+|@/).filter(Boolean).slice(0,2).map((part)=>part[0]?.toUpperCase()).join("");
  const profileChecks = [f.name, f.phone, f.country, f.travelers, f.notes].filter((value)=>String(value || "").trim()).length;
  const completion = Math.round((profileChecks / 5) * 100);
  const Row = ({ k, lab, ph, type, wide, readOnly }) => (
    <label className={wide ? "account-field-wide" : ""} style={{ display: "block" }}><div style={label}>{lab}</div><input className={readOnly ? "account-readonly" : ""} readOnly={readOnly} type={type || "text"} value={f[k] || ""} onChange={readOnly ? undefined : set(k)} placeholder={ph} style={input} /></label>
  );
  return (
    <div className="account-view">
      <div className="consumer-section-label">Account & travel profile</div>
      <section className="pt-card account-hero">
        <div className="account-avatar">{initials || "TW"}</div>
        <div className="account-identity"><span>TicoWild traveler</span><h1>{f.name || "Complete your traveler profile"}</h1><p>{email}</p></div>
        <div className="account-completion"><div><span>Profile readiness</span><b>{completion}%</b></div><div className="account-completion-track"><i style={{ width: `${completion}%` }} /></div></div>
      </section>
      <div className="account-grid">
        <div className="account-stack">
          <section className="pt-card account-card">
            <div className="account-card-head"><div className="account-card-icon"><User size={19}/></div><div><h2>Personal details</h2><p>Used by your concierge for confirmations, pickups, and operator coordination.</p></div></div>
            <div className="account-fields">
              <Row k="name" lab="Full name" ph="Your full name" />
              <Row k="phone" lab="Mobile / WhatsApp" ph="+1 480 555 0100" type="tel" />
              <Row k="email" lab="Sign-in email" ph="you@email.com" type="email" readOnly />
              <Row k="country" lab="Home country" ph="United States" />
              <Row k="travelers" lab="Number of travelers" ph="2" type="number" />
              <label className="account-field-wide" style={{ display:"block" }}><div style={label}>Travel notes & preferences</div><textarea value={f.notes || ""} onChange={set("notes")} rows={4} placeholder="Dietary needs, mobility considerations, celebrations, preferred pickup style, or anything that helps us personalize your trip…" style={{ ...input,resize:"vertical",minHeight:105 }} /></label>
            </div>
            <div className="account-save-row"><span style={{ color:"#7A858D",fontSize:10.5,lineHeight:1.4 }}>Your details are only shared when needed to operate your bookings.</span><div style={{ display:"flex",alignItems:"center",gap:10 }}>{saved&&<span className="account-saved"><CheckCircle2 size={15}/> Saved</span>}<button className="account-save" onClick={save} disabled={busy||!dirty}>{busy?"Saving…":dirty?"Save traveler profile":saved?"Saved":"No changes"}</button></div></div>
            {error&&<div role="alert" style={{ marginTop:12,padding:"10px 12px",borderRadius:radius.sm,border:"1px solid #F1B9B5",background:"#FFF3F2",color:"#B42318",fontSize:12 }}>{error}</div>}
          </section>
        </div>
        <aside className="account-stack">
          <section className="pt-card account-card">
            <div className="account-card-head"><div className="account-card-icon"><LockKeyhole size={18}/></div><div><h2>Login & security</h2><p>A clear view of how access to your trip is protected.</p></div></div>
            <div className="security-status"><ShieldCheck size={21}/><div><b>Flexible secure access</b><span>Use a private email link or your own password.</span></div></div>
            <div className="security-list">
              <div className="security-row"><MailCheck size={17}/><div><b>One-time email link</b><span>{email}</span></div></div>
              <div className="security-row"><Smartphone size={17}/><div><b>This device</b><span>Currently signed in with an active session</span></div></div>
              <div className="security-row"><KeyRound size={17}/><div><b>Password</b><span>Set or change your password anytime</span></div></div>
            </div>
            <button className="account-secondary-action" onClick={sendLink} disabled={linkState==="sending"}>{linkState==="sending"?"Sending secure link…":linkState==="sent"?"Secure link sent ✓":"Email me a fresh sign-in link"}</button>
            <button className="account-secondary-action password-action" onClick={()=>{setPasswordOpen(true);setPasswordMessage("");}}>Change password</button>
            {passwordMessage&&<div className="password-success">{passwordMessage}</div>}
            <button className="account-danger-action" onClick={onSignOut}><LogOut size={14}/> Sign out of this device</button>
          </section>
          <section className="pt-card account-help"><h3>Need something changed?</h3><p>Your concierge can help with traveler names, timing, pickups, accessibility needs, or booking questions.</p><button onClick={onMessage}><Headphones size={15}/> Message your concierge</button></section>
        </aside>
      </div>
      {dirty&&<div className="account-mobile-save"><span>Unsaved traveler details</span><button onClick={save} disabled={busy}>{busy?"Saving…":"Save changes"}</button></div>}
      {passwordOpen&&<div className="password-modal-backdrop" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setPasswordOpen(false);}}><form className="password-modal" onSubmit={updatePassword} role="dialog" aria-modal="true" aria-labelledby="password-title"><div className="password-modal-head"><div><LockKeyhole size={20}/></div><div><h2 id="password-title">Change password</h2><p>Choose at least 8 characters. You can still use a secure email link anytime.</p></div><button className="password-modal-close" type="button" onClick={()=>setPasswordOpen(false)} aria-label="Close password dialog"><X size={17}/></button></div><div className="password-modal-fields"><label><div style={label}>New password</div><input autoFocus type="password" autoComplete="new-password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="At least 8 characters" style={input}/></label><label><div style={label}>Confirm new password</div><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Enter it again" style={input}/></label></div>{passwordMessage&&<div role="alert" style={{marginTop:12,padding:"10px 12px",borderRadius:11,background:"#FFF3F2",color:"#B42318",fontSize:11.5,fontWeight:700}}>{passwordMessage}</div>}<div className="password-modal-actions"><button className="password-cancel" type="button" onClick={()=>setPasswordOpen(false)}>Cancel</button><button className="password-submit" type="submit" disabled={passwordBusy||newPassword.length<8||confirmPassword.length<8}>{passwordBusy?"Updating…":"Update password"}</button></div></form></div>}
    </div>
  );
}

function PortalSkeleton({ type = "trip" }) {
  if (type === "account") return <div className="portal-skeleton" role="status" aria-label="Loading your account"><div className="portal-skeleton-block portal-skeleton-account-hero"/><div className="portal-skeleton-columns"><div className="portal-skeleton-block portal-skeleton-panel"/><div className="portal-skeleton-block portal-skeleton-security"/></div></div>;
  return <div className="portal-skeleton" role="status" aria-label="Loading your trip"><div className="portal-skeleton-block portal-skeleton-hero"/><div className="portal-skeleton-block portal-skeleton-progress"/><div className="portal-skeleton-row"><div className="portal-skeleton-block portal-skeleton-thumb"/><div className="portal-skeleton-block portal-skeleton-copy"/></div></div>;
}

function PortalNotice({ title, body, action, onAction, tone }) {
  return <div className="pt-card" style={{ padding:"clamp(28px,7vw,52px) 22px",textAlign:"center",background:tone==="error"?"linear-gradient(145deg,rgba(248,113,113,.08),#13294A)":"linear-gradient(145deg,rgba(34,211,238,.08),#13294A)" }}><div style={{ width:46,height:46,borderRadius:15,margin:"0 auto 14px",display:"grid",placeItems:"center",background:tone==="error"?"rgba(248,113,113,.12)":"rgba(34,211,238,.12)",color:tone==="error"?"#FCA5A5":c.teal,fontSize:20 }}>✦</div><h2 style={{ margin:"0 0 7px",fontSize:21 }}>{title}</h2><p style={{ maxWidth:500,margin:"0 auto",color:c.stone,fontSize:13.5,lineHeight:1.65 }}>{body}</p>{action&&<button onClick={onAction} style={{ marginTop:17,padding:"10px 16px",border:0,borderRadius:radius.sm,background:c.gold,color:c.ink,fontWeight:850,cursor:"pointer" }}>{action}</button>}</div>;
}
