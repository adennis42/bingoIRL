"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHostSettings, CustomSoundMeta } from "@/lib/hooks/useHostSettings";
import { SOUNDS, SoundDef, playSound } from "@/lib/audioEngine";
import { RecordButton } from "@/components/host/RecordButton";
import { RecordingResult } from "@/lib/recorder";
import { uploadCustomSound, deleteCustomSound } from "@/lib/firebase/storage";
import Link from "next/link";

const COLOR_STYLES: Record<string, { bg: string; shadow: string; text: string }> = {
  yellow: { bg: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)", shadow: "#8a6600", text: "#111" },
  blue:   { bg: "linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)", shadow: "#004d99", text: "#111" },
  green:  { bg: "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)", shadow: "#005c1a", text: "#111" },
  red:    { bg: "linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)", shadow: "#660000", text: "#fff" },
  orange: { bg: "linear-gradient(to bottom, #ff9060 0%, #ff6b35 45%, #b33400 100%)", shadow: "#7a2000", text: "#111" },
  purple: { bg: "linear-gradient(to bottom, #c4a0ff 0%, #9b72ff 45%, #5b2fe0 100%)", shadow: "#2e0e80", text: "#fff" },
};

const CUSTOM_PALETTE = {
  bg: "linear-gradient(to bottom, #888 0%, #555 45%, #222 100%)",
  shadow: "#111",
  text: "#fff",
};

export default function HostSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isHost } = useAuth();
  const { settings, loading: settingsLoading, save, customSoundFiles } = useHostSettings(user?.uid);

  const [selected, setSelected] = useState<string[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Custom sounds state
  const [newSoundName, setNewSoundName] = useState("");
  const [uploadingSound, setUploadingSound] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync local state when settings load
  useEffect(() => {
    if (!settingsLoading) {
      setSelected(settings.soundboard);
    }
  }, [settingsLoading, settings.soundboard]);

  useEffect(() => {
    if (!authLoading && (!user || !isHost)) router.push("/login");
  }, [authLoading, user, isHost, router]);

  if (authLoading || settingsLoading || !user || !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#111" }}>
        <div className="font-black text-white uppercase text-sm tracking-widest animate-pulse">Loading...</div>
      </div>
    );
  }

  const handlePreview = (id: string, filePath?: string) => {
    playSound(id, filePath);
    setPlaying(id);
    setTimeout(() => setPlaying(null), 300);
  };

  const toggleSound = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 12) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await save({ soundboard: selected });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const moveSlot = (index: number, direction: -1 | 1) => {
    const newSel = [...selected];
    const target = index + direction;
    if (target < 0 || target >= newSel.length) return;
    [newSel[index], newSel[target]] = [newSel[target], newSel[index]];
    setSelected(newSel);
  };

  // ── Custom Sounds ────────────────────────────────────────────────────────

  const handleRecorded = async (result: RecordingResult) => {
    if (!user) return;
    const name = newSoundName.trim() || "Custom Sound";
    setUploadingSound(true);
    setUploadError("");
    try {
      const id = `custom_${Date.now()}`;
      const url = await uploadCustomSound(user.uid, id, result.blob, result.mimeType);
      const meta: CustomSoundMeta = {
        id,
        name,
        url,
        durationMs: result.durationMs,
        createdAt: Date.now(),
      };
      const existing = settings.customSounds ?? [];
      await save({ customSounds: [...existing, meta] });
      setNewSoundName("");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSound(false);
    }
  };

  const handleDeleteCustomSound = async (soundId: string) => {
    if (!user || deletingId) return;
    setDeletingId(soundId);
    try {
      await deleteCustomSound(user.uid, soundId);
      const remaining = (settings.customSounds ?? []).filter((s) => s.id !== soundId);
      // Also remove from soundboard if present
      const newSoundboard = selected.filter((s) => s !== soundId);
      await save({ customSounds: remaining, soundboard: newSoundboard });
      setSelected(newSoundboard);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const customSounds = settings.customSounds ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#111" }}>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/host/dashboard" className="text-[#555] hover:text-[#f5c542] font-black uppercase text-xs tracking-widest transition-colors">
            ← BACK
          </Link>
          <h1
            className="font-black text-2xl uppercase text-white"
            style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "2px 2px 0px #111" }}
          >
            SETTINGS
          </h1>
        </div>

        {/* ── Soundboard Section ── */}
        <div className="border-[3px] border-[#111] p-5 space-y-5" style={{ background: "#1a1a1a", boxShadow: "5px 5px 0px #111" }}>
          <div>
            <h2
              className="font-black text-lg uppercase text-white tracking-wide"
              style={{ fontFamily: "'Arial Black', sans-serif", textShadow: "1px 1px 0px #111" }}
            >
              🎵 SOUNDBOARD
            </h2>
            <p className="text-[#555] text-xs font-bold uppercase tracking-wider mt-1">
              Pick up to 12 sounds — saved to all your games
            </p>
          </div>

          {/* YOUR BOARD — current selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#f5c542] text-xs font-black uppercase tracking-widest">
                Your Board ({selected.length}/12)
              </span>
              {selected.length > 0 && (
                <button
                  onClick={() => setSelected([])}
                  className="text-[#e84040] text-xs font-black uppercase hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Selected slots */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const id = selected[i];
                const sound = id ? SOUNDS.find((s) => s.id === id) : null;
                const customMeta = id ? customSounds.find((s) => s.id === id) : null;
                const palette = sound
                  ? COLOR_STYLES[sound.color]
                  : customMeta
                  ? CUSTOM_PALETTE
                  : null;

                return (
                  <div
                    key={i}
                    style={{
                      aspectRatio: "1/1",
                      border: (sound || customMeta) ? "3px solid #111" : "2px dashed #333",
                      background: palette ? palette.bg : "#1a1a1a",
                      boxShadow: palette ? `3px 3px 0px ${palette.shadow}` : "none",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "2px",
                    }}
                  >
                    {(sound || customMeta) ? (
                      <>
                        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                          {sound ? sound.emoji : "🎙"}
                        </span>
                        <span style={{ fontSize: "6px", fontWeight: 900, textTransform: "uppercase", color: palette!.text, letterSpacing: "0.04em", textAlign: "center", padding: "0 2px" }}>
                          {sound ? sound.label : customMeta!.name}
                        </span>
                        {/* Remove button */}
                        <button
                          onClick={() => toggleSound(id)}
                          style={{
                            position: "absolute", top: "2px", right: "2px",
                            width: "14px", height: "14px",
                            background: "#e84040", border: "1px solid #111",
                            color: "#fff", fontSize: "8px", fontWeight: 900,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                        {/* Reorder arrows */}
                        <div style={{ position: "absolute", bottom: "2px", left: "2px", display: "flex", gap: "1px" }}>
                          {i > 0 && (
                            <button onClick={() => moveSlot(i, -1)} style={{ width: "12px", height: "12px", background: "#333", border: "1px solid #111", color: "#aaa", fontSize: "7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                          )}
                          {i < selected.length - 1 && (
                            <button onClick={() => moveSlot(i, 1)} style={{ width: "12px", height: "12px", background: "#333", border: "1px solid #111", color: "#aaa", fontSize: "7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                          )}
                        </div>
                      </>
                    ) : (
                      <span style={{ color: "#333", fontSize: "1.2rem" }}>+</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-[2px] bg-[#333]" />
            <span className="text-[#555] text-xs font-black uppercase tracking-widest">All Sounds</span>
            <div className="flex-1 h-[2px] bg-[#333]" />
          </div>

          {/* ALL SOUNDS library (stock) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {SOUNDS.map((sound: SoundDef) => {
              const palette = COLOR_STYLES[sound.color] ?? COLOR_STYLES.blue;
              const isSelected = selected.includes(sound.id);
              const isPlaying = playing === sound.id;
              const isDisabled = !isSelected && selected.length >= 12;

              return (
                <button
                  key={sound.id}
                  onClick={() => !isDisabled && toggleSound(sound.id)}
                  onContextMenu={(e) => { e.preventDefault(); handlePreview(sound.id); }}
                  style={{
                    position: "relative", aspectRatio: "1/1",
                    border: isSelected ? "3px solid #f5c542" : "3px solid #111",
                    background: isDisabled ? "#1a1a1a" : palette.bg,
                    boxShadow: isPlaying
                      ? "1px 1px 0px #111"
                      : isSelected ? "3px 3px 0px #8a6600" : `2px 2px 0px ${palette.shadow}`,
                    transform: isPlaying ? "scale(0.95) translate(2px,2px)" : "scale(1)",
                    opacity: isDisabled ? 0.35 : 1,
                    transition: "all 80ms ease",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: "2px",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {isPlaying && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.4)", pointerEvents: "none" }} />
                  )}
                  {isSelected && (
                    <div style={{ position: "absolute", top: "2px", right: "2px", width: "12px", height: "12px", background: "#f5c542", border: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "8px", fontWeight: 900, color: "#111" }}>✓</span>
                    </div>
                  )}
                  <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{sound.emoji}</span>
                  <span style={{ fontSize: "6px", fontWeight: 900, textTransform: "uppercase", color: isDisabled ? "#555" : palette.text, letterSpacing: "0.04em", textAlign: "center", padding: "0 2px" }}>
                    {sound.label}
                  </span>
                </button>
              );
            })}

            {/* Custom sounds in the grid */}
            {customSounds.map((cs) => {
              const isSelected = selected.includes(cs.id);
              const isPlaying = playing === cs.id;
              const isDisabled = !isSelected && selected.length >= 12;

              return (
                <button
                  key={cs.id}
                  onClick={() => !isDisabled && toggleSound(cs.id)}
                  onContextMenu={(e) => { e.preventDefault(); handlePreview(cs.id, cs.url); }}
                  style={{
                    position: "relative", aspectRatio: "1/1",
                    border: isSelected ? "3px solid #f5c542" : "3px solid #111",
                    background: isDisabled ? "#1a1a1a" : CUSTOM_PALETTE.bg,
                    boxShadow: isPlaying
                      ? "1px 1px 0px #111"
                      : isSelected ? "3px 3px 0px #8a6600" : `2px 2px 0px ${CUSTOM_PALETTE.shadow}`,
                    transform: isPlaying ? "scale(0.95) translate(2px,2px)" : "scale(1)",
                    opacity: isDisabled ? 0.35 : 1,
                    transition: "all 80ms ease",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: "2px",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {isPlaying && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.4)", pointerEvents: "none" }} />
                  )}
                  {isSelected && (
                    <div style={{ position: "absolute", top: "2px", right: "2px", width: "12px", height: "12px", background: "#f5c542", border: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "8px", fontWeight: 900, color: "#111" }}>✓</span>
                    </div>
                  )}
                  <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>🎙</span>
                  <span style={{ fontSize: "6px", fontWeight: 900, textTransform: "uppercase", color: isDisabled ? "#555" : CUSTOM_PALETTE.text, letterSpacing: "0.04em", textAlign: "center", padding: "0 2px" }}>
                    {cs.name}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[#555] text-[10px] font-bold uppercase tracking-wider text-center">
            Tap to select · Long-press to preview
          </p>
        </div>

        {/* ── Custom Sounds Section ── */}
        <div className="border-[3px] border-[#111] p-5 space-y-4" style={{ background: "#1a1a1a", boxShadow: "5px 5px 0px #111" }}>
          <div>
            <h2
              className="font-black text-lg uppercase text-white tracking-wide"
              style={{ fontFamily: "'Arial Black', sans-serif", textShadow: "1px 1px 0px #111" }}
            >
              🎙 CUSTOM SOUNDS
            </h2>
            <p className="text-[#555] text-xs font-bold uppercase tracking-wider mt-1">
              Record your own sounds (max 15s each)
            </p>
          </div>

          {/* Record new sound */}
          <div className="space-y-2">
            <input
              type="text"
              value={newSoundName}
              onChange={(e) => setNewSoundName(e.target.value)}
              placeholder="Sound name (e.g. MY CATCHPHRASE)"
              maxLength={30}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                background: "#111",
                border: "3px solid #333",
                color: "#fff",
                fontFamily: "'Arial Black', Impact, sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <RecordButton
              onRecorded={handleRecorded}
              maxSeconds={15}
              disabled={uploadingSound}
            />
            {uploadingSound && (
              <p className="text-[#f5c542] text-xs font-black uppercase tracking-widest text-center animate-pulse">
                ⏫ Uploading...
              </p>
            )}
            {uploadError && (
              <p className="text-[#e84040] text-xs font-black uppercase">{uploadError}</p>
            )}
          </div>

          {/* Existing custom sounds list */}
          {customSounds.length > 0 && (
            <div className="space-y-2">
              <p className="text-[#555] text-xs font-black uppercase tracking-widest">
                Your Recordings ({customSounds.length})
              </p>
              {customSounds.map((cs) => (
                <div
                  key={cs.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "0.5rem 0.75rem",
                    background: "#111",
                    border: "2px solid #333",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>🎙</span>
                  <span
                    style={{
                      flex: 1,
                      color: "#fff",
                      fontFamily: "'Arial Black', sans-serif",
                      fontWeight: 900,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cs.name}
                  </span>
                  <span style={{ color: "#555", fontSize: "0.65rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {Math.round(cs.durationMs / 1000)}s
                  </span>
                  {/* Play preview */}
                  <button
                    onClick={() => handlePreview(cs.id, cs.url)}
                    style={{
                      width: "28px", height: "28px",
                      background: "#333", border: "2px solid #555",
                      color: "#fff", fontSize: "0.8rem",
                      cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                    title="Preview"
                  >
                    ▶
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteCustomSound(cs.id)}
                    disabled={deletingId === cs.id}
                    style={{
                      width: "28px", height: "28px",
                      background: "#e84040", border: "2px solid #111",
                      color: "#fff", fontSize: "0.8rem", fontWeight: 900,
                      cursor: deletingId === cs.id ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: deletingId === cs.id ? 0.5 : 1,
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {saveError && (
          <div className="p-3 border-[3px] border-[#e84040] text-[#ff8080] text-sm font-black uppercase"
            style={{ background: "#e8404022", boxShadow: "3px 3px 0px #111" }}>
            ⚠ {saveError}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 font-black uppercase text-lg text-[#111] border-[3px] border-[#111] transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-60"
          style={{
            background: saved
              ? "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)"
              : "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)",
            boxShadow: saved ? "3px 3px 0px #005c1a" : "5px 5px 0px #111, inset 0 1px 0 rgba(255,255,255,0.4)",
            fontFamily: "'Arial Black', Impact, sans-serif",
          }}
        >
          {saving ? "SAVING..." : saved ? "✓ SAVED!" : "SAVE SETTINGS"}
        </button>
      </div>
    </div>
  );
}
