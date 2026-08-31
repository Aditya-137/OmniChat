import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import { ChatBubble } from "./ChatBubble";
import { MessageSquare } from "lucide-react";

interface ChatAreaProps {
  chats: ChatMessage[];
  onOpenSettings?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ chats }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-4 border border-[#06B6D4]/20 shadow-lg shadow-[#06B6D4]/5">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">OmniChat</h2>
        <p className="text-sm text-[#888888] max-w-sm leading-relaxed mb-6">
          Bring your own keys to converse with models from Google, Groq, OpenAI, Anthropic, and xAI in one place.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 custom-scrollbar">
      <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
        {chats.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
