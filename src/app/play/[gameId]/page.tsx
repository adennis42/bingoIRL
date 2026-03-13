"use client";

import { useParams } from "next/navigation";
import { useGame } from "@/lib/hooks/useGame";
import { useCalledNumbers } from "@/lib/hooks/useCalledNumbers";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getColumnColor, getColumn } from "@/lib/utils/bingo";
import type { BingoColumn } from "@/types";

const COLUMN_RANGES: Record<BingoColumn, [number, number]> = {
  B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75],
};

const COLUMNS: BingoColumn[] = ["B", "I", "N", "G", "O"];

export default function PlayerGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { game, loading: gameLoading } = useGame(gameId);
  const { calledNumbers, loading: numbersLoading } = useCalledNumbers(gameId);

  if (gameLoading || numbersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <LoadingSpinner />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base p-6">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">🤷</div>
          <h1 className="font-display text-2xl font-bold">Game Not Found</h1>
          <p className="text-text-secondary text-sm">This game doesn&apos;t exist or has ended.</p>
        </div>
      </div>
    );
  }

  const currentNumber = calledNumbers[0]?.number || null;
  const currentRound = game.rounds[game.currentRound - 1];
  const calledSet = new Set(calledNumbers.map((n) => n.number));
  const currentCol = currentNumber ? (currentNumber[0] as BingoColumn) : null;
  const currentColColor = currentCol ? getColumnColor(currentCol) : "var(--accent-primary)";

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: game.status === "active" ? "var(--accent-secondary)" : "var(--text-disabled)" }}
          />
          <span className="text-text-disabled text-xs font-mono uppercase tracking-widest">
            {game.status === "active" ? "Live" : game.status === "ended" ? "Ended" : "Waiting"}
          </span>
        </div>
        <span className="text-text-disabled text-xs font-mono">{calledNumbers.length}/75 called</span>
      </div>

      {/* ── Current Number ── big hero section ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden min-h-[40vh]">
        {/* Radial glow */}
        {currentNumber && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${currentColColor} 0%, transparent 65%)`,
            }}
          />
        )}

        {currentNumber ? (
          <div className="relative text-center space-y-2 animate-fade-up">
            <p className="text-text-disabled text-xs font-mono uppercase tracking-[0.2em]">Now Calling</p>
            <div
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(6rem, 28vw, 10rem)",
                color: currentColColor,
                textShadow: `0 0 60px ${currentColColor}80, 0 0 20px ${currentColColor}40`,
              }}
            >
              {currentNumber[0]}
              <span className="text-text-primary">{currentNumber.slice(1)}</span>
            </div>
            {/* Recent calls row */}
            <div className="flex items-center justify-center gap-1.5 pt-3 flex-wrap">
              {calledNumbers.slice(1, 7).map((n, i) => {
                const col = n.number[0] as BingoColumn;
                const color = getColumnColor(col);
                return (
                  <span
                    key={n.id}
                    className="font-mono text-xs font-bold px-2 py-1 rounded-lg"
                    style={{
                      color,
                      backgroundColor: `${color}18`,
                      border: `1px solid ${color}35`,
                      opacity: Math.max(0.35, 1 - i * 0.13),
                    }}
                  >
                    {n.number}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-5xl">⏳</div>
            <p className="font-display text-xl font-bold">Waiting for first call…</p>
          </div>
        )}
      </div>

      {/* ── Called Numbers Board ── */}
      <div className="px-3 pb-2">
        <div className="card overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-5 border-b border-border">
            {COLUMNS.map((col) => (
              <div
                key={col}
                className="py-2 text-center font-display font-black text-base"
                style={{ color: getColumnColor(col), backgroundColor: `${getColumnColor(col)}12` }}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Number grid — 15 rows × 5 cols */}
          <div className="grid grid-cols-5">
            {Array.from({ length: 15 }, (_, rowIndex) =>
              COLUMNS.map((col) => {
                const num = COLUMN_RANGES[col][0] + rowIndex;
                const formatted = `${col}${num}`;
                const isCalled = calledSet.has(formatted);
                const color = getColumnColor(col);
                return (
                  <div
                    key={formatted}
                    className="aspect-square flex items-center justify-center font-mono text-sm font-bold border-b border-r border-border/30 transition-all duration-300"
                    style={
                      isCalled
                        ? {
                            backgroundColor: `${color}22`,
                            color,
                          }
                        : {
                            backgroundColor: "transparent",
                            color: "var(--text-disabled)",
                          }
                    }
                  >
                    {isCalled ? (
                      <span className="relative">
                        {num}
                        <span
                          className="absolute inset-0 rounded-full opacity-40 blur-sm"
                          style={{ backgroundColor: color }}
                        />
                      </span>
                    ) : (
                      <span className="opacity-30">{num}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── round info ── */}
      {currentRound && (
        <div
          className="sticky bottom-0 px-3 pb-safe pb-4 pt-2"
          style={{ backgroundColor: "var(--bg-base)" }}
        >
          <div
            className="rounded-2xl px-4 py-3 flex items-center justify-between border"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--bg-border)",
            }}
          >
            <div className="space-y-0.5">
              <p className="text-text-disabled text-xs uppercase tracking-widest font-mono">
                Round {game.currentRound}/{game.totalRounds}
              </p>
              <p className="text-text-primary text-sm font-semibold capitalize">
                {currentRound.pattern.replace(/_/g, " ")}
              </p>
            </div>
            {currentRound.prize ? (
              <div className="text-right">
                <p className="text-text-disabled text-xs">Prize</p>
                <p className="text-gold font-bold text-sm">🏆 {currentRound.prize}</p>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-text-disabled text-xs">{calledNumbers.length}</p>
                <p className="text-text-secondary text-xs">numbers called</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
