"use client";

/**
 * ChatWidget — the floating chat button + panel mounted globally in Providers.
 *
 * Behaviour:
 *   - Floating button bottom-right (z-50) that toggles the panel open/closed.
 *   - Panel slides up from the bottom-right corner with a smooth animation.
 *   - Shows ChatBubble for each message, TypingIndicator while streaming,
 *     follow-up suggestion chips after each response, and ChatInput at the bottom.
 *   - Auto-scrolls to the latest message as tokens arrive.
 *   - Displays an unread dot on the FAB when the panel is closed and new
 *     assistant messages have arrived.
 */
import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Button } from "@heroui/react";
import { useChatSession } from "@/hooks/useChatSession";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const {
    messages,
    isStreaming,
    suggestions,
    isLoadingHistory,
    sendUserMessage,
  } = useChatSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  // ── Auto-scroll to bottom when messages grow ──────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // ── Unread dot when panel is closed and new assistant messages arrive ──────
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      !isOpen &&
      messages.length > prevMessageCountRef.current &&
      lastMsg?.role === "assistant" &&
      lastMsg?.content
    ) {
      setHasUnread(true);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      sendUserMessage(text);
    },
    [sendUserMessage]
  );

  const handleSuggestion = useCallback(
    (text: string) => {
      sendUserMessage(text);
    },
    [sendUserMessage]
  );

  return (
    <>
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="chat-panel"
          className="
            fixed bottom-24 right-4 z-50
            w-[360px] max-w-[calc(100vw-2rem)]
            flex flex-col
            rounded-2xl overflow-hidden
            border border-white/10
            bg-gradient-to-b from-zinc-900/95 to-black/95
            shadow-2xl shadow-black/60
            backdrop-blur-xl
            animate-in slide-in-from-bottom-4 fade-in duration-200
          "
          style={{ height: "min(560px, calc(100dvh - 120px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-violet-950/80 to-indigo-950/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
                {/* Pulsing online indicator */}
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-black shadow" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.946-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Skybot</p>
                <p className="text-[10px] text-emerald-400 leading-none mt-0.5">
                  SKYDGETS AI Assistant
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              id="chat-close-btn"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : messages.length === 0 ? (
              /* Welcome state */
              <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-7 w-7 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.946-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="">
                  <p className="font-semibold text-white text-sm">
                    Hi, I&apos;m Skybot!
                  </p>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Ask me about phones, accessories, order status, or gadget
                    recommendations. I&apos;ll search the real catalog for you.
                  </p>
                </div>
                {/* Quick starter prompts */}
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  {[
                    "Show me phones under ৳15,000",
                    "Recommend a gaming gadget",
                    "What monitors do you have?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 hover:text-white hover:border-violet-500/50 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator while streaming and the placeholder is empty */}
                {isStreaming &&
                  messages[messages.length - 1]?.role === "assistant" &&
                  messages[messages.length - 1]?.content === "" && (
                    <TypingIndicator />
                  )}

                {/* Suggested follow-up chips */}
                {suggestions.length > 0 && !isStreaming && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        id={`suggestion-${i}`}
                        onClick={() => handleSuggestion(s)}
                        className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 hover:bg-violet-500/20 hover:border-violet-400 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSend} isDisabled={isStreaming} />
        </div>
      )}

      {/* ── Floating Action Button ──────────────────────────────────────────── */}
      <Button
        id="chat-fab"
        isIconOnly
        onPress={isOpen ? () => setIsOpen(false) : handleOpen}
        className="
          fixed bottom-5 right-5 z-50
          h-14 w-14 rounded-2xl
          bg-gradient-to-br from-violet-600 to-indigo-600
          shadow-xl shadow-violet-900/50
          hover:shadow-violet-700/60 hover:scale-105
          active:scale-95
          transition-all duration-200
        "
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-black animate-pulse" />
        )}

        {/* Toggle icon: X when open, chat bubble when closed */}
        <span
          className={`transition-all duration-300 ${isOpen ? "rotate-0 scale-100" : "rotate-0 scale-100"}`}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-6 w-6 text-white"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-white"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.946-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </Button>
    </>
  );
}
