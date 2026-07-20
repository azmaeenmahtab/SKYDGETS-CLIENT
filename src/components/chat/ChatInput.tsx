"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Button, TextArea } from "@heroui/react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isDisabled = false,
  placeholder = "Ask about products, orders, or gadget recommendations…",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue("");
    // Refocus for the next message
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2 p-3 border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <TextArea
        ref={textareaRef}
        id="chat-input"
        aria-label="Chat message"
        value={value}
        // FIXED: Replaced onValueChange with standard onChange
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled} // FIXED: standard HTML element matching prop
        rows={1}
        // FIXED: Combined custom slots into a standard className utility
        className="flex-1 bg-white/10 border border-white/15 hover:border-violet-400/60 focus-within:border-violet-500 transition-colors rounded-xl p-2 text-sm text-foreground placeholder:text-foreground/40 resize-none outline-none shadow-none text-white"
      />

      {/* Send button */}
      <Button
        id="chat-send-btn"
        isIconOnly
        onPress={handleSend}
        isDisabled={isDisabled || !value.trim()}
        className={`
          h-10 w-10 min-w-10 rounded-xl shrink-0 transition-all duration-200
          ${
            value.trim() && !isDisabled
              ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40 scale-100 opacity-100"
              : "bg-white/10 text-foreground/30 scale-95 opacity-60"
          }
        `}
        aria-label="Send message"
      >
        {/* Paper-plane icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 text-white translate-x-px -translate-y-px"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </Button>
    </div>
  );
}