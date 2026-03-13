"use client";

import { create } from "zustand";
import type { CalledNumber } from "@/types";

interface GameStore {
  calledNumbers: Set<string>;
  setCalledNumbers: (numbers: CalledNumber[]) => void;
  isNumberCalled: (number: string) => boolean;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  calledNumbers: new Set(),
  setCalledNumbers: (numbers: CalledNumber[]) => {
    set({ calledNumbers: new Set(numbers.map((n) => n.number)) });
  },
  isNumberCalled: (number: string) => {
    return get().calledNumbers.has(number);
  },
  reset: () => {
    set({ calledNumbers: new Set() });
  },
}));
