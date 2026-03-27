"use client";

import { useState } from "react";
import { SOUNDS, SoundDef, playSound } from "@/lib/audioEngine";

// Cel-shaded color palette
const COLOR_STYLES: Record<
  string,
  { bg: string; shadow: string; text: string }
> = {
  yellow: {
    bg: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)",
    shadow: "#8a6600",
    text: "#111",
  },
  blue: {
    bg: "linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)",
    shadow: "#004d99",
    text: "#111",
  },
  green: {
    bg: "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)",
    shadow: "#005c1a",
    text: "#111",
  },
  red: {
    bg: "linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)",
    shadow: "#660000",
    text: "#fff",
  },
  orange: {
    bg: "linear-gradient(to bottom, #ff9060 0%, #ff6b35 45%, #b33400 100%)",
    shadow: "#7a2000",
    text: "#111",
  },
  purple: {
    bg: "linear-gradient(to bottom, #c4a0ff 0%, #9b72ff 45%, #5b2fe0 100%)",
    shadow: "#2e0e80",
    text: "#fff",
  },
};

interface SoundboardProps {
  soundIds?: string[];                   // if provided, show only these sounds in this order
  soundFiles?: Record<string, string>;   // soundId → URL (Firebase Storage or /sounds/ path)
}

export function Soundboard({ soundIds, soundFiles }: SoundboardProps) {
  const [playing, setPlaying] = useState<string | null>(null);

  const activeSounds: SoundDef[] = soundIds
    ? (soundIds
        .map((id) => SOUNDS.find((s) => s.id === id))
        .filter(Boolean) as SoundDef[])
    : SOUNDS.slice(0, 12);

  const handlePlay = (id: string) => {
    playSound(id, soundFiles?.[id]);
    setPlaying(id);
    setTimeout(() => setPlaying(null), 300);
  };

  return (
    <div
      className="p-4"
      style={{
        border: "3px solid #111",
        background: "#1a1a1a",
        boxShadow: "4px 4px 0px #111",
      }}
    >
      {/* Header */}
      <p
        className="text-xs font-black uppercase tracking-widest mb-3 text-white"
        style={{ textShadow: "1px 1px 0px #000" }}
      >
        🎵 SOUNDBOARD
      </p>

      {/* 4 × 3 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
        }}
      >
        {activeSounds.map((sound) => {
          const palette = COLOR_STYLES[sound.color] ?? COLOR_STYLES.blue;
          const isPlaying = playing === sound.id;

          return (
            <button
              key={sound.id}
              onClick={() => handlePlay(sound.id)}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                border: "3px solid #111",
                background: palette.bg,
                boxShadow: isPlaying
                  ? "1px 1px 0px #111"
                  : `3px 3px 0px ${palette.shadow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
                transform: isPlaying ? "scale(0.95) translate(2px, 2px)" : "scale(1)",
                transition: "box-shadow 80ms ease, transform 80ms ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                overflow: "hidden",
                userSelect: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Flash overlay when playing */}
              {isPlaying && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.45)",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Emoji */}
              <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{sound.emoji}</span>

              {/* Label */}
              <span
                style={{
                  fontSize: "7px",
                  fontWeight: 900,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: palette.text,
                  textShadow: "0 1px 0 rgba(0,0,0,0.2)",
                  lineHeight: 1.1,
                  textAlign: "center",
                  padding: "0 2px",
                }}
              >
                {sound.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
