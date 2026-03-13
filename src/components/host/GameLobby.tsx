"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/BackButton";
import type { Game, Player } from "@/types";

interface GameLobbyProps {
  game: Game;
  players: Player[];
  onStartGame: () => Promise<void>;
  starting: boolean;
  error?: string;
}

export function GameLobby({ game, players, onStartGame, starting, error }: GameLobbyProps) {
  const [origin, setOrigin] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const joinUrl = origin ? `${origin}/play?code=${game.gameCode}` : "";

  const copyCode = () => {
    navigator.clipboard.writeText(game.gameCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const copyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-base bg-dots flex flex-col">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[300px] h-[300px] rounded-full bg-secondary/8 blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center px-4 py-6 max-w-md mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <BackButton href="/host/dashboard" label="Dashboard" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-gold text-xs font-mono uppercase tracking-widest">Waiting</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 w-full">
          <h1 className="font-display text-3xl font-black">Game Lobby</h1>
          <p className="text-text-secondary text-sm">
            {game.totalRounds} round{game.totalRounds !== 1 ? "s" : ""} · Share the code or QR to get players in
          </p>
        </div>

        {/* Player count */}
        <div
          className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl border"
          style={{
            backgroundColor: players.length > 0 ? "rgba(0,212,170,0.08)" : "var(--bg-surface)",
            borderColor: players.length > 0 ? "rgba(0,212,170,0.3)" : "var(--bg-border)",
            transition: "all 0.4s ease",
          }}
        >
          <span className="text-5xl font-mono font-black" style={{ color: players.length > 0 ? "var(--accent-secondary)" : "var(--text-disabled)" }}>
            {players.length}
          </span>
          <div>
            <p className="text-text-secondary text-sm font-semibold">
              {players.length === 1 ? "player" : "players"} joined
            </p>
            <p className="text-text-disabled text-xs">Updates live</p>
          </div>
        </div>

        {/* QR Code */}
        {joinUrl && (
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-text-disabled text-xs font-mono uppercase tracking-widest">Scan to Join</p>
            <div className="p-4 bg-white rounded-2xl shadow-glow-primary">
              <QRCodeSVG
                value={joinUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#0a0a0f"
                level="M"
              />
            </div>
          </div>
        )}

        {/* Game code */}
        <div className="w-full space-y-2">
          <p className="text-text-disabled text-xs font-mono uppercase tracking-widest text-center">
            Or enter this code at {origin ? new URL(origin).hostname : "the join page"}
          </p>
          <div className="flex items-center gap-3 p-4 card">
            <span
              className="flex-1 text-center font-mono text-4xl font-black tracking-[0.25em]"
              style={{ textShadow: "0 0 20px rgba(108,99,255,0.4)" }}
            >
              {game.gameCode}
            </span>
            <button
              onClick={copyCode}
              className="shrink-0 px-3 py-2 rounded-xl bg-elevated border border-bg-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-primary/40 transition-all"
            >
              {codeCopied ? "✓" : "Copy"}
            </button>
          </div>
          <button
            onClick={copyLink}
            className="w-full text-center text-xs text-primary/70 hover:text-primary transition-colors py-1"
          >
            {linkCopied ? "✓ Link copied!" : "Copy join link"}
          </button>
        </div>

        {/* Round summary */}
        <div className="w-full card p-4 space-y-2">
          <p className="text-text-disabled text-xs font-mono uppercase tracking-widest mb-1">Rounds</p>
          {game.rounds.map((round, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Round {round.roundNumber} · <span className="capitalize">{round.pattern.replace(/_/g, " ")}</span></span>
              {round.prize && <span className="text-gold text-xs font-semibold">🏆 {round.prize}</span>}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="w-full p-3 bg-warn/10 border border-warn/40 rounded-xl text-warn text-sm text-center">
            {error}
          </div>
        )}

        {/* Start button */}
        <Button
          onClick={onStartGame}
          disabled={starting}
          size="xl"
          className="w-full"
        >
          {starting ? "Starting…" : "🎙️ Start Game"}
        </Button>

        <p className="text-text-disabled text-xs text-center">
          Players don&apos;t need an account to join
        </p>
      </div>
    </div>
  );
}
