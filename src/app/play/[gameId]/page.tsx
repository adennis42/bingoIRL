"use client";

import { useParams } from "next/navigation";
import { useGame } from "@/lib/hooks/useGame";
import { useCalledNumbers } from "@/lib/hooks/useCalledNumbers";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getAllNumbers, getColumnColor, getColumn } from "@/lib/utils/bingo";

export default function PlayerGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { game, loading: gameLoading } = useGame(gameId);
  const { calledNumbers, loading: numbersLoading } = useCalledNumbers(gameId);

  if (gameLoading || numbersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
          <p className="text-text-secondary">
            The game you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const currentNumber = calledNumbers[0]?.number || null;
  const currentRound = game.rounds[game.currentRound - 1];
  const allNumbers = getAllNumbers();
  const calledSet = new Set(calledNumbers.map((n) => n.number));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Current Number Display */}
        {currentNumber && (
          <div className="text-center">
            <div className="text-8xl md:text-9xl font-bold font-mono mb-4">
              {currentNumber}
            </div>
          </div>
        )}

        {/* Round Info - Sticky Bottom Bar */}
        {currentRound && (
          <div className="bg-surface border border-border rounded-2xl p-6 sticky bottom-4">
            <h2 className="text-xl font-bold mb-2">
              Round {game.currentRound} of {game.totalRounds}
            </h2>
            <p className="text-text-secondary">
              Pattern: {currentRound.pattern.replace("_", " ")}
            </p>
            {currentRound.prize && (
              <p className="text-gold mt-2">Prize: {currentRound.prize}</p>
            )}
          </div>
        )}

        {/* Called Numbers Grid */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Called Numbers</h3>
          <div className="grid grid-cols-5 gap-2">
            {["B", "I", "N", "G", "O"].map((col) => (
              <div
                key={col}
                className="text-center font-bold text-sm pb-2"
                style={{ color: getColumnColor(col as any) }}
              >
                {col}
              </div>
            ))}
            {allNumbers.map((number) => {
              const isCalled = calledSet.has(number);
              const column = getColumn(number);
              return (
                <div
                  key={number}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-mono transition-all ${
                    isCalled
                      ? "bg-secondary/30"
                      : "bg-elevated border border-border opacity-50"
                  }`}
                  style={
                    isCalled
                      ? {
                          borderColor: getColumnColor(column),
                          borderWidth: "2px",
                        }
                      : {}
                  }
                >
                  {number.slice(1)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
