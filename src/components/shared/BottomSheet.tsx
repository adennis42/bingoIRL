"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional title shown in the drag-handle area */
  title?: string;
}

/**
 * Mobile-first modal:
 * - Mobile (< sm): slides up from the bottom, full-width, rounded-t-3xl
 * - Desktop (≥ sm): centered dialog, max-w-md, rounded-3xl
 */
export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className={[
          "w-full sm:max-w-md",
          "bg-elevated",
          "rounded-t-3xl sm:rounded-3xl",
          "border border-bg-border",
          "shadow-[0_-8px_40px_rgba(0,0,0,0.5)] sm:shadow-elevated",
          "max-h-[90vh] overflow-y-auto",
          "animate-fade-up",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile visual cue) */}
        <div className="flex flex-col items-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-bg-border" />
        </div>

        {title && (
          <div className="px-5 pt-2 pb-0 sm:pt-5">
            <h2 className="font-display text-xl font-black">{title}</h2>
          </div>
        )}

        <div className="px-5 pt-4 pb-8 sm:pb-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
