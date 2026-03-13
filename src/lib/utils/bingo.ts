import type { BingoColumn } from "@/types";

export const COLUMN_RANGES: Record<BingoColumn, [number, number]> = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

export function getColumn(number: string): BingoColumn {
  return number[0] as BingoColumn;
}

export function formatNumber(num: number): string {
  if (num <= 15) return `B${num}`;
  if (num <= 30) return `I${num - 15}`;
  if (num <= 45) return `N${num - 30}`;
  if (num <= 60) return `G${num - 45}`;
  return `O${num - 60}`;
}

export function getActualNumber(bingoNumber: string): number {
  const column = bingoNumber[0] as BingoColumn;
  const position = parseInt(bingoNumber.slice(1), 10);
  
  switch (column) {
    case "B":
      return position; // 1-15
    case "I":
      return position + 15; // 16-30
    case "N":
      return position + 30; // 31-45
    case "G":
      return position + 45; // 46-60
    case "O":
      return position + 60; // 61-75
    default:
      return 0;
  }
}

export function getAllNumbers(): string[] {
  return Array.from({ length: 75 }, (_, i) => formatNumber(i + 1));
}

export function getColumnColor(column: BingoColumn): string {
  const colorMap: Record<BingoColumn, string> = {
    B: "var(--col-b)",
    I: "var(--col-i)",
    N: "var(--col-n)",
    G: "var(--col-g)",
    O: "var(--col-o)",
  };
  return colorMap[column];
}
