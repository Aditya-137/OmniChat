import React from "react";
import { MessageSquare, Plus, Key, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useConversation } from "@/context/ConversationContext";
import { useAlert } from "@/components/common/CustomAlert";
import { formatTime } from "@/utils/time";

interface SidebarProps {
  onNavigate?: () => void;
  onOpenApiModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onOpenApiModal }) => {
  const { user, logOut } = useAuth();
  const {
    conversations,
    currentConversationId,
    isLoading,
    setCurrentConversationId,
    clearCurrentConversation,
    deleteConversation,
  } = useConversation();
  const { showAlert } = useAlert();

  const handleNewChat = () => {
    clearCurrentConversation();
    onNavigate?.();
  };

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    showAlert({
      title: "Delete Conversation",
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      variant: "destructive",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteConversation(id),
        },
      ],
    });
  };

  return (
    <div className="flex flex-col h-full p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-1 px-2">
        <MessageSquare className="w-6 h-6 text-[#06B6D4]" />
        <span className="text-lg font-bold text-white tracking-tight">OmniChat</span>
      </div>
      {user?.email && (
        <p className="text-xs text-[#666666] mb-4 px-2 truncate">{user.email}</p>
      )}

      {/* + New Chat Button */}
      <button
        onClick={handleNewChat}
        className="w-full py-2.5 px-4 mb-5 border border-[#2A2A2A] hover:border-[#06B6D4]/50 bg-transparent hover:bg-[#1A1A1A] rounded-xl text-sm font-semibold text-[#F5F5F5] flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 text-[#06B6D4]" />
        New Chat
      </button>

      {/* Recent Chats Section */}
      <div className="text-[11px] font-bold text-[#666666] uppercase tracking-wider mb-2 px-2">
        Recent Chats
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#141414] animate-pulse space-y-2 border border-[#1E1E1E]">
                <div className="h-3.5 bg-[#262626] rounded w-3/4" />
                <div className="flex items-center gap-2">
                  <div className="h-2.5 bg-[#262626] rounded w-12" />
                  <div className="h-2.5 bg-[#262626] rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-[#444444] italic p-3">No conversations yet</p>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === currentConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => {
                  setCurrentConversationId(conv.id);
                  onNavigate?.();
                }}
                className={`group relative flex flex-col p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isActive ? "bg-[#1A1A1A]" : "hover:bg-[#141414]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm text-[#F5F5F5] font-medium truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => handleDelete(e, conv.id, conv.title)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-md transition-opacity cursor-pointer"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#888888]">
                  <span className="bg-[#06B6D4]/20 text-[#06B6D4] px-1.5 py-0.5 rounded-md font-bold text-[10px] uppercase">
                    {conv.provider}
                  </span>
                  <span>{formatTime(conv.updatedAt)}</span>
                  <span className="text-[#555555]">· {conv.messageCount} msgs</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-4 border-t border-[#1A1A1A] space-y-1 mt-auto">
        <button
          onClick={() => {
            onOpenApiModal();
            onNavigate?.();
          }}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl text-sm text-[#CCCCCC] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
        >
          <Key className="w-4 h-4 text-[#888888]" />
          API Keys
        </button>
        <button
          onClick={logOut}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl text-sm text-[#EF4444] hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#EF4444]" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
