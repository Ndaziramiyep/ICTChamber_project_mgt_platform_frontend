import { render, screen } from "@testing-library/react";

import { EmptyState } from "@/presentation/components/empty-state";

describe("EmptyState", () => {
  it("renders the title, description, and action", () => {
    render(
      <EmptyState
        title="No boards yet"
        description="Create your first board to get started."
        action={<button>New board</button>}
      />,
    );

    expect(screen.getByText("No boards yet")).toBeInTheDocument();
    expect(screen.getByText("Create your first board to get started.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New board" })).toBeInTheDocument();
  });
});
