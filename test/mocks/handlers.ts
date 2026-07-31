import { http, HttpResponse } from "msw";

import type {
  BoardResponseSchema,
  ColumnResponseSchema,
  TaskResponseSchema,
  UserProfileResponseSchema,
} from "@/infrastructure/repositories/wire-schemas";

const API_BASE_URL = "http://localhost:8000";

interface StoredUser extends UserProfileResponseSchema {
  plainTextPassword: string;
}

/** Minimal in-memory stand-in for the documented backend, faithful enough for repository/integration tests. */
class MockBackend {
  private users: StoredUser[] = [];
  private boards: BoardResponseSchema[] = [];
  private columns: ColumnResponseSchema[] = [];
  private tasks: TaskResponseSchema[] = [];
  private nextId = 1;
  private readonly accessTokensByUserId = new Map<string, string>();
  private readonly refreshTokensByUserId = new Map<string, string>();

  reset(): void {
    this.users = [];
    this.boards = [];
    this.columns = [];
    this.tasks = [];
    this.nextId = 1;
    this.accessTokensByUserId.clear();
    this.refreshTokensByUserId.clear();
  }

  generateId(prefix: string): string {
    return `${prefix}-${this.nextId++}`;
  }

  registerUser(
    emailAddress: string,
    plainTextPassword: string,
    displayName: string,
  ): StoredUser | null {
    if (this.users.some((user) => user.email_address === emailAddress)) {
      return null;
    }
    const user: StoredUser = {
      user_identifier: this.generateId("user"),
      email_address: emailAddress,
      display_name: displayName,
      account_created_at: new Date(0).toISOString(),
      is_account_active: true,
      plainTextPassword,
    };
    this.users.push(user);
    return user;
  }

  findUserByCredentials(emailAddress: string, plainTextPassword: string): StoredUser | undefined {
    return this.users.find(
      (user) => user.email_address === emailAddress && user.plainTextPassword === plainTextPassword,
    );
  }

  issueTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessToken = `access-${userId}-${this.nextId++}`;
    const refreshToken = `refresh-${userId}-${this.nextId++}`;
    this.accessTokensByUserId.set(userId, accessToken);
    this.refreshTokensByUserId.set(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  findUserIdByAccessToken(accessToken: string): string | undefined {
    for (const [userId, token] of this.accessTokensByUserId.entries()) {
      if (token === accessToken) return userId;
    }
    return undefined;
  }

  findUserIdByRefreshToken(refreshToken: string): string | undefined {
    for (const [userId, token] of this.refreshTokensByUserId.entries()) {
      if (token === refreshToken) return userId;
    }
    return undefined;
  }

  refreshAccessToken(userId: string): string {
    const accessToken = `access-${userId}-${this.nextId++}`;
    this.accessTokensByUserId.set(userId, accessToken);
    return accessToken;
  }

  getUserById(userId: string): StoredUser | undefined {
    return this.users.find((user) => user.user_identifier === userId);
  }

  createBoard(ownerId: string, title: string, description: string | null): BoardResponseSchema {
    const now = new Date().toISOString();
    const board: BoardResponseSchema = {
      board_identifier: this.generateId("board"),
      owning_user_identifier: ownerId,
      board_title: title,
      board_description: description,
      created_at: now,
      updated_at: now,
    };
    this.boards.push(board);
    return board;
  }

  listBoardsByOwner(ownerId: string): BoardResponseSchema[] {
    return this.boards.filter((board) => board.owning_user_identifier === ownerId);
  }

  findBoard(boardId: string): BoardResponseSchema | undefined {
    return this.boards.find((board) => board.board_identifier === boardId);
  }

  updateBoard(
    boardId: string,
    title: string,
    description: string | null,
  ): BoardResponseSchema | undefined {
    const board = this.findBoard(boardId);
    if (!board) return undefined;
    board.board_title = title;
    board.board_description = description;
    board.updated_at = new Date().toISOString();
    return board;
  }

  deleteBoard(boardId: string): void {
    this.boards = this.boards.filter((board) => board.board_identifier !== boardId);
    const columnIds = this.columns
      .filter((column) => column.parent_board_identifier === boardId)
      .map((column) => column.column_identifier);
    this.columns = this.columns.filter((column) => column.parent_board_identifier !== boardId);
    this.tasks = this.tasks.filter((task) => !columnIds.includes(task.parent_column_identifier));
  }

  createColumn(boardId: string, title: string): ColumnResponseSchema {
    const now = new Date().toISOString();
    const currentMax = this.columns
      .filter((column) => column.parent_board_identifier === boardId)
      .reduce((max, column) => Math.max(max, column.column_display_order), 0);
    const column: ColumnResponseSchema = {
      column_identifier: this.generateId("column"),
      parent_board_identifier: boardId,
      column_title: title,
      column_display_order: currentMax + 1,
      created_at: now,
      updated_at: now,
    };
    this.columns.push(column);
    return column;
  }

  listColumnsByBoard(boardId: string): ColumnResponseSchema[] {
    return this.columns
      .filter((column) => column.parent_board_identifier === boardId)
      .sort((a, b) => a.column_display_order - b.column_display_order);
  }

  findColumn(columnId: string): ColumnResponseSchema | undefined {
    return this.columns.find((column) => column.column_identifier === columnId);
  }

  updateColumn(columnId: string, title: string): ColumnResponseSchema | undefined {
    const column = this.findColumn(columnId);
    if (!column) return undefined;
    column.column_title = title;
    column.updated_at = new Date().toISOString();
    return column;
  }

  deleteColumn(columnId: string): void {
    this.columns = this.columns.filter((column) => column.column_identifier !== columnId);
    this.tasks = this.tasks.filter((task) => task.parent_column_identifier !== columnId);
  }

  createTask(
    columnId: string,
    title: string,
    description: string | null,
  ): TaskResponseSchema | undefined {
    const column = this.findColumn(columnId);
    if (!column) return undefined;
    const now = new Date().toISOString();
    const currentMax = this.tasks
      .filter((task) => task.parent_column_identifier === columnId)
      .reduce((max, task) => Math.max(max, task.task_position_value), 0);
    const task: TaskResponseSchema = {
      task_identifier: this.generateId("task"),
      parent_column_identifier: columnId,
      parent_board_identifier: column.parent_board_identifier,
      task_title: title,
      task_description: description,
      task_position_value: currentMax + 100,
      created_at: now,
      updated_at: now,
    };
    this.tasks.push(task);
    return task;
  }

  listTasksByColumn(columnId: string): TaskResponseSchema[] {
    return this.tasks
      .filter((task) => task.parent_column_identifier === columnId)
      .sort((a, b) => a.task_position_value - b.task_position_value);
  }

  findTask(taskId: string): TaskResponseSchema | undefined {
    return this.tasks.find((task) => task.task_identifier === taskId);
  }

  updateTask(
    taskId: string,
    title: string,
    description: string | null,
  ): TaskResponseSchema | undefined {
    const task = this.findTask(taskId);
    if (!task) return undefined;
    task.task_title = title;
    task.task_description = description;
    task.updated_at = new Date().toISOString();
    return task;
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter((task) => task.task_identifier !== taskId);
  }
}

export const mockBackend = new MockBackend();

function errorResponse(status: number, errorCode: string, message: string) {
  return HttpResponse.json(
    { error_code: errorCode, error_message: message, error_details: null },
    { status },
  );
}

function requireAuthenticatedUserId(request: Request): string | { errorResponse: Response } {
  const authorizationHeader = request.headers.get("Authorization");
  const accessToken = authorizationHeader?.replace(/^Bearer\s+/i, "");
  const userId = accessToken ? mockBackend.findUserIdByAccessToken(accessToken) : undefined;

  if (!userId) {
    return {
      errorResponse: errorResponse(401, "UnauthorizedError", "Missing or invalid access token."),
    };
  }
  return userId;
}

export const handlers = [
  http.post(`${API_BASE_URL}/api/v1/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email_address: string;
      plain_text_password: string;
      display_name: string;
    };
    const user = mockBackend.registerUser(
      body.email_address,
      body.plain_text_password,
      body.display_name,
    );
    if (!user) {
      return errorResponse(409, "EmailAlreadyRegisteredError", "This email is already registered.");
    }
    const { plainTextPassword: _plainTextPassword, ...profile } = user;
    return HttpResponse.json(profile, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email_address: string; plain_text_password: string };
    const user = mockBackend.findUserByCredentials(body.email_address, body.plain_text_password);
    if (!user) {
      return errorResponse(401, "InvalidCredentialsError", "Incorrect email or password.");
    }
    const tokens = mockBackend.issueTokens(user.user_identifier);
    return HttpResponse.json({
      access_token_value: tokens.accessToken,
      refresh_token_value: tokens.refreshToken,
      token_type_name: "bearer",
    });
  }),

  http.post(`${API_BASE_URL}/api/v1/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refresh_token_value: string };
    const userId = mockBackend.findUserIdByRefreshToken(body.refresh_token_value);
    if (!userId) {
      return errorResponse(
        401,
        "InvalidRefreshTokenError",
        "The refresh token is invalid or expired.",
      );
    }
    const accessToken = mockBackend.refreshAccessToken(userId);
    return HttpResponse.json({ access_token_value: accessToken, token_type_name: "bearer" });
  }),

  http.get(`${API_BASE_URL}/api/v1/auth/me`, ({ request }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const user = mockBackend.getUserById(result);
    if (!user) return errorResponse(404, "UserNotFoundError", "User not found.");
    const { plainTextPassword: _plainTextPassword, ...profile } = user;
    return HttpResponse.json(profile);
  }),

  http.post(`${API_BASE_URL}/api/v1/boards`, async ({ request }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const body = (await request.json()) as {
      board_title: string;
      board_description: string | null;
    };
    return HttpResponse.json(
      mockBackend.createBoard(result, body.board_title, body.board_description),
      {
        status: 201,
      },
    );
  }),

  http.get(`${API_BASE_URL}/api/v1/boards`, ({ request }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    return HttpResponse.json(mockBackend.listBoardsByOwner(result));
  }),

  http.get(`${API_BASE_URL}/api/v1/boards/:boardId`, ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const board = mockBackend.findBoard(params.boardId as string);
    if (!board) return errorResponse(404, "BoardNotFoundError", "Board not found.");
    if (board.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this board.");
    }
    return HttpResponse.json(board);
  }),

  http.put(`${API_BASE_URL}/api/v1/boards/:boardId`, async ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const board = mockBackend.findBoard(params.boardId as string);
    if (!board) return errorResponse(404, "BoardNotFoundError", "Board not found.");
    if (board.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this board.");
    }
    const body = (await request.json()) as {
      board_title: string;
      board_description: string | null;
    };
    return HttpResponse.json(
      mockBackend.updateBoard(board.board_identifier, body.board_title, body.board_description),
    );
  }),

  http.delete(`${API_BASE_URL}/api/v1/boards/:boardId`, ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const board = mockBackend.findBoard(params.boardId as string);
    if (!board) return errorResponse(404, "BoardNotFoundError", "Board not found.");
    if (board.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this board.");
    }
    mockBackend.deleteBoard(board.board_identifier);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE_URL}/api/v1/boards/:boardId/columns`, async ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const board = mockBackend.findBoard(params.boardId as string);
    if (!board) return errorResponse(404, "BoardNotFoundError", "Board not found.");
    if (board.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this board.");
    }
    const body = (await request.json()) as { column_title: string };
    return HttpResponse.json(mockBackend.createColumn(board.board_identifier, body.column_title), {
      status: 201,
    });
  }),

  http.get(`${API_BASE_URL}/api/v1/boards/:boardId/columns`, ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const board = mockBackend.findBoard(params.boardId as string);
    if (!board) return errorResponse(404, "BoardNotFoundError", "Board not found.");
    if (board.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this board.");
    }
    return HttpResponse.json(mockBackend.listColumnsByBoard(board.board_identifier));
  }),

  http.get(`${API_BASE_URL}/api/v1/columns/:columnId`, ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const column = mockBackend.findColumn(params.columnId as string);
    if (!column) return errorResponse(404, "ColumnNotFoundError", "Column not found.");
    const board = mockBackend.findBoard(column.parent_board_identifier);
    if (board?.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this column.");
    }
    return HttpResponse.json(column);
  }),

  http.put(`${API_BASE_URL}/api/v1/columns/:columnId`, async ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const column = mockBackend.findColumn(params.columnId as string);
    if (!column) return errorResponse(404, "ColumnNotFoundError", "Column not found.");
    const board = mockBackend.findBoard(column.parent_board_identifier);
    if (board?.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this column.");
    }
    const body = (await request.json()) as { column_title: string };
    return HttpResponse.json(mockBackend.updateColumn(column.column_identifier, body.column_title));
  }),

  http.delete(`${API_BASE_URL}/api/v1/columns/:columnId`, ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const column = mockBackend.findColumn(params.columnId as string);
    if (!column) return errorResponse(404, "ColumnNotFoundError", "Column not found.");
    const board = mockBackend.findBoard(column.parent_board_identifier);
    if (board?.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this column.");
    }
    mockBackend.deleteColumn(column.column_identifier);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_BASE_URL}/api/v1/columns/:columnId/tasks`, async ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const column = mockBackend.findColumn(params.columnId as string);
    if (!column) return errorResponse(404, "ColumnNotFoundError", "Column not found.");
    const board = mockBackend.findBoard(column.parent_board_identifier);
    if (board?.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this column.");
    }
    const body = (await request.json()) as { task_title: string; task_description: string | null };
    const task = mockBackend.createTask(
      column.column_identifier,
      body.task_title,
      body.task_description,
    );
    return HttpResponse.json(task, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/api/v1/columns/:columnId/tasks`, ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const column = mockBackend.findColumn(params.columnId as string);
    if (!column) return errorResponse(404, "ColumnNotFoundError", "Column not found.");
    const board = mockBackend.findBoard(column.parent_board_identifier);
    if (board?.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this column.");
    }
    return HttpResponse.json(mockBackend.listTasksByColumn(column.column_identifier));
  }),

  http.get(`${API_BASE_URL}/api/v1/tasks/:taskId`, ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const task = mockBackend.findTask(params.taskId as string);
    if (!task) return errorResponse(404, "TaskNotFoundError", "Task not found.");
    const board = mockBackend.findBoard(task.parent_board_identifier);
    if (board?.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this task.");
    }
    return HttpResponse.json(task);
  }),

  http.put(`${API_BASE_URL}/api/v1/tasks/:taskId`, async ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const task = mockBackend.findTask(params.taskId as string);
    if (!task) return errorResponse(404, "TaskNotFoundError", "Task not found.");
    const board = mockBackend.findBoard(task.parent_board_identifier);
    if (board?.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this task.");
    }
    const body = (await request.json()) as { task_title: string; task_description: string | null };
    return HttpResponse.json(
      mockBackend.updateTask(task.task_identifier, body.task_title, body.task_description),
    );
  }),

  http.delete(`${API_BASE_URL}/api/v1/tasks/:taskId`, ({ request, params }) => {
    const result = requireAuthenticatedUserId(request);
    if (typeof result !== "string") return result.errorResponse;
    const task = mockBackend.findTask(params.taskId as string);
    if (!task) return errorResponse(404, "TaskNotFoundError", "Task not found.");
    const board = mockBackend.findBoard(task.parent_board_identifier);
    if (board?.owning_user_identifier !== result) {
      return errorResponse(403, "ForbiddenError", "You do not own this task.");
    }
    mockBackend.deleteTask(task.task_identifier);
    return new HttpResponse(null, { status: 204 });
  }),
];
