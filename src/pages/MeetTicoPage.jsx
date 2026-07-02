import React from "react";
import { ArrowRight, Heart, ThumbsDown, Star, MapPin } from "lucide-react";
import { c, grad, glass } from "../theme.js";
import { activities } from "../data.js";
import { Section, Button } from "../components/ui.jsx";
import { Reveal } from "../motion.jsx";
import { TicoFace } from "../components/TicoFace.jsx";
import { TicoRanked } from "../components/TicoRanked.jsx";
import { LIFE } from "../intelligence/ticoPersona.js";

// ── Meet Tico ── the character's home base. Who he is, how he rates, and his
// all-time favorites ranked. This is where a visitor bonds with Tico — on a real
// page, not a popup.
export function MeetTicoPage({ go, addToTrip, trip, viewActivity }) {
  return (
    <>
      {/* hero */}
      <div style={{ position: "relative", overflow: "hidden", background: grad.hero, padding: "56px 20px 48px", textAlign: "center" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 90% at 50% 0%, rgba(34,211,238,.22), transparent 60%)" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
            <div aria-hidden style={{ position: "absolute", inset: -20, borderRadius: 999, background: "radial-gradient(circle, rgba(34,211,238,.4), transparent 70%)", filter: "blur(8px)" }} />
            <div style={{ position: "relative" }}><TicoFace size={124} mood="happy" /></div>
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, letterSpacing: -1, margin: "6px 0 8px" }}>Meet Tico</h1>
          <p style={{ color: "rgba(243,247,255,.9)", fontSize: 17, lineHeight: 1.55, margin: "0 auto", maxWidth: 520 }}>
            Your scarlet macaw guide. I grew up in the almond trees above Manuel Antonio and I've flown this whole coast more times than I can count. Now I help travelers see MY Costa Rica — the real one.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
            <Button variant="primary" size="lg" onClick={() => go("build")}>Plan with me <ArrowRight size={18} /></Button>
            <Button variant="glass" size="lg" onClick={() => go("activities")}>See what I rate</Button>
          </div>
        </div>
      </div>

      {/* how I rate */}
      <Section bg={c.sand}>
        <Reveal>
          <div style={{ ...glass, borderRadius: 22, padding: "clamp(22px,4vw,32px)", maxWidth: 760, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <TicoFace size={44} mood="proud" />
              <h2 style={{ margin: 0, color: "#fff", fontSize: 22, fontWeight: 800 }}>How I rate</h2>
            </div>
            <p style={{ color: c.stone, fontSize: 15, lineHeight: 1.6, margin: "0 0 16px" }}>
              I don't hand out stars for fun. Every experience gets scored on what actually matters — how good the operator is, how in-season it is right now, the value, and whether it's the real thing or a tourist trap. Then I tell you the truth:
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { mood: "excited", label: "A perch-topper (4.9–5.0)", body: "\"This is a 10. I'd fly across the country for it.\"" },
                { mood: "proud", label: "Tico's Pick (4.7+)", body: "\"Yes. This is the good stuff. Book it.\"" },
                { mood: "happy", label: "Really solid (4.4+)", body: "\"You'll be glad you did it. No notes.\"" },
                { mood: "chill", label: "Worth it if it fits (4.0+)", body: "\"Good, not life-changing. Do it if it fits the day.\"" },
                { mood: "unimpressed", label: "Only if you're curious (<4.0)", body: "\"Eh. I've got better for you, honestly.\"" },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", gap: 11, alignItems: "flex-start", background: "rgba(34,211,238,.05)", border: `1px solid ${c.line}`, borderRadius: 13, padding: "11px 13px" }}>
                  <TicoFace size={30} mood={r.mood} glow={false} animate={false} />
                  <div>
                    <div style={{ color: c.charcoal, fontWeight: 800, fontSize: 13.5 }}>{r.label}</div>
                    <div style={{ color: c.stone, fontSize: 13, fontStyle: "italic" }}>{r.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      {/* what I love / can't stand */}
      <Section bg={c.sand} pad={30}>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 760, margin: "0 auto" }}>
          <Reveal>
            <div style={{ background: c.white, border: `1px solid ${c.line}`, borderRadius: 18, padding: 20, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#FF6FA5", fontWeight: 800 }}><Heart size={17} />Things I love</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: c.charcoal, fontSize: 13.5, lineHeight: 1.9 }}>
                {LIFE.loves.map((l) => <li key={l}>{l}</li>)}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div style={{ background: c.white, border: `1px solid ${c.line}`, borderRadius: 18, padding: 20, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: c.stone, fontWeight: 800 }}><ThumbsDown size={16} />Things I can't stand</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: c.charcoal, fontSize: 13.5, lineHeight: 1.9 }}>
                {LIFE.against.map((l) => <li key={l}>{l}</li>)}
              </ul>
            </div>
          </Reveal>
        </div>
        <style>{`@media(min-width:760px){.two-col{grid-template-columns:1fr 1fr!important}}`}</style>
      </Section>

      {/* my all-time favorites, ranked */}
      <Section bg={c.sand}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18, maxWidth: 820, marginInline: "auto" }}>
          <TicoFace size={44} mood="excited" />
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "clamp(20px,3vw,26px)", fontWeight: 800, letterSpacing: -0.4 }}>My all-time favorites</h2>
            <p style={{ margin: "4px 0 0", color: c.stone, fontSize: 14 }}><b style={{ color: c.teal }}>Tico:</b> <span style={{ fontStyle: "italic" }}>"If you only did my top few, you'd still go home happy. Ranked, most-loved first."</span></p>
          </div>
        </div>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Reveal><TicoRanked items={activities} limit={6} onView={viewActivity} onAdd={addToTrip} trip={trip} /></Reveal>
        </div>
      </Section>
    </>
  );
}
