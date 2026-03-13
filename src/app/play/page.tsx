"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGameByCode } from "@/lib/firebase/firestore";
import { signInAnonymouslyUser } from "@/lib/firebase/auth";
import { addPlayer } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// useSearchParams requires Suspense boundary in Next.js 14 App Router
function PlayPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in anonymously FIRST (required for Firestore rules)
      const user = await signInAnonymouslyUser();

      // Now get the game (requires authentication)
      const game = await getGameByCode(code.toUpperCase());
      if (!game) {
        setError("Game not found. Please check the code.");
        setLoading(false);
        return;
      }

      // Add player to game (use user.uid as document ID for security rules)
      await addPlayer(game.id, {
        displayName: undefined,
        joinedAt: new Date(),
        isActive: true,
      }, user.uid);

      router.push(`/play/${game.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to join game";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Join Game</h1>
          <p className="text-xl text-text-secondary">
            Enter your 6-digit game code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-warn/10 border border-warn rounded-2xl text-warn text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().slice(0, 6))
              }
              placeholder="ABC123"
              maxLength={6}
              className="text-center text-3xl font-mono tracking-wider"
              required
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <LoadingSpinner /> : "Join Game"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <PlayPageInner />
    </Suspense>
  );
}
