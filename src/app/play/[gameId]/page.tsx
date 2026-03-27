"use client";

import { useParams } from "next/navigation";
import { useGame } from "@/lib/hooks/useGame";
import { useCalledNumbers } from "@/lib/hooks/useCalledNumbers";
import { useCustomPatterns } from "@/lib/hooks/useCustomPatterns";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { BingoBall } from "@/components/bingo/BingoBall";
import { PatternVisualizer } from "@/components/bingo/PatternVisualizer";
import { getColumnColor, getActualNumber } from "@/lib/utils/bingo";
import { PATTERN_DEFINITIONS } from "@/lib/utils/patterns";
import type { BingoColumn, CustomPattern } from "@/types";

export default function PlayerGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { game, loading: gameLoading } = useGame(gameId);
  const { calledNumbers, loading: numbersLoading } = useCalledNumbers(gameId);
  // Fetch host's custom patterns so we can resolve pattern IDs → names + cells
  const { patterns: customPatterns } = useCustomPatterns(game?.hostId);

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

  // Resolve pattern: built-in string | CustomPattern object | fallback
  const resolvePattern = (patternId: string): { name: string; pattern: string | CustomPattern } => {
    // Check built-in patterns first
    const builtIn = PATTERN_DEFINITIONS[patternId];
    if (builtIn) return { name: builtIn.name, pattern: patternId };

    // Check host's custom patterns
    const custom = customPatterns.find((p) => p.id === patternId);
    if (custom) return { name: custom.name, pattern: custom };

    // Fallback — pattern not found yet (still loading or unknown)
    return { name: patternId.replace(/_/g, " "), pattern: patternId };
  };

  const { name: patternName, pattern: resolvedPattern } = currentRound
    ? resolvePattern(currentRound.pattern)
    : { name: "", pattern: "" };

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0 border-b-[2px] border-[#222]">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2"
            style={{
              background: game.status === "active" ? "#50e878" : game.status === "ended" ? "#e84040" : "#f5c542",
              boxShadow: game.status === "active" ? "0 0 6px #50e878" : "none",
            }}
          />
          <span className="text-[#555] text-xs font-black uppercase tracking-widest">
            {game.status === "active" ? "Live" : game.status === "ended" ? "Ended" : "Waiting"}
          </span>
        </div>

        {/* Game code — always visible on player screen */}
        <div
          className="flex items-center gap-2 px-3 py-1 border-[2px] border-[#111]"
          style={{
            background: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)",
            boxShadow: "2px 2px 0px #111, inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          <span className="text-[10px] font-black uppercase text-[#111] tracking-wider">Code</span>
          <span
            className="font-black text-sm tracking-[0.2em] text-[#111]"
            style={{ fontFamily: "'Arial Black', Impact, monospace" }}
          >
            {game.gameCode}
          </span>
        </div>

        <span className="text-[#555] text-xs font-black uppercase">
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
                    className="flex items-center justify-center rounded-xl font-mono font-bold text-sm"
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

            <div className="h-px bg-bg-border" />

            {/* Pattern */}
            <div className="space-y-3">
              <div>
                <p className="text-text-disabled text-xs font-mono uppercase tracking-widest mb-0.5">Win Pattern</p>
                <p className="text-text-primary font-semibold text-sm">{patternName}</p>
              </div>
              <div className="flex justify-center">
                {resolvedPattern ? (
                  <PatternVisualizer pattern={resolvedPattern as any} size="md" />
                ) : null}
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

            {/* Winner banner */}
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

        {/* Game ended */}
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
