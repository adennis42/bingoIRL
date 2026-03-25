"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGameByCode } from "@/lib/firebase/firestore";
import { signInAnonymouslyUser } from "@/lib/firebase/auth";
import { addPlayer } from "@/lib/firebase/firestore";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";

function PlayPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) setCode(codeParam.toUpperCase());
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signInAnonymouslyUser();
      const game = await getGameByCode(code.toUpperCase());
      if (!game) {
        setError("Game not found. Check the code and try again.");
        setLoading(false);
        return;
      }
      await addPlayer(game.id, { displayName: undefined, joinedAt: new Date(), isActive: true }, user.uid);
      router.push(`/play/${game.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join game");
      setLoading(false);
    }
  };

  const chars = code.split("").concat(Array(6 - code.length).fill(""));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden" style={{ background: "#111" }}>
      {/* Halftone */}
      <div className="fixed inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: `radial-gradient(circle, #4db8ff 1px, transparent 1px)`, backgroundSize: "24px 24px" }} /><div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Back */}
        <Link href="/" className="flex items-center gap-1 text-[#8a7a5a] hover:text-[#f5c542] transition-colors text-sm font-black uppercase tracking-wide">
          ← BACK
        </Link>

        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">🎴</div>
          <h1 className="font-black text-4xl uppercase text-white tracking-tight"
            style={{ fontFamily: "'Arial Black', Impact, sans-serif", WebkitTextStroke: "2px #1a1a1a", textShadow: "3px 3px 0px #1a1a1a" }}>
            JOIN GAME
          </h1>
          <p className="text-[#8a7a5a] font-bold uppercase text-xs tracking-widest mt-2">Enter your 6-character game code</p>
        </div>

        {/* Code panel */}
        <div className="border-[3px] border-[#1a1a1a] bg-[#241808] p-6 space-y-5" style={{ boxShadow: "6px 6px 0px #1a1a1a" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Character boxes */}
            <div className="flex gap-2 justify-center">
              {chars.map((char, i) => (
                <div key={i}
                  className="w-11 h-13 flex items-center justify-center font-black text-xl border-[3px] border-[#1a1a1a] transition-all"
                  style={{
                    background: char ? "#4db8ff" : "#2a1f0e",
                    color: char ? "#1a1a1a" : "#4a3a2a",
                    boxShadow: char ? "3px 3px 0px #1a1a1a" : "2px 2px 0px #1a1a1a",
                    fontFamily: "'Arial Black', Impact, monospace",
                    minHeight: "3.25rem",
                  }}>
                  {char || "·"}
                </div>
              ))}
            </div>

            {/* Code input */}
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="TYPE CODE HERE"
              maxLength={6}
              required
              autoFocus
              autoComplete="off"
              className="w-full bg-[#2a1f0e] border-[3px] border-[#1a1a1a] px-4 py-3 text-center font-black text-lg tracking-[0.4em] text-white placeholder:text-[#4a3a2a] focus:outline-none focus:border-[#4db8ff] transition-colors"
              style={{ boxShadow: "3px 3px 0px #1a1a1a", background: "#2a1f0e", color: "#ffffff" }}
            />

            {error && (
              <div className="p-3 border-[3px] border-[#e84040] bg-[#e84040]/20 text-[#ff8080] text-sm font-black uppercase"
                style={{ boxShadow: "3px 3px 0px #1a1a1a" }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-4 font-black uppercase text-lg text-[#1a1a1a] border-[3px] border-[#1a1a1a] transition-all duration-75 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "#4db8ff",
                fontFamily: "'Arial Black', Impact, sans-serif",
                boxShadow: "5px 5px 0px #1a1a1a",
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner /> JOINING...
                </span>
              ) : "LET'S PLAY →"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8a7a5a] text-xs font-bold uppercase tracking-wide">
          Hosting?{" "}
          <Link href="/login" className="text-[#f5c542] hover:underline font-black">Sign in here</Link>
        </p>
      </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a1008" }}>
        <LoadingSpinner />
      </div>
    }>
      <PlayPageInner />
    </Suspense>
  );
}
