"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  subscribeToOverallLeaderboard,
  subscribeToSeasonalLeaderboard,
  subscribeToSeasons,
  createSeason,
  closeSeason,
  getActiveSeason,
} from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import Link from "next/link";
import type { LeaderboardEntry, SeasonalEntry, Season } from "@/types";

type Tab = "overall" | "seasonal";

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overall");
  const [overallEntries, setOverallEntries] = useState<LeaderboardEntry[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [seasonalEntries, setSeasonalEntries] = useState<SeasonalEntry[]>([]);
  const [showNewSeasonForm, setShowNewSeasonForm] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [creatingseason, setCreatingSeason] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closingSeasonId, setClosingSeasonId] = useState("");
  const [closingSeasonLoading, setClosingSeasonLoading] = useState(false);

  // Subscribe to overall leaderboard
  useEffect(() => {
    const unsub = subscribeToOverallLeaderboard(setOverallEntries);
    return unsub;
  }, []);

  // Subscribe to seasons for this host
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToSeasons(user.uid, (s) => {
      setSeasons(s);
      const active = s.find((x) => x.active) || null;
      setActiveSeason(active);
      // Auto-select active season, or most recent (only if nothing selected yet)
      setSelectedSeasonId((prev) => {
        if (prev) return prev;
        const defaultSeason = active || s[0];
        return defaultSeason ? defaultSeason.id : "";
      });
    });
    return unsub;
  }, [user]);

  // Subscribe to seasonal leaderboard for selected season
  useEffect(() => {
    if (!selectedSeasonId) return;
    const unsub = subscribeToSeasonalLeaderboard(selectedSeasonId, setSeasonalEntries);
    return unsub;
  }, [selectedSeasonId]);

  const handleCreateSeason = async () => {
    if (!user || !newSeasonName.trim()) return;
    setCreatingSeason(true);
    try {
      await createSeason({
        name: newSeasonName.trim(),
        startDate: new Date(),
        active: true,
        hostId: user.uid,
      });
      setNewSeasonName("");
      setShowNewSeasonForm(false);
    } catch (err) {
      console.error("Failed to create season:", err);
    } finally {
      setCreatingSeason(false);
    }
  };

  const handleCloseSeason = async () => {
    if (!closingSeasonId) return;
    setClosingSeasonLoading(true);
    try {
      await closeSeason(closingSeasonId);
      setShowCloseConfirm(false);
      setClosingSeasonId("");
    } catch (err) {
      console.error("Failed to close season:", err);
    } finally {
      setClosingSeasonLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const rankEmoji = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  return (
    <div className="min-h-screen" style={{ background: "#111" }}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Back */}
        <Link
          href="/host/dashboard"
          className="inline-flex items-center gap-1 text-[#555] hover:text-[#f5c542] font-black uppercase text-xs tracking-widest transition-colors"
        >
          ← BACK
        </Link>

        {/* Header */}
        <div>
          <h1
            className="font-black text-3xl uppercase text-white tracking-wide"
            style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "3px 3px 0px #111" }}
          >
            🏆 LEADERBOARD
          </h1>
          <p className="text-[#555] text-sm font-bold uppercase tracking-wider mt-1">
            Overall wins &amp; seasonal standings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["overall", "seasonal"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 font-black uppercase text-sm tracking-widest border-[3px] border-[#111] transition-all active:translate-x-[1px] active:translate-y-[1px]"
              style={
                tab === t
                  ? {
                      background: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)",
                      color: "#111",
                      boxShadow: "3px 3px 0px #111",
                    }
                  : {
                      background: "#1a1a1a",
                      color: "#555",
                      boxShadow: "3px 3px 0px #111",
                    }
              }
            >
              {t === "overall" ? "🌍 Overall" : "📅 Seasonal"}
            </button>
          ))}
        </div>

        {/* Overall Tab */}
        {tab === "overall" && (
          <div className="space-y-3">
            {overallEntries.length === 0 ? (
              <div
                className="p-8 border-[3px] border-[#222] text-center text-[#555] font-black uppercase text-sm"
                style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}
              >
                No winners yet. Start a game to build the leaderboard!
              </div>
            ) : (
              overallEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-4 border-[3px] border-[#111]"
                  style={{
                    background: i === 0 ? "#2a2000" : "#1a1a1a",
                    boxShadow: "4px 4px 0px #111",
                    borderColor: i === 0 ? "#c49200" : "#111",
                  }}
                >
                  <span
                    className="font-black text-xl w-10 text-center"
                    style={{ color: i === 0 ? "#f5c542" : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : "#555" }}
                  >
                    {rankEmoji(i)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-black uppercase text-base truncate"
                      style={{
                        color: i === 0 ? "#f5c542" : "#fff",
                        fontFamily: "'Arial Black', sans-serif",
                        textShadow: i === 0 ? "1px 1px 0 #111" : "none",
                      }}
                    >
                      {entry.playerName}
                    </p>
                    <p className="text-[#555] text-xs font-bold uppercase truncate">📍 {entry.location}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-black text-2xl"
                      style={{ color: i === 0 ? "#f5c542" : "#fff", fontFamily: "'Arial Black', sans-serif" }}
                    >
                      {entry.totalWins}
                    </p>
                    <p className="text-[#555] text-xs font-bold uppercase">
                      {entry.totalWins === 1 ? "WIN" : "WINS"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Seasonal Tab */}
        {tab === "seasonal" && (
          <div className="space-y-5">
            {/* Season selector + management */}
            <div
              className="p-4 border-[3px] border-[#111] space-y-3"
              style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">Season</label>
                <button
                  onClick={() => setShowNewSeasonForm(!showNewSeasonForm)}
                  className="text-xs font-black uppercase text-[#4db8ff] hover:underline"
                >
                  + NEW SEASON
                </button>
              </div>

              {seasons.length > 0 ? (
                <select
                  className="w-full h-12 px-3 text-sm font-black uppercase text-white focus:outline-none"
                  style={{ background: "#222", border: "3px solid #111", boxShadow: "3px 3px 0px #111" }}
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                >
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.active ? " (Active)" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[#555] text-sm font-bold">No seasons yet.</p>
              )}

              {/* Active season controls */}
              {activeSeason && selectedSeasonId === activeSeason.id && (
                <button
                  onClick={() => {
                    setClosingSeasonId(activeSeason.id);
                    setShowCloseConfirm(true);
                  }}
                  className="w-full py-2 font-black uppercase text-xs tracking-widest border-[3px] border-[#111] text-[#e84040] transition-all"
                  style={{ background: "#2a0000", boxShadow: "3px 3px 0px #111" }}
                >
                  🏁 Close Season
                </button>
              )}

              {/* New season form */}
              {showNewSeasonForm && (
                <div className="space-y-2 pt-2 border-t-[2px] border-[#222]">
                  <Input
                    placeholder="e.g. Spring 2026"
                    value={newSeasonName}
                    onChange={(e) => setNewSeasonName(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateSeason}
                    disabled={!newSeasonName.trim() || creatingseason}
                    className="w-full"
                  >
                    {creatingseason ? "Creating…" : "🌱 Start Season"}
                  </Button>
                </div>
              )}
            </div>

            {/* Seasonal entries */}
            {!selectedSeasonId ? (
              <div
                className="p-8 border-[3px] border-[#222] text-center text-[#555] font-black uppercase text-sm"
                style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}
              >
                Select or create a season to view standings.
              </div>
            ) : seasonalEntries.length === 0 ? (
              <div
                className="p-8 border-[3px] border-[#222] text-center text-[#555] font-black uppercase text-sm"
                style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}
              >
                No wins recorded this season yet.
              </div>
            ) : (
              <div className="space-y-3">
                {seasonalEntries.map((entry, i) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-4 border-[3px] border-[#111]"
                    style={{
                      background: i === 0 ? "#2a2000" : "#1a1a1a",
                      boxShadow: "4px 4px 0px #111",
                      borderColor: i === 0 ? "#c49200" : "#111",
                    }}
                  >
                    <span
                      className="font-black text-xl w-10 text-center"
                      style={{ color: i === 0 ? "#f5c542" : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : "#555" }}
                    >
                      {rankEmoji(i)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-black uppercase text-base truncate"
                        style={{
                          color: i === 0 ? "#f5c542" : "#fff",
                          fontFamily: "'Arial Black', sans-serif",
                        }}
                      >
                        {entry.playerName}
                      </p>
                      <p className="text-[#555] text-xs font-bold uppercase truncate">📍 {entry.location}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-black text-2xl"
                        style={{ color: i === 0 ? "#f5c542" : "#fff", fontFamily: "'Arial Black', sans-serif" }}
                      >
                        {entry.wins}
                      </p>
                      <p className="text-[#555] text-xs font-bold uppercase">
                        {entry.wins === 1 ? "WIN" : "WINS"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showCloseConfirm}
        onClose={() => {
          setShowCloseConfirm(false);
          setClosingSeasonId("");
        }}
        onConfirm={handleCloseSeason}
        title="Close Season"
        message="Are you sure you want to close this season? No more wins will be recorded to it. The standings are preserved."
        confirmText="Close Season"
        cancelText="Cancel"
        variant="destructive"
        loading={closingSeasonLoading}
      />
    </div>
  );
}
