export type MessageSender = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'received' | 'error';
export type ToolType = 'exchange_rate' | 'search' | 'wikipedia' | 'unknown';

export interface TextContent {
  kind: 'text';
  text: string;
}

export interface ToolResultContent {
  kind: 'tool_result';
  toolType: ToolType;
  payload: Record<string, unknown>;
  summary: string;
}

export type MessageContent = TextContent | ToolResultContent;

export interface Message {
  id: string;
  sender: MessageSender;
  content: MessageContent;
  timestamp: Date;
  status: MessageStatus;
}
