import type { WinningPattern, CustomPattern } from "@/types";

export interface PatternDefinition {
  name: string;
  description: string;
  cells: number[][]; // Array of [row, col] coordinates (0-indexed)
}

export const PATTERN_DEFINITIONS: Record<string, PatternDefinition> = {
  traditional_line: {
    name: "Traditional Line",
    description: "Any horizontal, vertical, or diagonal line",
    cells: [], // Dynamic - any line counts
  },
  four_corners: {
    name: "Four Corners",
    description: "All four corner squares",
    cells: [
      [0, 0],
      [0, 4],
      [4, 0],
      [4, 4],
    ],
  },
  blackout: {
    name: "Blackout",
    description: "All squares on the card",
    cells: Array.from({ length: 25 }, (_, i) => [
      Math.floor(i / 5),
      i % 5,
    ]),
  },
};

export function getPatternName(
  pattern: WinningPattern,
  customPatterns?: CustomPattern[]
): string {
  if (customPatterns) {
    const custom = customPatterns.find((p) => p.id === pattern);
    if (custom) return custom.name;
  }
  return PATTERN_DEFINITIONS[pattern]?.name || pattern;
}

export function getPatternDescription(
  pattern: WinningPattern,
  customPatterns?: CustomPattern[]
): string {
  if (customPatterns) {
    const custom = customPatterns.find((p) => p.id === pattern);
    if (custom) return custom.description || "";
  }
  return PATTERN_DEFINITIONS[pattern]?.description || "";
}
