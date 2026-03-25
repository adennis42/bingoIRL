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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: "#111" }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Back */}
        <Link href="/" className="flex items-center gap-1 text-[#555] hover:text-[#f5c542] transition-colors text-sm font-black uppercase tracking-wide">
          ← BACK
        </Link>

        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">🎴</div>
          <h1
            className="font-black text-4xl uppercase text-white tracking-tight"
            style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "3px 3px 0px #111" }}
          >
            JOIN GAME
          </h1>
          <p className="text-[#555] font-bold uppercase text-xs tracking-widest mt-2">Enter your 6-character game code</p>
        </div>

        {/* Code panel */}
        <div
          className="border-[3px] border-[#111] p-6 space-y-5"
          style={{ background: "#1a1a1a", boxShadow: "6px 6px 0px #111" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Character boxes */}
            <div className="flex gap-2 justify-center">
              {chars.map((char, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center font-black text-xl border-[3px] border-[#111] transition-all"
                  style={{
                    width: "2.75rem",
                    height: "3.25rem",
                    background: char
                      ? "linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)"
                      : "#222",
                    color: char ? "#111" : "#444",
                    boxShadow: char
                      ? "3px 3px 0px #111, inset 0 1px 0 rgba(255,255,255,0.4)"
                      : "2px 2px 0px #111",
                    fontFamily: "'Arial Black', Impact, monospace",
                  }}
                >
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
              className="w-full px-4 py-3 text-center font-black text-lg tracking-[0.4em] placeholder:text-[#444] focus:outline-none transition-colors"
              style={{
                background: "#222",
                border: "3px solid #111",
                color: "#fff",
                boxShadow: "3px 3px 0px #111",
              }}
            />

            {error && (
              <div
                className="p-3 border-[3px] border-[#e84040] text-[#ff8080] text-sm font-black uppercase"
                style={{ background: "#e8404022", boxShadow: "3px 3px 0px #111" }}
              >
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-4 font-black uppercase text-lg text-[#111] border-[3px] border-[#111] transition-all duration-75 disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px]"
              style={{
                background: "linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)",
                fontFamily: "'Arial Black', Impact, sans-serif",
                boxShadow: "5px 5px 0px #111, inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.2)",
              }}
            >
              {loading ? "JOINING..." : "LET'S PLAY →"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#555] text-xs font-bold uppercase tracking-wide">
          Hosting?{" "}
          <Link href="/login" className="text-[#f5c542] hover:underline font-black">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#111" }}>
        <LoadingSpinner />
      </div>
    }>
      <PlayPageInner />
    </Suspense>
  );
}
