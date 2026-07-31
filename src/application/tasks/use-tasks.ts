import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/application/query-keys";
import { useRepositories } from "@/application/repository-provider";
import type { TaskDraft } from "@/domain/entities/task";

export function useTasksQuery(columnId: string) {
  const { taskRepository } = useRepositories();
  return useQuery({
    queryKey: queryKeys.tasks.byColumn(columnId),
    queryFn: () => taskRepository.listTasksByColumn(columnId),
    enabled: Boolean(columnId),
  });
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
