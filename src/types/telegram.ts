export interface TelegramBot {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: boolean;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: TelegramChat;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    date: number;
    text?: string;
  };
}

export interface SendMessageParams {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown';
}

export interface SendPhotoParams {
  chat_id: number;
  photo: File;
  caption?: string;
  parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown';
}

export interface SendMessageResponse {
  ok: boolean;
  result?: {
    message_id: number;
    from: TelegramBot;
    chat: TelegramChat;
    date: number;
    text?: string;
  };
  description?: string;
}