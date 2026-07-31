import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Modal } from "@/presentation/components/modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onOpenChange={jest.fn()} title="Create board">
        <p>Form contents</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the title, description, and children when open", () => {
    render(
      <Modal open onOpenChange={jest.fn()} title="Create board" description="Give it a name.">
        <p>Form contents</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Create board" })).toBeInTheDocument();
    expect(screen.getByText("Give it a name.")).toBeInTheDocument();
    expect(screen.getByText("Form contents")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when the close button is activated", async () => {
    const handleOpenChange = jest.fn();
    render(
      <Modal open onOpenChange={handleOpenChange} title="Create board">
        <p>Form contents</p>
      </Modal>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
