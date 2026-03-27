"use client";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export interface HostSettings {
  soundboard: string[]; // array of up to 12 sound IDs
}

const DEFAULT_SETTINGS: HostSettings = {
  soundboard: [
    "drum_roll",
    "air_horn",
    "fanfare",
    "buzzer",
    "applause",
    "ding",
    "sad_trombone",
    "siren",
    "tick_tock",
    "shuffle",
    "shhhh",
    "lets_go",
  ],
};

export function useHostSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<HostSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const ref = doc(db, "users", userId, "settings", "host");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...(snap.data() as HostSettings) });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const save = useCallback(
    async (newSettings: HostSettings) => {
      if (!userId) return;
      const ref = doc(db, "users", userId, "settings", "host");
      await setDoc(ref, newSettings, { merge: true });
    },
    [userId]
  );

  return { settings, loading, save };
}
