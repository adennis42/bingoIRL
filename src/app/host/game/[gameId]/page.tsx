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
    <div className="min-h-screen bg-base p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackButton href="/host/dashboard" label="Dashboard" />
          <div className="flex items-center gap-3">
            <span className="text-text-disabled text-xs font-mono uppercase tracking-widest">
              {game.status === "active" ? "🟢 Live" : game.status === "setup" ? "⚙️ Setup" : "🔴 Ended"}
            </span>
          </div>
        </div>

        {/* Game Ended Banner */}
        {isGameEnded && (
          <div className="bg-warn/10 border border-warn/40 rounded-2xl p-5 text-center">
            <h2 className="font-display text-xl font-bold text-warn">🏁 Game Over</h2>
            <p className="text-text-secondary text-sm mt-1">All rounds complete.</p>
          </div>
        )}

        {/* Setup Banner */}
        {isGameSetup && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Ready to Start</h2>
              <p className="text-text-secondary text-sm">Share the code below, then start when everyone&apos;s ready.</p>
            </div>
            {gameError && (
              <div className="p-3 bg-warn/10 border border-warn/40 rounded-xl text-warn text-sm">{gameError}</div>
            )}
            <Button onClick={handleStartGame} size="lg" disabled={startingGame} className="mx-auto">
              {startingGame ? "Starting..." : "🎙️ Start Game"}
            </Button>
          </div>
        )}

        {/* Mobile: number grid first → current number → info panel
            Desktop: info | current number | number grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── Left Panel — Info (order-2 on mobile, order-1 on desktop) ── */}
          <div className="space-y-4 order-2 lg:order-1">
            {/* Game Code */}
            <div className="card p-5">
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">Game Code</p>
              <div
                className="font-mono text-4xl font-black tracking-[0.2em] text-text-primary mb-1"
                style={{ textShadow: "0 0 30px rgba(108,99,255,0.4)" }}
              >
                {game.gameCode}
              </div>
              <p className="text-text-disabled text-xs">Players join at this code</p>
            </div>

            {/* Player Count */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-2xl">👥</div>
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-widest">Players</p>
                <p className="font-display text-3xl font-black text-text-primary">{players.length}</p>
              </div>
            </div>

            {/* Round Info */}
            {currentRound && (
              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-text-secondary text-xs uppercase tracking-widest">Round</p>
                  <span className="text-xs font-mono text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                    {game.currentRound} / {game.totalRounds}
                  </span>
                </div>
                <p className="font-semibold capitalize">{currentRound.pattern.replace(/_/g, " ")}</p>
                {currentRound.prize && (
                  <div className="flex items-center gap-2">
                    <span className="text-gold text-sm">🏆</span>
                    <span className="text-gold text-sm font-semibold">{currentRound.prize}</span>
                  </div>
                )}
                {currentRound.winnerName && (
                  <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl">
                    <p className="text-xs text-text-secondary mb-0.5">Winner</p>
                    <p className="text-gold font-bold">🎉 {currentRound.winnerName}</p>
                  </div>
                )}
                {game.status === "active" && !currentRound.winnerName && (
                  <Button onClick={() => setShowWinnerModal(true)} className="w-full" variant="gold">
                    🏆 Mark Winner
                  </Button>
                )}
                {game.status === "active" && (
                  <Button variant="destructive" onClick={handleEndGame} className="w-full" disabled={endingGame}>
                    {endingGame ? "Ending..." : "End Game"}
                  </Button>
                )}
              </div>
            )}

            {/* Round Summary */}
            {game.totalRounds > 1 && (
              <div className="card p-5">
                <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">Rounds</p>
                <div className="space-y-2">
                  {game.rounds.map((round, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border text-sm transition-all ${
                        index + 1 === game.currentRound
                          ? "bg-primary/10 border-primary/40"
                          : round.winnerName
                          ? "bg-gold/10 border-gold/30"
                          : "bg-elevated border-bg-border"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Round {round.roundNumber}</p>
                          <p className="text-text-secondary text-xs capitalize">{round.pattern.replace(/_/g, " ")}</p>
                        </div>
                        {round.winnerName
                          ? <span className="text-gold text-xs">✓ {round.winnerName}</span>
                          : index + 1 === game.currentRound
                          ? <span className="text-primary text-xs">Current</span>
                          : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Center Panel — Current number (order-3 on mobile, order-2 on desktop) ── */}
          <div className="space-y-4 order-3 lg:order-2">
            {/* Current Number */}
            <div className="card p-6 text-center min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden">
              {currentNumber ? (
                <>
                  {/* Glow behind */}
                  <div
                    className="absolute inset-0 opacity-20 blur-3xl"
                    style={{ background: `radial-gradient(circle, ${getColumnColor(currentNumber[0] as BingoColumn)}, transparent 70%)` }}
                  />
                  <p className="text-text-disabled text-xs uppercase tracking-widest mb-3 relative">Now Calling</p>
                  <div
                    className="relative font-display font-black leading-none animate-number-pop"
                    style={{
                      fontSize: "clamp(5rem, 15vw, 9rem)",
                      color: getColumnColor(currentNumber[0] as BingoColumn),
                      textShadow: `0 0 40px ${getColumnColor(currentNumber[0] as BingoColumn)}`,
                    }}
                  >
                    {currentNumber[0]}<span className="text-text-primary">{getActualNumber(currentNumber)}</span>
                  </div>
                  <p
                    className="relative mt-2 text-sm font-mono font-bold tracking-widest uppercase"
                    style={{ color: getColumnColor(currentNumber[0] as BingoColumn) }}
                  >
                    {currentNumber[0] === "B" ? "B Column" : currentNumber[0] === "I" ? "I Column" : currentNumber[0] === "N" ? "N Column" : currentNumber[0] === "G" ? "G Column" : "O Column"}
                  </p>
                </>
              ) : (
                <p className="text-text-disabled text-sm">No numbers called yet</p>
              )}
            </div>

            {/* Recent Calls */}
            <div className="card p-5">
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">Recent Calls</p>
              <div className="flex gap-2 flex-wrap">
                {calledNumbers.length === 0 && (
                  <p className="text-text-disabled text-sm">—</p>
                )}
                {calledNumbers.slice(0, 8).map((num, i) => (
                  <div
                    key={num.id}
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all"
                    style={{
                      backgroundColor: `${getColumnColor(num.number[0] as BingoColumn)}${i === 0 ? "30" : "15"}`,
                      color: getColumnColor(num.number[0] as BingoColumn),
                      border: `1px solid ${getColumnColor(num.number[0] as BingoColumn)}${i === 0 ? "80" : "40"}`,
                      opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.1),
                    }}
                  >
                    {num.number}
                  </div>
                ))}
              </div>
              {calledNumbers.length > 0 && (
                <p className="text-text-disabled text-xs mt-3">{calledNumbers.length} of 75 called</p>
              )}
            </div>
          </div>

          {/* ── Right Panel — Number Grid (order-1 on mobile = top, order-3 on desktop) ── */}
          <div className="card p-4 order-1 lg:order-3">
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-3">
              Call Numbers
              <span className="ml-2 text-primary font-mono">
                {calledNumbers.length}/75
              </span>
            </p>
            {/* Column headers */}
            <div className="grid grid-cols-5 gap-1 mb-1">
              {(["B", "I", "N", "G", "O"] as BingoColumn[]).map((col) => (
                <div
                  key={col}
                  className="text-center font-display font-black text-base py-1 rounded-lg"
                  style={{
                    color: getColumnColor(col),
                    backgroundColor: `${getColumnColor(col)}15`,
                  }}
                >
                  {col}
                </div>
              ))}
            </div>
            {/* Number grid */}
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 15 }, (_, rowIndex) => {
                const columns: BingoColumn[] = ["B", "I", "N", "G", "O"];
                return columns.map((col) => {
                  let actualNumber: number;
                  switch (col) {
                    case "B": actualNumber = rowIndex + 1; break;
                    case "I": actualNumber = rowIndex + 16; break;
                    case "N": actualNumber = rowIndex + 31; break;
                    case "G": actualNumber = rowIndex + 46; break;
                    case "O": actualNumber = rowIndex + 61; break;
                  }
                  const number = formatNumber(actualNumber);
                  const isCalled = calledSet.has(number);
                  const colColor = getColumnColor(col);
                  return (
                    <button
                      key={number}
                      onClick={() => !isCalled && handleCallNumber(number)}
                      disabled={isCalled || isGameEnded || isGameSetup}
                      className="aspect-square rounded-lg font-mono text-xs font-bold transition-all duration-150 select-none"
                      style={
                        isCalled
                          ? {
                              backgroundColor: `${colColor}25`,
                              color: colColor,
                              border: `1px solid ${colColor}50`,
                              cursor: "not-allowed",
                            }
                          : {
                              backgroundColor: "var(--bg-elevated)",
                              color: "var(--text-secondary)",
                              border: `1px solid var(--bg-border)`,
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isCalled && !isGameEnded && !isGameSetup) {
                          e.currentTarget.style.backgroundColor = `${colColor}20`;
                          e.currentTarget.style.color = colColor;
                          e.currentTarget.style.borderColor = `${colColor}80`;
                          e.currentTarget.style.transform = "scale(1.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCalled) {
                          e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
                          e.currentTarget.style.color = "var(--text-secondary)";
                          e.currentTarget.style.borderColor = "var(--bg-border)";
                          e.currentTarget.style.transform = "scale(1)";
                        }
                      }}
                    >
                      {actualNumber}
                    </button>
                  );
                });
              }).flat()}
            </div>
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
