import { renderHook, waitFor } from "@testing-library/react";
import { useGame } from "@/lib/hooks/useGame";
import { subscribeToGame } from "@/lib/firebase/firestore";
import type { Game } from "@/types";

// Mock Firebase firestore
jest.mock("@/lib/firebase/firestore", () => ({
  subscribeToGame: jest.fn(),
}));

describe("useGame Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return loading state initially", () => {
    (subscribeToGame as jest.Mock).mockImplementation(() => {
      return jest.fn();
    });

    const { result } = renderHook(() => useGame("game1"));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.game).toBeNull();
  });

  it("should return game when subscribed", async () => {
    const mockGame: Game = {
      id: "game1",
      hostId: "user1",
      gameCode: "ABC123",
      status: "active",
      createdAt: new Date(),
      currentRound: 1,
      totalRounds: 3,
      rounds: [
        { roundNumber: 1, pattern: "traditional_line" },
      ],
    };

    (subscribeToGame as jest.Mock).mockImplementation((gameId, callback) => {
      setTimeout(() => callback(mockGame), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useGame("game1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.game).toEqual(mockGame);
    expect(result.current.error).toBeNull();
  });

  it("should handle null game", async () => {
    (subscribeToGame as jest.Mock).mockImplementation((gameId, callback) => {
      setTimeout(() => callback(null), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useGame("game1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.game).toBeNull();
  });

  it("should cleanup subscription on unmount", () => {
    const unsubscribe = jest.fn();
    (subscribeToGame as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useGame("game1"));
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should resubscribe when gameId changes", () => {
    const { rerender } = renderHook(({ gameId }) => useGame(gameId), {
      initialProps: { gameId: "game1" },
    });

    expect(subscribeToGame).toHaveBeenCalledWith("game1", expect.any(Function));

    rerender({ gameId: "game2" });

    expect(subscribeToGame).toHaveBeenCalledWith("game2", expect.any(Function));
    expect(subscribeToGame).toHaveBeenCalledTimes(2);
  });
});
