import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "@/presentation/components/input";

describe("Input", () => {
  it("forwards typed text via onChange", async () => {
    const handleChange = jest.fn();
    render(<Input aria-label="Board title" onChange={handleChange} />);

    await userEvent.type(screen.getByLabelText("Board title"), "Sprint 12");

    expect(handleChange).toHaveBeenCalled();
    expect(screen.getByLabelText("Board title")).toHaveValue("Sprint 12");
  });

  it("marks itself invalid when hasError is set", () => {
    render(<Input aria-label="Board title" hasError />);
    expect(screen.getByLabelText("Board title")).toHaveAttribute("aria-invalid", "true");
  });
});
