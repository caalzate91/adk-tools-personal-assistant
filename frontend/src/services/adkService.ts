import type { Message, MessageContent, ToolType } from '@/types/message';

const ADK_BASE = import.meta.env.VITE_ADK_BASE_URL as string || 'http://localhost:8000';
const APP_NAME = 'personal_assistant';

interface ADKSession {
  id: string;
  app_name: string;
  user_id: string;
}

interface ADKPart {
  text?: string;
  function_call?: { name: string; args: Record<string, unknown> };
  function_response?: { name: string; response: Record<string, unknown> };
}

interface ADKEvent {
  id?: string;
  author: string;
  invocation_id?: string;
  is_final_response?: boolean;
  content?: {
    role: string;
    parts: ADKPart[];
  };
  actions?: {
    function_calls?: Array<{ name: string; id: string; args: Record<string, unknown> }>;
  };
  error?: string;
}

function inferToolType(functionName: string): ToolType {
  if (functionName.includes('exchange_rate') || functionName === 'get_exchange_rate') {
    return 'exchange_rate';
  }
  if (functionName.includes('wikipedia')) {
    return 'wikipedia';
  }
  if (functionName.includes('search') || functionName.includes('google_search')) {
    return 'search';
  }
  return 'unknown';
}

function parseEventContent(event: ADKEvent): MessageContent | null {
  if (!event.content?.parts) return null;

  for (const part of event.content.parts) {
    if (part.function_response) {
      const toolType = inferToolType(part.function_response.name);
      return {
        kind: 'tool_result',
        toolType,
        payload: part.function_response.response,
        summary: JSON.stringify(part.function_response.response),
      };
    }
    if (part.text) {
      return { kind: 'text', text: part.text };
    }
  }

  return null;
}

export async function createSession(userId: string): Promise<string> {
  const response = await fetch(
    `${ADK_BASE}/apps/${APP_NAME}/users/${encodeURIComponent(userId)}/sessions`,
    { method: 'POST' },
  );
  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status}`);
  }
  const data = (await response.json()) as ADKSession;
  return data.id;
}

export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  const response = await fetch(
    `${ADK_BASE}/apps/${APP_NAME}/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`,
    { method: 'DELETE' },
  );
  if (!response.ok) {
    throw new Error(`Failed to delete session: ${response.status}`);
  }
}

export type SSECallback = (message: Partial<Message> & { isFinal?: boolean }) => void;

export async function runSSEStream(
  userId: string,
  sessionId: string,
  text: string,
  onEvent: SSECallback,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${ADK_BASE}/run_sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_name: APP_NAME,
      user_id: userId,
      session_id: sessionId,
      new_message: {
        role: 'user',
        parts: [{ text }],
      },
      streaming: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`SSE request failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const messages = buffer.split('\n\n');
      buffer = messages.pop() ?? '';

      for (const message of messages) {
        const dataLine = message
          .split('\n')
          .find((line) => line.startsWith('data: '));
        if (!dataLine) continue;

        const jsonStr = dataLine.slice(6);
        let event: ADKEvent;
        try {
          event = JSON.parse(jsonStr) as ADKEvent;
        } catch {
          continue; // skip malformed chunks
        }

        if (event.error) {
          onEvent({ status: 'error', content: { kind: 'text', text: event.error } });
          return;
        }

        const content = parseEventContent(event);
        if (content) {
          onEvent({
            content,
            sender: 'assistant',
            status: event.is_final_response ? 'received' : 'sending',
            isFinal: event.is_final_response ?? false,
          });
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
