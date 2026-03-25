"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCustomPatterns } from "@/lib/hooks/useCustomPatterns";
import { createGame } from "@/lib/firebase/firestore";
import { generateGameCode } from "@/lib/utils/gameCode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PatternVisualizer } from "@/components/bingo/PatternVisualizer";
import { PATTERN_DEFINITIONS } from "@/lib/utils/patterns";
import Link from "next/link";
import type { Round } from "@/types";

const PATTERN_OPTIONS = [
  { value: "traditional_line", label: "TRADITIONAL LINE" },
  { value: "four_corners",     label: "FOUR CORNERS" },
  { value: "blackout",         label: "BLACKOUT" },
];

export default function CreateGamePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { patterns: customPatterns } = useCustomPatterns(user?.uid);
  const [totalRounds, setTotalRounds] = useState(1);
  const [rounds, setRounds] = useState<Round[]>([{ roundNumber: 1, pattern: "traditional_line" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateRoundCount = (n: number) => {
    const count = Math.max(1, Math.min(10, n));
    setTotalRounds(count);
    const newRounds: Round[] = [];
    for (let i = 1; i <= count; i++) {
      newRounds.push(rounds[i - 1] || { roundNumber: i, pattern: "traditional_line" });
    }
    setRounds(newRounds);
  };

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const gameCode = generateGameCode();
      const gameId = await createGame({
        hostId: user.uid,
        gameCode,
        status: "setup",
        createdAt: new Date(),
        currentRound: 1,
        totalRounds,
        rounds: rounds.slice(0, totalRounds),
      });
      router.push(`/host/game/${gameId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#111" }}><div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Back */}
        <Link href="/host/dashboard" className="inline-flex items-center gap-1 text-[#8a7a5a] hover:text-[#f5c542] font-black uppercase text-xs tracking-widest transition-colors">
          ← BACK
        </Link>

        {/* Header */}
        <div>
          <h1 className="font-black text-3xl uppercase text-white tracking-wide"
            style={{ fontFamily: "'Arial Black', Impact, sans-serif", WebkitTextStroke: "1px #1a1a1a", textShadow: "3px 3px 0px #1a1a1a" }}>
            NEW GAME
          </h1>
          <p className="text-[#8a7a5a] text-sm font-bold uppercase tracking-wider mt-1">Set up your rounds, then share the code</p>
        </div>

        {error && (
          <div className="p-3 border-[3px] border-[#e84040] bg-[#e84040]/20 text-[#ff8080] text-sm font-black uppercase"
            style={{ boxShadow: "3px 3px 0px #1a1a1a" }}>
            ⚠ {error}
          </div>
        )}

        {/* Round count */}
        <div className="border-[3px] border-[#1a1a1a] bg-[#241808] p-5 space-y-3"
          style={{ boxShadow: "5px 5px 0px #1a1a1a" }}>
          <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">Number of Rounds</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateRoundCount(totalRounds - 1)}
              disabled={totalRounds <= 1}
              className="w-12 h-12 border-[3px] border-[#1a1a1a] bg-[#e84040] text-white text-2xl font-black disabled:opacity-30 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "3px 3px 0px #1a1a1a", fontFamily: "'Arial Black', sans-serif" }}>
              −
            </button>
            <span className="font-black text-4xl text-white w-10 text-center"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "2px 2px 0px #1a1a1a" }}>
              {totalRounds}
            </span>
            <button
              onClick={() => updateRoundCount(totalRounds + 1)}
              disabled={totalRounds >= 10}
              className="w-12 h-12 border-[3px] border-[#1a1a1a] bg-[#50e878] text-[#1a1a1a] text-2xl font-black disabled:opacity-30 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "3px 3px 0px #1a1a1a", fontFamily: "'Arial Black', sans-serif" }}>
              +
            </button>
          </div>
        </div>

        {/* Rounds config */}
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div key={index} className="border-[3px] border-[#1a1a1a] bg-[#241808] p-5 space-y-4"
              style={{ boxShadow: "4px 4px 0px #1a1a1a" }}>
              {/* Round header */}
              <div className="flex items-center justify-between border-b-[3px] border-[#1a1a1a] pb-3">
                <h3 className="font-black text-base uppercase text-white tracking-wide"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}>
                  ROUND {round.roundNumber}
                </h3>
                {totalRounds > 1 && (
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase border-[2px] border-[#1a1a1a] text-[#1a1a1a] bg-[#f5c542]"
                    style={{ boxShadow: "2px 2px 0px #1a1a1a" }}>
                    {index + 1}/{totalRounds}
                  </span>
                )}
              </div>

              {/* Pattern select */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">Pattern</label>
                  <Link href="/host/patterns" className="text-xs font-black text-[#4db8ff] hover:underline uppercase">+ CUSTOM</Link>
                </div>
                <select
                  className="w-full h-12 border-[3px] border-[#1a1a1a] bg-[#2a1f0e] px-3 text-sm font-black uppercase text-white focus:outline-none focus:border-[#f5c542] transition-colors"
                  style={{ boxShadow: "3px 3px 0px #1a1a1a" }}
                  value={round.pattern}
                  onChange={(e) => {
                    const newRounds = [...rounds];
                    newRounds[index] = { ...newRounds[index], pattern: e.target.value };
                    setRounds(newRounds);
                  }}>
                  <optgroup label="Built-in">
                    {PATTERN_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                  {customPatterns.length > 0 && (
                    <optgroup label="Custom">
                      {customPatterns.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <div className="flex items-center gap-3 pt-1">
                  <PatternVisualizer
                    pattern={customPatterns.find((p) => p.id === round.pattern) || round.pattern}
                    size="sm"
                  />
                  <span className="text-xs font-bold text-[#8a7a5a] uppercase">
                    {(() => {
                      const p = customPatterns.find((p) => p.id === round.pattern) ||
                        PATTERN_DEFINITIONS[round.pattern as keyof typeof PATTERN_DEFINITIONS];
                      return p && "name" in p ? p.name : round.pattern.replace(/_/g, " ");
                    })()}
                  </span>
                </div>
              </div>

              {/* Prize */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">
                  Prize <span className="text-[#8a7a5a] normal-case font-bold">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. $50 gift card, Free drinks…"
                  value={round.prize || ""}
                  onChange={(e) => {
                    const newRounds = [...rounds];
                    newRounds[index] = { ...newRounds[index], prize: e.target.value || undefined };
                    setRounds(newRounds);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleCreate} disabled={loading} size="lg" className="w-full">
          {loading ? <LoadingSpinner /> : "🎙️ CREATE GAME"}
        </Button>
      </div>
  );
}
