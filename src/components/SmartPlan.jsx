import React, { useMemo } from "react";
import { Sunrise, Sun, Sunset, MapPin, Car, Sparkles, AlertTriangle, Route, Brain, DollarSign } from "lucide-react";
import { c, grad, glass, money } from "../theme.js";
import { activityImage } from "../images.js";
import { Photo, Reveal } from "../motion.jsx";
import { buildPlan } from "../intelligence/index.js";

const TIME_ICON = { morning: Sunrise, afternoon: Sun, evening: Sunset };
const TIME_WORD = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };

// The intelligent, optimized day-by-day — powered by the planner engine.
// Shows the reasoning ("why this order") so travelers trust the machine.
export function SmartPlan({ chosen, pax = 2, budget, monthIdx }) {
  const ids = chosen.map((x) => (x.a ? x.a.id : x.id));
  const plan = useMemo(() => buildPlan(ids, { pax, budget, monthIdx, maxPerDay: 2 }), [ids.join(","), pax, budget, monthIdx]);

  return (
    <div>
      {/* engine header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, ...glass, color: c.teal, padding: "7px 13px", borderRadius: 999, fontWeight: 800, fontSize: 12.5 }}>
          <Brain size={14} /> Optimized by TicoWild AI
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: c.stone, fontSize: 12.5, fontWeight: 600 }}>
          <Route size={13} />{plan.totals.days} days · {plan.totals.drive}h total drive
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: c.stone, fontSize: 12.5, fontWeight: 600 }}>
          <DollarSign size={13} />{money(plan.totals.cost)} for {pax}
        </span>
      </div>

      {/* warnings / smart nudges */}
      {plan.warnings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {plan.warnings.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "rgba(255,208,0,.1)", border: "1px solid rgba(255,208,0,.28)", borderRadius: 12, padding: "10px 13px" }}>
              <AlertTriangle size={15} color={c.gold} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: c.charcoal, fontSize: 13.5, lineHeight: 1.45 }}>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* day-by-day */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 22 }}>
        {plan.days.map((day, di) => {
          const reason = plan.reasoning[di];
          const last = di === plan.days.length - 1;
          return (
            <Reveal key={day.n} delay={di * 60}>
              <div>
                {/* day header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: grad.hero, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0, boxShadow: "0 10px 24px -10px rgba(34,211,238,.6)" }}>{day.n}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Day {day.n}</div>
                    <div style={{ color: c.teal, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} />{reason?.region}</div>
                  </div>
                </div>

                {/* why this day is ordered like this */}
                {reason?.why && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 12, marginLeft: 4 }}>
                    <Sparkles size={13} color={c.gold} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={{ color: c.stone, fontSize: 13, lineHeight: 1.45, fontStyle: "italic" }}>{reason.why}</span>
                  </div>
                )}

                {/* the day's activities, time-ordered */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 4 }}>
                  {day.activities.map((a, ai) => {
                    const time = day.items[ai]?.time || "morning";
                    const TIcon = TIME_ICON[time];
                    return (
                      <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center", background: c.surface2, border: `1px solid ${c.line}`, borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ width: 84, minWidth: 84, height: 70 }}>
                          <Photo src={activityImage(a)} fallback={grad.ocean} alt={a.title} height={70} zoom={false} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, padding: "8px 12px 8px 0" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: c.gold, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            <TIcon size={12} />{TIME_WORD[time]}
                          </div>
                          <div style={{ color: "#fff", fontWeight: 800, fontSize: 14.5, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                          <div style={{ color: c.stone, fontSize: 12.5 }}>{a.duration} · {money(a.price)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
