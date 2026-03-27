export const STOCK_SOUND_IDS = [
  "drum_roll", "air_horn", "fanfare", "buzzer", "applause", "ding",
  "sad_trombone", "siren", "tick_tock", "shuffle", "shhhh", "lets_go",
  "winner", "jackpot", "party", "laugh", "gasp", "zap", "boom", "launch",
  "bullseye", "dramatic", "spooky", "riff", "sparkle", "silly", "wow",
  "charge", "countdown", "mic_drop",
];

/**
 * Returns a map of soundId → /sounds/{id}.mp3 for files that actually exist.
 * Uses HEAD requests to probe — no 404 noise in the console for missing files.
 */
export async function detectStockSounds(): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  await Promise.all(
    STOCK_SOUND_IDS.map(async (id) => {
      try {
        const res = await fetch(`/sounds/${id}.mp3`, { method: "HEAD" });
        if (res.ok) results[id] = `/sounds/${id}.mp3`;
      } catch {
        // File doesn't exist — fall back to synthesis
      }
    })
  );
  return results;
}
