"use client";

/**
 * useChatSession — the core hook powering the chat widget.
 *
 * Manages:
 *   - messages[]       — grows as the user sends and as tokens stream in
 *   - isStreaming       — true while an assistant reply is being received
 *   - suggestions[]    — follow-up prompts, cleared on each new user message
 *   - sessionId        — created/restored from localStorage on mount
 *
 * Streaming strategy: each incoming token is appended to the LAST assistant
 * message in the array (the one added optimistically before the stream starts),
 * so the UI updates character-by-character without waiting for the full response.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  createSession,
  fetchMessages,
  sendMessage,
  getStoredSessionId,
  storeSessionId,
  clearStoredSessionId,
  type ChatMessagePayload,
} from "@/lib/api/chat";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Ref to avoid stale closure in the streaming callbacks
  const streamingAssistantId = useRef<string | null>(null);

  // ── On mount: restore or create a session ──────────────────────────────────
  useEffect(() => {
    async function initSession() {
      const stored = getStoredSessionId();

      if (stored) {
        setSessionId(stored);
        // Load existing message history
        setIsLoadingHistory(true);
        try {
          const history = await fetchMessages(stored);
          setMessages(
            history
              .filter((m) => m.role === "user" || m.role === "assistant")
              .map((m: ChatMessagePayload) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
                createdAt: new Date(m.createdAt),
              }))
          );
        } catch {
          // Session likely expired or belongs to a different guest.
          // Clear it and start fresh.
          clearStoredSessionId();
          const newId = await createSession();
          storeSessionId(newId);
          setSessionId(newId);
          setMessages([]);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        // Brand new session
        try {
          const newId = await createSession();
          storeSessionId(newId);
          setSessionId(newId);
        } catch (err) {
          console.error("Failed to create chat session:", err);
        }
      }
    }

    initSession();
  }, []);

  // ── sendUserMessage ────────────────────────────────────────────────────────
  const sendUserMessage = useCallback(
    async (messageText: string) => {
      if (!sessionId || isStreaming || !messageText.trim()) return;

      // Clear suggestions on each new user message
      setSuggestions([]);

      // Optimistically add user message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: messageText.trim(),
        createdAt: new Date(),
      };

      // Add a blank assistant message placeholder that will fill with tokens
      const assistantPlaceholderId = `assistant-${Date.now()}`;
      streamingAssistantId.current = assistantPlaceholderId;

      const assistantMsg: ChatMessage = {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        await sendMessage(
          sessionId,
          messageText.trim(),
          // onToken — append each chunk to the streaming assistant message
          (text: string) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingAssistantId.current
                  ? { ...m, content: m.content + text }
                  : m
              )
            );
          },
          // onSuggestions
          (newSuggestions: string[]) => {
            setSuggestions(newSuggestions);
          },
          // onDone
          () => {
            setIsStreaming(false);
            streamingAssistantId.current = null;
          }
        );
      } catch (err) {
        console.error("Chat send error:", err);
        // Replace placeholder with an error message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? {
                  ...m,
                  content:
                    "Sorry, I ran into a problem. Please try again in a moment.",
                }
              : m
          )
        );
        setIsStreaming(false);
        streamingAssistantId.current = null;
      }
    },
    [sessionId, isStreaming]
  );

  // ── resetSession — start a brand new conversation ─────────────────────────
  const resetSession = useCallback(async () => {
    clearStoredSessionId();
    setMessages([]);
    setSuggestions([]);
    setIsStreaming(false);
    try {
      const newId = await createSession();
      storeSessionId(newId);
      setSessionId(newId);
    } catch (err) {
      console.error("Failed to reset session:", err);
    }
  }, []);

  return {
    sessionId,
    messages,
    isStreaming,
    suggestions,
    isLoadingHistory,
    sendUserMessage,
    resetSession,
  };
}
