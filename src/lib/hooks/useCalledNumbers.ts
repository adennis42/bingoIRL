"use client";

import { useEffect, useState } from "react";
import { subscribeToCalledNumbers } from "@/lib/firebase/firestore";
import type { CalledNumber } from "@/types";

export function useCalledNumbers(gameId: string) {
  const [calledNumbers, setCalledNumbers] = useState<CalledNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToCalledNumbers(gameId, (numbers) => {
      setCalledNumbers(numbers);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [gameId]);

  return { calledNumbers, loading, error };
}
