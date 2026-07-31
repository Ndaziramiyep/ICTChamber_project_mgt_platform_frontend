import type { Board, BoardDraft } from "@/domain/entities/board";
import type { ColumnDraft, KanbanColumn } from "@/domain/entities/column";
import type { Task, TaskDraft } from "@/domain/entities/task";
import type { AuthenticatedSession, User } from "@/domain/entities/user";
import { ApiError } from "@/domain/errors/api-error";
import type {
  AuthRepository,
  LoginInput,
  RegistrationInput,
} from "@/domain/repositories/auth-repository";
import type { BoardRepository } from "@/domain/repositories/board-repository";
import type { ColumnRepository } from "@/domain/repositories/column-repository";
import type { TaskRepository } from "@/domain/repositories/task-repository";
import type { StoredTokenPair, TokenStorage } from "@/infrastructure/storage/token-storage";

export function buildFakeUser(overrides: Partial<User> = {}): User {
  return {
    userId: "user-1",
    emailAddress: "jane@example.com",
    displayName: "Jane Doe",
    accountCreatedAt: "2026-01-01T00:00:00Z",
    isAccountActive: true,
    ...overrides,
  };
}

export class FakeTokenStorage implements TokenStorage {
  private tokens: StoredTokenPair | null = null;

  getTokens(): StoredTokenPair | null {
    return this.tokens;
  }

  saveTokens(tokens: StoredTokenPair): void {
    this.tokens = tokens;
  }

  clearTokens(): void {
    this.tokens = null;
  }
}

/** In-memory {@link AuthRepository} fake for hook tests — no network, no MSW. */
export class FakeAuthRepository implements AuthRepository {
  private readonly registeredUsers = new Map<string, { user: User; password: string }>();
  currentUser: User | null = null;

  async register(input: RegistrationInput): Promise<User> {
    if (this.registeredUsers.has(input.emailAddress)) {
      throw new ApiError({
        httpStatus: 409,
        errorCode: "EmailAlreadyRegisteredError",
        message: "This email is already registered.",
      });
    }
    const user = buildFakeUser({
      userId: `user-${this.registeredUsers.size + 1}`,
      emailAddress: input.emailAddress,
      displayName: input.displayName,
    });
    this.registeredUsers.set(input.emailAddress, { user, password: input.plainTextPassword });
    return user;
  }

  async login(input: LoginInput): Promise<AuthenticatedSession> {
    const record = this.registeredUsers.get(input.emailAddress);
    if (!record || record.password !== input.plainTextPassword) {
      throw new ApiError({
        httpStatus: 401,
        errorCode: "InvalidCredentialsError",
        message: "Incorrect email or password.",
      });
    }
    this.currentUser = record.user;
    return {
      user: record.user,
      accessToken: "fake-access-token",
      refreshToken: "fake-refresh-token",
    };
  }

  async refreshAccessToken(): Promise<string> {
    return "fake-access-token-2";
  }

  async getCurrentUser(): Promise<User> {
    if (!this.currentUser) {
      throw new ApiError({
        httpStatus: 401,
        errorCode: "UnauthorizedError",
        message: "Not authenticated.",
      });
    }
    return this.currentUser;
  }
}

/** In-memory {@link BoardRepository} fake for hook tests. */
export class FakeBoardRepository implements BoardRepository {
  boards: Board[] = [];
  private nextId = 1;

  async listBoards(): Promise<Board[]> {
    return [...this.boards];
  }

  async getBoardById(boardId: string): Promise<Board> {
    const board = this.boards.find((candidate) => candidate.boardId === boardId);
    if (!board)
      throw new ApiError({
        httpStatus: 404,
        errorCode: "BoardNotFoundError",
        message: "Not found.",
      });
    return board;
  }

  async createBoard(draft: BoardDraft): Promise<Board> {
    const now = "2026-01-01T00:00:00Z";
    const board: Board = {
      boardId: `board-${this.nextId++}`,
      owningUserId: "user-1",
      title: draft.title,
      description: draft.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.boards.push(board);
    return board;
  }

  async updateBoard(boardId: string, draft: BoardDraft): Promise<Board> {
    const board = await this.getBoardById(boardId);
    board.title = draft.title;
    board.description = draft.description ?? null;
    return board;
  }

  async deleteBoard(boardId: string): Promise<void> {
    this.boards = this.boards.filter((board) => board.boardId !== boardId);
  }
}

/** In-memory {@link ColumnRepository} fake for hook tests. */
export class FakeColumnRepository implements ColumnRepository {
  columns: KanbanColumn[] = [];
  private nextId = 1;

  async listColumnsByBoard(boardId: string): Promise<KanbanColumn[]> {
    return this.columns
      .filter((column) => column.parentBoardId === boardId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getColumnById(columnId: string): Promise<KanbanColumn> {
    const column = this.columns.find((candidate) => candidate.columnId === columnId);
    if (!column)
      throw new ApiError({
        httpStatus: 404,
        errorCode: "ColumnNotFoundError",
        message: "Not found.",
      });
    return column;
  }

  async createColumn(boardId: string, draft: ColumnDraft): Promise<KanbanColumn> {
    const now = "2026-01-01T00:00:00Z";
    const column: KanbanColumn = {
      columnId: `column-${this.nextId++}`,
      parentBoardId: boardId,
      title: draft.title,
      displayOrder:
        this.columns.filter((candidate) => candidate.parentBoardId === boardId).length + 1,
      createdAt: now,
      updatedAt: now,
    };
    this.columns.push(column);
    return column;
  }

  async updateColumn(columnId: string, draft: ColumnDraft): Promise<KanbanColumn> {
    const column = await this.getColumnById(columnId);
    column.title = draft.title;
    return column;
  }

  async deleteColumn(columnId: string): Promise<void> {
    this.columns = this.columns.filter((column) => column.columnId !== columnId);
  }
}

/** In-memory {@link TaskRepository} fake for hook tests. */
export class FakeTaskRepository implements TaskRepository {
  tasks: Task[] = [];
  private nextId = 1;

  async listTasksByColumn(columnId: string): Promise<Task[]> {
    return this.tasks
      .filter((task) => task.parentColumnId === columnId)
      .sort((a, b) => a.positionValue - b.positionValue);
  }

  async getTaskById(taskId: string): Promise<Task> {
    const task = this.tasks.find((candidate) => candidate.taskId === taskId);
    if (!task)
      throw new ApiError({
        httpStatus: 404,
        errorCode: "TaskNotFoundError",
        message: "Not found.",
      });
    return task;
  }

  async createTask(columnId: string, draft: TaskDraft): Promise<Task> {
    const now = "2026-01-01T00:00:00Z";
    const task: Task = {
      taskId: `task-${this.nextId++}`,
      parentColumnId: columnId,
      parentBoardId: "board-1",
      title: draft.title,
      description: draft.description ?? null,
      positionValue:
        (this.tasks.filter((candidate) => candidate.parentColumnId === columnId).length + 1) * 100,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  async updateTask(taskId: string, draft: TaskDraft): Promise<Task> {
    const task = await this.getTaskById(taskId);
    task.title = draft.title;
    task.description = draft.description ?? null;
    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks = this.tasks.filter((task) => task.taskId !== taskId);
  }
}
