export type GameStatus = "setup" | "active" | "paused" | "ended";
export type WinningPattern = "traditional_line" | "four_corners" | "blackout" | string; // string for custom patterns (patternId)
export type BingoColumn = "B" | "I" | "N" | "G" | "O";

export interface Round {
  roundNumber: number;
  pattern: WinningPattern;
  prize?: string;
  winnerId?: string;
  winnerName?: string;
  completedAt?: Date;
}

export interface Game {
  id: string;
  hostId: string;
  gameCode: string;
  status: GameStatus;
  createdAt: Date;
  currentRound: number;
  totalRounds: number;
  rounds: Round[];
}

export interface CalledNumber {
  id: string;
  number: string;
  calledAt: Date;
  sequence: number;
}

export interface Player {
  id: string;
  displayName?: string;
  joinedAt: Date;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  gamesHosted: number;
}

export interface CustomPattern {
  id: string;
  userId: string;
  name: string;
  description?: string;
  cells: number[][]; // Array of [row, col] coordinates (0-indexed)
  createdAt: Date;
  updatedAt: Date;
}
