import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "@/presentation/components/button";

describe("Button", () => {
  it("renders its children as a button", () => {
    render(<Button>Save board</Button>);
    expect(screen.getByRole("button", { name: "Save board" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Save board</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Save board" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button and marks it busy while loading", () => {
    render(<Button isLoading>Save board</Button>);

    const button = screen.getByRole("button", { name: "Save board" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("does not fire onClick when disabled", async () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Save board
      </Button>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Save board" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("defaults to type=button so it never accidentally submits a form", () => {
    render(<Button>Cancel</Button>);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("type", "button");
  });
});
