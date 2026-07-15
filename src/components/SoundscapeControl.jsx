import React, { useEffect, useRef, useState } from "react";
import { LoaderCircle, Volume2, VolumeX, Waves } from "lucide-react";
import { c, glass } from "../theme.js";

const TRACK = "/audio/tico-island-welcome.mp3";

export function SoundscapeControl({ lift = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const ensureAudio = () => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(TRACK);
    audio.loop = true;
    audio.volume = 0.2;
    audio.preload = "none";
    audio.addEventListener("playing", () => { setLoading(false); setPlaying(true); setError(""); });
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("error", () => { setLoading(false); setPlaying(false); setError("Sound unavailable"); });
    audioRef.current = audio;
    return audio;
  };

  const toggle = async () => {
    const audio = ensureAudio();
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      setLoading(true);
      setError("");
      await audio.play();
    } catch {
      setLoading(false);
      setPlaying(false);
      setError("Tap again for sound");
    }
  };

  const Icon = loading ? LoaderCircle : playing ? Volume2 : VolumeX;
  const label = error || (playing ? "Island sound on" : "Island sound off");

  return (
    <button
      type="button"
      className="tico-soundscape"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={`${label}. Play My Last Mojito by Michael Ramir C.`}
      title="Optional TicoWild island soundscape"
      style={{
        position: "fixed", left: 18, bottom: lift ? 86 : 18, zIndex: 59,
        ...glass, background: "rgba(7,17,35,.9)", color: "#fff",
        borderRadius: 999, padding: "9px 13px 9px 9px", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 9,
        boxShadow: "0 18px 45px -20px rgba(0,0,0,.9)", transition: "bottom .25s ease, transform .2s ease, border-color .2s ease",
      }}
    >
      <span style={{ width: 34, height: 34, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: playing ? "rgba(255,208,0,.16)" : "rgba(34,211,238,.1)", border: `1px solid ${playing ? "rgba(255,208,0,.42)" : "rgba(34,211,238,.3)"}` }}>
        <Icon className={loading ? "sound-spin" : ""} size={16} color={playing ? c.gold : c.teal} />
      </span>
      <span style={{ textAlign: "left" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}><Waves size={12} color={c.teal} />{label}</span>
        <span className="sound-track-name" style={{ display: "block", color: c.stone, fontSize: 10.5, marginTop: 1 }}>My Last Mojito</span>
      </span>
      <style>{`
        @keyframes soundSpin{to{transform:rotate(360deg)}}
        .sound-spin{animation:soundSpin .8s linear infinite}
        .tico-soundscape:hover{transform:translateY(-2px);border-color:rgba(255,208,0,.45)!important}
        @media(max-width:520px){.tico-soundscape{left:12px!important}.sound-track-name{display:none!important}}
        @media(prefers-reduced-motion:reduce){.tico-soundscape,.sound-spin{animation:none!important;transition:none!important}}
      `}</style>
    </button>
  );
}
