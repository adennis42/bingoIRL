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
    <div className="min-h-screen bg-base bg-dots flex flex-col items-center justify-center px-6 py-12">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        {/* Back link */}
        <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm w-fit">
          ← Back
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">🎴</div>
          <h1 className="font-display text-4xl font-black">Join Game</h1>
          <p className="text-text-secondary">Enter the 6-character code from your host</p>
        </div>

        {/* Code input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visual character boxes */}
          <div className="space-y-3">
            <div className="flex gap-2 justify-center">
              {chars.map((char, i) => (
                <div
                  key={i}
                  className="w-12 h-14 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-xl transition-all"
                  style={{
                    borderColor: char ? "var(--accent-primary)" : "var(--bg-border)",
                    backgroundColor: char ? "rgba(108,99,255,0.12)" : "var(--bg-surface)",
                    color: char ? "var(--text-primary)" : "var(--text-disabled)",
                    boxShadow: char ? "0 0 12px rgba(108,99,255,0.3)" : "none",
                  }}
                >
                  {char || "·"}
                </div>
              ))}
            </div>

            {/* Hidden-ish actual input */}
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="Type code here"
              maxLength={6}
              required
              autoFocus
              autoComplete="off"
              className="w-full bg-surface border-2 border-bg-border rounded-2xl px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary/70 transition-colors"
            />
          </div>

          {error && (
            <div className="p-4 bg-warn/10 border border-warn/50 rounded-2xl text-warn text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white bg-secondary hover:bg-secondary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-glow-secondary hover:shadow-[0_0_32px_rgba(0,212,170,0.5)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner /> Joining...
              </span>
            ) : (
              "Let&apos;s Play →"
            )}
          </button>
        </form>

        <p className="text-center text-text-disabled text-xs">
          Are you hosting?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-base">
        <LoadingSpinner />
      </div>
    }>
      <PlayPageInner />
    </Suspense>
  );
}
