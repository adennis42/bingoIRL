import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { onAuthChange } from "@/lib/firebase/auth";

// Mock Firebase auth
jest.mock("@/lib/firebase/auth", () => ({
  onAuthChange: jest.fn(),
  isHost: jest.fn((user) => {
    if (!user) return false;
    return !user.isAnonymous;
  }),
}));

describe("useAuth Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return loading state initially", () => {
    (onAuthChange as jest.Mock).mockImplementation((callback) => {
      // Don't call callback immediately to simulate loading
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("should return user when authenticated", async () => {
    const mockUser = {
      uid: "user123",
      email: "test@example.com",
      isAnonymous: false,
    };

    (onAuthChange as jest.Mock).mockImplementation((callback) => {
      setTimeout(() => callback(mockUser), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isHost).toBe(true);
  });

  it("should return null user when not authenticated", async () => {
    (onAuthChange as jest.Mock).mockImplementation((callback) => {
      setTimeout(() => callback(null), 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    // isHost calls isHost(user) which returns false for null user
    expect(result.current.isHost).toBe(false);
  });

  it("should cleanup subscription on unmount", () => {
    const unsubscribe = jest.fn();
    (onAuthChange as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
