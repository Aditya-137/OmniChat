import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseMessage } from "@langchain/core/messages";
import { extractContentString } from "../utils/contentExtractor";

const resolveKey = (apiKey: string) =>
  apiKey === "mock-key" ? process.env.GOOGLE_API_KEY : apiKey;

export const invokeGoogle = async (messages: BaseMessage[], apiKey: string, modelId: string): Promise<string> => {
  const llm = new ChatGoogleGenerativeAI({ apiKey: resolveKey(apiKey), model: modelId });
  const response = await llm.invoke(messages);
  return extractContentString(response.content);
};

export const streamGoogle = async (
  messages: BaseMessage[],
  apiKey: string,
  modelId: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> => {
  try {
    const llm = new ChatGoogleGenerativeAI({ apiKey: resolveKey(apiKey), model: modelId });
    const stream = await llm.stream(messages);
    for await (const chunk of stream) {
      const text = extractContentString(chunk.content);
      if (text) onChunk(text);
    }
    onDone();
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
};