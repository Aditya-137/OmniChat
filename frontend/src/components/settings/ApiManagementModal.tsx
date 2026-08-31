import React, { useState, useEffect } from "react";
import { X, Key, Check } from "lucide-react";
import { PROVIDERS_CONFIG, UserApiKeys } from "@/types";
import { ProviderLogo } from "../common/ProviderLogo";
import { storage } from "@/utils/storage";
import { useAlert } from "@/components/common/CustomAlert";

interface ApiManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiManagementModal: React.FC<ApiManagementModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<UserApiKeys>({
    groq: "",
    gemini: "",
    openai: "",
    anthropic: "",
  });
  const { showAlert } = useAlert();

  useEffect(() => {
    if (isOpen) {
      const stored = storage.getItem<UserApiKeys>("user_api_keys");
      if (stored) setKeys(stored);
    }
  }, [isOpen]);

  const handleSave = () => {
    storage.setItem("user_api_keys", keys);
    window.dispatchEvent(new Event("omni_keys_updated"));
    showAlert({
      title: "Saved!",
      message: "API Keys saved securely in browser storage.",
      variant: "success",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#06B6D4]/10 rounded-xl">
              <Key className="w-5 h-5 text-[#06B6D4]" />
            </div>
            <h2 className="text-lg font-bold text-white">API Key Management</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1E1E1E] rounded-lg text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          <p className="text-xs text-[#888888] leading-relaxed">
            Bring your own keys to power OmniChat directly without subscription fees. Left blank, the application tests against server reserve defaults.
          </p>

          {PROVIDERS_CONFIG.map((p) => {
            const hasKey = Boolean(keys[p.id]?.trim());
            return (
              <div
                key={p.id}
                className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-4 transition-all"
                style={{ borderLeftWidth: "4px", borderLeftColor: p.color }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <ProviderLogo uri={p.logo} name={p.name} color={p.color} className="w-5 h-5" />
                    <span className="text-sm font-bold" style={{ color: p.color }}>
                      {p.name}
                    </span>
                  </div>
                  {hasKey && (
                    <span className="text-[10px] font-bold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={keys[p.id] || ""}
                  onChange={(e) => setKeys({ ...keys, [p.id]: e.target.value })}
                  placeholder={`Enter ${p.name} Key (${p.placeholder})`}
                  className="w-full bg-[#1A1A1A] border border-[#262626] focus:border-[#06B6D4]/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#555555] outline-none font-mono"
                />
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-[#1E1E1E] bg-[#101010] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-sm font-semibold text-[#888888] hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-6 rounded-xl text-sm font-bold bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] transition-all cursor-pointer shadow-lg shadow-[#06B6D4]/10"
          >
            Save Configurations
          </button>
        </div>
      </div>
    </div>
  );
};
