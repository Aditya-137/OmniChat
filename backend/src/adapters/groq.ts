import { ChatGroq } from "@langchain/groq";
import type { BaseMessage } from "@langchain/core/messages";
import { extractContentString } from "../utils/contentExtractor";

export const invokeGroq = async (messages: BaseMessage[], apiKey: string, modelId: string): Promise<string> => {
  const llm = new ChatGroq({ apiKey, model: modelId });
  const response = await llm.invoke(messages);
  return extractContentString(response.content);
};

export const streamGroq = async (
  messages: BaseMessage[],
  apiKey: string,
  modelId: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> => {
  try {
    const llm = new ChatGroq({ apiKey, model: modelId });
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