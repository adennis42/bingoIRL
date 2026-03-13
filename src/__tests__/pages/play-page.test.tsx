import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { getGameByCode } from "@/lib/firebase/firestore";
import { signInAnonymouslyUser } from "@/lib/firebase/auth";
import { addPlayer } from "@/lib/firebase/firestore";
import PlayPage from "@/app/play/page";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/lib/firebase/firestore", () => ({
  getGameByCode: jest.fn(),
  addPlayer: jest.fn(),
}));

jest.mock("@/lib/firebase/auth", () => ({
  signInAnonymouslyUser: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
};

describe("PlayPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it("should render join game form", () => {
    render(<PlayPage />);
    
    expect(screen.getByText("Join Game")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("Join Game")).toBeInTheDocument();
  });

  it("should prefill code from URL search params", () => {
    const searchParams = new URLSearchParams("code=ABC123");
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);

    render(<PlayPage />);
    
    const input = screen.getByPlaceholderText("ABC123") as HTMLInputElement;
    expect(input.value).toBe("ABC123");
  });

  it("should convert code to uppercase", async () => {
    const user = userEvent.setup();
    render(<PlayPage />);
    
    const input = screen.getByPlaceholderText("ABC123");
    await user.type(input, "abc123");
    
    expect((input as HTMLInputElement).value).toBe("ABC123");
  });

  it("should limit code to 6 characters", async () => {
    const user = userEvent.setup();
    render(<PlayPage />);
    
    const input = screen.getByPlaceholderText("ABC123");
    await user.type(input, "ABCDEFGHIJ");
    
    expect((input as HTMLInputElement).value).toHaveLength(6);
  });

  it("should show error when game not found", async () => {
    const user = userEvent.setup();
    (signInAnonymouslyUser as jest.Mock).mockResolvedValue({
      uid: "player1",
    });
    (getGameByCode as jest.Mock).mockResolvedValue(null);

    render(<PlayPage />);
    
    const input = screen.getByPlaceholderText("ABC123");
    await user.type(input, "INVALID");
    
    const submitButton = screen.getByText("Join Game");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Game not found/)).toBeInTheDocument();
    });
  });

  it("should show error when join fails", async () => {
    const user = userEvent.setup();
    (signInAnonymouslyUser as jest.Mock).mockResolvedValue({
      uid: "player1",
    });
    (getGameByCode as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<PlayPage />);
    
    const input = screen.getByPlaceholderText("ABC123");
    await user.type(input, "ABC123");
    
    const submitButton = screen.getByText("Join Game");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to join game/)).toBeInTheDocument();
    });
  });

  it("should successfully join game and redirect", async () => {
    const user = userEvent.setup();
    const mockUser = { uid: "player1" };
    const mockGame = {
      id: "game1",
      gameCode: "ABC123",
    };

    (signInAnonymouslyUser as jest.Mock).mockResolvedValue(mockUser);
    (getGameByCode as jest.Mock).mockResolvedValue(mockGame);
    (addPlayer as jest.Mock).mockResolvedValue("player1");

    render(<PlayPage />);
    
    const input = screen.getByPlaceholderText("ABC123");
    await user.type(input, "ABC123");
    
    const submitButton = screen.getByText("Join Game");
    await user.click(submitButton);

    await waitFor(() => {
      expect(addPlayer).toHaveBeenCalledWith(
        "game1",
        expect.objectContaining({
          isActive: true,
        }),
        "player1"
      );
      expect(mockPush).toHaveBeenCalledWith("/play/game1");
    });
  });

  it("should disable submit button while loading", async () => {
    const user = userEvent.setup();
    (signInAnonymouslyUser as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<PlayPage />);
    
    const input = screen.getByPlaceholderText("ABC123");
    await user.type(input, "ABC123");
    
    const submitButton = screen.getByText("Join Game");
    await user.click(submitButton);

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled();
  });
});
