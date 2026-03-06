# Data Model: React Personal Assistant Web App

**Branch**: `001-react-assistant-webapp` | **Date**: 2026-03-05

---

## Entities

### Message

The atomic unit of conversation. Rendered by `MessageBubble` (text) or `ToolResultWidget`
(tool result).

```ts
// src/types/message.ts

export type MessageSender = 'user' | 'assistant';
export type MessageStatus  = 'sending' | 'received' | 'error';
export type ToolType       = 'exchange_rate' | 'search' | 'wikipedia' | 'unknown';

export interface TextContent {
  kind: 'text';
  text: string;
}

export interface ToolResultContent {
  kind: 'tool_result';
  toolType: ToolType;
  /** Raw structured payload from ADK event (tool-specific shape) */
  payload: Record<string, unknown>;
  /** Human-readable summary for accessibility / fallback rendering */
  summary: string;
}

export type MessageContent = TextContent | ToolResultContent;

export interface Message {
  id: string;               // UUID generated client-side
  sender: MessageSender;
  content: MessageContent;
  timestamp: Date;
  status: MessageStatus;
}
```

**Validation rules**:
- `id`: non-empty string (UUID v4 recommended).
- `content.text`: non-empty after trim (enforced before send by FR-006).
- `timestamp`: set at creation time; immutable after creation.
- `status` transitions: `'sending' → 'received'` (success) | `'sending' → 'error'` (failure).

---

### Conversation

An ordered sequence of Messages tied to one ADK session and one Firebase user.

```ts
// src/types/conversation.ts

import type { Message } from './message';

export interface Conversation {
  id: string;              // Firestore document ID (UUID generated client-side)
  userId: string;          // Firebase Auth uid
  adkSessionId: string;   // session ID returned by POST /apps/.../sessions
  title: string;           // First user message, truncated to 60 chars
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];     // In-memory only; persisted in sub-collection
}
```

**State transitions**:
- `created` → messages accumulate → `active` → user starts new chat → `archived`
  (no formal status field needed; `updatedAt` serves as recency indicator)

---

### User (Auth + Profile)

```ts
// src/types/user.ts  (thin wrapper over FirebaseUser)

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
```

Stored in Firestore at `users/{uid}` for profile denormalisation only. The auth source
of truth is Firebase Auth.

---

## ADK Session ↔ Conversation Mapping

| Concept | ADK side | Firestore side |
|---------|----------|---------------|
| User identity | `user_id` (string passed in API calls = Firebase `uid`) | `users/{uid}` document |
| Session | ADK in-memory session managed by the server | `adkSessionId` field on `conversations/{convId}` |
| Messages | ADK `Event` stream from `/run_sse` | `conversations/{convId}/messages/{msgId}` |
| New conversation | `DELETE` old session → `POST` new session | New `conversations/{convId}` document created |

> ADK manages its own session context (LLM history, tool states). Firestore stores the
> rendered UI messages only. The two stores are kept in sync by the `adkService.ts` /
> `firebaseService.ts` pair on each message exchange.

---

## Firestore Schema

```
users/{uid}
  displayName:  string
  email:        string
  photoURL:     string | null
  createdAt:    Timestamp
  lastActiveAt: Timestamp

users/{uid}/conversations/{convId}
  id:           string          // = convId, denormalised for queries
  adkSessionId: string
  title:        string          // first 60 chars of first user message
  createdAt:    Timestamp
  updatedAt:    Timestamp

users/{uid}/conversations/{convId}/messages/{msgId}
  id:           string          // UUID
  sender:       'user' | 'assistant'
  contentKind:  'text' | 'tool_result'
  text:         string | null   // present when contentKind == 'text'
  toolType:     string | null   // present when contentKind == 'tool_result'
  payload:      map | null      // present when contentKind == 'tool_result'
  summary:      string | null   // present when contentKind == 'tool_result'
  timestamp:    Timestamp
  status:       'sent' | 'received' | 'error'
```

**Indexes**: No composite indexes required for V1. Default Firestore ordering by
`timestamp` ascending is sufficient for message history.

---

## ADK Event → Message Mapping

The ADK `/run_sse` stream emits `Event` JSON objects. The frontend translates them to
`Message` objects as follows:

| ADK Event field | Condition | Maps to |
|-----------------|-----------|---------|
| `content.parts[*].text` | text part present | `TextContent { kind:'text', text }` |
| `actions.function_calls[*]` | tool invocation event | detected but NOT rendered (intermediate state) |
| `content.parts[*].function_response` | tool result event | `ToolResultContent { kind:'tool_result', ... }` |
| `is_final_response == true` | last event in turn | sets `status = 'received'`; auto-scroll triggered |
| `error` field present in SSE data | ADK error | `status = 'error'`; `errorMessage` populated |

**Tool type detection** (from function name in the event):

| Function name prefix | ToolType |
|----------------------|---------|
| `get_exchange_rate` | `'exchange_rate'` |
| `google_search_agent` | `'search'` |
| `langchain_wikipedia_tool` | `'wikipedia'` |
| (other) | `'unknown'` |
