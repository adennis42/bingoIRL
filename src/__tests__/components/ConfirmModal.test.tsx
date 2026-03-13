import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Test Title",
    message: "Test message",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    
    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should use custom button texts", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Keep")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(<ConfirmModal {...defaultProps} loading={true} />);
    
    // When loading, button text changes to "Processing..."
    const confirmButton = screen.getByText("Processing...");
    expect(confirmButton).toBeDisabled();
    
    // Cancel button should also be disabled
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeDisabled();
  });

  it("should apply destructive variant", () => {
    render(<ConfirmModal {...defaultProps} variant="destructive" />);
    
    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toHaveClass("bg-warn");
  });

  it("should close when overlay is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);
    
    // Click on the overlay (the outer div)
    const overlay = document.querySelector(".fixed.inset-0");
    if (overlay) {
      await user.click(overlay as HTMLElement);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });
});
