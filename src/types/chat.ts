// Chat type definitions
export type MessageRole = "user" | "assistant" | "tool";

export interface ChatMessage {
  _id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  _id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}
