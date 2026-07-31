/** Wire-format response/request shapes exactly as documented by the backend. */

export interface UserProfileResponseSchema {
  user_identifier: string;
  email_address: string;
  display_name: string;
  account_created_at: string;
  is_account_active: boolean;
}

export interface TokenPairResponseSchema {
  access_token_value: string;
  refresh_token_value: string;
  token_type_name: string;
}

export interface AccessTokenResponseSchema {
  access_token_value: string;
  token_type_name: string;
}

export interface BoardResponseSchema {
  board_identifier: string;
  owning_user_identifier: string;
  board_title: string;
  board_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ColumnResponseSchema {
  column_identifier: string;
  parent_board_identifier: string;
  column_title: string;
  column_display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaskResponseSchema {
  task_identifier: string;
  parent_column_identifier: string;
  parent_board_identifier: string;
  task_title: string;
  task_description: string | null;
  task_position_value: number;
  created_at: string;
  updated_at: string;
}
