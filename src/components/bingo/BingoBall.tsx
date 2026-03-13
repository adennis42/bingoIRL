"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getColumnColor, getActualNumber } from "@/lib/utils/bingo";
import type { BingoColumn } from "@/types";

interface BingoBallProps {
  /** Full bingo number string e.g. "B7", "N42" */
  number: string;
  /** Size in px — the ball is always a perfect circle */
  size?: number;
  /** If true, wraps in AnimatePresence + triggers spin on number change */
  animate?: boolean;
}

function BallInner({ number, size = 200 }: { number: string; size?: number }) {
  const col = number[0] as BingoColumn;
  const num = getActualNumber(number); // "O1" → 61, "B5" → 5, etc.
  const color = getColumnColor(col);

  // Derived sizes — all proportional to ball diameter
  const ovalW = size * 0.54;
  const ovalH = size * 0.60;
  const letterSize = size * 0.14;
  // Slightly smaller font for 2-digit numbers so they fit the oval
  const numSize = num >= 10 ? size * 0.28 : size * 0.32;
  const shineW = size * 0.28;
  const shineH = size * 0.16;

  return (
    <div
      className="relative rounded-full flex items-center justify-center select-none"
      style={{
        width: size,
        height: size,
        // Radial gradient gives the left-top light source 3D look
        background: `radial-gradient(ellipse at 38% 32%, ${color}ff 0%, ${color}cc 45%, ${color}88 75%, ${color}55 100%)`,
        boxShadow: [
          `0 ${size * 0.06}px ${size * 0.18}px ${color}70`,   // colour glow
          `0 ${size * 0.03}px ${size * 0.06}px rgba(0,0,0,0.5)`, // drop shadow
          `inset 0 ${size * 0.025}px ${size * 0.07}px rgba(255,255,255,0.25)`, // top inner light
          `inset 0 -${size * 0.03}px ${size * 0.08}px rgba(0,0,0,0.35)`,      // bottom inner dark
        ].join(", "),
      }}
    >
      {/* White oval label — like a real bingo ball */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          width: ovalW,
          height: ovalH,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
        }}
      >
        {/* Column letter */}
        <span
          className="font-display font-black leading-none"
          style={{
            fontSize: letterSize,
            color,
            letterSpacing: "0.02em",
          }}
        >
          {col}
        </span>
        {/* Number */}
        <span
          className="font-mono font-black leading-none"
          style={{
            fontSize: numSize,
            color: "#111",
            marginTop: size * 0.01,
          }}
        >
          {num}
        </span>
      </div>

      {/* Specular highlight — top-left shine */}
      <div
        className="absolute rounded-full"
        style={{
          top: size * 0.10,
          left: size * 0.16,
          width: shineW,
          height: shineH,
          background: "radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 80%)",
          filter: "blur(2px)",
          transform: "rotate(-20deg)",
        }}
      />
    </div>
  );
}

/**
 * BingoBall — renders a stylised 3-D bingo ball.
 * When `animate` is true (default), each new `number` value triggers
 * a clockwise spin-in from the edge using Framer Motion.
 */
export function BingoBall({ number, size = 200, animate = true }: BingoBallProps) {
  if (!animate) return <BallInner number={number} size={size} />;

  return (
    /* perspective on the parent is required for the rotateY 3-D effect */
    <div style={{ perspective: `${size * 4}px` }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={number}
          initial={{ rotateY: -90, scale: 0.85, opacity: 0.5 }}
          animate={{ rotateY: 0,   scale: 1,    opacity: 1   }}
          exit={{    rotateY:  90, scale: 0.85, opacity: 0   }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 22,
            mass: 0.9,
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <BallInner number={number} size={size} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
