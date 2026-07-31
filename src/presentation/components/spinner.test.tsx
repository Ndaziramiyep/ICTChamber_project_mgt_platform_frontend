import { render, screen } from "@testing-library/react";

import { Spinner } from "@/presentation/components/spinner";

describe("Spinner", () => {
  it("exposes a status role with an accessible label", () => {
    render(<Spinner label="Loading boards…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading boards…");
  });
});
