import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Task } from "@/domain/entities/task";
import { TaskCard } from "@/presentation/features/board-detail/task-card";

const task: Task = {
  taskId: "task-1",
  parentColumnId: "column-1",
  parentBoardId: "board-1",
  title: "Wire up login form",
  description: "Use the /auth/login endpoint",
  positionValue: 100,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("TaskCard", () => {
  it("renders the title and description", () => {
    render(
      <TaskCard
        task={task}
        columnId="column-1"
        onEdit={jest.fn()}
        onDuplicate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Wire up login form")).toBeInTheDocument();
    expect(screen.getByText("Use the /auth/login endpoint")).toBeInTheDocument();
  });

  it("omits the description paragraph when there is none", () => {
    render(
      <TaskCard
        task={{ ...task, description: null }}
        columnId="column-1"
        onEdit={jest.fn()}
        onDuplicate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.queryByText("Use the /auth/login endpoint")).not.toBeInTheDocument();
  });

  it("calls onEdit, onDuplicate, and onDelete", async () => {
    const onEdit = jest.fn();
    const onDuplicate = jest.fn();
    const onDelete = jest.fn();
    render(
      <TaskCard
        task={task}
        columnId="column-1"
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Edit Wire up login form" }));
    await userEvent.click(screen.getByRole("button", { name: "Duplicate Wire up login form" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete Wire up login form" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("marks the card drag-disabled when isDragDisabled is true", () => {
    const { container } = render(
      <TaskCard
        task={task}
        columnId="column-1"
        onEdit={jest.fn()}
        onDuplicate={jest.fn()}
        onDelete={jest.fn()}
        isDragDisabled
      />,
    );

    expect(container.firstChild).toHaveAttribute("aria-disabled", "true");
  });

  it("toggles the complete checkbox without altering the title's styling", async () => {
    render(
      <TaskCard
        task={task}
        columnId="column-1"
        onEdit={jest.fn()}
        onDuplicate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Mark Wire up login form complete" });
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    await userEvent.click(checkbox);

    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("checkbox", { name: "Mark Wire up login form incomplete" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Wire up login form")).not.toHaveClass("line-through");
  });

  it("does not start a drag from the edit, duplicate, delete, or complete buttons", () => {
    render(
      <TaskCard
        task={task}
        columnId="column-1"
        onEdit={jest.fn()}
        onDuplicate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Mark Wire up login form complete" }),
    ).toHaveAttribute("data-no-dnd");
    expect(screen.getByRole("button", { name: "Edit Wire up login form" })).toHaveAttribute(
      "data-no-dnd",
    );
    expect(screen.getByRole("button", { name: "Duplicate Wire up login form" })).toHaveAttribute(
      "data-no-dnd",
    );
    expect(screen.getByRole("button", { name: "Delete Wire up login form" })).toHaveAttribute(
      "data-no-dnd",
    );
  });
});
