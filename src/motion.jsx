import React, { useEffect, useRef, useState } from "react";

// ── Reveal ── fades + rises a block into view on scroll (IntersectionObserver).
// Bulletproof: anything already in (or near) the viewport at mount reveals
// immediately, so a full-height page never shows a blank void on first paint.
export function Reveal({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // If it's already on screen at mount, reveal right away (no waiting on scroll).
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < vh * 0.92 && r.bottom > 0) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.unobserve(el); } },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    // Safety net: never let content stay invisible longer than ~1.2s.
    const t = setTimeout(() => setShown(true), 1200);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity .6s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .6s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Lift ── card hover: lift + soften shadow + a soft spotlight that follows
// the cursor across the card. Wrap any card.
export function Lift({ children, style = {}, radius = 22, glow = true, ...rest }) {
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const onMove = (e) => {
    if (!glow) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={onMove}
      style={{
        ...style,
        position: style.position || "relative",
        borderRadius: radius,
        transform: hover ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hover ? "0 30px 60px -24px rgba(8,28,58,.55)" : "0 14px 40px -22px rgba(15,30,40,.4)",
        transition: "transform .28s cubic-bezier(.2,.7,.2,1), box-shadow .28s ease",
      }}
      {...rest}
    >
      {glow && (
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none", zIndex: 3,
            opacity: hover ? 1 : 0, transition: "opacity .3s ease",
            background: `radial-gradient(240px circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,.28), transparent 60%)`,
            mixBlendMode: "soft-light",
          }}
        />
      )}
      {children}
    </div>
  );
}

// ── Magnetic ── wraps a button/CTA so it gently pulls toward the cursor.
export function Magnetic({ children, strength = 0.35, style = {} }) {
  const ref = useRef(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setT({ x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength });
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{ display: "inline-block", transform: `translate(${t.x}px, ${t.y}px)`, transition: t.x === 0 && t.y === 0 ? "transform .35s cubic-bezier(.2,.7,.2,1)" : "transform .08s linear", ...style }}
    >
      {children}
    </div>
  );
}

// ── CountUp ── animates a number from 0 → value when it mounts.
export function useCountUp(value, ms = 700) {
  const [n, setN] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return n;
}

// ── Photo ── image with gradient fallback + optional hover zoom.
export function Photo({ src, fallback, alt = "", height = 168, zoom = true, children, overlay }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", height, overflow: "hidden", background: fallback }}
    >
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transform: zoom && hover ? "scale(1.07)" : "scale(1)",
            transition: "opacity .5s ease, transform .5s cubic-bezier(.2,.7,.2,1)",
          }}
        />
      )}
      {overlay && <div style={{ position: "absolute", inset: 0 }}>{overlay}</div>}
      {children}
    </div>
  );
}
