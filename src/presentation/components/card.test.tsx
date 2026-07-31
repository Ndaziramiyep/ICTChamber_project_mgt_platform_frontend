import { render, screen } from "@testing-library/react";

import { Card } from "@/presentation/components/card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Board summary</Card>);
    expect(screen.getByText("Board summary")).toBeInTheDocument();
  });

  it("merges custom classNames with the default styles", () => {
    render(<Card className="custom-class">Content</Card>);
    expect(screen.getByText("Content")).toHaveClass("custom-class", "rounded-lg");
  });
});
