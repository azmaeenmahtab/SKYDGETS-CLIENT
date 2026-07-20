"use client";

/**
 * TypingIndicator — three animated dots shown while isStreaming is true.
 * Each dot bounces in sequence to create a classic "bot is typing" effect.
 */
export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      {/* Bot avatar — mirrors ChatBubble assistant avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md text-xs font-bold text-white select-none mt-0.5">
        AI
      </div>

      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white/10 dark:bg-white/[0.07] border border-white/10 px-4 py-3 shadow-sm backdrop-blur-sm">
        <span
          className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: "180ms", animationDuration: "1s" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: "360ms", animationDuration: "1s" }}
        />
      </div>
    </div>
  );
}
