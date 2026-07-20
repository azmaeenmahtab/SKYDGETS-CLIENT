"use client";

import { type ChatMessage } from "@/hooks/useChatSession";
import { cn } from "@heroui/react";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar — bot only */}
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md text-xs font-bold text-white select-none mt-0.5">
          AI
        </div>
      )}

      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words",
          isUser
            ? "rounded-tr-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md"
            : "rounded-tl-sm bg-white/10 dark:bg-white/[0.07] text-white border border-white/10 shadow-sm backdrop-blur-sm"
        )}
      >
        {/* Render content — preserve newlines from the model */}
        {message.content ? (
          message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))
        ) : (
          // Empty content = still streaming, show a blinking cursor
          <span className="inline-block h-3.5 w-0.5 bg-current opacity-70 animate-pulse" />
        )}
      </div>

      {/* Avatar — user only */}
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-md text-xs font-bold text-white select-none mt-0.5">
          You
        </div>
      )}
    </div>
  );
}
