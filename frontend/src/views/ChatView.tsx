import React, { useState, useEffect, useCallback } from "react";
import { ChatMessage, SelectedModel, UserApiKeys } from "@/types";
import { Header } from "../components/layout/Header";
import { ChatArea } from "../components/chat/ChatArea";
import { ChatInput } from "../components/chat/ChatInput";
import { DisappearingBanner } from "../components/chat/DisappearingBanner";
import { ModelSelectorModal } from "../components/modals/ModelSelectorModal";
import { SystemPromptModal, SYSTEM_PROMPT_KEY } from "../components/modals/SystemPromptModal";
import { useConversation } from "@/context/ConversationContext";
import { useAlert } from "@/components/common/CustomAlert";
import { storage } from "@/utils/storage";

interface ChatViewProps {
  onOpenDrawer?: () => void;
  onOpenApiModal: () => void;
}

const SELECTED_MODEL_KEY = "omni_selected_model";
const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

export const ChatView: React.FC<ChatViewProps> = ({ onOpenDrawer, onOpenApiModal }) => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(() => {
    return storage.getItem<SelectedModel>(SELECTED_MODEL_KEY);
  });
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [systemPromptModalVisible, setSystemPromptModalVisible] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isDisappearing, setIsDisappearing] = useState(false);

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    loadConversation,
    saveMessages,
  } = useConversation();
  const { showAlert } = useAlert();

  // Load saved system prompt from storage on mount
  useEffect(() => {
    const saved = storage.getItem<string>(SYSTEM_PROMPT_KEY);
    if (saved) setSystemPrompt(saved);
  }, []);

  // Update and persist selected model
  const handleModelChange = useCallback((model: SelectedModel) => {
    setSelectedModel(model);
    storage.setItem(SELECTED_MODEL_KEY, model);
  }, []);

  // Auto-resolve active model based on user-configured API keys
  const resolveActiveModel = useCallback(async () => {
    try {
      const storedKeys = storage.getItem<UserApiKeys>("user_api_keys") || {};
      const res = await fetch(`${BASE_URL}/models`);
      const providerData = await res.json();

      let allValidModels: SelectedModel[] = [];
      if (Array.isArray(providerData)) {
        providerData.forEach((p: any) => {
          if (storedKeys[p.id] && storedKeys[p.id]?.trim() !== "") {
            p.models?.forEach((m: any) => {
              allValidModels.push({
                modelId: m.id,
                provider: p.id,
                name: m.name,
                logoUrl: p.logoUrl,
              });
            });
          }
        });
      }

      setSelectedModel((current) => {
        // If current selected model still has a valid key, keep it
        if (
          current &&
          allValidModels.some(
            (m) => m.modelId === current.modelId && m.provider === current.provider
          )
        ) {
          return current;
        }

        // Check if previously saved model in localStorage is valid
        const saved = storage.getItem<SelectedModel>(SELECTED_MODEL_KEY);
        if (
          saved &&
          allValidModels.some(
            (m) => m.modelId === saved.modelId && m.provider === saved.provider
          )
        ) {
          return saved;
        }

        // Auto-select first model that has a valid API key (e.g. Groq, OpenAI, etc.)
        if (allValidModels.length > 0) {
          const first = allValidModels[0];
          storage.setItem(SELECTED_MODEL_KEY, first);
          return first;
        }

        return null;
      });
    } catch (err) {
      console.error("Failed to auto-resolve active model:", err);
    }
  }, []);

  // Resolve on initial load and whenever API keys are updated
  useEffect(() => {
    resolveActiveModel();

    const handleKeysUpdated = () => {
      resolveActiveModel();
    };

    window.addEventListener("omni_keys_updated", handleKeysUpdated);
    window.addEventListener("storage", handleKeysUpdated);

    return () => {
      window.removeEventListener("omni_keys_updated", handleKeysUpdated);
      window.removeEventListener("storage", handleKeysUpdated);
    };
  }, [resolveActiveModel]);

  // When currentConversationId changes from the sidebar, load its messages and sync model
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId).then((msgs) => {
        setChats(msgs);
        setIsDisappearing(false);

        // Sync model to the conversation's model if available
        const currentConv = conversations.find((c) => c.id === currentConversationId);
        if (currentConv && currentConv.modelId && currentConv.provider) {
          const storedKeys = storage.getItem<UserApiKeys>("user_api_keys") || {};
          if (storedKeys[currentConv.provider]) {
            handleModelChange({
              modelId: currentConv.modelId,
              provider: currentConv.provider,
              name: currentConv.modelId,
            });
          }
        }
      });
    } else {
      setChats([]);
    }
  }, [currentConversationId, loadConversation, conversations, handleModelChange]);

  const toggleDisappearing = () => {
    if (!isDisappearing) {
      setChats([]);
      setCurrentConversationId(null);
      setIsDisappearing(true);
    } else if (chats.length === 0) {
      setIsDisappearing(false);
    } else {
      showAlert({
        title: "Exit Disappearing Chat?",
        message: "All messages in this session will be permanently deleted. This cannot be undone.",
        variant: "destructive",
        buttons: [
          { text: "Stay", style: "cancel" },
          {
            text: "Exit & Clear",
            style: "destructive",
            onPress: () => {
              setChats([]);
              setCurrentConversationId(null);
              setIsDisappearing(false);
            },
          },
        ],
      });
    }
  };

  const handlePersistMessages = useCallback(
    async (finalChats: ChatMessage[]) => {
      if (isDisappearing) return;

      if (finalChats.length >= 2 && selectedModel) {
        let convId = currentConversationId;
        if (!convId) {
          convId = createNewConversation(selectedModel.modelId, selectedModel.provider);
          setCurrentConversationId(convId);
        }
        await saveMessages(convId, finalChats, selectedModel.modelId, selectedModel.provider);
      }
    },
    [currentConversationId, selectedModel, isDisappearing, createNewConversation, saveMessages, setCurrentConversationId]
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0A0A] overflow-hidden">
      {/* Top Header */}
      <Header
        selectedModel={selectedModel}
        onOpenModelModal={() => setModelModalVisible(true)}
        onOpenSystemPromptModal={() => setSystemPromptModalVisible(true)}
        isDisappearing={isDisappearing}
        onToggleDisappearing={toggleDisappearing}
        hasSystemPrompt={Boolean(systemPrompt.trim())}
        onOpenDrawer={onOpenDrawer}
      />

      {/* Disappearing mode banner */}
      {isDisappearing && <DisappearingBanner />}

      {/* Message feed */}
      <ChatArea chats={chats} onOpenSettings={onOpenApiModal} />

      {/* Message input */}
      <ChatInput
        selectedModel={selectedModel}
        chats={chats}
        setChats={setChats}
        onPersistMessages={handlePersistMessages}
        systemPrompt={systemPrompt}
        onOpenSettings={onOpenApiModal}
      />

      {/* Model Selection Modal */}
      <ModelSelectorModal
        visible={modelModalVisible}
        value={selectedModel}
        onChange={handleModelChange}
        onClose={() => setModelModalVisible(false)}
        onOpenSettings={onOpenApiModal}
      />

      {/* System Prompt Modal */}
      <SystemPromptModal
        visible={systemPromptModalVisible}
        onClose={() => setSystemPromptModalVisible(false)}
        systemPrompt={systemPrompt}
        onSave={setSystemPrompt}
      />
    </div>
  );
};
