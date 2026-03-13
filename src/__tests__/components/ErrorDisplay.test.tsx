import { render, screen } from "@testing-library/react";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";

describe("ErrorDisplay", () => {
  it("should not render when error is null", () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should display string error message", () => {
    render(<ErrorDisplay error="Test error message" />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should display Error object message", () => {
    const error = new Error("Error object message");
    render(<ErrorDisplay error={error} />);
    expect(screen.getByText("Error object message")).toBeInTheDocument();
  });

  it("should show dismiss button when onDismiss is provided", () => {
    const onDismiss = jest.fn();
    render(<ErrorDisplay error="Test error" onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText("Dismiss error");
    expect(dismissButton).toBeInTheDocument();
    
    dismissButton.click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should not show dismiss button when onDismiss is not provided", () => {
    render(<ErrorDisplay error="Test error" />);
    expect(screen.queryByLabelText("Dismiss error")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ErrorDisplay error="Test error" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
