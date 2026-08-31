import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

interface MarkdownContentProps {
  content: string;
  isUser: boolean;
}

const CodeBlock = ({ className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const textToCopy = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (match) {
    return (
      <div className="relative group my-3 rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#121212]">
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#181818] border-b border-[#262626] text-xs text-[#888888]">
          <span className="font-mono">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <pre className="p-3.5 overflow-x-auto text-sm">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <code
      className="px-1.5 py-0.5 rounded text-sm font-mono bg-[#262626] text-[#06B6D4]"
      {...props}
    >
      {children}
    </code>
  );
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, isUser }) => {
  return (
    <div className={`prose prose-invert max-w-none text-sm md:text-base leading-relaxed ${isUser ? "text-black" : "text-[#F5F5F5]"}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            if (!match) {
              return (
                <code
                  className={`px-1.5 py-0.5 rounded text-xs font-mono font-medium ${
                    isUser ? "bg-[#048eab] text-black" : "bg-[#262626] text-[#06B6D4]"
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 border border-[#262626] rounded-xl">
                <table className="w-full text-left text-sm border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="bg-[#1C1C1C] px-3.5 py-2 border-b border-[#262626] font-semibold text-white">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3.5 py-2 border-b border-[#1E1E1E] text-[#DDD]">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-[#06B6D4] pl-4 py-1.5 my-3 bg-[#06B6D4]/5 rounded-r text-[#CCC]">
                {children}
              </blockquote>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
