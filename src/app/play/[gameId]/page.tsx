"use client";

import { useParams } from "next/navigation";
import { useGame } from "@/lib/hooks/useGame";
import { useCalledNumbers } from "@/lib/hooks/useCalledNumbers";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { BingoBall } from "@/components/bingo/BingoBall";
import { PatternVisualizer } from "@/components/bingo/PatternVisualizer";
import { getColumnColor, getActualNumber } from "@/lib/utils/bingo";
import { PATTERN_DEFINITIONS } from "@/lib/utils/patterns";
import type { BingoColumn } from "@/types";

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
  const previousNumbers = calledNumbers.slice(1);
  const currentRound = game.rounds[game.currentRound - 1];

  const patternName = (() => {
    if (!currentRound) return "";
    const def = PATTERN_DEFINITIONS[currentRound.pattern];
    return def ? def.name : currentRound.pattern.replace(/_/g, " ");
  })();

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: game.status === "active"
                ? "var(--accent-secondary)"
                : "var(--text-disabled)",
              animation: game.status === "active" ? "glowPulse 2s ease-in-out infinite" : "none",
            }}
          />
          <span className="text-text-disabled text-xs font-mono uppercase tracking-widest">
            {game.status === "active" ? "Live" : game.status === "ended" ? "Ended" : "Waiting"}
          </span>
        </div>
        <span className="text-text-disabled text-xs font-mono">
          {calledNumbers.length} called
        </span>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">

        {/* ── Current Ball ── */}
        <div className="flex flex-col items-center py-4">
          {currentNumber ? (
            <>
              <p className="text-text-disabled text-xs font-mono uppercase tracking-[0.2em] mb-3">
                Now Calling
              </p>
              <BingoBall number={currentNumber} size={180} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-32 h-32 rounded-full bg-elevated border-2 border-dashed border-bg-border flex items-center justify-center">
                <span className="text-text-disabled text-4xl">?</span>
              </div>
              <p className="text-text-disabled text-sm font-mono">Waiting for first call…</p>
            </div>
          )}
        </div>

        {/* ── Previously called numbers ── */}
        {previousNumbers.length > 0 && (
          <div className="space-y-2">
            <p className="text-text-disabled text-xs font-mono uppercase tracking-widest">
              Previously Called ({previousNumbers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {previousNumbers.map((n, i) => {
                const col = n.number[0] as BingoColumn;
                const color = getColumnColor(col);
                const actual = getActualNumber(n.number);
                return (
                  <div
                    key={n.id}
                    className="flex items-center justify-center rounded-xl font-mono font-bold text-sm transition-all"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: `${color}18`,
                      color,
                      border: `1px solid ${color}40`,
                      opacity: Math.max(0.45, 1 - i * 0.04),
                    }}
                  >
                    {col}{actual}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Round info card ── */}
        {currentRound && (
          <div className="card p-5 space-y-4">
            {/* Round header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-disabled text-xs font-mono uppercase tracking-widest">Round</p>
                <p className="font-display text-2xl font-black">
                  {game.currentRound}
                  <span className="text-text-disabled text-base font-sans font-normal"> / {game.totalRounds}</span>
                </p>
              </div>
              {currentRound.prize && (
                <div className="text-right">
                  <p className="text-text-disabled text-xs font-mono uppercase tracking-widest">Prize</p>
                  <p className="text-gold font-bold text-base">🏆 {currentRound.prize}</p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-bg-border" />

            {/* Pattern */}
            <div className="space-y-3">
              <div>
                <p className="text-text-disabled text-xs font-mono uppercase tracking-widest mb-0.5">Win Pattern</p>
                <p className="text-text-primary font-semibold text-sm">{patternName}</p>
              </div>
              <div className="flex justify-center">
                <PatternVisualizer pattern={currentRound.pattern} size="md" />
              </div>
              {currentRound.pattern === "traditional_line" && (
                <p className="text-text-secondary text-xs text-center">
                  Any horizontal, vertical, or diagonal line
                </p>
              )}
              {currentRound.pattern === "blackout" && (
                <p className="text-text-secondary text-xs text-center">
                  Fill every square on your card
                </p>
              )}
            </div>

            {/* Winner banner if round is complete */}
            {currentRound.winnerName && (
              <>
                <div className="h-px bg-bg-border" />
                <div className="flex items-center gap-3 p-3 bg-gold/10 border border-gold/30 rounded-xl">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-xs text-text-secondary">Winner</p>
                    <p className="text-gold font-bold">{currentRound.winnerName}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Game ended state */}
        {game.status === "ended" && (
          <div className="card p-6 text-center space-y-2">
            <div className="text-4xl">🏁</div>
            <p className="font-display text-xl font-bold">Game Over</p>
            <p className="text-text-secondary text-sm">Thanks for playing!</p>
          </div>
        )}
      </div>
    </div>
  );
}
