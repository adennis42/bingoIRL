"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (winnerName: string) => void;
  roundNumber: number;
  prize?: string;
  loading?: boolean;
}

export function WinnerModal({
  isOpen,
  onClose,
  onConfirm,
  roundNumber,
  prize,
  loading = false,
}: WinnerModalProps) {
  const [winnerName, setWinnerName] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setWinnerName("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (winnerName.trim() && !loading) {
      onConfirm(winnerName.trim());
    }
  };

  const handleClose = () => {
    if (!loading) {
      setWinnerName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" 
      onClick={handleClose}
      style={{ zIndex: 1000 }}
    >
      <div 
        className="bg-elevated border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Mark Winner - Round {roundNumber}</h2>
        
        {prize && (
          <div className="mb-4 p-3 bg-gold/10 border border-gold rounded-lg">
            <p className="text-sm text-text-secondary">Prize:</p>
            <p className="text-gold font-semibold">{prize}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Winner Name *
            </label>
            <Input
              value={winnerName}
              onChange={(e) => setWinnerName(e.target.value)}
              placeholder="Enter winner's name"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!winnerName.trim() || loading}
              className="flex-1"
            >
              {loading ? "Saving..." : "Mark Winner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
