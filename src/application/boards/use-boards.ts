import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/application/query-keys";
import { useRepositories } from "@/application/repository-provider";
import type { BoardDraft } from "@/domain/entities/board";

export function useBoardsQuery() {
  const { boardRepository } = useRepositories();
  return useQuery({ queryKey: queryKeys.boards.all, queryFn: () => boardRepository.listBoards() });
}

export function useBoardQuery(boardId: string) {
  const { boardRepository } = useRepositories();
  return useQuery({
    queryKey: queryKeys.boards.detail(boardId),
    queryFn: () => boardRepository.getBoardById(boardId),
    enabled: Boolean(boardId),
  });
}

export function useCreateBoardMutation() {
  const { boardRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: BoardDraft) => boardRepository.createBoard(draft),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    },
  });
}

export function useUpdateBoardMutation() {
  const { boardRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, draft }: { boardId: string; draft: BoardDraft }) =>
      boardRepository.updateBoard(boardId, draft),
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData(queryKeys.boards.detail(updatedBoard.boardId), updatedBoard);
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    },
  });
}

export function useDeleteBoardMutation() {
  const { boardRepository } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => boardRepository.deleteBoard(boardId),
    onSuccess: (_result, boardId) => {
      queryClient.removeQueries({ queryKey: queryKeys.boards.detail(boardId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.boards.all });
    },
  });
}
