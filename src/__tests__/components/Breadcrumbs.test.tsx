import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

describe("Breadcrumbs", () => {
  it("should render home icon", () => {
    render(<Breadcrumbs items={[]} />);
    const homeLink = screen.getByLabelText("Breadcrumb");
    expect(homeLink).toBeInTheDocument();
  });

  it("should render breadcrumb items", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Games", href: "/games" },
          { label: "Current Game" },
        ]}
      />
    );
    
    expect(screen.getByText("Games")).toBeInTheDocument();
    expect(screen.getByText("Current Game")).toBeInTheDocument();
  });

  it("should render items without href as text", () => {
    render(<Breadcrumbs items={[{ label: "Current Page" }]} />);
    const currentPage = screen.getByText("Current Page");
    expect(currentPage.tagName).toBe("SPAN");
  });

  it("should render items with href as links", () => {
    render(<Breadcrumbs items={[{ label: "Games", href: "/games" }]} />);
    const gamesLink = screen.getByText("Games");
    expect(gamesLink.tagName).toBe("A");
    expect(gamesLink).toHaveAttribute("href", "/games");
  });
});
