"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomSheet } from "@/components/shared/BottomSheet";

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

  useEffect(() => {
    if (!isOpen) setWinnerName("");
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (winnerName.trim() && !loading) onConfirm(winnerName.trim());
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => !loading && onClose()} title={`ROUND ${roundNumber} Winner`}>
      {prize && (
        <div className="flex items-center gap-2 p-3 bg-gold/10 border border-gold/30 rounded-xl">
          <span className="text-lg">PRIZE</span>
          <div>
            <p className="text-xs text-text-secondary">Prize</p>
            <p className="text-gold font-bold text-sm">{prize}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
            Winner&apos;s Name
          </label>
          <Input
            value={winnerName}
            onChange={(e) => setWinnerName(e.target.value)}
            placeholder="Enter their name…"
            required
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="gold" disabled={!winnerName.trim() || loading} className="flex-1">
            {loading ? "Saving…" : "Confirm Winner "}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
