import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TextArea } from "@/presentation/components/text-area";

describe("TextArea", () => {
  it("accepts multiline text", async () => {
    render(<TextArea aria-label="Task description" />);

    await userEvent.type(screen.getByLabelText("Task description"), "Line one");

    expect(screen.getByLabelText("Task description")).toHaveValue("Line one");
  });

  it("marks itself invalid when hasError is set", () => {
    render(<TextArea aria-label="Task description" hasError />);
    expect(screen.getByLabelText("Task description")).toHaveAttribute("aria-invalid", "true");
  });
});
