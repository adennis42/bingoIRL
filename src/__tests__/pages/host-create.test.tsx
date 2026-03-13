import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCustomPatterns } from "@/lib/hooks/useCustomPatterns";
import { createGame } from "@/lib/firebase/firestore";
import HostCreatePage from "@/app/host/create/page";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/hooks/useCustomPatterns", () => ({
  useCustomPatterns: jest.fn(),
}));

jest.mock("@/lib/firebase/firestore", () => ({
  createGame: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

describe("HostCreatePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "user1", email: "test@example.com" },
      loading: false,
    });
    (useCustomPatterns as jest.Mock).mockReturnValue({
      patterns: [],
      loading: false,
    });
  });

  it("should render create game form", () => {
    render(<HostCreatePage />);
    
    expect(screen.getByText("Create New Game")).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Rounds/)).toBeInTheDocument();
  });

  it("should allow changing number of rounds", async () => {
    const user = userEvent.setup();
    render(<HostCreatePage />);
    
    const roundsInput = screen.getByLabelText(/Number of Rounds/) as HTMLInputElement;
    await user.clear(roundsInput);
    await user.type(roundsInput, "3");
    
    expect(roundsInput.value).toBe("3");
  });

  it("should limit rounds to maximum", async () => {
    const user = userEvent.setup();
    render(<HostCreatePage />);
    
    const roundsInput = screen.getByLabelText(/Number of Rounds/) as HTMLInputElement;
    await user.clear(roundsInput);
    await user.type(roundsInput, "20"); // More than max (10)
    
    expect(parseInt(roundsInput.value)).toBeLessThanOrEqual(10);
  });

  it("should limit rounds to minimum", async () => {
    const user = userEvent.setup();
    render(<HostCreatePage />);
    
    const roundsInput = screen.getByLabelText(/Number of Rounds/) as HTMLInputElement;
    await user.clear(roundsInput);
    await user.type(roundsInput, "0");
    
    expect(parseInt(roundsInput.value)).toBeGreaterThanOrEqual(1);
  });

  it("should create game and redirect on submit", async () => {
    const user = userEvent.setup();
    (createGame as jest.Mock).mockResolvedValue("new-game-id");

    render(<HostCreatePage />);
    
    const createButton = screen.getByText("Create Game");
    await user.click(createButton);

    await waitFor(() => {
      expect(createGame).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/host/game/new-game-id");
    });
  });

  it("should show error when game creation fails", async () => {
    const user = userEvent.setup();
    (createGame as jest.Mock).mockRejectedValue(new Error("Creation failed"));

    render(<HostCreatePage />);
    
    const createButton = screen.getByText("Create Game");
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to create game/)).toBeInTheDocument();
    });
  });

  it("should disable create button while loading", async () => {
    const user = userEvent.setup();
    (createGame as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<HostCreatePage />);
    
    const createButton = screen.getByText("Create Game");
    await user.click(createButton);

    await waitFor(() => {
      expect(createButton).toBeDisabled();
    });
  });

  it("should show custom patterns when available", () => {
    (useCustomPatterns as jest.Mock).mockReturnValue({
      patterns: [
        {
          id: "custom1",
          name: "Custom Pattern",
          cells: [],
          userId: "user1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      loading: false,
    });

    render(<HostCreatePage />);
    
    // Should show custom patterns in the pattern selector
    expect(screen.getByText(/Custom Pattern/)).toBeInTheDocument();
  });
});
