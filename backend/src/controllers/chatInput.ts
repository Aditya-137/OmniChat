import type { Request, Response } from "express";
import { divert } from "../services/chatServices";
import { getProviders } from "../config/llm";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

const SYSTEM_PROMPT_MAX_LENGTH = 4000;

export const controlChat = async (req: Request, res: Response): Promise<any> => {
  try {
    const { messages, modelId, provider, apiKey, systemPrompt } = req.body;

    if (!messages || !modelId || !provider || !apiKey) {
      return res.status(400).json({
        error: "Missing required fields (messages, modelId, provider, apiKey)",
        code: "VALIDATION_ERROR",
      });
    }

    if (systemPrompt && systemPrompt.length > SYSTEM_PROMPT_MAX_LENGTH) {
      return res.status(400).json({
        error: `System prompt exceeds ${SYSTEM_PROMPT_MAX_LENGTH} character limit`,
        code: "PROMPT_TOO_LONG",
      });
    }

    const langchainMessages = messages.map((m: any) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    );

    if (systemPrompt && systemPrompt.trim()) {
      langchainMessages.unshift(new SystemMessage(systemPrompt.trim()));
    }

    const response = await divert(provider, modelId, langchainMessages, apiKey);

    if (!response) {
      console.error("[controlChat] Empty response from provider:", provider, modelId);
      return res.status(500).json({ error: "Model returned an empty response", code: "EMPTY_RESPONSE" });
    }

    return res.json({ response });
  } catch (err: any) {
    console.error("[controlChat error]", err.message);
    return res.status(500).json({ error: err.message ?? "Provider error", code: "PROVIDER_ERROR" });
  }
};

export async function controlModel(req: Request, res: Response) {
  const providers = getProviders();
  res.json(providers);
}