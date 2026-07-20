/**
 * Chat API helpers — all fetch calls for the chat assistant.
 *
 * sendMessage uses a manual SSE parser over fetch (ReadableStream),
 * because EventSource doesn't support POST bodies.
 */
import { getJwtToken } from "@/lib/auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const SESSION_STORAGE_KEY = "skydgets_chat_session_id";

// ── Session ID persistence ────────────────────────────────────────────────────

export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function storeSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

export function clearStoredSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// ── Auth header ───────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getJwtToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── createSession ─────────────────────────────────────────────────────────────

export async function createSession(): Promise<string> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/chat/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    credentials: "include", // send guestToken cookie
  });

  if (!res.ok) {
    throw new Error(`Failed to create chat session: ${res.status}`);
  }

  const data = (await res.json()) as { sessionId: string };
  storeSessionId(data.sessionId);
  return data.sessionId;
}

// ── fetchMessages — load history on page refresh ──────────────────────────────

export interface ChatMessagePayload {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export async function fetchMessages(
  sessionId: string
): Promise<ChatMessagePayload[]> {
  const headers = await authHeaders();
  const res = await fetch(
    `${BASE_URL}/chat/sessions/${sessionId}/messages`,
    {
      headers,
      credentials: "include",
    }
  );

  if (!res.ok) {
    // Session might be gone / belong to different guest — caller should reset
    throw new Error(`Failed to fetch messages: ${res.status}`);
  }

  const data = (await res.json()) as { messages: ChatMessagePayload[] };
  return data.messages;
}

// ── sendMessage — manual SSE parser over fetch ────────────────────────────────

export async function sendMessage(
  sessionId: string,
  message: string,
  onToken: (text: string) => void,
  onSuggestions: (suggestions: string[]) => void,
  onDone: () => void
): Promise<void> {
  const headers = await authHeaders();

  const res = await fetch(
    `${BASE_URL}/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...headers,
      },
      credentials: "include",
      body: JSON.stringify({ message }),
    }
  );

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  if (!res.body) {
    throw new Error("No response body for SSE stream");
  }

  // ── Manual SSE parsing ────────────────────────────────────────────────────
  // SSE format:
  //   event: token\ndata: {"text": "..."}\n\n
  //   event: suggestions\ndata: {"suggestions": [...]}\n\n
  //   event: done\ndata: {}\n\n

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split on double newlines — each SSE message ends with \n\n
    const events = buffer.split("\n\n");
    // The last element might be incomplete — keep it in the buffer
    buffer = events.pop() ?? "";

    for (const eventBlock of events) {
      if (!eventBlock.trim()) continue;

      // Parse event name and data lines
      const lines = eventBlock.split("\n");
      let eventName = "message";
      let dataLine = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventName = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          dataLine = line.slice(6).trim();
        }
      }

      if (!dataLine) continue;

      try {
        const payload = JSON.parse(dataLine);

        if (eventName === "token" && typeof payload.text === "string") {
          onToken(payload.text);
        } else if (
          eventName === "suggestions" &&
          Array.isArray(payload.suggestions)
        ) {
          onSuggestions(payload.suggestions as string[]);
        } else if (eventName === "error") {
          onToken(payload.message || "An error occurred.");
          onDone();
        } else if (eventName === "done") {
          onDone();
        }
      } catch {
        // Malformed JSON chunk — skip silently
      }
    }
  }
}
