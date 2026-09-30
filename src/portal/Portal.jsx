import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  CalendarDays, MessageCircle, User, MapPin, Clock, Check, Hourglass, Send, LogOut, Backpack, ShieldCheck,
  QrCode, X, LifeBuoy, ChevronRight, Navigation, ExternalLink, Sparkles, Route, ArrowLeft,
  KeyRound, MailCheck, Smartphone, Headphones, LockKeyhole, CheckCircle2,
} from "lucide-react";
import { c, FONT, radius, shadow, grad } from "../theme.js";
import {
  getTrip, getMessages, sendMessage, getProfile, saveProfile, sendSecureSignInLink, activityPhoto, tripStages, DEMO_TRIP,
} from "./portalData.js";
import GuestMeetingMap, { guestDirectionsUrl } from "./GuestMeetingMap.jsx";
import { Logo } from "../components/Logo.jsx";

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
  const [sampleMode, setSampleMode] = useState(() => new URLSearchParams(window.location.search).get("sample") === "1");
  const [tripError, setTripError] = useState("");
  const loadTrip = () => { setTrip(undefined); setTripError(""); getTrip().then(setTrip).catch((err) => { setTrip(null); setTripError(err.message); }); };
  useEffect(() => { loadTrip(); }, []);
  const toggleSample = (on) => {
    setSampleMode(on);
    const url = new URL(window.location.href);
    if (on) url.searchParams.set("sample", "1"); else url.searchParams.delete("sample");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="customer-portal" style={{ minHeight: "100vh", background: "#F5F4F0", color: "#172532", fontFamily: FONT }}>
      <style>{`
        .pt-wrap{max-width:1120px;margin:0 auto;padding:28px clamp(16px,4vw,32px) 70px}
        .customer-app-bar{position:sticky;top:0;z-index:12;background:rgba(255,255,255,.94)!important;border-bottom:1px solid #E5E7E9!important;backdrop-filter:blur(16px)}
        .customer-brand{display:flex;align-items:center;flex:1}
        .customer-signout{border-color:#E1E4E7!important;background:#fff!important;color:#53616D!important}
        .pt-tabs{position:sticky;top:59px;z-index:10;display:flex;justify-content:center;gap:7px;padding:10px clamp(10px,3vw,20px);background:rgba(255,255,255,.94);border-bottom:1px solid #E5E7E9;backdrop-filter:blur(16px)}
        .pt-tabs button{min-height:42px;padding-inline:20px!important;color:#56636F!important}
        .pt-tabs button[data-active="true"]{background:#13283D!important;color:#fff!important;box-shadow:0 8px 20px rgba(19,40,61,.16)}
        .pt-card{border-radius:20px;border:1px solid #E4E7E9!important;background-color:#fff!important;color:#172532!important;box-shadow:0 12px 35px rgba(19,40,61,.07)!important}
        .guest-trip-view{gap:22px!important}
        .guest-sample-bar{display:flex;align-items:center;gap:12px;padding:13px 15px;border:1px solid #BFE3DE;border-radius:16px;background:#EAF7F5;color:#173C39;box-shadow:0 8px 24px rgba(10,129,116,.08)}
        .guest-sample-bar>svg{flex:0 0 auto;color:#0A8174}
        .guest-sample-copy{display:grid;gap:2px;flex:1;font-size:12.5px;color:#536C68}
        .guest-sample-copy b{color:#173C39;font-size:13.5px}
        .guest-sample-exit{display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border:1px solid #B7D8D3;border-radius:10px;background:#fff;color:#173C39;font:800 12px ${FONT};cursor:pointer}
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
        .guest-trip-eyebrow{display:inline-flex;align-self:flex-start;margin-bottom:auto;padding:7px 11px;border:1px solid rgba(255,255,255,.48);border-radius:999px;background:rgba(255,255,255,.92);color:#0A8174;font-size:10px!important;font-weight:900!important;letter-spacing:.08em;text-transform:uppercase;opacity:1!important}
        .guest-trip-title{font-size:clamp(30px,5vw,48px)!important;line-height:1!important;letter-spacing:-.055em!important}
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
        .account-help{padding:20px!important;background:linear-gradient(145deg,#FFF8D7,#fff)!important;border-color:#F2E5A0!important}
        .account-help h3{margin:0 0 6px;font-size:16px;letter-spacing:-.025em}
        .account-help p{margin:0 0 14px;color:#6E6B5F;font-size:11.5px;line-height:1.55}
        .account-help button{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border:0;border-radius:11px;background:#13283D;color:#fff;font:800 11.5px ${FONT};cursor:pointer}
        @media(max-width:700px){
          .pt-tabs{justify-content:flex-start;overflow-x:auto;scrollbar-width:none}
          .pt-tabs::-webkit-scrollbar,.guest-progress::-webkit-scrollbar{display:none}
          .pt-wrap{padding:18px 12px 92px}
          .guest-sample-bar{align-items:flex-start}
          .guest-sample-exit span{display:none}
          .guest-empty{grid-template-columns:1fr;min-height:0}
          .guest-empty-copy{padding:31px 22px 26px}
          .guest-empty h1{font-size:36px}
          .guest-empty-proof{grid-template-columns:1fr;gap:8px;margin-top:24px}
          .guest-empty-proof div{grid-template-columns:120px 1fr;align-items:start;padding-top:9px}
          .guest-empty-visual{min-height:350px;padding:28px}
          .guest-preview-phone{max-width:290px}
          .guest-trip-hero{min-height:220px;padding:22px!important;border-radius:22px!important}
          .guest-trip-title{font-size:31px!important}
          .guest-progress{overflow:hidden;padding:15px 9px!important}
          .guest-progress>div{min-width:0}
          .guest-progress-label{font-size:9px!important;line-height:1.15}
          .guest-next-up{grid-template-columns:92px minmax(0,1fr);gap:12px}
          .guest-next-photo{height:92px}
          .guest-next-actions{grid-column:1/-1;grid-template-columns:1fr 1fr}
          .guest-next-copy h2{font-size:18px}
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
          .customer-help{width:52px;height:52px;padding:0!important;justify-content:center!important;font-size:0!important}
          .concierge-head{padding:15px}
          .concierge-assurance{display:none}
          .concierge-thread{min-height:360px;max-height:none;padding:17px 13px}
          .concierge-compose{position:sticky;bottom:0;padding:11px}
          .account-hero{grid-template-columns:auto minmax(0,1fr);gap:13px;padding:19px!important}
          .account-avatar{width:54px;height:54px;border-radius:18px;font-size:19px}
          .account-identity h1{font-size:20px;white-space:normal;line-height:1.1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
          .account-completion{grid-column:1/-1;width:auto}
          .account-grid{grid-template-columns:1fr;gap:14px}
          .account-stack{gap:14px}
          .account-card{padding:18px!important}
          .account-fields{grid-template-columns:1fr;gap:12px}
          .account-field-wide{grid-column:auto}
          .account-save-row{align-items:flex-start;flex-direction:column-reverse}
          .account-save{width:100%;min-height:48px}
        }
      `}</style>

      {/* app bar */}
      <div className="customer-app-bar" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px clamp(14px,4vw,26px)" }}>
        <div className="customer-brand"><Logo fontSize={20} surface="light" /></div>
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
        {tab === "trip" && <TripTab trip={sampleMode && trip !== undefined ? DEMO_TRIP : trip} error={sampleMode ? "" : tripError} onRetry={loadTrip} sampleMode={sampleMode} onPreviewSample={() => toggleSample(true)} onExitSample={() => toggleSample(false)} onMessage={() => setTab("messages")} />}
        {tab === "messages" && <MessagesTab />}
        {tab === "account" && <AccountTab email={email} onSignOut={onSignOut} onMessage={() => setTab("messages")} />}
      </div>

      {tab !== "messages" && (
        <button className="customer-help" onClick={() => setTab("messages")} title="Chat with your concierge"
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

function TripTab({ trip, error, onRetry, sampleMode, onPreviewSample, onExitSample, onMessage }) {
  const [voucher, setVoucher] = useState(null);
  if (trip === undefined) return <PortalNotice title="Loading your trip…" body="Getting the latest itinerary and confirmations." />;
  if (error) return <PortalNotice title="We couldn't load your trip" body={error} action="Try again" onAction={onRetry} tone="error" />;
  if (!trip) return <EmptyTripState onPreviewSample={onPreviewSample} onMessage={onMessage} />;
  const until = daysUntil(trip.start);
  const stageIdx = tripStages.indexOf(trip.status === "Confirmed" ? "Confirmed" : trip.status);
  const balance = trip.total - trip.deposit;
  const heroPhoto = trip.days?.[0]?.items?.[0]?.photo;
  const bookings = trip.days.flatMap((day) => day.items.map((item) => ({ ...item, date: day.date })));
  const nextUp = bookings.find((item) => item.status === "Confirmed") || bookings[0];
  return (
    <div className="guest-trip-view" style={{ display: "grid", gap: 16 }}>
      {sampleMode && (
        <div className="guest-sample-bar">
          <Sparkles size={18} />
          <div className="guest-sample-copy"><b>Sample trip preview</b><span>This is example content only. Nothing has been added to your account.</span></div>
          <button className="guest-sample-exit" onClick={onExitSample}><ArrowLeft size={14} /><span>Exit preview</span></button>
        </div>
      )}
      {/* hero */}
      <div className="pt-card guest-trip-hero" style={{ padding: "20px 22px", backgroundImage: `url(${activityPhoto(heroPhoto, 1400)})`, color: "#fff", border: "none" }}>
        <div className="guest-trip-eyebrow" style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}>{sampleMode ? "Sample Costa Rica journey" : "Confirmed Costa Rica journey"}</div>
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

      {nextUp && (
        <div className="pt-card guest-next-up">
          <img className="guest-next-photo" src={activityPhoto(nextUp.photo, 500)} alt="" />
          <div className="guest-next-copy">
            <div className="guest-next-kicker"><Route size={13} /> Next up</div>
            <h2>{nextUp.name}</h2>
            <div className="guest-next-facts">
              <span><CalendarDays size={14} /> {fmt(nextUp.date)} · {nextUp.time}</span>
              <span><MapPin size={14} /> {nextUp.meet}</span>
            </div>
          </div>
          <div className="guest-next-actions">
            <button className="guest-next-primary" onClick={() => setVoucher(nextUp)}><Navigation size={14} /> Meeting details</button>
            <button className="guest-next-secondary" onClick={onMessage}><MessageCircle size={14} /> Ask concierge</button>
          </div>
        </div>
      )}

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
  const time = (value) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
  const prompts = ["What should I pack?", "Confirm my pickup", "I need help with my trip"];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="consumer-section-label">Your trip support</div>
      <section className="pt-card concierge-shell">
        <div className="concierge-head">
          <div className="concierge-avatar"><img src="/ticowild-macaw.svg" alt="" /></div>
          <div className="concierge-title"><b>Your TicoWild concierge</b><span>A real local team coordinating every operator</span></div>
          <div className="concierge-assurance"><ShieldCheck size={15} /> Private trip conversation</div>
        </div>
        <div className="concierge-thread">
          {messages.length ? messages.map((m) => {
            const mine = m.from === "customer";
            return (
              <div className="guest-message-row" data-mine={mine} key={m.id}>
                <div className="guest-message-meta">{mine ? "You" : "TicoWild concierge"}{m.at ? ` · ${time(m.at)}` : ""}</div>
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
  const [linkState,setLinkState]=useState("");
  useEffect(() => { getProfile(email).then((p) => setF({ ...p, email: p.email || email })).catch((err)=>setError(err.message)); }, [email]);
  if (!f) return error?<PortalNotice title="We couldn't load your profile" body={error} tone="error"/>:<PortalNotice title="Loading your account…" body="Getting your saved traveler details."/>;
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setSaved(false); };
  const save = async () => { setBusy(true);setError("");try{setF(await saveProfile(f));setSaved(true);}catch(err){setError(err.message);}finally{setBusy(false);} };
  const sendLink = async () => { setLinkState("sending");setError("");try{await sendSecureSignInLink(email);setLinkState("sent");}catch(err){setError(err.message);setLinkState("");} };
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
            <div className="account-save-row"><span style={{ color:"#7A858D",fontSize:10.5,lineHeight:1.4 }}>Your details are only shared when needed to operate your bookings.</span><div style={{ display:"flex",alignItems:"center",gap:10 }}>{saved&&<span className="account-saved"><CheckCircle2 size={15}/> Saved</span>}<button className="account-save" onClick={save} disabled={busy}>{busy?"Saving…":"Save traveler profile"}</button></div></div>
            {error&&<div role="alert" style={{ marginTop:12,padding:"10px 12px",borderRadius:radius.sm,border:"1px solid #F1B9B5",background:"#FFF3F2",color:"#B42318",fontSize:12 }}>{error}</div>}
          </section>
        </div>
        <aside className="account-stack">
          <section className="pt-card account-card">
            <div className="account-card-head"><div className="account-card-icon"><LockKeyhole size={18}/></div><div><h2>Login & security</h2><p>A clear view of how access to your trip is protected.</p></div></div>
            <div className="security-status"><ShieldCheck size={21}/><div><b>Secure passwordless account</b><span>No reusable password exists to steal or forget.</span></div></div>
            <div className="security-list">
              <div className="security-row"><MailCheck size={17}/><div><b>One-time email link</b><span>{email}</span></div></div>
              <div className="security-row"><Smartphone size={17}/><div><b>This device</b><span>Currently signed in with an active session</span></div></div>
              <div className="security-row"><KeyRound size={17}/><div><b>Password</b><span>Not required—each sign-in link is unique</span></div></div>
            </div>
            <button className="account-secondary-action" onClick={sendLink} disabled={linkState==="sending"}>{linkState==="sending"?"Sending secure link…":linkState==="sent"?"Secure link sent ✓":"Email me a fresh sign-in link"}</button>
            <button className="account-danger-action" onClick={onSignOut}><LogOut size={14}/> Sign out of this device</button>
          </section>
          <section className="pt-card account-help"><h3>Need something changed?</h3><p>Your concierge can help with traveler names, timing, pickups, accessibility needs, or booking questions.</p><button onClick={onMessage}><Headphones size={15}/> Message your concierge</button></section>
        </aside>
      </div>
    </div>
  );
}

function PortalNotice({ title, body, action, onAction, tone }) {
  return <div className="pt-card" style={{ padding:"clamp(28px,7vw,52px) 22px",textAlign:"center",background:tone==="error"?"linear-gradient(145deg,rgba(248,113,113,.08),#13294A)":"linear-gradient(145deg,rgba(34,211,238,.08),#13294A)" }}><div style={{ width:46,height:46,borderRadius:15,margin:"0 auto 14px",display:"grid",placeItems:"center",background:tone==="error"?"rgba(248,113,113,.12)":"rgba(34,211,238,.12)",color:tone==="error"?"#FCA5A5":c.teal,fontSize:20 }}>✦</div><h2 style={{ margin:"0 0 7px",fontSize:21 }}>{title}</h2><p style={{ maxWidth:500,margin:"0 auto",color:c.stone,fontSize:13.5,lineHeight:1.65 }}>{body}</p>{action&&<button onClick={onAction} style={{ marginTop:17,padding:"10px 16px",border:0,borderRadius:radius.sm,background:c.gold,color:c.ink,fontWeight:850,cursor:"pointer" }}>{action}</button>}</div>;
}
