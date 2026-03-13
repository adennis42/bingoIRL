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
import { BackButton } from "@/components/shared/BackButton";
import Link from "next/link";
import type { Round } from "@/types";

const PATTERN_OPTIONS = [
  { value: "traditional_line", label: "Traditional Line" },
  { value: "four_corners", label: "Four Corners" },
  { value: "blackout", label: "Blackout" },
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
    <div className="min-h-screen bg-base">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <BackButton href="/host/dashboard" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-black">New Game</h1>
          <p className="text-text-secondary text-sm mt-1">Set up your rounds, then share the code.</p>
        </div>

        {error && (
          <div className="p-3 bg-warn/10 border border-warn/40 rounded-xl text-warn text-sm">{error}</div>
        )}

        {/* Round count */}
        <div className="card p-5 space-y-3">
          <label className="text-sm font-semibold text-text-secondary uppercase tracking-widest">Rounds</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateRoundCount(totalRounds - 1)}
              disabled={totalRounds <= 1}
              className="w-11 h-11 rounded-xl bg-elevated border border-border text-xl font-bold disabled:opacity-30 hover:border-primary/50 transition-colors"
            >−</button>
            <span className="font-display text-3xl font-black w-8 text-center">{totalRounds}</span>
            <button
              onClick={() => updateRoundCount(totalRounds + 1)}
              disabled={totalRounds >= 10}
              className="w-11 h-11 rounded-xl bg-elevated border border-border text-xl font-bold disabled:opacity-30 hover:border-primary/50 transition-colors"
            >+</button>
          </div>
        </div>

        {/* Rounds config */}
        <div className="space-y-3">
          {rounds.map((round, index) => (
            <div key={index} className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-semibold text-base">Round {round.roundNumber}</h3>
                {totalRounds > 1 && (
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {index + 1}/{totalRounds}
                  </span>
                )}
              </div>

              {/* Pattern select */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Pattern</label>
                  <Link href="/host/patterns" className="text-xs text-primary hover:underline">+ Custom</Link>
                </div>
                <select
                  className="w-full h-11 rounded-xl border border-border bg-elevated px-3 text-sm text-text-primary focus:outline-none focus:border-primary/60 transition-colors"
                  value={round.pattern}
                  onChange={(e) => {
                    const newRounds = [...rounds];
                    newRounds[index] = { ...newRounds[index], pattern: e.target.value };
                    setRounds(newRounds);
                  }}
                >
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
                  <span className="text-xs text-text-secondary capitalize">
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
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                  Prize <span className="normal-case font-normal">(optional)</span>
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
          {loading ? <LoadingSpinner /> : "🎙️ Create Game"}
        </Button>
      </div>
    </div>
  );
}
