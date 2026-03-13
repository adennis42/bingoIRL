import { useState, useEffect } from "react";
import { subscribeToHostGames } from "@/lib/firebase/firestore";
import type { Game } from "@/types";

export function useHostGames(hostId: string | undefined) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hostId) {
      setGames([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToHostGames(hostId, (g) => {
      setGames(g);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [hostId]);

  return { games, loading };
}
