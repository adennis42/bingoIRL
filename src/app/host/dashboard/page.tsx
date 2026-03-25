"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHostGames } from "@/lib/hooks/useHostGames";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import type { GameStatus } from "@/types";

const CEL_BG = {
  background: "#1a1008",
  backgroundImage: `
    repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px),
    repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)
  `,
};

const STATUS_CONFIG: Record<GameStatus, { label: string; bg: string; dot: string }> = {
  setup:  { label: "SETUP",  bg: "#f5c542", dot: "#c49a00" },
  active: { label: "LIVE",   bg: "#50e878", dot: "#1a9933" },
  paused: { label: "PAUSED", bg: "#ff6b35", dot: "#b33d00" },
  ended:  { label: "ENDED",  bg: "#555",    dot: "#333" },
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a1008" }}>
        <LoadingSpinner />
      </div>
    );
  }

  const activeGames = games.filter((g) => g.status === "active" || g.status === "setup");
  const pastGames = games.filter((g) => g.status === "ended" || g.status === "paused");

  return (
    <div className="min-h-screen" style={CEL_BG}>
      {/* Top yellow bar */}
      <div className="h-4 bg-[#f5c542]" />

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-2xl uppercase text-white tracking-wide"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif", WebkitTextStroke: "1px #1a1a1a", textShadow: "2px 2px 0px #1a1a1a" }}>
              DASHBOARD
            </h1>
            <p className="text-[#8a7a5a] text-xs font-bold uppercase tracking-widest mt-0.5">{user.email}</p>
          </div>
          <Link href="/host/create">
            <Button size="sm">＋ NEW GAME</Button>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/host/create", icon: "🎙️", label: "New Game", sub: "Start hosting" },
            { href: "/host/patterns", icon: "🎨", label: "Patterns", sub: "Custom designs" },
          ].map(({ href, icon, label, sub }) => (
            <Link key={href} href={href}>
              <div className="border-[3px] border-[#1a1a1a] bg-[#241808] p-4 flex items-center gap-3 cursor-pointer transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: "4px 4px 0px #1a1a1a" }}>
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-black text-sm uppercase text-white tracking-wide">{label}</p>
                  <p className="text-[#8a7a5a] text-xs font-bold">{sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Active games */}
        {activeGames.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-[3px] flex-1 bg-[#50e878]" />
              <span className="text-[#50e878] text-xs font-black uppercase tracking-widest px-1">Active Games</span>
              <div className="h-[3px] flex-1 bg-[#50e878]" />
            </div>
            {activeGames.map((game) => {
              const cfg = STATUS_CONFIG[game.status];
              return (
                <Link key={game.id} href={`/host/game/${game.id}`}>
                  <div className="border-[3px] border-[#1a1a1a] bg-[#241808] p-4 flex items-center gap-3 cursor-pointer transition-transform hover:-translate-y-0.5"
                    style={{ boxShadow: "4px 4px 0px #1a1a1a" }}>
                    {/* Status badge */}
                    <div className="px-2 py-1 text-[10px] font-black uppercase border-[2px] border-[#1a1a1a] text-[#1a1a1a] shrink-0"
                      style={{ background: cfg.bg, boxShadow: "2px 2px 0px #1a1a1a" }}>
                      {cfg.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-lg tracking-[0.2em] text-white"
                        style={{ fontFamily: "'Arial Black', monospace" }}>{game.gameCode}</span>
                      <p className="text-[#8a7a5a] text-xs font-bold uppercase">
                        Round {game.currentRound}/{game.totalRounds}
                      </p>
                    </div>
                    <span className="text-[#f5c542] text-xl font-black">›</span>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {/* Past games */}
        {pastGames.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-[3px] flex-1 bg-[#555]" />
              <span className="text-[#8a7a5a] text-xs font-black uppercase tracking-widest px-1">Past Games</span>
              <div className="h-[3px] flex-1 bg-[#555]" />
            </div>
            {pastGames.map((game) => {
              const cfg = STATUS_CONFIG[game.status];
              return (
                <Link key={game.id} href={`/host/game/${game.id}`}>
                  <div className="border-[3px] border-[#1a1a1a] bg-[#1e1508] p-4 flex items-center gap-3 cursor-pointer opacity-70 hover:opacity-100 transition-all"
                    style={{ boxShadow: "3px 3px 0px #1a1a1a" }}>
                    <div className="px-2 py-1 text-[10px] font-black uppercase border-[2px] border-[#1a1a1a] text-white shrink-0"
                      style={{ background: cfg.bg, boxShadow: "1px 1px 0px #1a1a1a" }}>
                      {cfg.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-sm tracking-[0.2em] text-[#8a7a5a]"
                        style={{ fontFamily: "'Arial Black', monospace" }}>{game.gameCode}</span>
                      <p className="text-[#4a3a2a] text-xs font-bold uppercase">
                        {game.totalRounds} round{game.totalRounds !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-[#4a3a2a] text-xl font-black">›</span>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {/* Empty state */}
        {!gamesLoading && games.length === 0 && (
          <div className="border-[3px] border-[#1a1a1a] bg-[#241808] p-10 text-center space-y-4"
            style={{ boxShadow: "6px 6px 0px #1a1a1a" }}>
            <div className="text-5xl">🎴</div>
            <div>
              <p className="font-black text-lg uppercase text-white tracking-wide"
                style={{ fontFamily: "'Arial Black', sans-serif", WebkitTextStroke: "0.5px #1a1a1a" }}>
                No games yet
              </p>
              <p className="text-[#8a7a5a] text-sm font-bold mt-1">Create your first game to get started.</p>
            </div>
            <Link href="/host/create">
              <Button className="mt-1">🎙️ CREATE GAME</Button>
            </Link>
          </div>
        )}

        {gamesLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Bottom red bar */}
      <div className="h-4 bg-[#e84040]" />
    </div>
  );
}
