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
    render(<TaskCard task={task} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Wire up login form")).toBeInTheDocument();
    expect(screen.getByText("Use the /auth/login endpoint")).toBeInTheDocument();
  });

  it("omits the description paragraph when there is none", () => {
    render(
      <TaskCard task={{ ...task, description: null }} onEdit={jest.fn()} onDelete={jest.fn()} />,
    );
    expect(screen.queryByText("Use the /auth/login endpoint")).not.toBeInTheDocument();
  });

  it("calls onEdit and onDelete", async () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(<TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: "Edit Wire up login form" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete Wire up login form" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
