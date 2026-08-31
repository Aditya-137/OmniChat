import React from "react";
import { Menu, ChevronDown, EyeOff, Terminal } from "lucide-react";
import { SelectedModel } from "@/types";
import { ProviderLogo } from "../common/ProviderLogo";

interface HeaderProps {
  selectedModel: SelectedModel | null;
  onOpenModelModal: () => void;
  onOpenSystemPromptModal: () => void;
  isDisappearing: boolean;
  onToggleDisappearing: () => void;
  hasSystemPrompt: boolean;
  onOpenDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModel,
  onOpenModelModal,
  onOpenSystemPromptModal,
  isDisappearing,
  onToggleDisappearing,
  hasSystemPrompt,
  onOpenDrawer,
}) => {
  return (
    <header className="h-14 border-b border-[#1A1A1A] bg-[#0A0A0A] flex items-center justify-between px-4 z-20">
      {/* Left button: Mobile Menu toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDrawer}
          className="md:hidden p-2 hover:bg-[#1A1A1A] rounded-xl text-[#F5F5F5] transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Model Selector Pill */}
      <button
        onClick={onOpenModelModal}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded-full transition-all cursor-pointer shadow-xs max-w-[240px] md:max-w-xs"
      >
        {selectedModel?.logoUrl ? (
          <ProviderLogo uri={selectedModel.logoUrl} name={selectedModel.name ?? "Model"} className="w-4 h-4" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-[#06B6D4]/20 flex items-center justify-center text-[10px] font-bold text-[#06B6D4]">
            AI
          </div>
        )}
        <span className="text-sm font-semibold text-white truncate">
          {selectedModel?.name ?? "Select a model"}
        </span>
        <ChevronDown className="w-4 h-4 text-[#888888] flex-shrink-0" />
      </button>

      {/* Right: Actions (Disappearing mode & System Prompt) */}
      <div className="flex items-center gap-1.5">
        {/* Disappearing Chat Toggle */}
        <button
          onClick={onToggleDisappearing}
          title={isDisappearing ? "Disappearing Mode Active" : "Enable Disappearing Chat"}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isDisappearing
              ? "bg-[#A855F7]/15 border-[#A855F7]/40 text-[#A855F7]"
              : "bg-transparent border-transparent hover:bg-[#1A1A1A] text-[#666666] hover:text-[#AAAAAA]"
          }`}
        >
          <EyeOff className="w-4 h-4" />
        </button>

        {/* System Prompt Modal Button */}
        <button
          onClick={onOpenSystemPromptModal}
          title="Set System Prompt"
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            hasSystemPrompt
              ? "bg-[#06B6D4]/15 border-[#06B6D4]/40 text-[#06B6D4]"
              : "bg-transparent border-transparent hover:bg-[#1A1A1A] text-[#666666] hover:text-[#AAAAAA]"
          }`}
        >
          <Terminal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
