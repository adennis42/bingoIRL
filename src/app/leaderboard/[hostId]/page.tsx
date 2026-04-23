"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  subscribeToOverallLeaderboard,
  subscribeToSeasonalLeaderboard,
  subscribeToSeasons,
} from "@/lib/firebase/firestore";
import { BottomSheet } from "@/components/shared/BottomSheet";
import type { LeaderboardEntry, SeasonalEntry, Season } from "@/types";

type Tab = "overall" | "seasonal";

function rankLabel(i: number): string {
  if (i === 0) return "#1";
  if (i === 1) return "#2";
  if (i === 2) return "#3";
  return `#${i + 1}`;
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PublicLeaderboardPage() {
  const params = useParams();
  const hostId = params?.hostId as string;

  const [tab, setTab] = useState<Tab>("seasonal");
  const [overallEntries, setOverallEntries] = useState<LeaderboardEntry[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [seasonalEntries, setSeasonalEntries] = useState<SeasonalEntry[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | SeasonalEntry | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = subscribeToOverallLeaderboard(setOverallEntries);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hostId) return;
    const unsub = subscribeToSeasons(hostId, (s) => {
      setSeasons(s);
      const active = s.find((x) => x.active) || null;
      setActiveSeason(active);
      setSelectedSeasonId((prev) => {
        if (prev) return prev;
        const def = active || s[0];
        return def ? def.id : "";
      });
    });
    return unsub;
  }, [hostId]);

  useEffect(() => {
    if (!selectedSeasonId) return;
    const unsub = subscribeToSeasonalLeaderboard(selectedSeasonId, setSeasonalEntries);
    return unsub;
  }, [selectedSeasonId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const totalWins = (e: LeaderboardEntry | SeasonalEntry) =>
    "totalWins" in e ? e.totalWins : e.wins;

  function EntryRow({ entry, i }: { entry: LeaderboardEntry | SeasonalEntry; i: number }) {
    const wins = totalWins(entry);
    const isTop = i === 0;
    return (
      <button
        onClick={() => setSelectedPlayer(entry)}
        className="w-full flex items-center gap-4 p-4 border-[3px] text-left transition-all active:translate-x-[1px] active:translate-y-[1px]"
        style={{
          background: isTop ? "#2a2000" : "#1a1a1a",
          boxShadow: "4px 4px 0px #111",
          border: `3px solid ${isTop ? "#c49200" : "#111"}`,
          cursor: "pointer",
        }}
      >
        <span
          className="font-black text-base w-10 text-center shrink-0"
          style={{
            color: i === 0 ? "#f5c542" : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : "#555",
            fontFamily: "'Arial Black', sans-serif",
          }}
        >
          {rankLabel(i)}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="font-black uppercase text-base truncate"
            style={{
              color: isTop ? "#f5c542" : "#fff",
              fontFamily: "'Arial Black', sans-serif",
              textShadow: isTop ? "1px 1px 0 #111" : "none",
            }}
          >
            {entry.playerName}
          </p>
          <p className="text-[#555] text-xs font-bold uppercase truncate">{entry.lastLocation}</p>
        </div>
        <div className="text-right shrink-0">
          <p
            className="font-black text-2xl"
            style={{ color: isTop ? "#f5c542" : "#fff", fontFamily: "'Arial Black', sans-serif" }}
          >
            {wins}
          </p>
          <p className="text-[#555] text-xs font-bold uppercase">{wins === 1 ? "WIN" : "WINS"}</p>
        </div>
        <span className="text-[#333] text-xs font-black ml-1 shrink-0">›</span>
      </button>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#111" }}>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[#555] text-xs font-black uppercase tracking-widest mb-1">BingoIRL</p>
            <h1
              className="font-black text-3xl uppercase text-white tracking-wide"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "3px 3px 0px #111" }}
            >
              LEADERBOARD
            </h1>
            {activeSeason && (
              <div
                className="inline-flex items-center gap-2 mt-2 px-3 py-1 border-[2px] border-[#111] text-[10px] font-black uppercase tracking-widest text-[#111]"
                style={{
                  background: "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)",
                  boxShadow: "2px 2px 0px #111",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#111] inline-block" />
                {activeSeason.name} — Active
              </div>
            )}
          </div>

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className="shrink-0 px-4 py-2 border-[3px] border-[#111] font-black uppercase text-xs tracking-widest text-[#111] transition-all active:translate-x-[1px] active:translate-y-[1px]"
            style={{
              background: copied
                ? "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)"
                : "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)",
              boxShadow: "3px 3px 0px #111",
            }}
          >
            {copied ? "COPIED!" : "SHARE"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["seasonal", "overall"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 font-black uppercase text-sm tracking-widest border-[3px] border-[#111] transition-all active:translate-x-[1px] active:translate-y-[1px]"
              style={
                tab === t
                  ? { background: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)", color: "#111", boxShadow: "3px 3px 0px #111" }
                  : { background: "#1a1a1a", color: "#555", boxShadow: "3px 3px 0px #111" }
              }
            >
              {t === "overall" ? "ALL TIME" : "THIS SEASON"}
            </button>
          ))}
        </div>

        {/* Season selector (if multiple seasons) */}
        {tab === "seasonal" && seasons.length > 1 && (
          <select
            className="w-full h-11 px-3 text-sm font-black uppercase text-white focus:outline-none"
            style={{ background: "#1a1a1a", border: "3px solid #111", boxShadow: "3px 3px 0px #111" }}
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.active ? " (Current)" : ""}
              </option>
            ))}
          </select>
        )}

        {/* Overall Tab */}
        {tab === "overall" && (
          <div className="space-y-3">
            {overallEntries.length === 0 ? (
              <div className="p-8 border-[3px] border-[#222] text-center text-[#555] font-black uppercase text-sm" style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}>
                No winners yet.
              </div>
            ) : (
              overallEntries.map((entry, i) => <EntryRow key={entry.id} entry={entry} i={i} />)
            )}
          </div>
        )}

        {/* Seasonal Tab */}
        {tab === "seasonal" && (
          <div className="space-y-3">
            {!selectedSeasonId ? (
              <div className="p-8 border-[3px] border-[#222] text-center text-[#555] font-black uppercase text-sm" style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}>
                No active season.
              </div>
            ) : seasonalEntries.length === 0 ? (
              <div className="p-8 border-[3px] border-[#222] text-center text-[#555] font-black uppercase text-sm" style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111" }}>
                No wins recorded yet this season. Play some bingo!
              </div>
            ) : (
              seasonalEntries.map((entry, i) => <EntryRow key={entry.id} entry={entry} i={i} />)
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[#333] text-xs font-black uppercase tracking-widest pt-4">
          Powered by BingoIRL · bingoirl.app
        </p>
      </div>

      {/* Player detail sheet */}
      <BottomSheet
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        title={selectedPlayer?.playerName || ""}
      >
        {selectedPlayer && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 p-3 border-[3px] border-[#111] text-center" style={{ background: "#1a1a1a", boxShadow: "3px 3px 0px #111" }}>
                <p className="font-black text-2xl text-white" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                  {totalWins(selectedPlayer)}
                </p>
                <p className="text-[#555] text-xs font-black uppercase tracking-widest">
                  {"totalWins" in selectedPlayer ? "All Time" : "This Season"}
                </p>
              </div>
              <div className="flex-1 p-3 border-[3px] border-[#111] text-center" style={{ background: "#1a1a1a", boxShadow: "3px 3px 0px #111" }}>
                <p className="font-black text-sm text-[#f5c542]" style={{ fontFamily: "'Arial Black', sans-serif" }}>
                  {selectedPlayer.locations?.length || 1}
                </p>
                <p className="text-[#555] text-xs font-black uppercase tracking-widest">
                  {(selectedPlayer.locations?.length || 1) === 1 ? "Venue" : "Venues"}
                </p>
              </div>
            </div>

            {selectedPlayer.locations && selectedPlayer.locations.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#555] mb-2">Venues</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPlayer.locations.map((loc) => (
                    <span key={loc} className="px-3 py-1 text-xs font-black uppercase border-[2px] border-[#222] text-[#888]" style={{ background: "#1a1a1a" }}>
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#555] mb-2">Win History</p>
              {(!selectedPlayer.winHistory || selectedPlayer.winHistory.length === 0) ? (
                <p className="text-[#555] text-sm font-bold">No history available yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...selectedPlayer.winHistory].reverse().map((win, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-[2px] border-[#222]" style={{ background: "#161616" }}>
                      <div>
                        <p className="text-white font-bold text-sm uppercase">{win.location}</p>
                        <p className="text-[#555] text-xs font-bold">{formatDate(win.date)}</p>
                      </div>
                      <span className="text-[#333] text-xs font-black uppercase tracking-widest">WIN</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
