import type { Message } from './message';

export interface Conversation {
  id: string;
  userId: string;
  adkSessionId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}
