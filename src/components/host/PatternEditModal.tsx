"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatternCreator } from "@/components/bingo/PatternCreator";
import type { CustomPattern } from "@/types";

interface PatternEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string | undefined, cells: number[][]) => Promise<void>;
  pattern?: CustomPattern | null;
  loading?: boolean;
}

export function PatternEditModal({
  isOpen,
  onClose,
  onSave,
  pattern,
  loading = false,
}: PatternEditModalProps) {
  const [patternName, setPatternName] = useState("");
  const [patternDescription, setPatternDescription] = useState("");
  const [patternCells, setPatternCells] = useState<number[][]>([]);
  const [error, setError] = useState("");

  // Reset form when modal opens/closes or pattern changes
  useEffect(() => {
    if (isOpen) {
      if (pattern) {
        setPatternName(pattern.name);
        setPatternDescription(pattern.description || "");
        // Ensure cells are in the correct format [[row, col], ...]
        const cells = Array.isArray(pattern.cells) 
          ? pattern.cells.map((cell: any) => {
              // Handle both formats: {row, col} objects or [row, col] arrays
              if (Array.isArray(cell) && cell.length === 2) {
                return cell;
              }
              if (cell && typeof cell.row === "number" && typeof cell.col === "number") {
                return [cell.row, cell.col];
              }
              return [0, 0];
            })
          : [];
        setPatternCells(cells);
      } else {
        setPatternName("");
        setPatternDescription("");
        setPatternCells([]);
      }
      setError("");
    }
  }, [isOpen, pattern]);

  const handleSavePattern = async (cells: number[][]) => {
    if (!patternName.trim()) {
      setError("Pattern name is required");
      return;
    }

    if (cells.length === 0) {
      setError("Please select at least one cell");
      return;
    }

    setError("");
    try {
      await onSave(patternName.trim(), patternDescription.trim() || undefined, cells);
      // Parent will close the modal on success
    } catch (err: any) {
      setError(err.message || "Failed to save pattern");
      // Don't re-throw - error is displayed in modal
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPatternName("");
      setPatternDescription("");
      setPatternCells([]);
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto"
      onClick={handleClose}
      style={{ zIndex: 1000 }}
    >
      <div
        className="bg-elevated border border-border rounded-2xl p-6 max-w-2xl w-full my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">
          {pattern ? "Edit Pattern" : "Create New Pattern"}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-warn/10 border border-warn rounded-2xl text-warn text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Pattern Name *
            </label>
            <Input
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              placeholder="e.g., X Pattern"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <Input
              value={patternDescription}
              onChange={(e) => setPatternDescription(e.target.value)}
              placeholder="Describe this pattern"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">
              Select Pattern Cells
            </label>
            <PatternCreator
              key={pattern?.id || "new"}
              initialCells={patternCells}
              onSave={handleSavePattern}
              onCancel={handleClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
