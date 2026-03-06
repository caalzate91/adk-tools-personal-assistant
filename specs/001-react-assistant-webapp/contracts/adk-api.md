# Contract: ADK Web Server API

**Consumer**: `frontend/src/services/adkService.ts`
**Provider**: ADK FastAPI web server (`adk web personal_assistant`)
**Base URL**: `http://localhost:8000` (dev) | `$VITE_ADK_BASE_URL` (configurable)

---

## Authentication / CORS

- The ADK web server runs with `CORSMiddleware` allowing origins `["*"]` in development.
- No API authentication is required between frontend and ADK server (they run co-located).
- Firebase Auth token is **not** forwarded to the ADK server; user identity is passed
  via the `user_id` field in request bodies.

---

## Endpoints

### 1. Create Session

```
POST /apps/{appName}/users/{userId}/sessions
```

**Path parameters**:

| Param | Type | Value |
|-------|------|-------|
| `appName` | string | `"personal_assistant"` |
| `userId` | string | Firebase Auth `user.uid` |

**Request body**: empty (`{}`) or omitted.

**Response `200 OK`**:
```json
{
  "id": "session-uuid",
  "app_name": "personal_assistant",
  "user_id": "firebase-uid",
  "state": {},
  "events": [],
  "last_update_time": 1234567890.0
}
```

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | Malformed app_name or user_id |
| `500` | ADK internal error |

**Frontend usage**:
```ts
const session = await fetch(
  `${ADK_BASE}/apps/personal_assistant/users/${uid}/sessions`,
  { method: 'POST' }
).then(r => r.json());
const sessionId = session.id;
```

---

### 2. Run Agent (SSE Streaming)

```
POST /run_sse
Content-Type: application/json
Accept: text/event-stream
```

**Request body** (`RunAgentRequest`):
```json
{
  "app_name": "personal_assistant",
  "user_id": "firebase-uid",
  "session_id": "session-uuid",
  "new_message": {
    "role": "user",
    "parts": [
      { "text": "What is the exchange rate for USD to EUR?" }
    ]
  },
  "streaming": true
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `app_name` | string | ✅ | Must match registered agent package name |
| `user_id` | string | ✅ | Firebase Auth uid |
| `session_id` | string | ✅ | From `Create Session` response |
| `new_message` | Content | ✅ | Gemini `Content` object; `role` must be `"user"` |
| `new_message.parts` | Part[] | ✅ | Array with at least one `{ text: string }` part |
| `streaming` | boolean | ✅ | Must be `true` for SSE |
| `invocation_id` | string | ❌ | Optional; omit to let server generate |

**Response**: `text/event-stream`

Each SSE event has the format:
```
data: {"content": {...}, "author": "assistant", "is_final_response": false, ...}\n\n
```

The stream ends with a final event where `is_final_response == true` or the connection
closes naturally.

**Event data shape** (partial — only fields used by frontend):
```ts
interface ADKEvent {
  id?: string;
  author: string;                     // e.g. "personal_assistant" | "google_search_agent"
  invocation_id?: string;
  is_final_response?: boolean;
  content?: {
    role: string;
    parts: Array<
      | { text: string }
      | { function_call: { name: string; args: Record<string, unknown> } }
      | { function_response: { name: string; response: Record<string, unknown> } }
    >;
  };
  actions?: {
    function_calls?: Array<{ name: string; id: string; args: Record<string, unknown> }>;
  };
  error?: string;
}
```

**Frontend usage pattern** (EventSource workaround — POST body via fetch + ReadableStream):
```ts
// EventSource only supports GET; use fetch with ReadableStream for POST SSE
const response = await fetch(`${ADK_BASE}/run_sse`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request),
});
const reader = response.body!.getReader();
// decode chunks, split on '\n\n', parse 'data: ...' lines
```

**Error responses** (HTTP level, before stream starts):

| Status | Condition |
|--------|-----------|
| `404` | App or session not found |
| `422` | Validation error in request body |
| `500` | ADK internal error |

---

### 3. Delete Session

```
DELETE /apps/{appName}/users/{userId}/sessions/{sessionId}
```

**Path parameters**: same as Create Session plus `sessionId` from Create response.

**Response `200 OK`**: empty body or `{}`

**Frontend usage**: call on "New Chat" action or on unmount of last conversation.

---

### 4. Get Session (optional — for reconnect)

```
GET /apps/{appName}/users/{userId}/sessions/{sessionId}
```

Same response shape as Create Session.
Used to verify a stored `adkSessionId` is still valid after page refresh before
resuming a conversation.

---

## SSE Parsing Algorithm

```
1. Accumulate text chunks from ReadableStream into a buffer
2. Split buffer on '\n\n' to extract complete SSE messages
3. For each SSE message, extract lines starting with 'data: '
4. JSON.parse() the data value → ADKEvent
5. Dispatch ADKEvent through the conversation reducer
6. On `is_final_response == true`, mark streaming as complete
7. On fetch error or stream abort, mark last message as 'error'
```

---

## Error Handling Contract

| Scenario | Frontend behaviour |
|----------|--------------------|
| Session creation fails (500) | Show error banner; disable input |
| `/run_sse` returns non-200 | Append error message to conversation |
| Stream chunk parse error | Skip malformed chunk; continue |
| Stream aborted mid-response | Mark last message `status = 'error'`; show retry button |
| ADK agent returns `error` field in event | Render as error message type |
