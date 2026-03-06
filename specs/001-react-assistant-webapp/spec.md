# Feature Specification: React Personal Assistant Web App

**Feature Branch**: `001-react-assistant-webapp`  
**Created**: 2026-03-05  
**Status**: Draft — Amended 2026-03-06  
**Input**: User description: "Create a web app in Typescript using React where it locale in the root project directory and it integrate the personal assistant in this new web app. Remember use Atomic Design and it should have the best practices."

> **⚠️ Amendment — 2026-03-06** (findings C1, I1, D3 from consistency analysis)  
> The planning session mandated Firebase Authentication (Google OAuth) and Firebase Firestore  
> conversation persistence — overriding two original assumptions that stated no auth was needed  
> and history was session-scoped only. This amendment:  
> - Updates **US2 Acceptance Scenario 3** (page-refresh behaviour)  
> - Rewrites **FR-015** (persistence scope)  
> - Adds **FR-016** (authentication requirement)  
> - Adds **FR-017** (cross-session Firestore persistence)  
> - Corrects the **Assumptions** section  
> Tasks T057 (spec backport) is now complete.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send a Message and Receive a Response (Priority: P1)

A user opens the web app in a browser, types a question in their preferred language (English or
Spanish), submits it, and promptly sees the personal assistant's answer appear in the
conversation area.

**Why this priority**: This is the core interaction of the application. Without it the app
delivers no value. Every other user story depends on this capability being present and reliable.

**Independent Test**: Open the app, type "What is the exchange rate between USD and EUR?", press
Enter. The assistant's response should appear in the conversation view without a page reload and
without a raw error message.

**Acceptance Scenarios**:

1. **Given** the app is open and the text input is empty, **When** the user types a message and
   presses Enter or clicks the Send button, **Then** the message appears in the conversation view
   as a user message and a loading indicator replaces the send action.
2. **Given** a user message has been sent, **When** the assistant finishes processing, **Then**
   the assistant's response appears in the conversation in a visually distinct style from the
   user message.
3. **Given** the user types a message in Spanish, **When** the assistant responds, **Then** the
   response is written in Spanish.
4. **Given** the input field contains only whitespace, **When** the user attempts to send,
   **Then** the message is NOT submitted and the input field remains focused.

---

### User Story 2 - View Conversation History (Priority: P2)

A user continues a multi-turn conversation across several exchanges and can review earlier
messages by scrolling up. The full ordered history is visible within the current browser session.

**Why this priority**: Without scrollable history the user loses context between turns, which
breaks multi-step queries (e.g., asking a follow-up about a previously fetched rate).

**Independent Test**: Send at least five messages and verify all exchanges remain displayed in
chronological order. Scroll up and confirm earlier messages are still present.

**Acceptance Scenarios**:

1. **Given** multiple exchanges have occurred, **When** the user scrolls up in the conversation
   view, **Then** earlier messages are visible in the correct chronological order.
2. **Given** a new response arrives, **When** it is rendered, **Then** the conversation view
   auto-scrolls to make the newest message visible.
3. **Given** the user refreshes the browser, **When** the page reloads and the user is still
   authenticated, **Then** the conversation history for that user reloads from persistent
   storage and is displayed in chronological order — the session is NOT lost.

---

### User Story 3 - View Structured Tool Results (Priority: P3)

When the assistant invokes a tool (currency exchange, Google Search, Wikipedia lookup) the result
is displayed with clear visual formatting — not as an undifferentiated prose block — so the user
can quickly scan key facts.

**Why this priority**: Tool results are a primary differentiator of this assistant. Rendering
them as plain text removes their value and degrades trust in the assistant's capabilities.

**Independent Test**: Ask "What is the current EUR to USD rate?" and verify the rate figures and
currency codes are visually distinct from surrounding prose text. Ask a Wikipedia question and
verify the summary renders as readable paragraphs, not as a raw text dump.

**Acceptance Scenarios**:

1. **Given** the assistant returns an exchange rate result, **When** rendered, **Then** the
   numeric rate and currency codes are visually highlighted or structured apart from plain text.
2. **Given** the assistant returns a Wikipedia summary, **When** displayed, **Then** key factual
   content is formatted as readable prose with any source attribution clearly visible.
3. **Given** the assistant returns Google Search results, **When** displayed, **Then** each
   result is presented as a scannable summary item, not a block of raw concatenated text.

---

### User Story 4 - Accessible and Responsive Interface (Priority: P4)

A user interacts with the app on a desktop or tablet browser and experiences a clean, accessible
interface that operates correctly regardless of screen size and meets baseline web accessibility
guidelines — navigable by keyboard alone.

**Why this priority**: Accessibility and responsiveness are fundamental quality expectations.
An inaccessible or broken layout on tablet-sized screens fails the "best practices" requirement
stated in the feature description.

**Independent Test**: Verify the chat flow at 768 px and 1280 px viewport widths. Complete the
full flow (load → type → send → read response) using keyboard navigation only. Run an automated
accessibility audit and confirm a score ≥ 90.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (≥ 1024 px), **When** the user opens the app, **Then** the
   conversation view and text input are fully visible and usable without horizontal scrolling.
2. **Given** a tablet viewport (≥ 768 px), **When** the user opens the app, **Then** the layout
   adapts without content overflow or obscured interactive elements.
3. **Given** a user navigates with keyboard only, **When** they Tab through the interface,
   **Then** focus order is logical and they can compose and send a message without a mouse.
4. **Given** any interactive element in the interface, **When** inspected, **Then** it has a
   descriptive accessible label (visible text or ARIA attribute).

---

### Edge Cases

- What happens when the ADK backend is unreachable? The app MUST display a user-facing error
  message in the conversation view (not a raw error code or stack trace) and allow the user to
  retry the last message.
- What happens when the assistant takes unexpectedly long? A loading indicator is shown for the
  full duration and earlier messages remain readable above it.
- What happens if the user sends a second message while the first response is still pending? The
  send action is disabled until the active response completes, preventing duplicate in-flight
  requests.
- What happens if the network drops mid-response? Any partial content is shown with a clearly
  labelled error notice; the conversation history remains intact.
- What happens at very narrow viewports (< 400 px)? The layout degrades gracefully without
  breaking core functionality.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide a single-page interface where a user can type and submit text
  messages to the personal assistant.
- **FR-002**: The app MUST display each user message and each assistant response in a scrollable
  conversation view in chronological order.
- **FR-003**: The app MUST show a visible loading indicator between message submission and
  response receipt.
- **FR-004**: The app MUST visually distinguish user messages from assistant messages (e.g.,
  alignment, colour, or avatar).
- **FR-005**: The app MUST support message submission via the Enter key and via a dedicated Send
  button.
- **FR-006**: The app MUST block submission of empty or whitespace-only messages.
- **FR-007**: The app MUST render assistant responses that contain structured data (exchange
  rates, search results, encyclopedic summaries) in a clearly formatted layout — not as raw
  plain text.
- **FR-008**: The app MUST display a descriptive, user-facing error message when the backend is
  unavailable or returns an error condition, without exposing internal exception or stack trace
  details.
- **FR-009**: The app MUST automatically scroll to the latest message when a new response is
  received.
- **FR-010**: The app MUST be fully operable via keyboard navigation (Tab, Enter, Escape for
  standard actions).
- **FR-011**: All interactive elements MUST carry accessible labels meeting WCAG 2.1 AA baseline
  (visible text or ARIA attributes).
- **FR-012**: The app MUST adapt its layout for at minimum two viewport breakpoints: desktop
  (≥ 1024 px) and tablet (≥ 768 px).
- **FR-013**: The UI component architecture MUST follow the Atomic Design methodology
  (Atoms → Molecules → Organisms → Templates → Pages), with each component placed at the correct
  abstraction level.
- **FR-014**: The codebase MUST pass all configured lint and strict type-check rules with zero
  errors before any release.
- **FR-015**: Conversation state MUST persist across internal navigation within the application
  and MUST reload from persistent per-user storage on full browser page refresh. Conversation
  history is NOT session-scoped and MUST NOT be lost on page reload.
- **FR-016**: The app MUST require users to sign in before accessing the chat interface.
  Unauthenticated users MUST be presented with a dedicated login screen. The Google account
  provider MUST be supported as the sign-in method.
- **FR-017**: Each authenticated user's conversation history MUST be stored per-user in a
  cloud-backed persistent store, enabling history to survive browser restarts and be
  accessible across devices using the same account.

### Key Entities

- **Message**: A single unit of conversation. Attributes: sender (user or assistant), content
  (text or structured tool result), timestamp, delivery status (sending, received, error).
- **Conversation**: An ordered, session-scoped sequence of Messages. Initialised empty on page
  load; destroyed on full reload.
- **Tool Result**: A specialised Message content variant produced when the assistant invokes a
  tool (currency lookup, web search, Wikipedia). Carries source type and structured data to
  enable distinct visual rendering.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can send a message and receive a visible assistant response in under
  10 seconds at p95 under normal network conditions (local ADK backend running).
- **SC-002**: The conversation view correctly renders all message types (user, assistant, tool
  result) with zero rendering errors across Chrome and Firefox latest stable releases.
- **SC-003**: The app scores ≥ 90 on a Lighthouse Accessibility audit without manual
  post-audit remediation.
- **SC-004**: The layout renders correctly (no overflow, no hidden content, no broken elements)
  at viewport widths of 768 px and 1280 px.
- **SC-005**: Zero type errors and zero lint errors are present in the production build output.
- **SC-006**: 100% of UI components are organised at the correct Atomic Design abstraction level,
  verified by code review against the defined component hierarchy.
- **SC-007**: When the backend is unavailable, 100% of error conditions surface a user-readable
  message in the conversation view within 3 seconds of the failure occurring.
- **SC-008**: The complete chat flow (load app → type message → send → read response) is
  achievable using keyboard navigation alone, verified by an automated end-to-end test.

---

## Assumptions

- The personal assistant backend is exposed via the `adk web` command, which starts a local HTTP
  server. The web app communicates with this server to send messages and receive responses.
- ~~No user authentication is required~~ **AMENDED (2026-03-06)**: User authentication via
  Google Sign-In is required — see FR-016. The app is protected behind a login screen; only
  authenticated users may access the chat interface.
- ~~Conversation history is session-scoped; no server-side storage is required~~ **AMENDED
  (2026-03-06)**: Conversation history is persisted per-user in a cloud-backed store — see
  FR-015 and FR-017. History survives page refreshes and browser restarts.
- The web app source will reside at the project root (`/personal_assistant/`), effectively
  replacing or superseding the scaffold currently under `/personal_assistant/frontend/`.
- A single active conversation thread per browser session is sufficient (no multi-conversation
  tabs or conversation-switching UI).
- The frontend is implemented in TypeScript (strict mode) and React 19, as explicitly specified.
- Component architecture follows the Atomic Design methodology, as explicitly requested.
- The app does not need to support Internet Explorer or any browser released before 2023.

