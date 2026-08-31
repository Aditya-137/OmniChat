import React, { useEffect, useState } from "react";
import { X, Check, Key } from "lucide-react";
import { SelectedModel, UserApiKeys } from "@/types";
import { ProviderLogo } from "../common/ProviderLogo";
import { storage } from "@/utils/storage";

interface ModelSelectorModalProps {
  visible: boolean;
  value: SelectedModel | null;
  onChange: (value: SelectedModel) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  visible,
  value,
  onChange,
  onClose,
  onOpenSettings,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      if (!visible) return;
      setLoading(true);
      try {
        const storedKeys = storage.getItem<UserApiKeys>("user_api_keys") || {};
        const res = await fetch(`${BASE_URL}/models`);
        const providerData = await res.json();

        let allModels: any[] = [];
        if (Array.isArray(providerData)) {
          providerData.forEach((p: any) => {
            if (storedKeys[p.id] && storedKeys[p.id]?.trim() !== "") {
              allModels = allModels.concat(
                p.models.map((m: any) => ({
                  ...m,
                  providerName: p.name,
                  logoUrl: p.logoUrl,
                }))
              );
            }
          });
        }

        setItems(allModels);

        if (allModels.length > 0 && !value) {
          onChange({
            modelId: allModels[0].id,
            provider: allModels[0].provider,
            name: allModels[0].name,
            logoUrl: allModels[0].logoUrl,
          });
        }
      } catch (error) {
        console.error("Failed to fetch models or keys:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1E1E1E]">
          <h2 className="text-base font-bold text-white">Select Model</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1E1E1E] rounded-lg text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-sm text-[#888888]">Loading available models...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mx-auto">
                <Key className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">No active models found</p>
              <p className="text-xs text-[#888888] leading-relaxed max-w-xs mx-auto">
                Configure your API keys in settings to unlock models from Groq, Google Gemini, OpenAI, and Anthropic.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="mt-2 py-2 px-4 rounded-xl text-xs font-bold bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                Go to API Settings
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isSelected = value?.modelId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onChange({
                      modelId: item.id,
                      provider: item.provider,
                      name: item.name,
                      logoUrl: item.logoUrl,
                    });
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? "bg-[#262626]" : "hover:bg-[#1C1C1C]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProviderLogo uri={item.logoUrl} name={item.providerName ?? item.name} className="w-6 h-6" />
                    <div className="truncate">
                      <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                      <div className="text-xs text-[#888888] capitalize">{item.providerName}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-[#06B6D4] flex-shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
