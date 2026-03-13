import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoundCompleteModal } from "@/components/host/RoundCompleteModal";

describe("RoundCompleteModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    roundNumber: 1,
    totalRounds: 3,
    winnerName: "John Doe",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<RoundCompleteModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Round.*Complete/)).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<RoundCompleteModal {...defaultProps} />);
    expect(screen.getByText(/Round 1 Complete!/)).toBeInTheDocument();
  });

  it("should display winner name", () => {
    render(<RoundCompleteModal {...defaultProps} winnerName="Jane Smith" />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should display prize when provided", () => {
    render(<RoundCompleteModal {...defaultProps} prize="$100" />);
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("should show 'Game Complete!' for last round", () => {
    render(<RoundCompleteModal {...defaultProps} isLastRound={true} />);
    expect(screen.getByText("Game Complete!")).toBeInTheDocument();
  });

  it("should show round number for non-last rounds", () => {
    render(<RoundCompleteModal {...defaultProps} isLastRound={false} roundNumber={2} />);
    expect(screen.getByText(/Round 2 Complete!/)).toBeInTheDocument();
  });

  it("should show next round message for non-last rounds", () => {
    render(<RoundCompleteModal {...defaultProps} isLastRound={false} roundNumber={1} />);
    expect(screen.getByText(/Round 2 will begin automatically/)).toBeInTheDocument();
  });

  it("should show Close button for last round", () => {
    render(<RoundCompleteModal {...defaultProps} isLastRound={true} />);
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("should show Dismiss and Continue buttons for non-last rounds", () => {
    render(<RoundCompleteModal {...defaultProps} isLastRound={false} />);
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });

  it("should call onClose when Close button is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    
    render(<RoundCompleteModal {...defaultProps} isLastRound={true} onClose={onClose} />);
    
    const closeButton = screen.getByText("Close");
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onContinue when Continue button is clicked", async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    
    render(
      <RoundCompleteModal
        {...defaultProps}
        isLastRound={false}
        onContinue={onContinue}
      />
    );
    
    const continueButton = screen.getByText("Continue to Next Round");
    await user.click(continueButton);
    
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("should not show Continue button when onContinue is not provided", () => {
    render(<RoundCompleteModal {...defaultProps} isLastRound={false} />);
    expect(screen.queryByText("Continue to Next Round")).not.toBeInTheDocument();
  });
});
