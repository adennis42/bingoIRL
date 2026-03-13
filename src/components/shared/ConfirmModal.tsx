"use client";

import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/shared/BottomSheet";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen, onClose, onConfirm, title, message,
  confirmText = "Confirm", cancelText = "Cancel",
  variant = "default", loading = false,
}: ConfirmModalProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading} className="flex-1">
          {loading ? "Processing…" : confirmText}
        </Button>
      </div>
    </BottomSheet>
  );
}
