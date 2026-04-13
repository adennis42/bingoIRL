"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHostGames } from "@/lib/hooks/useHostGames";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import type { GameStatus } from "@/types";

const STATUS_CONFIG: Record<GameStatus, { label: string; bg: string }> = {
  setup:  { label: "SETUP",  bg: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)" },
  active: { label: "LIVE",   bg: "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)" },
  paused: { label: "PAUSED", bg: "linear-gradient(to bottom, #ff9060 0%, #ff6b35 45%, #b33400 100%)" },
  ended:  { label: "ENDED",  bg: "#333" },
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#111" }}>
        <LoadingSpinner />
      </div>
    );
  }

  const activeGames = games.filter((g) => g.status === "active" || g.status === "setup");
  const pastGames = games.filter((g) => g.status === "ended" || g.status === "paused");

  return (
    <div className="min-h-screen" style={{ background: "#111" }}>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-black text-2xl uppercase text-white tracking-wide"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "2px 2px 0px #111" }}
            >
              DASHBOARD
            </h1>
            <p className="text-[#555] text-xs font-bold uppercase tracking-widest mt-0.5">{user.email}</p>
          </div>
          <Link href="/host/create">
            <Button size="sm">＋ NEW GAME</Button>
          </Link>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/host/create", icon: "🎙️", label: "New Game", sub: "Start hosting" },
            { href: "/host/leaderboard", icon: "🏆", label: "Leaderboard", sub: "Winners & seasons" },
            { href: "/host/patterns", icon: "🎨", label: "Patterns", sub: "Custom designs" },
            { href: "/host/settings", icon: "⚙️", label: "Settings", sub: "Sounds & prefs" },
          ].map(({ href, icon, label, sub }) => (
            <Link key={href} href={href}>
              <div
                className="border-[3px] border-[#111] p-4 flex items-center gap-3 cursor-pointer transition-transform hover:-translate-y-0.5"
                style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-black text-sm uppercase text-white tracking-wide">{label}</p>
                  <p className="text-[#555] text-xs font-bold">{sub}</p>
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
                  <div
                    className="border-[3px] border-[#111] p-4 flex items-center gap-3 cursor-pointer transition-transform hover:-translate-y-0.5"
                    style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}
                  >
                    <div
                      className="px-2 py-1 text-[10px] font-black uppercase border-[2px] border-[#111] text-[#111] shrink-0"
                      style={{ background: cfg.bg, boxShadow: "2px 2px 0px #111, inset 0 1px 0 rgba(255,255,255,0.3)" }}
                    >
                      {cfg.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-lg tracking-[0.2em] text-white" style={{ fontFamily: "'Arial Black', monospace" }}>
                        {game.gameCode}
                      </span>
                      <p className="text-[#555] text-xs font-bold uppercase">Round {game.currentRound}/{game.totalRounds}</p>
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
              <div className="h-[3px] flex-1 bg-[#333]" />
              <span className="text-[#555] text-xs font-black uppercase tracking-widest px-1">Past Games</span>
              <div className="h-[3px] flex-1 bg-[#333]" />
            </div>
            {pastGames.map((game) => {
              const cfg = STATUS_CONFIG[game.status];
              return (
                <Link key={game.id} href={`/host/game/${game.id}`}>
                  <div
                    className="border-[3px] border-[#111] p-4 flex items-center gap-3 cursor-pointer opacity-60 hover:opacity-100 transition-all"
                    style={{ background: "#161616", boxShadow: "3px 3px 0px #111" }}
                  >
                    <div
                      className="px-2 py-1 text-[10px] font-black uppercase border-[2px] border-[#111] text-white shrink-0"
                      style={{ background: cfg.bg, boxShadow: "1px 1px 0px #111" }}
                    >
                      {cfg.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-sm tracking-[0.2em] text-[#555]" style={{ fontFamily: "'Arial Black', monospace" }}>
                        {game.gameCode}
                      </span>
                      <p className="text-[#333] text-xs font-bold uppercase">{game.totalRounds} round{game.totalRounds !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="text-[#333] text-xl font-black">›</span>
                  </div>
                </Link>
              );
            })}
          </section>
        )}

        {/* Empty state */}
        {!gamesLoading && games.length === 0 && (
          <div
            className="border-[3px] border-[#111] p-10 text-center space-y-4"
            style={{ background: "#1a1a1a", boxShadow: "6px 6px 0px #111" }}
          >
            <div className="text-5xl">🎴</div>
            <div>
              <p className="font-black text-lg uppercase text-white tracking-wide" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                No games yet
              </p>
              <p className="text-[#555] text-sm font-bold mt-1">Create your first game to get started.</p>
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
    </div>
  );
}
