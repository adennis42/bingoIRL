"use client";

import { useEffect, useState } from "react";
import { subscribeToCustomPatterns } from "@/lib/firebase/firestore";
import type { CustomPattern } from "@/types";

export function useCustomPatterns(userId: string | undefined) {
  const [patterns, setPatterns] = useState<CustomPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToCustomPatterns(userId, (patternsData) => {
      setPatterns(patternsData);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [userId]);

  return { patterns, loading, error };
}
