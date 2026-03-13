"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PatternCreatorProps {
  initialCells?: number[][];
  onSave: (cells: number[][]) => void;
  onCancel?: () => void;
}

export function PatternCreator({
  initialCells = [],
  onSave,
  onCancel,
}: PatternCreatorProps) {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(
    new Set(initialCells.map(([row, col]) => `${row},${col}`))
  );

  // Update selected cells when initialCells changes (for editing)
  useEffect(() => {
    if (initialCells && initialCells.length > 0) {
      const newSet = new Set(initialCells.map(([row, col]) => `${row},${col}`));
      setSelectedCells(newSet);
    } else {
      setSelectedCells(new Set());
    }
  }, [initialCells]);

  const toggleCell = (row: number, col: number) => {
    const key = `${row},${col}`;
    setSelectedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = () => {
    const cells = Array.from(selectedCells).map((key) => {
      const [row, col] = key.split(",").map(Number);
      return [row, col];
    });
    onSave(cells);
  };

  const handleClear = () => {
    setSelectedCells(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2 w-fit mx-auto">
        {Array.from({ length: 25 }, (_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const key = `${row},${col}`;
          const isSelected = selectedCells.has(key);
          const isCenter = row === 2 && col === 2;

          return (
            <button
              key={key}
              onClick={() => toggleCell(row, col)}
              disabled={isCenter}
              className={`aspect-square w-12 rounded-lg border-2 transition-all ${
                isCenter
                  ? "bg-surface border-border opacity-50 cursor-not-allowed"
                  : isSelected
                  ? "bg-primary border-primary"
                  : "bg-elevated border-border hover:border-primary/50"
              }`}
              title={isCenter ? "Free Space (always selected)" : undefined}
            />
          );
        })}
      </div>

      <div className="flex gap-2 justify-center">
        <Button variant="secondary" onClick={handleClear}>
          Clear
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={selectedCells.size === 0}>
          Save Pattern
        </Button>
      </div>

      <p className="text-sm text-text-secondary text-center">
        Click cells to select them. Center cell is always free.
      </p>
    </div>
  );
}
