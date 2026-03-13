"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHostGames } from "@/lib/hooks/useHostGames";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import type { GameStatus } from "@/types";

const STATUS_CONFIG: Record<GameStatus, { label: string; color: string; dot: string }> = {
  setup:  { label: "Setup",  color: "text-text-secondary",  dot: "bg-text-disabled" },
  active: { label: "Live",   color: "text-secondary",       dot: "bg-secondary animate-pulse" },
  paused: { label: "Paused", color: "text-gold",            dot: "bg-gold" },
  ended:  { label: "Ended",  color: "text-text-disabled",   dot: "bg-text-disabled" },
};

export default function HostDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isHost } = useAuth();
  const { games, loading: gamesLoading } = useHostGames(user?.uid);

  useEffect(() => {
    if (!authLoading && (!user || !isHost)) router.push("/login");
  }, [authLoading, user, isHost, router]);

  if (authLoading || !user || !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <LoadingSpinner />
      </div>
    );
  }

  const activeGames = games.filter((g) => g.status === "active" || g.status === "setup");
  const pastGames = games.filter((g) => g.status === "ended" || g.status === "paused");

  return (
    <div className="min-h-screen bg-base bg-grid">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="relative max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="font-display text-2xl font-black">Dashboard</h1>
            <p className="text-text-disabled text-xs mt-0.5 font-mono">{user.email}</p>
          </div>
          <Link href="/host/create">
            <Button size="sm">＋ New Game</Button>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/host/create">
            <div className="card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer">
              <span className="text-2xl">🎙️</span>
              <div>
                <p className="font-semibold text-sm">New Game</p>
                <p className="text-text-disabled text-xs">Start hosting</p>
              </div>
            </div>
          </Link>
          <Link href="/host/patterns">
            <div className="card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer">
              <span className="text-2xl">🎨</span>
              <div>
                <p className="font-semibold text-sm">Patterns</p>
                <p className="text-text-disabled text-xs">Custom designs</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Active games */}
        {activeGames.length > 0 && (
          <section className="space-y-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest px-1">Active</p>
            {activeGames.map((game) => {
              const cfg = STATUS_CONFIG[game.status];
              return (
                <Link key={game.id} href={`/host/game/${game.id}`}>
                  <div className="card p-4 flex items-center gap-4 hover:border-primary/40 transition-all cursor-pointer">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base tracking-widest text-text-primary">{game.gameCode}</span>
                        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-text-disabled text-xs mt-0.5">
                        Round {game.currentRound}/{game.totalRounds}
                      </p>
                    </div>
                    <span className="text-text-disabled text-lg">›</span>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {/* Past games */}
        {pastGames.length > 0 && (
          <section className="space-y-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest px-1">Past Games</p>
            {pastGames.map((game) => {
              const cfg = STATUS_CONFIG[game.status];
              return (
                <Link key={game.id} href={`/host/game/${game.id}`}>
                  <div className="card p-4 flex items-center gap-4 hover:border-bg-border transition-all cursor-pointer opacity-70 hover:opacity-100">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono font-bold text-sm tracking-widest text-text-secondary">{game.gameCode}</span>
                      <p className="text-text-disabled text-xs mt-0.5">
                        {game.totalRounds} round{game.totalRounds !== 1 ? "s" : ""} · {cfg.label}
                      </p>
                    </div>
                    <span className="text-text-disabled text-lg">›</span>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {/* Empty state */}
        {!gamesLoading && games.length === 0 && (
          <div className="card p-10 text-center space-y-4">
            <div className="text-5xl">🎴</div>
            <div>
              <p className="font-sans font-semibold text-lg">No games yet</p>
              <p className="text-text-secondary text-sm mt-1">Create your first game to get started.</p>
            </div>
            <Link href="/host/create">
              <Button className="mt-1">🎙️ Create Game</Button>
            </Link>
          </div>
        )}

        {gamesLoading && <LoadingSpinner />}
      </div>
    </div>
  );
}
