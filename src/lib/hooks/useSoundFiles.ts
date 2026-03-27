"use client";
import { useEffect, useState } from "react";
import { detectStockSounds } from "@/lib/stockSounds";

export function useSoundFiles() {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    detectStockSounds().then((f) => {
      setFiles(f);
      setLoaded(true);
    });
  }, []);

  return { files, loaded };
}
