"use client";

import { useEffect, useState } from "react";
import { subscribeToGame } from "@/lib/firebase/firestore";
import type { Game } from "@/types";

export function useGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToGame(gameId, (gameData) => {
      setGame(gameData);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [gameId]);

  return { game, loading, error };
}
