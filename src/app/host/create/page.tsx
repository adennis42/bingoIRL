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
  const [location, setLocation] = useState("");
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

      // Embed pattern name + cells into each round so players can read them
      // without needing access to the host's customPatterns subcollection
      const enrichedRounds = rounds.slice(0, totalRounds).map((round) => {
        const builtIn = PATTERN_DEFINITIONS[round.pattern as keyof typeof PATTERN_DEFINITIONS];
        if (builtIn) {
          return { ...round, patternName: builtIn.name };
        }
        const custom = customPatterns.find((p) => p.id === round.pattern);
        if (custom) {
          return { ...round, patternName: custom.name, patternCells: custom.cells };
        }
        return round;
      });

      const gameId = await createGame({
        hostId: user.uid,
        gameCode,
        status: "setup",
        createdAt: new Date(),
        currentRound: 1,
        totalRounds,
        rounds: enrichedRounds,
        location: location.trim() || undefined,
      });
      router.push(`/host/game/${gameId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#111" }}>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Back */}
        <Link href="/host/dashboard" className="inline-flex items-center gap-1 text-[#555] hover:text-[#f5c542] font-black uppercase text-xs tracking-widest transition-colors">
          ← BACK
        </Link>

        {/* Header */}
        <div>
          <h1
            className="font-black text-3xl uppercase text-white tracking-wide"
            style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "3px 3px 0px #111" }}
          >
            NEW GAME
          </h1>
          <p className="text-[#555] text-sm font-bold uppercase tracking-wider mt-1">Set up your rounds, then share the code</p>
        </div>

        {error && (
          <div
            className="p-3 border-[3px] border-[#e84040] text-[#ff8080] text-sm font-black uppercase"
            style={{ background: "#e8404022", boxShadow: "3px 3px 0px #111" }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Location */}
        <div
          className="border-[3px] border-[#111] p-5 space-y-3"
          style={{ background: "#1a1a1a", boxShadow: "5px 5px 0px #111" }}
        >
          <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">
            Venue / Location <span className="text-[#555] normal-case font-bold">(optional)</span>
          </label>
          <Input
            placeholder="e.g. The Rusty Anchor, Bay Shore"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <p className="text-[10px] text-[#555] font-bold uppercase tracking-wider">
            Used for leaderboard tracking — winners are shown with this location
          </p>
        </div>

        {/* Round count stepper */}
        <div
          className="border-[3px] border-[#111] p-5 space-y-3"
          style={{ background: "#1a1a1a", boxShadow: "5px 5px 0px #111" }}
        >
          <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">Number of Rounds</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateRoundCount(totalRounds - 1)}
              disabled={totalRounds <= 1}
              className="w-12 h-12 border-[3px] border-[#111] font-black text-2xl text-white disabled:opacity-30 transition-all active:translate-x-[2px] active:translate-y-[2px]"
              style={{
                background: "linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)",
                boxShadow: "3px 3px 0px #111, inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              −
            </button>
            <span
              className="font-black text-4xl text-white w-10 text-center"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "2px 2px 0px #111" }}
            >
              {totalRounds}
            </span>
            <button
              onClick={() => updateRoundCount(totalRounds + 1)}
              disabled={totalRounds >= 10}
              className="w-12 h-12 border-[3px] border-[#111] font-black text-2xl text-[#111] disabled:opacity-30 transition-all active:translate-x-[2px] active:translate-y-[2px]"
              style={{
                background: "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)",
                boxShadow: "3px 3px 0px #111, inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Round configs */}
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div
              key={index}
              className="border-[3px] border-[#111] p-5 space-y-4"
              style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}
            >
              <div className="flex items-center justify-between border-b-[3px] border-[#111] pb-3">
                <h3
                  className="font-black text-base uppercase text-white tracking-wide"
                  style={{ fontFamily: "'Arial Black', sans-serif" }}
                >
                  ROUND {round.roundNumber}
                </h3>
                {totalRounds > 1 && (
                  <span
                    className="px-2 py-0.5 text-[10px] font-black uppercase border-[2px] border-[#111] text-[#111]"
                    style={{
                      background: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)",
                      boxShadow: "2px 2px 0px #111",
                    }}
                  >
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
                  className="w-full h-12 px-3 text-sm font-black uppercase text-white focus:outline-none transition-colors"
                  style={{
                    background: "#222",
                    border: "3px solid #111",
                    boxShadow: "3px 3px 0px #111",
                    color: "#fff",
                  }}
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
                  <span className="text-xs font-bold text-[#555] uppercase">
                    {(() => {
                      const p =
                        customPatterns.find((p) => p.id === round.pattern) ||
                        PATTERN_DEFINITIONS[round.pattern as keyof typeof PATTERN_DEFINITIONS];
                      return p && "name" in p ? p.name : round.pattern.replace(/_/g, " ");
                    })()}
                  </span>
                </div>
              </div>

              {/* Prize */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">
                  Prize <span className="text-[#555] normal-case font-bold">(optional)</span>
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
          {loading ? <LoadingSpinner variant="inline" /> : "🎙️ CREATE GAME"}
        </Button>
      </div>
    </div>
  );
}
