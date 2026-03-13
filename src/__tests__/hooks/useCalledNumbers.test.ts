import { renderHook, waitFor } from "@testing-library/react";
import { useCalledNumbers } from "@/lib/hooks/useCalledNumbers";
import { subscribeToCalledNumbers } from "@/lib/firebase/firestore";
import type { CalledNumber } from "@/types";

jest.mock("@/lib/firebase/firestore", () => ({
  subscribeToCalledNumbers: jest.fn(),
}));

describe("useCalledNumbers Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return loading state initially", () => {
    (subscribeToCalledNumbers as jest.Mock).mockImplementation(() => {
      return jest.fn();
    });

    const { result } = renderHook(() => useCalledNumbers("game1"));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.calledNumbers).toEqual([]);
  });

  it("should return called numbers when subscribed", async () => {
    const mockNumbers: CalledNumber[] = [
      {
        id: "num1",
        number: "B5",
        calledAt: new Date(),
        sequence: 1,
      },
      {
        id: "num2",
        number: "I20",
        calledAt: new Date(),
        sequence: 2,
      },
    ];

    (subscribeToCalledNumbers as jest.Mock).mockImplementation((gameId, callback) => {
      setTimeout(() => callback(mockNumbers), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useCalledNumbers("game1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.calledNumbers).toEqual(mockNumbers);
    expect(result.current.error).toBeNull();
  });

  it("should handle empty array", async () => {
    (subscribeToCalledNumbers as jest.Mock).mockImplementation((gameId, callback) => {
      setTimeout(() => callback([]), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useCalledNumbers("game1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.calledNumbers).toEqual([]);
  });

  it("should cleanup subscription on unmount", () => {
    const unsubscribe = jest.fn();
    (subscribeToCalledNumbers as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useCalledNumbers("game1"));
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should resubscribe when gameId changes", () => {
    const { rerender } = renderHook(({ gameId }) => useCalledNumbers(gameId), {
      initialProps: { gameId: "game1" },
    });

    expect(subscribeToCalledNumbers).toHaveBeenCalledWith("game1", expect.any(Function));

    rerender({ gameId: "game2" });

    expect(subscribeToCalledNumbers).toHaveBeenCalledWith("game2", expect.any(Function));
    expect(subscribeToCalledNumbers).toHaveBeenCalledTimes(2);
  });
});
