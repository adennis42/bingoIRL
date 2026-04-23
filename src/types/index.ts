export type GameStatus = "setup" | "active" | "paused" | "ended";
export type WinningPattern = "traditional_line" | "four_corners" | "blackout" | string; // string for custom patterns (patternId)
export type BingoColumn = "B" | "I" | "N" | "G" | "O";

export interface Round {
  roundNumber: number;
  pattern: WinningPattern;
  patternName?: string;       // embedded at game creation so players can read it
  patternCells?: number[][];  // embedded custom pattern cells (if custom pattern)
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
  location?: string; // venue/location entered by host at game setup
}

// ─── Leaderboard ───────────────────────────────────────────────────────────

export interface WinRecord {
  date: Date | string;
  location: string;
  gameId: string;
  seasonId?: string;
}

export interface LeaderboardEntry {
  id: string;           // slugified player name
  playerName: string;
  totalWins: number;
  lastWin: Date;
  lastLocation: string;  // most recent location
  locations: string[];   // all unique locations this player has won at
  winHistory: WinRecord[];
}

export interface Season {
  id: string;
  name: string;         // e.g. "Spring 2026"
  startDate: Date;
  endDate?: Date;
  active: boolean;
  hostId: string;
}

export interface SeasonalEntry {
  id: string;           // slugified player name
  playerName: string;
  wins: number;
  lastWin: Date;
  lastLocation: string;
  locations: string[];
  winHistory: WinRecord[];
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
