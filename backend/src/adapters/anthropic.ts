import { ChatAnthropic } from "@langchain/anthropic";
import type { BaseMessage } from "@langchain/core/messages";
import { extractContentString } from "../utils/contentExtractor";

export const invokeAnthropic = async (messages: BaseMessage[], apiKey: string, modelId: string): Promise<string> => {
  const llm = new ChatAnthropic({ apiKey, model: modelId });
  const response = await llm.invoke(messages);
  return extractContentString(response.content);
};

export const streamAnthropic = async (
  messages: BaseMessage[],
  apiKey: string,
  modelId: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> => {
  try {
    const llm = new ChatAnthropic({ apiKey, model: modelId });
    const stream = await llm.stream(messages);
    for await (const chunk of stream) {
      // Anthropic streams may include thinking blocks — extractContentString filters them
      const text = extractContentString(chunk.content);
      if (text) onChunk(text);
    }
    onDone();
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
};
