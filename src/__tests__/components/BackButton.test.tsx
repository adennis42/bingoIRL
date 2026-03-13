import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackButton } from "@/components/shared/BackButton";

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

describe("BackButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("should render with default label", () => {
    render(<BackButton />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("should render with custom label", () => {
    render(<BackButton label="Go Back" />);
    expect(screen.getByText("Go Back")).toBeInTheDocument();
  });

  it("should navigate back when no href provided", async () => {
    const user = userEvent.setup();
    render(<BackButton />);
    
    await user.click(screen.getByText("Back"));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should navigate to href when provided", async () => {
    const user = userEvent.setup();
    render(<BackButton href="/dashboard" />);
    
    await user.click(screen.getByText("Back"));
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(mockBack).not.toHaveBeenCalled();
  });
});
