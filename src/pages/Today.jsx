import React, { useMemo, useState } from "react";
import { Sun, Sunset, MapPin, Sparkles, AlertTriangle, ArrowRight, Star, Clock, Compass, Waves } from "lucide-react";
import { c, grad, glass, gradText, money } from "../theme.js";
import { activities, operators } from "../data.js";
import { activityImage, heroImage } from "../images.js";
import { Section, Button } from "../components/ui.jsx";
import { Photo, Reveal, TiltCard } from "../motion.jsx";
import { todayBriefing } from "../intelligence/index.js";
import { TicoAvatar } from "../components/Tico.jsx";

const REGIONS = ["Manuel Antonio", "Quepos", "Uvita", "Dominical", "Jacó", "Tamarindo", "Guanacaste"];

function hourNow() { try { return new Date().getHours(); } catch { return 9; } }

// A big "pick of the day" card
function PickCard({ label, a, tone, onView, onAdd, inTrip }) {
  const op = operators.find((o) => o.id === a.operatorId);
  return (
    <TiltCard style={{ overflow: "hidden", border: `1px solid ${c.line}`, background: c.white }} radius={22}>
      <div style={{ position: "relative" }}>
        <Photo src={activityImage(a, 900)} fallback={grad.ocean} alt={a.title} height={190}
          overlay={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.1) 0%, transparent 35%, rgba(11,26,46,.85) 100%)" }} />}>
          <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2, background: tone === "gold" ? c.gold : "rgba(11,26,46,.6)", color: tone === "gold" ? c.ink : "#fff", padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", ...(tone === "gold" ? {} : glass) }}>{label}</span>
          <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, zIndex: 2 }}>
            <div style={{ color: c.teal, fontSize: 12, fontWeight: 800 }}>{a.category}</div>
            <div style={{ color: "#fff", fontSize: 21, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>{a.title}</div>
          </div>
        </Photo>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 14, color: c.stone, fontSize: 13, fontWeight: 600, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{a.region}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} />{a.duration}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Star size={13} fill={c.gold} color={c.gold} />{a.rating}</span>
          <span style={{ marginLeft: "auto", color: c.charcoal, fontWeight: 800 }}>{money(a.price)}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant={inTrip ? "dark" : "primary"} size="sm" full onClick={() => onAdd(a.id)}>{inTrip ? "Added" : "Add to trip"}</Button>
          <Button variant="ghost" size="sm" onClick={() => onView(a.id)}>Details <ArrowRight size={14} /></Button>
        </div>
      </div>
    </TiltCard>
  );
}

export function Today({ go, addToTrip, trip, viewActivity }) {
  const [region, setRegion] = useState("Manuel Antonio");
  const hour = hourNow();
  const t = useMemo(() => todayBriefing({ hour, region }), [hour, region]);
  const inTrip = (id) => trip.some((x) => x.id === id);

  return (
    <>
      {/* live hero band */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={heroImage(1800)} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,26,46,.72), rgba(11,26,46,.97))" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(45% 60% at 12% 15%, rgba(34,211,238,.2), transparent 55%), radial-gradient(45% 60% at 90% 80%, rgba(255,208,0,.14), transparent 55%)` }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "48px 20px 34px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass, padding: "7px 14px", borderRadius: 999, marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: "#37E36B", boxShadow: "0 0 10px #37E36B" }} />
            <span style={{ color: "#fff", fontSize: 12.5, fontWeight: 700 }}>Live today · {t.season || t.climateNote}</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(30px,5vw,50px)", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.02, margin: 0 }}>
            {t.greeting} from <span style={gradText(`linear-gradient(100deg,${c.teal},${c.gold})`)}>{region}</span>.
          </h1>
          <p style={{ color: "rgba(243,247,255,.85)", fontSize: 17, marginTop: 10, maxWidth: 560 }}>
            Here's what looks best today — picked by TicoWild's local brain around the weather, the tides, and where you are.
          </p>

          {/* region + sun row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 20 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {REGIONS.map((r) => (
                <button key={r} onClick={() => setRegion(r)} style={{
                  padding: "8px 13px", borderRadius: 999, cursor: "pointer", fontWeight: 700, fontSize: 12.5, transition: "all .15s",
                  background: r === region ? c.teal : "rgba(255,255,255,.06)", color: r === region ? c.ink : "#fff",
                  border: r === region ? "none" : `1px solid ${c.line}`,
                }}>{r}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, marginLeft: "auto", color: "rgba(243,247,255,.8)", fontSize: 13, fontWeight: 600 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Sun size={14} color={c.gold} />{t.sunrise}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Sunset size={14} color={c.gold} />{t.sunset}</span>
            </div>
          </div>
        </div>
      </div>

      <Section bg={c.sand} pad={44}>
        {/* avoid-today warning */}
        {t.avoid && (
          <Reveal>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start", background: "rgba(255,208,0,.1)", border: "1px solid rgba(255,208,0,.28)", borderRadius: 16, padding: "14px 16px", marginBottom: 24 }}>
              <TicoAvatar size={26} glow={false} />
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 13.5, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>Rico's heads-up for today <AlertTriangle size={13} color={c.gold} /></div>
                <div style={{ color: "rgba(243,247,255,.85)", fontSize: 14, lineHeight: 1.5 }}>{t.avoid}</div>
              </div>
            </div>
          </Reveal>
        )}

        {/* the two picks */}
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          {t.best && (
            <Reveal>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, color: c.gold, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  <Sparkles size={14} />Best thing to do today
                </div>
                <PickCard label="Top pick" tone="gold" a={t.best} onView={viewActivity} onAdd={addToTrip} inTrip={inTrip(t.best.id)} />
                {t.bestReason && <p style={{ color: c.stone, fontSize: 13, marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}><Waves size={14} color={c.teal} style={{ flexShrink: 0, marginTop: 2 }} />{t.bestReason}</p>}
              </div>
            </Reveal>
          )}
          {t.localPick && (
            <Reveal delay={90}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, color: c.teal, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  <Compass size={14} />Local's pick
                </div>
                <PickCard label="Locals love this" a={t.localPick} onView={viewActivity} onAdd={addToTrip} inTrip={inTrip(t.localPick.id)} />
                <p style={{ color: c.stone, fontSize: 13, marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}><Star size={14} color={c.gold} fill={c.gold} style={{ flexShrink: 0, marginTop: 2 }} />A quieter gem locals rate — great when you want fewer crowds.</p>
              </div>
            </Reveal>
          )}
        </div>

        {/* build-a-full-day CTA */}
        <Reveal>
          <div style={{ marginTop: 30, position: "relative", overflow: "hidden", borderRadius: 24, border: `1px solid ${c.line}`, background: c.canvas2, padding: "28px 24px", textAlign: "center" }}>
            <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 90% at 80% 20%, rgba(34,211,238,.16), transparent 55%)` }} />
            <div style={{ position: "relative" }}>
              <h2 style={{ color: "#fff", fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Want the whole day planned?</h2>
              <p style={{ color: "rgba(243,247,255,.8)", fontSize: 15.5, margin: "10px auto 20px", maxWidth: 480 }}>Rico builds a full personalized day-by-day around {region} — drive times, tides, and season handled.</p>
              <Button variant="primary" size="lg" onClick={() => go("build")}>Build my Costa Rica <ArrowRight size={18} /></Button>
            </div>
          </div>
        </Reveal>
      </Section>

      <style>{`@media(min-width:820px){.two-col{grid-template-columns:1fr 1fr!important}}`}</style>
    </>
  );
}
