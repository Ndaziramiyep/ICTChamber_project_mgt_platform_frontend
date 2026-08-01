import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/application/query-keys";
import { useRepositories } from "@/application/repository-provider";
import type { Task, TaskDraft } from "@/domain/entities/task";

export function useTasksQuery(columnId: string) {
  const { taskRepository } = useRepositories();
  return useQuery({
    queryKey: queryKeys.tasks.byColumn(columnId),
    queryFn: () => taskRepository.listTasksByColumn(columnId),
    enabled: Boolean(columnId),
  });
}

export interface ColumnTasksState {
  tasks: Task[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

export interface TasksByColumnQueryResult {
  tasksByColumnId: Record<string, Task[]>;
  /** Per-column loading/error state, so one column's fetch never spinners every other column. */
  stateByColumnId: Record<string, ColumnTasksState>;
  refetchAll: () => void;
}

/**
 * Fetches every column's tasks in parallel (the API only exposes "list tasks by column", not
 * "list tasks by board") and merges the results into a single map, so the board view can see
 * every task on the board at once — needed to drag a card between columns.
 */
export function useTasksByColumnsQuery(columnIds: string[]): TasksByColumnQueryResult {
  const { taskRepository } = useRepositories();

  const queryResults = useQueries({
    queries: columnIds.map((columnId) => ({
      queryKey: queryKeys.tasks.byColumn(columnId),
      queryFn: () => taskRepository.listTasksByColumn(columnId),
    })),
  });

  const tasksByColumnId: Record<string, Task[]> = {};
  const stateByColumnId: Record<string, ColumnTasksState> = {};

  columnIds.forEach((columnId, index) => {
    const queryResult = queryResults[index];
    const tasks = queryResult?.data ?? [];
    tasksByColumnId[columnId] = tasks;
    stateByColumnId[columnId] = {
      tasks,
      isPending: queryResult?.isPending ?? false,
      isError: queryResult?.isError ?? false,
      error: queryResult?.error ?? null,
      refetch: () => void queryResult?.refetch(),
    };
  });

  return {
    tasksByColumnId,
    stateByColumnId,
    refetchAll: () => {
      queryResults.forEach((queryResult) => void queryResult.refetch());
    },
  };
}

export function useCreateTaskMutation(columnId: string) {
  const { taskRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: TaskDraft) => taskRepository.createTask(columnId, draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byColumn(columnId) });
    },
  });
}

export function useUpdateTaskMutation() {
  const { taskRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, draft }: { taskId: string; draft: TaskDraft }) =>
      taskRepository.updateTask(taskId, draft),
    onSuccess: (updatedTask) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byColumn(updatedTask.parentColumnId),
      });
    },
  });
}

export function useDeleteTaskMutation() {
  const { taskRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; columnId: string }) =>
      taskRepository.deleteTask(taskId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byColumn(variables.columnId),
      });
    },
  });
}
