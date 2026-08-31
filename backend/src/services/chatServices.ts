import { invokeGroq, streamGroq } from "../adapters/groq";
import { invokeGoogle, streamGoogle } from "../adapters/google";
import { invokeOpenAI, streamOpenAI } from "../adapters/openai";
import { invokeAnthropic, streamAnthropic } from "../adapters/anthropic";
import type { BaseMessage } from "@langchain/core/messages";

export const divert = async (
  provider: string,
  modelId: string,
  messages: BaseMessage[],
  apiKey: string
): Promise<string> => {
  switch (provider) {
    case "groq":      return invokeGroq(messages, apiKey, modelId);
    case "gemini":    return invokeGoogle(messages, apiKey, modelId);
    case "openai":    return invokeOpenAI(messages, apiKey, modelId);
    case "anthropic": return invokeAnthropic(messages, apiKey, modelId);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};

export const streamDivert = async (
  provider: string,
  modelId: string,
  messages: BaseMessage[],
  apiKey: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> => {
  switch (provider) {
    case "groq":      return streamGroq(messages, apiKey, modelId, onChunk, onDone, onError);
    case "gemini":    return streamGoogle(messages, apiKey, modelId, onChunk, onDone, onError);
    case "openai":    return streamOpenAI(messages, apiKey, modelId, onChunk, onDone, onError);
    case "anthropic": return streamAnthropic(messages, apiKey, modelId, onChunk, onDone, onError);
    default:
      onError(new Error(`Unknown provider: ${provider}`));
  }
};