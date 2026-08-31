import type { Model, Provider } from "../types/index";

const providers: Provider[] = [];

// --- Mutators ---

const addProvider = (id: string, name: string, logoUrl: string, models: Model[] = []) => {
  providers.push({ id, name, models, logoUrl });
};

const addModel = (id: string, name: string, providerId: string) => {
  const provider = providers.find((p) => p.id === providerId);
  if (!provider) throw new Error(`Provider "${providerId}" not found`);
  provider.models.push({ id, name, provider: providerId });
};

// --- Getters ---

const getProviders = (): Provider[] => providers;

const getProvider = (id: string): Provider | undefined =>
  providers.find((p) => p.id === id);

const getModels = (providerId: string): Model[] =>
  providers.find((p) => p.id === providerId)?.models ?? [];

const getAllModels = (): Model[] =>
  providers.flatMap((p) => p.models);

// --- Real Production Model Registries ---

// 1. Google Gemini
addProvider(
  "gemini",
  "Google Gemini",
  "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/gemini-color.png"
);
addModel("gemini-3.6-flash", "Gemini 3.6 Flash", "gemini");
addModel("gemini-3.5-flash-lite", "Gemini 3.5 Flash Lite", "gemini");
addModel("gemini-3-flash-preview", "Gemini 3 Flash Preview", "gemini");
addModel("gemini-3.1-flash-lite-preview", "Gemini 3.1 Flash Lite Preview", "gemini");
addModel("gemini-2.5-flash", "Gemini 2.5 Flash", "gemini");

// 2. Groq (Ultra-fast LPU inference)
addProvider(
  "groq",
  "Groq",
  "https://cdn.brandfetch.io/idxygbEPCQ/w/201/h/201/theme/dark/icon.png?c=1dxbfHSJFAPEGdCLU4o5B"
);
addModel("openai/gpt-oss-120b", "GPT OSS 120B (Groq)", "groq");
addModel("openai/gpt-oss-20b", "GPT OSS 20B (Groq)", "groq");

// 3. OpenAI
addProvider(
  "openai",
  "OpenAI",
  "https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-png/dark/openai.png"
);
addModel("gpt-4o", "GPT-4o", "openai");
addModel("gpt-4o-mini", "GPT-4o Mini", "openai");
addModel("o3-mini", "o3-mini", "openai");

// 4. Anthropic
addProvider(
  "anthropic",
  "Anthropic",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoQxsrnr_5qk5WWR94ALEy_4IL8J_TjI2PRA&s"
);
addModel("claude-3-7-sonnet-20250219", "Claude 3.7 Sonnet", "anthropic");
addModel("claude-3-5-sonnet-20241022", "Claude 3.5 Sonnet", "anthropic");
addModel("claude-3-5-haiku-20241022", "Claude 3.5 Haiku", "anthropic");

export { providers, getProviders, getProvider, getModels, getAllModels, addProvider, addModel };