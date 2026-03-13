"use client";

import { useEffect, useState } from "react";
import { subscribeToPlayers } from "@/lib/firebase/firestore";
import type { Player } from "@/types";

export function usePlayers(gameId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPlayers(gameId, (playersData) => {
      setPlayers(playersData);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [gameId]);

  return { players, loading, error };
}
