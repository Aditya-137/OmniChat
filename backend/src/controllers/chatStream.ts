import type { Request, Response } from "express";
import { streamDivert } from "../services/chatServices";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

const SYSTEM_PROMPT_MAX_LENGTH = 4000;

/**
 * POST /chat/stream
 *
 * Streams the AI response as Server-Sent Events (SSE).
 *
 * Events are JSON-encoded for lossless multi-line, whitespace, and unicode transport:
 *   data: {"text": " token "}
 *   data: [DONE]
 *   data: {"error": "..."}
 */
export const controlChatStream = async (req: Request, res: Response): Promise<void> => {
  const { messages, modelId, provider, apiKey, systemPrompt } = req.body;

  if (!messages || !modelId || !provider || !apiKey) {
    res.status(400).json({
      error: "Missing required fields (messages, modelId, provider, apiKey)",
      code: "VALIDATION_ERROR",
    });
    return;
  }

  if (systemPrompt && systemPrompt.length > SYSTEM_PROMPT_MAX_LENGTH) {
    res.status(400).json({
      error: `System prompt exceeds ${SYSTEM_PROMPT_MAX_LENGTH} character limit`,
      code: "PROMPT_TOO_LONG",
    });
    return;
  }

  // Set SSE headers before writing anything
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const langchainMessages = messages.map((m: any) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );

  if (systemPrompt && systemPrompt.trim()) {
    langchainMessages.unshift(new SystemMessage(systemPrompt.trim()));
  }

  const sendChunk = (text: string) => {
    if (text === "") return;
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  };

  const sendDone = () => {
    res.write("data: [DONE]\n\n");
    res.end();
  };

  const sendError = (err: Error) => {
    console.error("[chatStream error]", err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  };

  req.on("close", () => {
    // Client connection closed
  });

  await streamDivert(provider, modelId, langchainMessages, apiKey, sendChunk, sendDone, sendError);
};
