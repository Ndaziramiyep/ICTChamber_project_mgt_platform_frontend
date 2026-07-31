import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ErrorState, LoadingState } from "@/presentation/components/page-status";

describe("LoadingState", () => {
  it("shows an accessible loading status", () => {
    render(<LoadingState label="Loading boards…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading boards…");
  });
});

describe("ErrorState", () => {
  it("shows the error message", () => {
    render(<ErrorState message="Could not load boards." />);
    expect(screen.getByText("Could not load boards.")).toBeInTheDocument();
  });

  it("calls onRetry when the retry button is clicked", async () => {
    const handleRetry = jest.fn();
    render(<ErrorState message="Could not load boards." onRetry={handleRetry} />);

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render a retry button when onRetry is omitted", () => {
    render(<ErrorState message="Could not load boards." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
