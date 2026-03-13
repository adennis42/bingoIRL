"use client";

import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/shared/BottomSheet";

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
  isOpen, onClose, roundNumber, totalRounds, winnerName, prize, isLastRound, onContinue,
}: RoundCompleteModalProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="text-center space-y-5">
        <div className="text-6xl">{isLastRound ? "🏁" : "🎉"}</div>

        <div>
          <h2 className="font-display text-2xl font-black">
            {isLastRound ? "Game Over!" : `Round ${roundNumber} Done!`}
          </h2>
          {!isLastRound && (
            <p className="text-text-secondary text-sm mt-1">
              {roundNumber} of {totalRounds} complete
            </p>
          )}
        </div>

        {/* Winner highlight */}
        <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 space-y-1">
          <p className="text-xs text-text-secondary uppercase tracking-widest">Winner</p>
          <p className="font-display text-2xl font-black text-gold">{winnerName}</p>
        </div>

        {prize && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 space-y-1">
            <p className="text-xs text-text-secondary uppercase tracking-widest">Prize</p>
            <p className="font-bold text-lg">{prize}</p>
          </div>
        )}

        {!isLastRound && (
          <p className="text-text-secondary text-sm">Next round is ready to go.</p>
        )}

        <div className="flex gap-3 pt-1">
          {isLastRound ? (
            <Button onClick={onClose} className="flex-1" size="lg">Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose} className="flex-1">Dismiss</Button>
              {onContinue && (
                <Button onClick={onContinue} className="flex-1">Next Round →</Button>
              )}
            </>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
