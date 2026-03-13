"use client";

import { Button } from "@/components/ui/button";

interface RoundCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundNumber: number;
  totalRounds: number;
  winnerName: string;
  prize?: string;
  isLastRound: boolean;
  onContinue?: () => void;
}

export function RoundCompleteModal({
  isOpen,
  onClose,
  roundNumber,
  totalRounds,
  winnerName,
  prize,
  isLastRound,
  onContinue,
}: RoundCompleteModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" 
      onClick={onClose}
      style={{ zIndex: 1000 }}
    >
      <div 
        className="bg-elevated border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold">
          {isLastRound ? "Game Complete!" : `Round ${roundNumber} Complete!`}
        </h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-gold/10 border border-gold rounded-lg">
            <p className="text-sm text-text-secondary mb-1">Winner</p>
            <p className="text-2xl font-bold text-gold">{winnerName}</p>
          </div>

          {prize && (
            <div className="p-4 bg-primary/10 border border-primary rounded-lg">
              <p className="text-sm text-text-secondary mb-1">Prize</p>
              <p className="text-xl font-semibold">{prize}</p>
            </div>
          )}

          {!isLastRound && (
            <p className="text-text-secondary pt-2">
              Round {roundNumber + 1} will begin automatically
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {isLastRound ? (
            <Button onClick={onClose} className="flex-1" size="lg">
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Dismiss
              </Button>
              {onContinue && (
                <Button onClick={onContinue} className="flex-1">
                  Continue to Next Round
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
