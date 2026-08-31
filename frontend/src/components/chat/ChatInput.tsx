import React, { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { ChatMessage, SelectedModel, UserApiKeys } from "@/types";
import { storage } from "@/utils/storage";
import { useAlert } from "@/components/common/CustomAlert";

interface ChatInputProps {
  selectedModel: SelectedModel | null;
  chats: ChatMessage[];
  setChats: (chats: ChatMessage[]) => void;
  onPersistMessages: (chats: ChatMessage[]) => void;
  systemPrompt?: string;
  onOpenSettings: () => void;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

export const ChatInput: React.FC<ChatInputProps> = ({
  selectedModel,
  chats,
  setChats,
  onPersistMessages,
  systemPrompt,
  onOpenSettings,
}) => {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { showAlert } = useAlert();

  // Clean up any in-flight requests or timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Auto-expand textarea up to max height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSend = async () => {
    if (!value.trim()) {
      return;
    }

    if (!selectedModel) {
      showAlert({
        title: "Select a Model",
        message: "Please configure an API Key in Settings or select an active model from the top bar to start chatting.",
        variant: "warning",
        buttons: [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", style: "default", onPress: onOpenSettings },
        ],
      });
      return;
    }

    const storedKeys = storage.getItem<UserApiKeys>("user_api_keys") || {};
    const specificApiKey = storedKeys[selectedModel.provider];

    if (!specificApiKey || specificApiKey.trim() === "") {
      showAlert({
        title: "API Key Required",
        message: `Please configure your API Key for ${selectedModel.provider.toUpperCase()} to continue using ${selectedModel.name ?? "this model"}.`,
        variant: "warning",
        buttons: [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", style: "default", onPress: onOpenSettings },
        ],
      });
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: value.trim() };
    const currentWithUser = [...chats, userMessage];

    // Optimistically show user message and placeholder assistant with cursor
    setChats([...currentWithUser, { role: "assistant", content: "", isStreaming: true }]);
    setValue("");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    timeoutRef.current = setTimeout(() => controller.abort(), 90000);

    let accumulated = "";

    try {
      const payload: any = {
        modelId: selectedModel.modelId,
        provider: selectedModel.provider,
        messages: currentWithUser,
        apiKey: specificApiKey,
      };

      if (systemPrompt && systemPrompt.trim()) {
        payload.systemPrompt = systemPrompt.trim();
      }

      const res = await fetch(`${BASE_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errJson;
        try {
          errJson = await res.json();
        } catch {
          // not JSON
        }
        throw new Error(errJson?.error || `Server responded with status ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value: chunkVal } = await reader.read();
          if (done) break;

          buffer += decoder.decode(chunkVal, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const dataContent = line.startsWith("data: ") ? line.slice(6) : line.slice(5);

            if (dataContent === "[DONE]") {
              break;
            }

            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (typeof parsed.text === "string") {
                accumulated += parsed.text;
                setChats([
                  ...currentWithUser,
                  { role: "assistant", content: accumulated, isStreaming: true },
                ]);
              }
            } catch (err: any) {
              if (err.message && !err.message.includes("is not valid JSON") && !err.message.includes("Unexpected token")) {
                throw err;
              }
            }
          }
        }
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const finalMessages: ChatMessage[] = [
        ...currentWithUser,
        { role: "assistant", content: accumulated },
      ];

      // Finalize message and trigger background persistence to storage
      setChats(finalMessages);
      onPersistMessages(finalMessages);
    } catch (err: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      let errorText = "Network Error: Could not reach the backend server.";
      if (err.name === "AbortError") {
        errorText = accumulated
          ? accumulated // If we already had tokens, keep what we got
          : "System API Error: Request was cancelled or timed out after 90s.";
      } else if (err.message) {
        errorText = `System API Error: ${err.message}`;
      }

      // Show error in local chat feed ONLY — do NOT persist error message to Firestore/localStorage
      setChats([
        ...currentWithUser,
        { role: "assistant", content: errorText },
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-[#1A1A1A] bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-[#1A1A1A] border border-[#262626] focus-within:border-[#06B6D4]/50 rounded-2xl p-2.5 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={isLoading}
          className="flex-1 max-h-44 bg-transparent text-[#F5F5F5] placeholder-[#666666] text-sm md:text-base outline-none resize-none px-2 py-1 leading-relaxed font-sans disabled:opacity-60"
        />
        {isLoading ? (
          <button
            onClick={handleStop}
            className="p-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl transition-all cursor-pointer flex-shrink-0 shadow-md shadow-red-500/20"
            title="Stop generating"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="p-2.5 bg-[#06B6D4] hover:bg-[#0891B2] disabled:opacity-30 disabled:hover:bg-[#06B6D4] text-[#0A0A0A] rounded-xl transition-all cursor-pointer flex-shrink-0"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
