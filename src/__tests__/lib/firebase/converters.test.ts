import { Timestamp } from "firebase/firestore";
import {
  gameConverter,
  calledNumberConverter,
  playerConverter,
  customPatternConverter,
} from "@/lib/firebase/converters";
import type { Game, CalledNumber, Player, CustomPattern } from "@/types";

// Mock QueryDocumentSnapshot
class MockQueryDocumentSnapshot {
  id: string;
  data: () => any;

  constructor(id: string, data: any) {
    this.id = id;
    this.data = () => data;
  }
}

describe("Firebase Converters", () => {
  describe("gameConverter", () => {
    const mockGame: Game = {
      id: "game1",
      hostId: "user1",
      gameCode: "ABC123",
      status: "active",
      createdAt: new Date("2024-01-01"),
      currentRound: 1,
      totalRounds: 3,
      rounds: [
        {
          roundNumber: 1,
          pattern: "traditional_line",
          prize: "Prize 1",
        },
        {
          roundNumber: 2,
          pattern: "four_corners",
        },
        {
          roundNumber: 3,
          pattern: "blackout",
        },
      ],
    };

    it("should convert Game to Firestore format", () => {
      const firestoreData = gameConverter.toFirestore(mockGame);
      
      expect(firestoreData.hostId).toBe("user1");
      expect(firestoreData.gameCode).toBe("ABC123");
      expect(firestoreData.status).toBe("active");
      expect(firestoreData.currentRound).toBe(1);
      expect(firestoreData.totalRounds).toBe(3);
      expect(firestoreData.rounds).toHaveLength(3);
      expect(firestoreData.createdAt).toBeInstanceOf(Object);
    });

    it("should convert Firestore data to Game", () => {
      const firestoreData = {
        hostId: "user1",
        gameCode: "ABC123",
        status: "active",
        createdAt: Timestamp.fromDate(new Date("2024-01-01")),
        currentRound: 1,
        totalRounds: 3,
        rounds: [
          {
            roundNumber: 1,
            pattern: "traditional_line",
            prize: "Prize 1",
            winnerId: null,
            winnerName: null,
            completedAt: null,
          },
        ],
      };

      const snapshot = new MockQueryDocumentSnapshot("game1", firestoreData) as any;
      const game = gameConverter.fromFirestore(snapshot, {});

      expect(game.id).toBe("game1");
      expect(game.hostId).toBe("user1");
      expect(game.gameCode).toBe("ABC123");
      expect(game.status).toBe("active");
      expect(game.currentRound).toBe(1);
      expect(game.totalRounds).toBe(3);
      expect(game.rounds).toHaveLength(1);
      expect(game.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("calledNumberConverter", () => {
    const mockCalledNumber: CalledNumber = {
      id: "num1",
      number: "B5",
      calledAt: new Date("2024-01-01"),
      sequence: 1,
    };

    it("should convert CalledNumber to Firestore format", () => {
      const firestoreData = calledNumberConverter.toFirestore(mockCalledNumber);
      
      expect(firestoreData.number).toBe("B5");
      expect(firestoreData.sequence).toBe(1);
      expect(firestoreData.calledAt).toBeInstanceOf(Object);
    });

    it("should convert Firestore data to CalledNumber", () => {
      const firestoreData = {
        number: "B5",
        calledAt: Timestamp.fromDate(new Date("2024-01-01")),
        sequence: 1,
      };

      const snapshot = new MockQueryDocumentSnapshot("num1", firestoreData) as any;
      const calledNumber = calledNumberConverter.fromFirestore(snapshot, {});

      expect(calledNumber.id).toBe("num1");
      expect(calledNumber.number).toBe("B5");
      expect(calledNumber.sequence).toBe(1);
      expect(calledNumber.calledAt).toBeInstanceOf(Date);
    });
  });

  describe("playerConverter", () => {
    const mockPlayer: Player = {
      id: "player1",
      displayName: "Player One",
      joinedAt: new Date("2024-01-01"),
      isActive: true,
    };

    it("should convert Player to Firestore format", () => {
      const firestoreData = playerConverter.toFirestore(mockPlayer);
      
      expect(firestoreData.displayName).toBe("Player One");
      expect(firestoreData.isActive).toBe(true);
      expect(firestoreData.joinedAt).toBeInstanceOf(Object);
    });

    it("should convert Firestore data to Player", () => {
      const firestoreData = {
        displayName: "Player One",
        joinedAt: Timestamp.fromDate(new Date("2024-01-01")),
        isActive: true,
      };

      const snapshot = new MockQueryDocumentSnapshot("player1", firestoreData) as any;
      const player = playerConverter.fromFirestore(snapshot, {});

      expect(player.id).toBe("player1");
      expect(player.displayName).toBe("Player One");
      expect(player.isActive).toBe(true);
      expect(player.joinedAt).toBeInstanceOf(Date);
    });

    it("should handle null displayName", () => {
      const firestoreData = {
        displayName: null,
        joinedAt: Timestamp.fromDate(new Date("2024-01-01")),
        isActive: true,
      };

      const snapshot = new MockQueryDocumentSnapshot("player1", firestoreData) as any;
      const player = playerConverter.fromFirestore(snapshot, {});

      // Converter might convert null to undefined
      expect(player.displayName === null || player.displayName === undefined).toBe(true);
    });
  });

  describe("customPatternConverter", () => {
    const mockPattern: CustomPattern = {
      id: "pattern1",
      userId: "user1",
      name: "Test Pattern",
      description: "Test description",
      cells: [[0, 0], [0, 1], [1, 0], [1, 1]],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
    };

    it("should convert CustomPattern to Firestore format", () => {
      const firestoreData = customPatternConverter.toFirestore(mockPattern);
      
      expect(firestoreData.userId).toBe("user1");
      expect(firestoreData.name).toBe("Test Pattern");
      expect(firestoreData.description).toBe("Test description");
      expect(firestoreData.cells).toHaveLength(4);
      expect(firestoreData.cells[0]).toEqual({ row: 0, col: 0 });
      expect(firestoreData.createdAt).toBeInstanceOf(Object);
    });

    it("should convert Firestore data to CustomPattern", () => {
      const firestoreData = {
        userId: "user1",
        name: "Test Pattern",
        description: "Test description",
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
          { row: 1, col: 0 },
          { row: 1, col: 1 },
        ],
        createdAt: Timestamp.fromDate(new Date("2024-01-01")),
        updatedAt: Timestamp.fromDate(new Date("2024-01-02")),
      };

      const snapshot = new MockQueryDocumentSnapshot("pattern1", firestoreData) as any;
      const pattern = customPatternConverter.fromFirestore(snapshot, {});

      expect(pattern.id).toBe("pattern1");
      expect(pattern.userId).toBe("user1");
      expect(pattern.name).toBe("Test Pattern");
      expect(pattern.description).toBe("Test description");
      expect(pattern.cells).toEqual([[0, 0], [0, 1], [1, 0], [1, 1]]);
      expect(pattern.createdAt).toBeInstanceOf(Date);
      expect(pattern.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle null description", () => {
      const firestoreData = {
        userId: "user1",
        name: "Test Pattern",
        description: null,
        cells: [],
        createdAt: Timestamp.fromDate(new Date("2024-01-01")),
        updatedAt: Timestamp.fromDate(new Date("2024-01-02")),
      };

      const snapshot = new MockQueryDocumentSnapshot("pattern1", firestoreData) as any;
      const pattern = customPatternConverter.fromFirestore(snapshot, {});

      expect(pattern.description).toBeUndefined();
    });

    it("should handle cells as arrays (backward compatibility)", () => {
      const firestoreData = {
        userId: "user1",
        name: "Test Pattern",
        description: null,
        cells: [[0, 0], [0, 1]], // Old format
        createdAt: Timestamp.fromDate(new Date("2024-01-01")),
        updatedAt: Timestamp.fromDate(new Date("2024-01-02")),
      };

      const snapshot = new MockQueryDocumentSnapshot("pattern1", firestoreData) as any;
      const pattern = customPatternConverter.fromFirestore(snapshot, {});

      expect(pattern.cells).toEqual([[0, 0], [0, 1]]);
    });
  });
});
