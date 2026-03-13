import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WinnerModal } from "@/components/host/WinnerModal";

describe("WinnerModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    roundNumber: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<WinnerModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Mark Winner/)).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<WinnerModal {...defaultProps} />);
    expect(screen.getByText(/Mark Winner - Round 1/)).toBeInTheDocument();
  });

  it("should display round number", () => {
    render(<WinnerModal {...defaultProps} roundNumber={3} />);
    expect(screen.getByText(/Round 3/)).toBeInTheDocument();
  });

  it("should display prize when provided", () => {
    render(<WinnerModal {...defaultProps} prize="$100" />);
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("should not display prize section when not provided", () => {
    render(<WinnerModal {...defaultProps} />);
    expect(screen.queryByText(/Prize:/)).not.toBeInTheDocument();
  });

  it("should call onConfirm with winner name when form is submitted", async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    
    render(<WinnerModal {...defaultProps} onConfirm={onConfirm} />);
    
    const input = screen.getByPlaceholderText("Enter winner's name");
    await user.type(input, "John Doe");
    
    const submitButton = screen.getByText("Mark Winner");
    await user.click(submitButton);
    
    expect(onConfirm).toHaveBeenCalledWith("John Doe");
  });

  it("should trim whitespace from winner name", async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    
    render(<WinnerModal {...defaultProps} onConfirm={onConfirm} />);
    
    const input = screen.getByPlaceholderText("Enter winner's name");
    await user.type(input, "  John Doe  ");
    
    const submitButton = screen.getByText("Mark Winner");
    await user.click(submitButton);
    
    expect(onConfirm).toHaveBeenCalledWith("John Doe");
  });

  it("should disable submit button when name is empty", () => {
    render(<WinnerModal {...defaultProps} />);
    
    const submitButton = screen.getByText("Mark Winner");
    expect(submitButton).toBeDisabled();
  });

  it("should disable submit button when loading", () => {
    render(<WinnerModal {...defaultProps} loading={true} />);
    
    const input = screen.getByPlaceholderText("Enter winner's name");
    const submitButton = screen.getByText("Saving...");
    
    expect(submitButton).toBeDisabled();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    
    render(<WinnerModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should reset form when modal closes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<WinnerModal {...defaultProps} />);
    
    const input = screen.getByPlaceholderText("Enter winner's name");
    await user.type(input, "Test Name");
    
    expect(input).toHaveValue("Test Name");
    
    rerender(<WinnerModal {...defaultProps} isOpen={false} />);
    rerender(<WinnerModal {...defaultProps} isOpen={true} />);
    
    await waitFor(() => {
      const newInput = screen.getByPlaceholderText("Enter winner's name");
      expect(newInput).toHaveValue("");
    });
  });
});
