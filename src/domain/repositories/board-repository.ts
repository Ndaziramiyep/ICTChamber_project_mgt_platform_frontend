import type { Board, BoardDraft } from "@/domain/entities/board";

/** Port for `/api/v1/boards*` endpoints. */
export interface BoardRepository {
  listBoards(): Promise<Board[]>;
  getBoardById(boardId: string): Promise<Board>;
  createBoard(draft: BoardDraft): Promise<Board>;
  updateBoard(boardId: string, draft: BoardDraft): Promise<Board>;
  deleteBoard(boardId: string): Promise<void>;
}
