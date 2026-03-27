"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export interface CustomSoundMeta {
  id: string;        // e.g. "custom_1"
  name: string;      // user-given name
  url: string;       // Firebase Storage download URL
  durationMs: number;
  createdAt: number; // timestamp
}

export interface HostSettings {
  soundboard: string[];           // array of up to 12 sound IDs (built-in or custom)
  customSounds?: CustomSoundMeta[]; // metadata for custom recorded sounds
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
  customSounds: [],
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
    async (newSettings: Partial<HostSettings>) => {
      if (!userId) return;
      const ref = doc(db, "users", userId, "settings", "host");
      await setDoc(ref, newSettings, { merge: true });
    },
    [userId]
  );

  // Computed map of custom sound id → Firebase Storage URL
  const customSoundFiles = useMemo(() => {
    const map: Record<string, string> = {};
    settings.customSounds?.forEach((s) => {
      map[s.id] = s.url;
    });
    return map;
  }, [settings.customSounds]);

  return { settings, loading, save, customSoundFiles };
}
