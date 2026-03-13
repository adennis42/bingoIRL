import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import HostDashboardPage from "@/app/host/dashboard/page";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  replace: jest.fn(),
};

describe("HostDashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("should show loading spinner while loading", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      isHost: false,
    });

    const { container } = render(<HostDashboardPage />);
    const spinner = container.querySelector(".animate-spin") || screen.queryByRole("status");
    expect(spinner).toBeInTheDocument();
  });

  it("should redirect to login when user is not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      isHost: false,
    });

    render(<HostDashboardPage />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should redirect to login when user is not a host", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "user1", email: "test@example.com" },
      loading: false,
      isHost: false,
    });

    render(<HostDashboardPage />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should render dashboard when user is authenticated host", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "user1", email: "test@example.com" },
      loading: false,
      isHost: true,
    });

    render(<HostDashboardPage />);
    
    expect(screen.getByText("Host Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Create New Game")).toBeInTheDocument();
    expect(screen.getByText("Custom Patterns")).toBeInTheDocument();
  });

  it("should show placeholder message for empty games", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "user1", email: "test@example.com" },
      loading: false,
      isHost: true,
    });

    render(<HostDashboardPage />);
    
    expect(screen.getByText(/Your games will appear here/)).toBeInTheDocument();
  });
});
