import React from "react";
import { AlertCircle } from "lucide-react";
import { ChatMessage } from "@/types";
import { MarkdownContent } from "./MarkdownContent";

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const contentStr = message.content || "";
  const isError =
    contentStr.startsWith("System API Error:") ||
    contentStr.startsWith("Network Error:");

  if (isUser) {
    return (
      <div className="flex justify-end my-3">
        <div className="bg-[#06B6D4] text-black font-normal rounded-2xl rounded-tr-xs px-4 py-3 max-w-[85%] md:max-w-[75%] shadow-md">
          <MarkdownContent content={contentStr} isUser={true} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start my-3">
        <div className="bg-[#2A1A1A] border border-[#EF4444] rounded-2xl rounded-tl-xs px-4 py-3 max-w-[85%] md:max-w-[75%] shadow-md">
          <div className="flex items-center gap-2 mb-2 text-[#EF4444] font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Error</span>
          </div>
          <MarkdownContent content={contentStr} isUser={false} />
        </div>
      </div>
    );
  }

  // Waiting for first stream token from the model
  if (message.isStreaming && !contentStr.trim()) {
    return (
      <div className="flex justify-start my-3">
        <div className="bg-[#1E1E1E] border border-[#262626] rounded-2xl rounded-tl-xs px-4 py-3.5 shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-3">
      <div className="bg-[#1E1E1E] border border-[#262626] text-[#F5F5F5] rounded-2xl rounded-tl-xs px-4 py-3 max-w-[85%] md:max-w-[75%] shadow-md relative">
        <MarkdownContent content={contentStr} isUser={false} />
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#06B6D4] animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
};
