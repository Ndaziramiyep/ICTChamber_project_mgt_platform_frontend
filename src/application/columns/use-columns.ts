import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/application/query-keys";
import { useRepositories } from "@/application/repository-provider";
import type { ColumnDraft } from "@/domain/entities/column";

export function useColumnsQuery(boardId: string) {
  const { columnRepository } = useRepositories();
  return useQuery({
    queryKey: queryKeys.columns.byBoard(boardId),
    queryFn: () => columnRepository.listColumnsByBoard(boardId),
    enabled: Boolean(boardId),
  });
}

export function useCreateColumnMutation(boardId: string) {
  const { columnRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: ColumnDraft) => columnRepository.createColumn(boardId, draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.columns.byBoard(boardId) });
    },
  });
}

export function useUpdateColumnMutation() {
  const { columnRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, draft }: { columnId: string; draft: ColumnDraft }) =>
      columnRepository.updateColumn(columnId, draft),
    onSuccess: (updatedColumn) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.columns.byBoard(updatedColumn.parentBoardId),
      });
    },
  });
}

export function useDeleteColumnMutation() {
  const { columnRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId }: { columnId: string; boardId: string }) =>
      columnRepository.deleteColumn(columnId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.columns.byBoard(variables.boardId),
      });
    },
  });
}
