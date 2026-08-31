export type ProviderId = "groq" | "gemini" | "openai" | "anthropic";

export interface Model {
  id: string;
  name: string;
  provider: ProviderId | string;
}

export interface Provider {
  id: ProviderId;
  name: string;
  logoUrl: string;
  models: Model[];
}

export interface SelectedModel {
  modelId: string;
  provider: ProviderId | string;
  name?: string;
  logoUrl?: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: MessageRole;
  content: string;
  isStreaming?: boolean; // true while this message is actively being streamed
}

export interface ConversationSummary {
  id: string;
  title: string;
  modelId: string;
  provider: string;
  updatedAt: number; // ms
  messageCount: number;
}

export interface StoredConversation {
  id: string;
  title: string;
  modelId: string;
  provider: string;
  updatedAt: number; // ms
  messages: ChatMessage[];
}

export interface UserApiKeys {
  groq?: string;
  gemini?: string;
  openai?: string;
  anthropic?: string;
  [key: string]: string | undefined;
}

export type AlertVariant = "info" | "warning" | "error" | "success" | "destructive";

export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface AlertConfig {
  title: string;
  message: string;
  variant?: AlertVariant;
  buttons?: AlertButton[];
}

export const PROVIDERS_CONFIG = [
  {
    id: "groq" as ProviderId,
    name: "Groq",
    color: "#F55036",
    logo: "https://cdn.brandfetch.io/idxygbEPCQ/w/201/h/201/theme/dark/icon.png?c=1dxbfHSJFAPEGdCLU4o5B",
    placeholder: "gsk_...",
  },
  {
    id: "gemini" as ProviderId,
    name: "Google Gemini",
    color: "#1A73E8",
    logo: "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/gemini-color.png",
    placeholder: "AIzaSy...",
  },
  {
    id: "openai" as ProviderId,
    name: "OpenAI",
    color: "#10A37F",
    logo: "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/openai.png",
    placeholder: "sk-proj-...",
  },
  {
    id: "anthropic" as ProviderId,
    name: "Anthropic",
    color: "#D97757",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoQxsrnr_5qk5WWR94ALEy_4IL8J_TjI2PRA&s",
    placeholder: "sk-ant-...",
  },
];
