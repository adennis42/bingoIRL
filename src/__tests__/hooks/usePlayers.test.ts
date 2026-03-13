import { renderHook, waitFor } from "@testing-library/react";
import { usePlayers } from "@/lib/hooks/usePlayers";
import { subscribeToPlayers } from "@/lib/firebase/firestore";
import type { Player } from "@/types";

jest.mock("@/lib/firebase/firestore", () => ({
  subscribeToPlayers: jest.fn(),
}));

describe("usePlayers Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return loading state initially", () => {
    (subscribeToPlayers as jest.Mock).mockImplementation(() => {
      return jest.fn();
    });

    const { result } = renderHook(() => usePlayers("game1"));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.players).toEqual([]);
  });

  it("should return players when subscribed", async () => {
    const mockPlayers: Player[] = [
      {
        id: "player1",
        displayName: "Player One",
        joinedAt: new Date(),
        isActive: true,
      },
      {
        id: "player2",
        displayName: null,
        joinedAt: new Date(),
        isActive: true,
      },
    ];

    (subscribeToPlayers as jest.Mock).mockImplementation((gameId, callback) => {
      setTimeout(() => callback(mockPlayers), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => usePlayers("game1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.players).toEqual(mockPlayers);
    expect(result.current.error).toBeNull();
  });

  it("should handle empty players array", async () => {
    (subscribeToPlayers as jest.Mock).mockImplementation((gameId, callback) => {
      setTimeout(() => callback([]), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => usePlayers("game1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.players).toEqual([]);
  });

  it("should cleanup subscription on unmount", () => {
    const unsubscribe = jest.fn();
    (subscribeToPlayers as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => usePlayers("game1"));
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should resubscribe when gameId changes", () => {
    const { rerender } = renderHook(({ gameId }) => usePlayers(gameId), {
      initialProps: { gameId: "game1" },
    });

    expect(subscribeToPlayers).toHaveBeenCalledWith("game1", expect.any(Function));

    rerender({ gameId: "game2" });

    expect(subscribeToPlayers).toHaveBeenCalledWith("game2", expect.any(Function));
    expect(subscribeToPlayers).toHaveBeenCalledTimes(2);
  });
});
