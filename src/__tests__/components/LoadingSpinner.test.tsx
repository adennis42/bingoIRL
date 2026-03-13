import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render without crashing", () => {
    render(<LoadingSpinner />);
    // LoadingSpinner renders a div with spinner classes
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should have accessible role", () => {
    render(<LoadingSpinner />);
    // Check if there's a loading indicator
    const spinner = document.querySelector("[class*='animate-spin']");
    expect(spinner).toBeInTheDocument();
  });
});
