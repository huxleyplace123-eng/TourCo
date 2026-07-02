import React, { useEffect, useRef, useState } from "react";

// ── Reveal ── fades + rises a block into view on scroll (IntersectionObserver).
export function Reveal({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.unobserve(el); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
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

// ── Lift ── card hover: lift + soften shadow. Wrap any card.
export function Lift({ children, style = {}, radius = 22, ...rest }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...style,
        borderRadius: radius,
        transform: hover ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hover ? "0 30px 60px -24px rgba(8,28,58,.55)" : "0 14px 40px -22px rgba(15,30,40,.4)",
        transition: "transform .28s cubic-bezier(.2,.7,.2,1), box-shadow .28s ease",
      }}
      {...rest}
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
