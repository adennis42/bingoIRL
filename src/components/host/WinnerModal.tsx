"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { searchLeaderboardNames } from "@/lib/firebase/firestore";

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (winnerName: string) => void;
  roundNumber: number;
  prize?: string;
  loading?: boolean;
}

export function WinnerModal({ isOpen, onClose, onConfirm, roundNumber, prize, loading = false }: WinnerModalProps) {
  const [winnerName, setWinnerName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setWinnerName("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isOpen]);

  const handleNameChange = (value: string) => {
    setWinnerName(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 1) {
      debounceRef.current = setTimeout(async () => {
        const results = await searchLeaderboardNames(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setWinnerName(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (winnerName.trim() && !loading) onConfirm(winnerName.trim());
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => !loading && onClose()} title={`ROUND ${roundNumber} WINNER`}>
      {prize && (
        <div
          className="flex items-center gap-2 p-3 border-[3px] border-[#111]"
          style={{
            background: "#1a1a1a",
            boxShadow: "3px 3px 0px #111",
          }}
        >
          <span className="text-xs font-black uppercase tracking-widest text-[#555]">PRIZE</span>
          <span className="text-[#f5c542] font-black text-sm uppercase">{prize}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-[#555]">
            WINNER&apos;S NAME
          </label>
          <div className="relative">
            <Input
              value={winnerName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter their name…"
              required
              autoFocus
              autoComplete="off"
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            {/* Autocomplete dropdown */}
            {showSuggestions && (
              <div
                className="absolute left-0 right-0 z-50 border-[3px] border-[#111] border-t-0"
                style={{ background: "#1a1a1a", boxShadow: "4px 4px 0px #111", top: "100%" }}
              >
                {suggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={() => selectSuggestion(name)}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-white uppercase tracking-wide border-b border-[#222] last:border-b-0 hover:bg-[#222] transition-colors"
                  >
                    {name}
                    <span className="text-[#555] text-xs ml-2 normal-case tracking-normal font-bold">— returning</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="gold" disabled={!winnerName.trim() || loading} className="flex-1">
            {loading ? "Saving…" : "Confirm Winner"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
