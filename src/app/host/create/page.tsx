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
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { BackButton } from "@/components/shared/BackButton";
import Link from "next/link";
import type { Round } from "@/types";

export default function CreateGamePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { patterns: customPatterns } = useCustomPatterns(user?.uid);
  const [totalRounds, setTotalRounds] = useState(1);
  const [rounds, setRounds] = useState<Round[]>([
    { roundNumber: 1, pattern: "traditional_line" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err: any) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Breadcrumbs items={[{ label: "Create New Game" }]} />
        <BackButton href="/host/dashboard" />
        <h1 className="text-4xl font-bold">Create New Game</h1>

        {error && (
          <div className="p-4 bg-warn/10 border border-warn rounded-2xl text-warn text-sm">
            {error}
          </div>
        )}

        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Rounds
            </label>
            <Input
              type="number"
              min={1}
              max={10}
              value={totalRounds}
              onChange={(e) => {
                const num = parseInt(e.target.value) || 1;
                setTotalRounds(Math.max(1, Math.min(10, num)));
                // Update rounds array
                const newRounds: Round[] = [];
                for (let i = 1; i <= num; i++) {
                  newRounds.push(
                    rounds[i - 1] || {
                      roundNumber: i,
                      pattern: "traditional_line",
                    }
                  );
                }
                setRounds(newRounds);
              }}
            />
          </div>

          <div className="space-y-4">
            {rounds.map((round, index) => (
              <div
                key={index}
                className="p-4 bg-elevated rounded-xl space-y-3"
              >
                <h3 className="font-semibold">Round {round.roundNumber}</h3>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">
                      Pattern
                    </label>
                    <Link
                      href="/host/patterns"
                      className="text-sm text-primary hover:underline"
                    >
                      Manage Patterns
                    </Link>
                  </div>
                  <select
                    className="w-full h-12 rounded-xl border border-border bg-surface px-4 mb-3"
                    value={round.pattern}
                    onChange={(e) => {
                      const newRounds = [...rounds];
                      newRounds[index].pattern = e.target.value;
                      setRounds(newRounds);
                    }}
                  >
                    <optgroup label="Built-in Patterns">
                      <option value="traditional_line">Traditional Line</option>
                      <option value="four_corners">Four Corners</option>
                      <option value="blackout">Blackout</option>
                    </optgroup>
                    {customPatterns.length > 0 && (
                      <optgroup label="Custom Patterns">
                        {customPatterns.map((pattern) => (
                          <option key={pattern.id} value={pattern.id}>
                            {pattern.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <div className="flex items-center gap-2">
                    <PatternVisualizer
                      pattern={
                        customPatterns.find((p) => p.id === round.pattern) ||
                        round.pattern
                      }
                      size="sm"
                    />
                    <span className="text-sm text-text-secondary">
                      {(() => {
                        const pattern =
                          customPatterns.find((p) => p.id === round.pattern) ||
                          PATTERN_DEFINITIONS[round.pattern as keyof typeof PATTERN_DEFINITIONS];
                        if (pattern && "name" in pattern) {
                          return pattern.name;
                        }
                        return round.pattern.replace("_", " ");
                      })()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prize (optional)
                  </label>
                  <Input
                    placeholder="e.g., $50 Gift Card"
                    value={round.prize || ""}
                    onChange={(e) => {
                      const newRounds = [...rounds];
                      newRounds[index].prize = e.target.value || undefined;
                      setRounds(newRounds);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreate} disabled={loading} size="lg">
            {loading ? <LoadingSpinner /> : "Create Game"}
          </Button>
        </div>
      </div>
    </div>
  );
}
