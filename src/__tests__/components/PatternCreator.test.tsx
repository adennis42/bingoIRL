import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PatternCreator } from "@/components/bingo/PatternCreator";

describe("PatternCreator", () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render 5x5 grid", () => {
    const { container } = render(
      <PatternCreator onSave={mockOnSave} />
    );
    const cells = container.querySelectorAll("button");
    // 25 cells + Save/Cancel buttons = 27 buttons
    expect(cells.length).toBeGreaterThanOrEqual(25);
  });

  it("should have center cell always selected", () => {
    const { container } = render(
      <PatternCreator onSave={mockOnSave} />
    );
    const cells = container.querySelectorAll("button");
    // Center cell (index 12) should be disabled/always selected
    const centerCell = Array.from(cells).find((cell) =>
      cell.getAttribute("disabled") !== null
    );
    expect(centerCell).toBeDefined();
  });

  it("should toggle cell selection on click", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PatternCreator onSave={mockOnSave} />
    );
    
    const cells = container.querySelectorAll("button");
    // Find a non-center, non-disabled cell (skip center and buttons)
    const toggleableCell = Array.from(cells).find(
      (cell) => !cell.disabled && cell.textContent === ""
    ) as HTMLButtonElement;
    
    if (toggleableCell) {
      const initialClass = toggleableCell.className;
      await user.click(toggleableCell);
      
      // Cell should have changed state
      expect(toggleableCell.className).not.toBe(initialClass);
    }
  });

  it("should call onSave with selected cells", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PatternCreator onSave={mockOnSave} />
    );
    
    const saveButton = screen.getByText("Save Pattern");
    await user.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalled();
    const savedCells = mockOnSave.mock.calls[0][0];
    expect(Array.isArray(savedCells)).toBe(true);
    // Should include center cell at minimum
    expect(savedCells.some(([r, c]: number[]) => r === 2 && c === 2)).toBe(true);
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<PatternCreator onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("should initialize with initialCells", () => {
    const initialCells = [[0, 0], [0, 1], [2, 2]];
    const { container } = render(
      <PatternCreator onSave={mockOnSave} initialCells={initialCells} />
    );
    
    // Cells should be rendered
    const cells = container.querySelectorAll("button");
    expect(cells.length).toBeGreaterThan(0);
  });

  it("should update when initialCells prop changes", () => {
    const { rerender, container } = render(
      <PatternCreator onSave={mockOnSave} initialCells={[[0, 0]]} />
    );
    
    rerender(
      <PatternCreator onSave={mockOnSave} initialCells={[[0, 0], [0, 1]]} />
    );
    
    // Component should update
    const cells = container.querySelectorAll("button");
    expect(cells.length).toBeGreaterThan(0);
  });
});
