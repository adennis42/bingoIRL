"use client";

import type { CustomPattern } from "@/types";
import { PATTERN_DEFINITIONS } from "@/lib/utils/patterns";
import type { WinningPattern } from "@/types";

interface PatternVisualizerProps {
  pattern: WinningPattern | CustomPattern;
  size?: "sm" | "md" | "lg";
}

export function PatternVisualizer({
  pattern,
  size = "md",
}: PatternVisualizerProps) {
  let cells: number[][] = [];

  // Check if it's a built-in pattern
  if (typeof pattern === "string" && pattern in PATTERN_DEFINITIONS) {
    const patternDef = PATTERN_DEFINITIONS[pattern as keyof typeof PATTERN_DEFINITIONS];
    if (patternDef.cells.length > 0) {
      cells = patternDef.cells;
    } else if (pattern === "traditional_line") {
      // Show example line
      cells = Array.from({ length: 5 }, (_, i) => [2, i]);
    }
  } else if (typeof pattern === "object" && "cells" in pattern) {
    // Custom pattern
    cells = pattern.cells;
  }

  const sizeClasses = {
    sm: "w-8",
    md: "w-12",
    lg: "w-16",
  };

  return (
    <div className="grid grid-cols-5 gap-1 w-fit">
      {Array.from({ length: 25 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const isSelected = cells.some(([r, c]) => r === row && c === col);
        const isCenter = row === 2 && col === 2;

        return (
          <div
            key={`${row},${col}`}
            className={`aspect-square ${sizeClasses[size]} rounded border ${
              isCenter || isSelected
                ? "bg-primary border-primary"
                : "bg-elevated border-border"
            }`}
          />
        );
      })}
    </div>
  );
}
