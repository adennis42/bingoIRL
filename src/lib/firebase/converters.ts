import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import type { Game, CalledNumber, Player, Round, CustomPattern, LeaderboardEntry, Season, SeasonalEntry } from "@/types";

export const gameConverter = {
  toFirestore(game: Game): DocumentData {
    return {
      hostId: game.hostId,
      gameCode: game.gameCode,
      status: game.status,
      createdAt: Timestamp.fromDate(game.createdAt),
      currentRound: game.currentRound,
      totalRounds: game.totalRounds,
      location: game.location || null,
      rounds: game.rounds.map((round) => ({
        roundNumber: round.roundNumber,
        pattern: round.pattern,
        prize: round.prize || null,
        winnerId: round.winnerId || null,
        winnerName: round.winnerName || null,
        completedAt: round.completedAt
          ? Timestamp.fromDate(round.completedAt)
          : null,
      })),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Game {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      hostId: data.hostId,
      gameCode: data.gameCode,
      status: data.status,
      createdAt: data.createdAt.toDate(),
      currentRound: data.currentRound,
      totalRounds: data.totalRounds,
      location: data.location || undefined,
      rounds: data.rounds.map((round: any) => ({
        roundNumber: round.roundNumber,
        pattern: round.pattern,
        prize: round.prize || undefined,
        winnerId: round.winnerId || undefined,
        winnerName: round.winnerName || undefined,
        completedAt: round.completedAt?.toDate(),
      })),
    };
  },
};

export const leaderboardEntryConverter = {
  toFirestore(entry: LeaderboardEntry): DocumentData {
    return {
      playerName: entry.playerName,
      location: entry.location,
      totalWins: entry.totalWins,
      lastWin: Timestamp.fromDate(entry.lastWin),
      lastGameId: entry.lastGameId || null,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): LeaderboardEntry {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      playerName: data.playerName,
      location: data.location,
      totalWins: data.totalWins,
      lastWin: data.lastWin.toDate(),
      lastGameId: data.lastGameId || undefined,
    };
  },
};

export const seasonConverter = {
  toFirestore(season: Season): DocumentData {
    return {
      name: season.name,
      startDate: Timestamp.fromDate(season.startDate),
      endDate: season.endDate ? Timestamp.fromDate(season.endDate) : null,
      active: season.active,
      hostId: season.hostId,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Season {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      startDate: data.startDate.toDate(),
      endDate: data.endDate?.toDate(),
      active: data.active,
      hostId: data.hostId,
    };
  },
};

export const seasonalEntryConverter = {
  toFirestore(entry: SeasonalEntry): DocumentData {
    return {
      playerName: entry.playerName,
      location: entry.location,
      wins: entry.wins,
      lastWin: Timestamp.fromDate(entry.lastWin),
      lastGameId: entry.lastGameId || null,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): SeasonalEntry {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      playerName: data.playerName,
      location: data.location,
      wins: data.wins,
      lastWin: data.lastWin.toDate(),
      lastGameId: data.lastGameId || undefined,
    };
  },
};

export const calledNumberConverter = {
  toFirestore(calledNumber: CalledNumber): DocumentData {
    return {
      number: calledNumber.number,
      calledAt: Timestamp.fromDate(calledNumber.calledAt),
      sequence: calledNumber.sequence,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CalledNumber {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      number: data.number,
      calledAt: data.calledAt.toDate(),
      sequence: data.sequence,
    };
  },
};

export const playerConverter = {
  toFirestore(player: Player): DocumentData {
    return {
      displayName: player.displayName || null,
      joinedAt: Timestamp.fromDate(player.joinedAt),
      isActive: player.isActive,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Player {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      displayName: data.displayName || undefined,
      joinedAt: data.joinedAt.toDate(),
      isActive: data.isActive,
    };
  },
};

export const customPatternConverter = {
  toFirestore(pattern: CustomPattern): DocumentData {
    // Convert nested arrays to array of objects for Firestore compatibility
    const cellsData = pattern.cells.map(([row, col]) => ({
      row,
      col,
    }));
    return {
      userId: pattern.userId,
      name: pattern.name,
      description: pattern.description || null,
      cells: cellsData,
      createdAt: Timestamp.fromDate(pattern.createdAt),
      updatedAt: Timestamp.fromDate(pattern.updatedAt),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CustomPattern {
    const data = snapshot.data(options);
    // Convert array of objects back to nested arrays
    const cells: number[][] = Array.isArray(data.cells)
      ? data.cells.map((cell: any) => {
          // Handle both formats: {row, col} objects or [row, col] arrays
          if (Array.isArray(cell)) {
            return cell;
          }
          if (cell && typeof cell.row === "number" && typeof cell.col === "number") {
            return [cell.row, cell.col];
          }
          return [0, 0]; // Fallback
        })
      : [];
    
    // Handle timestamp conversion - Firestore Timestamps have a toDate() method
    let createdAt: Date;
    try {
      if (data.createdAt) {
        // Check if it's a Firestore Timestamp
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt.toDate && typeof data.createdAt.toDate === "function") {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt instanceof Date) {
          createdAt = data.createdAt;
        } else {
          createdAt = new Date();
        }
      } else {
        createdAt = new Date();
      }
    } catch (e) {
      console.warn("Error parsing createdAt:", e, data.createdAt);
      createdAt = new Date();
    }
    
    let updatedAt: Date;
    try {
      if (data.updatedAt) {
        // Check if it's a Firestore Timestamp
        if (data.updatedAt instanceof Timestamp) {
          updatedAt = data.updatedAt.toDate();
        } else if (data.updatedAt.toDate && typeof data.updatedAt.toDate === "function") {
          updatedAt = data.updatedAt.toDate();
        } else if (data.updatedAt instanceof Date) {
          updatedAt = data.updatedAt;
        } else {
          updatedAt = new Date();
        }
      } else {
        updatedAt = new Date();
      }
    } catch (e) {
      console.warn("Error parsing updatedAt:", e, data.updatedAt);
      updatedAt = new Date();
    }
    
    return {
      id: snapshot.id,
      userId: data.userId,
      name: data.name,
      description: data.description || undefined,
      cells,
      createdAt,
      updatedAt,
    };
  },
};
