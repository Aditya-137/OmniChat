import React, { useState, useEffect } from "react";
import { Terminal, X, Trash2, Check } from "lucide-react";
import { storage } from "@/utils/storage";

export const SYSTEM_PROMPT_KEY = "omni_system_prompt";
export const MAX_SYSTEM_PROMPT_CHARS = 4000;

interface SystemPromptModalProps {
  visible: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSave: (prompt: string) => void;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  visible,
  onClose,
  systemPrompt,
  onSave,
}) => {
  const [draft, setDraft] = useState(systemPrompt);

  useEffect(() => {
    if (visible) {
      setDraft(systemPrompt);
    }
  }, [visible, systemPrompt]);

  const isOverLimit = draft.length > MAX_SYSTEM_PROMPT_CHARS;

  const handleSave = () => {
    if (isOverLimit) return;
    storage.setItem(SYSTEM_PROMPT_KEY, draft);
    onSave(draft);
    onClose();
  };

  const handleClear = () => {
    setDraft("");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#06B6D4]/10 rounded-xl">
              <Terminal className="w-5 h-5 text-[#06B6D4]" />
            </div>
            <h2 className="text-lg font-bold text-white">System Prompt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1E1E1E] rounded-lg text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3">
          <p className="text-xs text-[#888888] leading-relaxed">
            Set custom instructions that the AI will follow for every message in this session.
          </p>

          <div className={`relative bg-[#0A0A0A] border ${isOverLimit ? "border-[#EF4444]" : "border-[#222222] focus-within:border-[#06B6D4]/50"} rounded-xl p-3`}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. You are a helpful coding assistant. Always respond in markdown..."
              rows={6}
              className="w-full bg-transparent text-sm text-[#F5F5F5] placeholder-[#555555] outline-none resize-none leading-relaxed font-sans"
              autoFocus
            />
            <div className={`text-right text-[11px] pt-1 ${isOverLimit ? "text-[#EF4444] font-semibold" : "text-[#555555]"}`}>
              {draft.length} / {MAX_SYSTEM_PROMPT_CHARS} chars
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E1E1E] bg-[#101010] flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-[#EF4444] bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-sm font-semibold text-[#888888] hover:bg-[#1E1E1E] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isOverLimit}
              className="flex items-center gap-1.5 py-2 px-5 rounded-xl text-sm font-bold bg-[#06B6D4] hover:bg-[#0891B2] disabled:opacity-40 disabled:hover:bg-[#06B6D4] text-[#0A0A0A] transition-all cursor-pointer shadow-lg shadow-[#06B6D4]/10"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
