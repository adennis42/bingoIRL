"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/lib/hooks/useGame";
import { useCalledNumbers } from "@/lib/hooks/useCalledNumbers";
import { usePlayers } from "@/lib/hooks/usePlayers";
import { useAuth } from "@/lib/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { getAllNumbers, getColumnColor, getActualNumber, formatNumber } from "@/lib/utils/bingo";
import { addCalledNumber, updateGame } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { WinnerModal } from "@/components/host/WinnerModal";
import { RoundCompleteModal } from "@/components/host/RoundCompleteModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { BackButton } from "@/components/shared/BackButton";
import Link from "next/link";
import type { BingoColumn } from "@/types";

export default function HostGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = (params?.gameId as string) || "";
  const { user, loading: authLoading } = useAuth();
  
  // Always call hooks in the same order, even if gameId is empty
  const { game, loading: gameLoading } = useGame(gameId);
  const { calledNumbers } = useCalledNumbers(gameId);
  const { players } = usePlayers(gameId);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showRoundCompleteModal, setShowRoundCompleteModal] = useState(false);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [completedRoundInfo, setCompletedRoundInfo] = useState<{
    roundNumber: number;
    winnerName: string;
    prize?: string;
    isLastRound: boolean;
  } | null>(null);
  const [markingWinner, setMarkingWinner] = useState(false);
  const [endingGame, setEndingGame] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [gameError, setGameError] = useState("");

  // Clear error when game status changes successfully
  const gameStatus = game?.status;
  useEffect(() => {
    if (gameStatus === "active" && gameError) {
      setGameError("");
    }
  }, [gameStatus, gameError]);

  // Redirect non-hosts to player page (must be before any conditional returns)
  useEffect(() => {
    if (game && user && game.hostId !== user.uid) {
      // If user is authenticated but not the host, they might be a player
      // Redirect them to the player page instead
      router.push(`/play/${gameId}`);
    }
  }, [game, user, gameId, router]);

  // Redirect non-hosts to player page (must be before any conditional returns)
  useEffect(() => {
    if (game && user && game.hostId !== user.uid) {
      // If user is authenticated but not the host, they might be a player
      // Redirect them to the player page instead
      router.push(`/play/${gameId}`);
    }
  }, [game, user, gameId, router]);

  const handleCallNumber = async (number: string) => {
    const isAlreadyCalled = calledNumbers.some((n) => n.number === number);
    if (isAlreadyCalled) return;

    try {
      await addCalledNumber(gameId, {
        number,
        calledAt: new Date(),
        sequence: calledNumbers.length + 1,
      });
    } catch (error) {
      console.error("Failed to call number:", error);
    }
  };

  const handleMarkWinner = async (winnerName: string) => {
    if (!game) return;

    setMarkingWinner(true);
    try {
      const updatedRounds = [...game.rounds];
      const currentRoundIndex = game.currentRound - 1;
      const currentRound = updatedRounds[currentRoundIndex];

      // Mark winner for current round
      updatedRounds[currentRoundIndex] = {
        ...currentRound,
        winnerName,
        completedAt: new Date(),
      };

      const isLastRound = game.currentRound >= game.totalRounds;
      const updates: any = {
        rounds: updatedRounds,
      };

      if (isLastRound) {
        // End the game
        updates.status = "ended";
      } else {
        // Advance to next round
        updates.currentRound = game.currentRound + 1;
        updates.status = "active";
      }

      await updateGame(gameId, updates);
      setShowWinnerModal(false);
      
      // Show round completion modal
      setCompletedRoundInfo({
        roundNumber: game.currentRound,
        winnerName,
        prize: currentRound.prize,
        isLastRound,
      });
      setShowRoundCompleteModal(true);
    } catch (error) {
      console.error("Failed to mark winner:", error);
    } finally {
      setMarkingWinner(false);
    }
  };

  const handleStartGame = async () => {
    if (!game || !user) {
      setGameError("You must be logged in to start the game.");
      return;
    }
    
    // Verify hostId matches (with detailed logging for debugging)
    const gameHostId = game.hostId;
    const userUid = user.uid;
    
    if (gameHostId !== userUid) {
      console.error("Permission denied:", {
        gameHostId,
        userUid,
        match: gameHostId === userUid,
        gameHostIdType: typeof gameHostId,
        userUidType: typeof userUid,
      });
      setGameError("You don't have permission to start this game.");
      return;
    }
    
    setStartingGame(true);
    setGameError("");
    try {
      await updateGame(gameId, { status: "active" });
      // Real-time listener will update the UI automatically
    } catch (error: any) {
      console.error("Failed to start game:", error);
      console.error("User UID:", userUid);
      console.error("Game hostId:", gameHostId);
      setGameError(error.message || "Failed to start game. Please try again.");
    } finally {
      setStartingGame(false);
    }
  };

  const handleEndGame = async () => {
    if (!game) return;
    setShowEndGameConfirm(true);
  };

  const confirmEndGame = async () => {
    if (!game) return;
    setEndingGame(true);
    try {
      await updateGame(gameId, { status: "ended" });
      setShowEndGameConfirm(false);
    } catch (error) {
      console.error("Failed to end game:", error);
    } finally {
      setEndingGame(false);
    }
  };

  if (authLoading || gameLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-text-secondary">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
        </div>
      </div>
    );
  }
  
  // Show loading while redirecting non-hosts to player page
  if (game && user && game.hostId !== user.uid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const allNumbers = getAllNumbers();
  const calledSet = new Set(calledNumbers.map((n) => n.number));
  const currentNumber = calledNumbers[0]?.number || null;
  const currentRound = game.rounds[game.currentRound - 1];
  const isGameEnded = game.status === "ended";
  const isGameSetup = game.status === "setup";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Game", href: `/host/game/${gameId}` },
          ]}
        />
        <BackButton href="/host/dashboard" label="Back to Dashboard" />
      </div>

      {isGameEnded && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-warn/10 border border-warn rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold text-warn mb-2">Game Ended</h2>
            <p className="text-text-secondary">
              This game has been completed. All rounds have finished.
            </p>
          </div>
        </div>
      )}

      {isGameSetup && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Game Ready to Start</h2>
            <p className="text-text-secondary mb-4">
              Share the game code with players, then start the game when ready.
            </p>
            {gameError && (
              <div className="mb-4 p-3 bg-warn/10 border border-warn rounded-lg text-warn text-sm">
                {gameError}
              </div>
            )}
            <Button 
              onClick={handleStartGame} 
              size="lg"
              disabled={startingGame}
            >
              {startingGame ? "Starting..." : "Start Game"}
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-2">Game Code</h2>
            <div className="text-3xl font-bold font-mono mb-4">{game.gameCode}</div>
            <p className="text-sm text-text-secondary">
              Share this code with players to join
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Players</h2>
            <div className="text-3xl font-bold">{players.length}</div>
          </div>

          {currentRound && (
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Round Info</h2>
              <div className="space-y-2">
                <p className="text-text-secondary">
                  Round {game.currentRound} of {game.totalRounds}
                </p>
                <p className="mb-2">
                  Pattern: {currentRound.pattern.replace("_", " ")}
                </p>
                {currentRound.prize && (
                  <p className="text-gold">Prize: {currentRound.prize}</p>
                )}
              </div>
              
              {currentRound.winnerName && (
                <div className="p-3 bg-gold/10 border border-gold rounded-lg">
                  <p className="text-sm text-text-secondary">Winner:</p>
                  <p className="text-gold font-semibold">{currentRound.winnerName}</p>
                </div>
              )}

              {game.status === "active" && !currentRound.winnerName && (
                <Button
                  onClick={() => {
                    console.log("Mark Winner clicked");
                    setShowWinnerModal(true);
                  }}
                  className="w-full"
                >
                  Mark Winner
                </Button>
              )}

              {game.status === "active" && (
                <Button
                  variant="destructive"
                  onClick={handleEndGame}
                  className="w-full"
                  disabled={endingGame}
                >
                  {endingGame ? "Ending..." : "End Game"}
                </Button>
              )}
            </div>
          )}

          {/* Round Summary */}
          {game.totalRounds > 1 && (
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Round Summary</h2>
              <div className="space-y-2">
                {game.rounds.map((round, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      index + 1 === game.currentRound
                        ? "bg-primary/10 border-primary"
                        : round.winnerName
                        ? "bg-gold/10 border-gold"
                        : "bg-elevated border-border"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          Round {round.roundNumber}
                          {index + 1 === game.currentRound && (
                            <span className="ml-2 text-xs text-primary">(Current)</span>
                          )}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {round.pattern.replace("_", " ")}
                        </p>
                        {round.winnerName && (
                          <p className="text-sm text-gold mt-1">
                            Winner: {round.winnerName}
                          </p>
                        )}
                      </div>
                      {round.winnerName && (
                        <span className="text-2xl">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Panel */}
        <div className="space-y-6">
          {currentNumber && (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
              <div className="text-7xl md:text-9xl font-bold font-mono mb-4">
                {currentNumber[0]}
                {getActualNumber(currentNumber)}
              </div>
              <p className="text-text-secondary">Current Number</p>
            </div>
          )}

          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Calls</h3>
            <div className="flex gap-2 flex-wrap">
              {calledNumbers.slice(0, 5).map((num) => (
                <div
                  key={num.id}
                  className="px-4 py-2 bg-secondary/20 rounded-lg font-mono"
                >
                  {num.number[0]}
                  {getActualNumber(num.number)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Number Grid */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Call Numbers</h3>
          <div className="grid grid-cols-5 gap-2">
            {/* Column Headers */}
            {["B", "I", "N", "G", "O"].map((col) => (
              <div
                key={col}
                className="text-center font-bold text-sm pb-2"
                style={{ color: getColumnColor(col as any) }}
              >
                {col}
              </div>
            ))}
            {/* Grid organized by column: B(1-15), I(16-30), N(31-45), G(46-60), O(61-75) */}
            {Array.from({ length: 15 }, (_, rowIndex) => {
              const columns: BingoColumn[] = ["B", "I", "N", "G", "O"];
              return columns.map((col) => {
                let actualNumber: number;
                
                switch (col) {
                  case "B":
                    actualNumber = rowIndex + 1; // 1-15
                    break;
                  case "I":
                    actualNumber = rowIndex + 16; // 16-30
                    break;
                  case "N":
                    actualNumber = rowIndex + 31; // 31-45
                    break;
                  case "G":
                    actualNumber = rowIndex + 46; // 46-60
                    break;
                  case "O":
                    actualNumber = rowIndex + 61; // 61-75
                    break;
                }
                
                // Convert actual number to bingo format (e.g., 36 -> "N6")
                const number = formatNumber(actualNumber);
                const isCalled = calledSet.has(number);
                
                return (
                  <button
                    key={number}
                    onClick={() => !isCalled && handleCallNumber(number)}
                    disabled={isCalled || isGameEnded || isGameSetup}
                    className={`aspect-square rounded-lg font-mono text-sm transition-all ${
                      isCalled
                        ? "bg-secondary/30 cursor-not-allowed opacity-50"
                        : "bg-elevated hover:bg-elevated/80 hover:scale-105 border border-border"
                    }`}
                    style={
                      !isCalled
                        ? {
                            borderColor: getColumnColor(col),
                          }
                        : {}
                    }
                  >
                    {actualNumber}
                  </button>
                );
              });
            }).flat()}
          </div>
        </div>
      </div>

      {showWinnerModal && (
        <WinnerModal
          isOpen={showWinnerModal}
          onClose={() => {
            console.log("Closing winner modal");
            setShowWinnerModal(false);
          }}
          onConfirm={handleMarkWinner}
          roundNumber={game.currentRound}
          prize={currentRound?.prize}
          loading={markingWinner}
        />
      )}

      {completedRoundInfo && (
        <RoundCompleteModal
          isOpen={showRoundCompleteModal}
          onClose={() => {
            setShowRoundCompleteModal(false);
            setCompletedRoundInfo(null);
          }}
          roundNumber={completedRoundInfo.roundNumber}
          totalRounds={game.totalRounds}
          winnerName={completedRoundInfo.winnerName}
          prize={completedRoundInfo.prize}
          isLastRound={completedRoundInfo.isLastRound}
        />
      )}

      <ConfirmModal
        isOpen={showEndGameConfirm}
        onClose={() => setShowEndGameConfirm(false)}
        onConfirm={confirmEndGame}
        title="End Game"
        message="Are you sure you want to end this game? This action cannot be undone."
        confirmText="End Game"
        cancelText="Cancel"
        variant="destructive"
        loading={endingGame}
      />
    </div>
  );
}
