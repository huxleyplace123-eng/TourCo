import React, { useEffect, useState } from "react";

// ── Tico's expressive face ───────────────────────────────────────────────────
// The same macaw identity as the logo mark, but ALIVE: the eye, brow and beak
// change with his mood, he blinks on his own, and he has a soft idle sway. This
// is what turns "a logo" into "a character who's reacting to you."
//
// Moods: chill · happy · excited · thinking · unimpressed · proud · cheeky · soft
// (matches MOODS in intelligence/ticoPersona.js)

// Per-mood facial pose. Values are deltas applied to a neutral macaw face.
const POSE = {
  chill:       { eyeR: 6.5, lid: 0.35, browY: 0,   browRot: 0,   pupil: 0,   beak: 0,  sparkle: false, cheek: 0.15 },
  happy:       { eyeR: 7,   lid: 0.15, browY: -1,  browRot: -4,  pupil: 0,   beak: 3,  sparkle: false, cheek: 0.35 },
  excited:     { eyeR: 8,   lid: 0,    browY: -3,  browRot: -10, pupil: 0,   beak: 6,  sparkle: true,  cheek: 0.45 },
  thinking:    { eyeR: 6,   lid: 0.3,  browY: -2,  browRot: 14,  pupil: -2,  beak: 0,  sparkle: false, cheek: 0 },
  unimpressed: { eyeR: 6,   lid: 0.55, browY: 1,   browRot: 10,  pupil: -1.5,beak: -1, sparkle: false, cheek: 0 },
  proud:       { eyeR: 6.5, lid: 0.4,  browY: -1,  browRot: -6,  pupil: 1,   beak: 2,  sparkle: true,  cheek: 0.3 },
  cheeky:      { eyeR: 6.5, lid: 0.45, browY: -1,  browRot: -8,  pupil: 1.5, beak: 3,  sparkle: false, cheek: 0.4 },
  soft:        { eyeR: 7.5, lid: 0.2,  browY: -1,  browRot: -3,  pupil: 0,   beak: 1,  sparkle: false, cheek: 0.5 },
};

export function TicoFace({ size = 44, mood = "happy", glow = true, animate = true, wink = false }) {
  const p = POSE[mood] || POSE.happy;
  const [blink, setBlink] = useState(false);

  // spontaneous blinking — a small thing that makes him feel alive
  useEffect(() => {
    if (!animate) return;
    let t;
    const loop = () => {
      // random-ish but no Math.random in this env-safe way: vary by time drift
      const next = 2600 + (size % 7) * 300 + (mood.length * 220);
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        loop();
      }, next);
    };
    loop();
    return () => clearTimeout(t);
  }, [animate, size, mood]);

  const uid = `tf${size}${mood}`;
  const lidClosed = blink ? 0.92 : p.lid;
  const eyeCx = 126, eyeCy = 120;
  const eyeRy = p.eyeR * (1 - lidClosed); // squish vertically as lid closes

  return (
    <svg width={size} height={size} viewBox="80 64 108 108" role="img" aria-label={`Rico (${mood})`}
      style={{ flexShrink: 0, filter: glow ? "drop-shadow(0 3px 10px rgba(34,211,238,.4))" : "none",
               transformOrigin: "center", animation: animate ? "ticoSway 5.5s ease-in-out infinite" : "none" }}>
      <defs>
        <linearGradient id={`${uid}G`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F6BEB" /><stop offset="1" stopColor="#0A2E8F" /></linearGradient>
        <clipPath id={`${uid}C`}><rect x="80" y="64" width="108" height="108" rx="30" /></clipPath>
      </defs>
      <style>{`
        @keyframes ticoSway { 0%,100%{ transform: rotate(-1.5deg) } 50%{ transform: rotate(1.5deg) } }
        @keyframes ticoSparkle { 0%,100%{ opacity:.2; transform: scale(.7) } 50%{ opacity:1; transform: scale(1) } }
        @media(prefers-reduced-motion:reduce){ svg[aria-label^="Rico"]{ animation:none!important } }
      `}</style>

      <rect x="80" y="64" width="108" height="108" rx="30" fill={`url(#${uid}G)`} />
      <g clipPath={`url(#${uid}C)`}>
        <rect x="80" y="64" width="108" height="38" fill="#ffffff" opacity="0.08" />

        {/* head + crest */}
        <path d="M120 100C104 104 98 124 106 144C112 158 128 162 140 156C138 148 138 136 142 128C146 118 150 108 144 100C136 94 128 98 120 100Z" fill="#0A1F5C" />
        <path d="M124 96C118 88 128 84 134 90C130 92 126 94 124 96Z" fill="#0A1F5C" />

        {/* cheek blush — warmth for happy/soft moods */}
        {p.cheek > 0 && <ellipse cx="118" cy="132" rx="7" ry="4.5" fill="#FF6FA5" opacity={p.cheek * 0.6} />}

        {/* upper mandible — fixed */}
        <path d="M140 112C160 108 176 116 174 128C172 138 158 138 148 132C142 128 140 120 140 112Z" fill="#FFD000" />
        {/* lower mandible — hinges open from the beak corner (x=148) as p.beak grows */}
        <path d={`M148 131 C158 ${133 + p.beak} 170 ${134 + p.beak} 174 ${129 + p.beak} C171 ${138 + p.beak} 160 ${141 + p.beak} 149 ${137 + p.beak} Z`} fill="#F0A400" />
        <path d="M140 122C150 122 160 124 166 128" fill="none" stroke="#7A5200" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />

        {/* eye socket — a light patch so the eye + brow read against the dark head */}
        <ellipse cx={eyeCx} cy={eyeCy} rx="12.5" ry="12" fill="#12327A" />

        {/* eye — cyan ring + pupil that shifts with mood */}
        <g transform={`translate(${eyeCx} ${eyeCy})`}>
          <ellipse cx="0" cy="0" rx={p.eyeR} ry={Math.max(0.6, eyeRy)} fill="#22D3EE" />
          {!blink && lidClosed < 0.85 && (
            <circle cx={p.pupil} cy={p.pupil * 0.4} r="3.2" fill="#04122E" />
          )}
          {/* catchlight */}
          {!blink && lidClosed < 0.7 && <circle cx={p.pupil - 1.8} cy={p.pupil * 0.4 - 1.8} r="1.2" fill="#fff" opacity="0.95" />}
          {/* lower lid line for squinty moods (unimpressed/cheeky) */}
          {p.lid >= 0.45 && !blink && <rect x={-p.eyeR} y={eyeRy - 1} width={p.eyeR * 2} height="2" rx="1" fill="#04122E" opacity="0.55" />}
        </g>

        {/* brow — the single most expressive line. Bright so it reads on the dark
            head; angle + height carry the emotion. */}
        <g transform={`translate(${eyeCx} ${eyeCy - 12 + p.browY}) rotate(${p.browRot})`}>
          <rect x="-9" y="-1.8" width="18" height="3.6" rx="1.8" fill="#5EE6FF" opacity="0.92" />
        </g>

        {/* excited / proud sparkle */}
        {p.sparkle && (
          <g fill="#FFE873" style={{ transformOrigin: "150px 104px", animation: animate ? "ticoSparkle 1.4s ease-in-out infinite" : "none" }}>
            <path d="M150 100 L151.4 103 L154.4 104.4 L151.4 105.8 L150 108.8 L148.6 105.8 L145.6 104.4 L148.6 103 Z" />
          </g>
        )}
      </g>
    </svg>
  );
}
