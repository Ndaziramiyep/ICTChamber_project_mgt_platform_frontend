import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfirmDialog } from "@/presentation/components/confirm-dialog";

describe("ConfirmDialog", () => {
  it("calls onConfirm when the confirm button is clicked", async () => {
    const handleConfirm = jest.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={jest.fn()}
        title="Delete board?"
        description="This cannot be undone."
        onConfirm={handleConfirm}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when cancel is clicked", async () => {
    const handleOpenChange = jest.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={handleOpenChange}
        title="Delete board?"
        onConfirm={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables both buttons and shows a busy confirm button while confirming", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={jest.fn()}
        title="Delete board?"
        onConfirm={jest.fn()}
        isConfirming
      />,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("aria-busy", "true");
  });
});
