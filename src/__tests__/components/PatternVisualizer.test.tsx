import { render } from "@testing-library/react";
import { PatternVisualizer } from "@/components/bingo/PatternVisualizer";
import { PATTERN_DEFINITIONS } from "@/lib/utils/patterns";
import type { CustomPattern } from "@/types";

describe("PatternVisualizer", () => {
  it("should render 5x5 grid", () => {
    const { container } = render(<PatternVisualizer pattern="four_corners" />);
    const cells = container.querySelectorAll(".grid.grid-cols-5 > div");
    expect(cells).toHaveLength(25);
  });

  it("should highlight cells for four_corners pattern", () => {
    const { container } = render(<PatternVisualizer pattern="four_corners" />);
    const cells = container.querySelectorAll(".grid.grid-cols-5 > div");
    
    // Four corners should be selected (0,0), (0,4), (4,0), (4,4)
    // Plus center (2,2) is always selected
    const selectedCells = Array.from(cells).filter((cell) =>
      cell.classList.contains("bg-primary")
    );
    expect(selectedCells.length).toBeGreaterThanOrEqual(4);
  });

  it("should highlight center cell", () => {
    const { container } = render(<PatternVisualizer pattern="blackout" />);
    const cells = container.querySelectorAll(".grid.grid-cols-5 > div");
    
    // Center cell is at index 12 (row 2, col 2)
    const centerCell = cells[12];
    expect(centerCell).toHaveClass("bg-primary");
  });

  it("should render custom pattern", () => {
    const customPattern: CustomPattern = {
      id: "custom1",
      userId: "user1",
      name: "Custom",
      cells: [[0, 0], [0, 1], [1, 0]],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { container } = render(<PatternVisualizer pattern={customPattern} />);
    const cells = container.querySelectorAll(".grid.grid-cols-5 > div");
    expect(cells).toHaveLength(25);
  });

  it("should apply size classes", () => {
    const { container, rerender } = render(
      <PatternVisualizer pattern="four_corners" size="sm" />
    );
    let cells = container.querySelectorAll(".grid.grid-cols-5 > div");
    expect(cells[0]).toHaveClass("w-8");

    rerender(<PatternVisualizer pattern="four_corners" size="lg" />);
    cells = container.querySelectorAll(".grid.grid-cols-5 > div");
    expect(cells[0]).toHaveClass("w-16");
  });

  it("should handle traditional_line pattern", () => {
    const { container } = render(<PatternVisualizer pattern="traditional_line" />);
    const cells = container.querySelectorAll(".grid.grid-cols-5 > div");
    expect(cells).toHaveLength(25);
    
    // Traditional line shows example line (middle row)
    const selectedCells = Array.from(cells).filter((cell) =>
      cell.classList.contains("bg-primary")
    );
    expect(selectedCells.length).toBeGreaterThan(0);
  });
});
