import React from "react";

// Canonical BINGO tile colors per design spec:
// B = Yellow, I = Red, N = Blue, G = Green, O = Orange
// Colors match the bingo ball/host board column colors:
// B=Blue, I=Red, N=White, G=Green, O=Orange
const TILES = [
  { letter: "B", bg: "linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)", shadow: "#004d99", text: "#111" },
  { letter: "I", bg: "linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)", shadow: "#660000", text: "#fff" },
  { letter: "N", bg: "linear-gradient(to bottom, #ffffff 0%, #f0f0f0 45%, #c4c4c4 100%)", shadow: "#999999", text: "#111" },
  { letter: "G", bg: "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)", shadow: "#005c1a", text: "#111" },
  { letter: "O", bg: "linear-gradient(to bottom, #ff9060 0%, #ff6b35 45%, #b33400 100%)", shadow: "#7a2000", text: "#111" },
];

interface BingoLogoProps {
  /** Tile size in px — default 56 (large), use 36 for compact */
  size?: number;
  /** Show the IRL tag — default true */
  showIrl?: boolean;
  className?: string;
}

export function BingoLogo({ size = 56, showIrl = true, className = "" }: BingoLogoProps) {
  const fontSize = Math.round(size * 0.38);
  const borderWidth = size >= 48 ? 3 : 2;
  const shadowOffset = size >= 48 ? 4 : 2;
  const gap = Math.max(4, Math.round(size * 0.07));

  return (
    <div className={`flex items-center ${className}`} style={{ gap }}>
      {TILES.map(({ letter, bg, shadow, text }) => (
        <div
          key={letter}
          className="flex items-center justify-center font-black select-none"
          style={{
            width: size,
            height: size,
            background: bg,
            border: `${borderWidth}px solid #111`,
            boxShadow: `${shadowOffset}px ${shadowOffset}px 0px #111, inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -3px 0 ${shadow}`,
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontSize,
            color: text,
            letterSpacing: "-1px",
            flexShrink: 0,
          }}
        >
          {letter}
        </div>
      ))}

      {showIrl && (
        <div
          className="flex flex-col justify-end"
          style={{ paddingBottom: Math.round(size * 0.04), paddingLeft: Math.round(size * 0.05) }}
        >
          <span
            style={{
              fontFamily: "'Arial Black', Impact, sans-serif",
              fontWeight: 900,
              fontSize: Math.round(size * 0.22),
              letterSpacing: Math.round(size * 0.05),
              color: "#fff",
              WebkitTextStroke: `${size >= 48 ? 1.5 : 1}px #111`,
              paintOrder: "stroke fill",
              textShadow: "2px 2px 0px #111",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            IRL
          </span>
        </div>
      )}
    </div>
  );
}
