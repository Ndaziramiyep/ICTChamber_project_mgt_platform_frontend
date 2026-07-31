import type { AxiosInstance } from "axios";

import type { Board, BoardDraft } from "@/domain/entities/board";
import type { BoardRepository } from "@/domain/repositories/board-repository";
import { mapBoardResponse } from "@/infrastructure/repositories/mappers";
import type { BoardResponseSchema } from "@/infrastructure/repositories/wire-schemas";

/** Implements {@link BoardRepository} against `/api/v1/boards*`. */
export class HttpBoardRepository implements BoardRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async listBoards(): Promise<Board[]> {
    const response = await this.httpClient.get<BoardResponseSchema[]>("/api/v1/boards");
    return response.data.map(mapBoardResponse);
  }

  async getBoardById(boardId: string): Promise<Board> {
    const response = await this.httpClient.get<BoardResponseSchema>(`/api/v1/boards/${boardId}`);
    return mapBoardResponse(response.data);
  }

  async createBoard(draft: BoardDraft): Promise<Board> {
    const response = await this.httpClient.post<BoardResponseSchema>("/api/v1/boards", {
      board_title: draft.title,
      board_description: draft.description ?? null,
    });
    return mapBoardResponse(response.data);
  }

  async updateBoard(boardId: string, draft: BoardDraft): Promise<Board> {
    const response = await this.httpClient.put<BoardResponseSchema>(`/api/v1/boards/${boardId}`, {
      board_title: draft.title,
      board_description: draft.description ?? null,
    });
    return mapBoardResponse(response.data);
  }

  async deleteBoard(boardId: string): Promise<void> {
    await this.httpClient.delete(`/api/v1/boards/${boardId}`);
  }
}
