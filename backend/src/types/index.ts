// ─── Models & Providers ───────────────────────────────────────────
import type { BaseMessage } from "@langchain/core/messages";

export type Model = {
    id: string;
    name: string;
    provider: string;
};

export type Provider = {
    id: string;
    name: string;
    models: Model[];
    logoUrl: string;
};

// ─── Chat / Messages ──────────────────────────────────────────────
export type MessageRole = "user" | "assistant" | "system";

export type Message = {
    role: MessageRole;
    content: string;
};

export type Conversation = {
    id: string;
    modelId: string;
    provider: string;
    messages: Message[];
    createdAt: Date;
};

// ─── API Payloads ─────────────────────────────────────────────────
export type ChatRequest = {
    conversationId: string;
    modelId: string;
    provider: string;
    message: string;
};

export type ChatResponse = {
    conversationId: string;
    reply: string;
    modelId: string;
};

declare global {
  namespace Express {
    interface Request {
      uid?: string;
    }
  }
}

export interface LLMAdapter {
  invoke(messages: BaseMessage[], apiKey: string, modelId: string): Promise<string>;
}