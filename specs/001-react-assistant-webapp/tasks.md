# Tasks: React Personal Assistant Web App

**Feature branch**: `001-react-assistant-webapp`
**Input**: Design documents from `/specs/001-react-assistant-webapp/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/adk-api.md ✅ · contracts/firebase.md ✅

**Tests**: REQUIRED — Constitution Principle II (Testing Standards) is NON-NEGOTIABLE.
All test tasks MUST be committed and confirmed failing before the implementation they cover (TDD).

## Format: `- [ ] [ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[US1–US4]**: User story association (from spec.md priorities P1–P4)
- Sequential tasks without **[P]** must wait for their predecessors

---

## Phase 1: Setup

**Purpose**: Extend the existing Vite scaffold with test tooling, strict linting, and the Atomic Design directory structure required by the plan.

- [x] T001 Update `frontend/package.json` to add Vitest, `@testing-library/react`, `@testing-library/user-event`, `@vitest/coverage-v8`, `jsdom`, and Playwright as dev dependencies — `frontend/package.json`
- [x] T002 Configure Vitest (test globals, jsdom environment, coverage thresholds ≥ 80%) in `frontend/vite.config.ts`
- [x] T003 [P] Create Playwright config (baseURL, browsers: chromium, screenshot on failure) in `frontend/playwright.config.ts`
- [x] T004 [P] Add `typescript-eslint/strict`, `eslint-plugin-react-hooks`, and `eslint-plugin-jsx-a11y` rules to `frontend/eslint.config.js`
- [x] T005 [P] Enable TypeScript `strict`, `noUncheckedIndexedAccess`, and `@/` path alias in `frontend/tsconfig.app.json`
- [x] T006 Create Atomic Design directory scaffold under `frontend/src/`: `atoms/`, `molecules/`, `organisms/`, `templates/`, `pages/`, `services/`, `hooks/`, `types/`, `__tests__/unit/services/`, `__tests__/unit/hooks/`, `__tests__/integration/atoms/`, `__tests__/integration/molecules/`, `__tests__/integration/organisms/`, `__tests__/integration/pages/`, and root-level `e2e/`

**Checkpoint**: Toolchain installed — `npm test` runs (zero tests yet), `npm run lint` passes, `tsc --noEmit` passes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, Firebase initializer, service layer, and hooks that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Create `Message`, `MessageSender`, `MessageStatus`, `MessageContent`, `TextContent`, `ToolResultContent`, and `ToolType` types in `frontend/src/types/message.ts`
- [x] T008 [P] Create `Conversation` type in `frontend/src/types/conversation.ts`
- [x] T009 [P] Create `AppUser` type in `frontend/src/types/user.ts`
- [x] T010 Define global CSS custom properties — color palette, spacing scale, typography, border-radius, shadow tokens, and CSS reset — in `frontend/src/index.css`
- [x] T011 Create Firebase app initializer (exports `app`, `auth`, `firestore` singletons reading from `import.meta.env`) in `frontend/src/firebase.ts`
- [x] T012 Implement `createSession`, `runSSEStream` (fetch + ReadableStream SSE chunk parser mapping ADK events to `Message`), and `deleteSession` functions in `frontend/src/services/adkService.ts`
- [x] T013 [P] Implement `signInWithGoogle`, `signOutUser`, `onAuthChange`, `upsertUserProfile`, `createConversation`, `updateConversation`, `saveMessage`, and `loadMessages` functions in `frontend/src/services/firebaseService.ts`
- [x] T014 Implement `useAuth` hook (subscribes via `onAuthChange`, exposes `user: AppUser | null`, `signIn`, `signOut`, `loading`) in `frontend/src/hooks/useAuth.ts`
- [x] T015 Implement `useConversation` hook (messages state, `sendMessage` dispatching `adkService` + `firebaseService`, SSE event reducer, in-flight request lock, error state) in `frontend/src/hooks/useConversation.ts`

**Checkpoint**: Types compile, Firebase initializes, services and hooks are importable — user story phases can now begin

---

## Phase 3: User Story 1 — Send a Message and Receive a Response (Priority: P1) 🎯 MVP

**Goal**: Authenticated user can type a message, submit it, see a loading indicator, and receive the assistant's streamed response — the complete core interaction loop.

**Independent Test**: Open the app → click "Sign in with Google" → authenticate → type "What is the exchange rate between USD and EUR?" → press Enter → the assistant's response appears in the conversation view without a page reload or raw error message.

### Tests for User Story 1 (REQUIRED — Constitution Principle II)

> **NON-NEGOTIABLE: Commit these tests first, confirm they FAIL, then implement**

- [x] T016 [P] [US1] Write unit tests for `adkService` (createSession success/failure, SSE stream parsing, in-flight request, abort on error) in `frontend/src/__tests__/unit/services/adkService.test.ts`
- [x] T017 [P] [US1] Write unit tests for `firebaseService` (signIn, signOut, auth state change, Firestore CRUD mocks) in `frontend/src/__tests__/unit/services/firebaseService.test.ts`
- [x] T018 [P] [US1] Write unit tests for `useAuth` hook (loads from null, updates on sign-in, clears on sign-out, exposes loading) in `frontend/src/__tests__/unit/hooks/useAuth.test.ts`
- [x] T019 [P] [US1] Write unit tests for `useConversation` hook (sendMessage appends user message, SSE events dispatch correctly, error path sets status, blocks second send while in-flight) in `frontend/src/__tests__/unit/hooks/useConversation.test.ts`
- [x] T020 [P] [US1] Write component tests for `Button` atom (renders label, click handler, disabled state blocks click, keyboard activation via Enter/Space) in `frontend/src/__tests__/integration/atoms/Button.test.tsx`
- [x] T021 [P] [US1] Write component tests for `TextInput` atom (controlled value, onChange, Enter keydown emits onSubmit, non-empty guard via maxLength, ARIA attributes) in `frontend/src/__tests__/integration/atoms/TextInput.test.tsx`
- [x] T022 [P] [US1] Write component tests for `LoadingDots` atom (renders three dots, carries accessible `aria-label`, hidden from assistive tech when not shown) in `frontend/src/__tests__/integration/atoms/LoadingDots.test.tsx`
- [x] T023 [P] [US1] Write component tests for `MessageInputBar` molecule (submit on Enter dispatches, submit on button click dispatches, whitespace-only input blocked, disabled state while loading) in `frontend/src/__tests__/integration/molecules/MessageInputBar.test.tsx`
- [x] T024 [P] [US1] Write component tests for `ErrorBanner` molecule (renders error message string, dismiss/retry callback, does not render when no error) in `frontend/src/__tests__/integration/molecules/ErrorBanner.test.tsx`
- [x] T025 [US1] Write integration tests for `ChatComposer` organism (dispatches message to useConversation mock, shows LoadingDots during in-flight, disables input while loading, clears input after send) in `frontend/src/__tests__/integration/organisms/ChatComposer.test.tsx`
- [x] T026 [P] [US1] Write component tests for `LoginPage` (renders Google sign-in button, calls `signIn` on click, shows loading during auth, displays auth error message) in `frontend/src/__tests__/integration/pages/LoginPage.test.tsx`

### Implementation for User Story 1

- [x] T027 [P] [US1] Create `Button` atom in `frontend/src/atoms/Button/Button.tsx` + `frontend/src/atoms/Button/Button.css`
- [x] T028 [P] [US1] Create `TextInput` atom in `frontend/src/atoms/TextInput/TextInput.tsx` + `frontend/src/atoms/TextInput/TextInput.css`
- [x] T029 [P] [US1] Create `LoadingDots` atom in `frontend/src/atoms/LoadingDots/LoadingDots.tsx` + `frontend/src/atoms/LoadingDots/LoadingDots.css`
- [x] T030 [US1] Create `MessageInputBar` molecule (composes `TextInput` + `Button`, Enter key handler, whitespace-only guard per FR-006, disabled prop during loading) in `frontend/src/molecules/MessageInputBar/MessageInputBar.tsx` + `frontend/src/molecules/MessageInputBar/MessageInputBar.css`
- [x] T031 [P] [US1] Create `ErrorBanner` molecule (displays user-facing error string, retry/dismiss callback, no stack trace exposed per FR-008) in `frontend/src/molecules/ErrorBanner/ErrorBanner.tsx` + `frontend/src/molecules/ErrorBanner/ErrorBanner.css`
- [x] T032 [US1] Create `ChatComposer` organism (integrates `MessageInputBar` + `LoadingDots` + `ErrorBanner`, wires `useConversation.sendMessage`, locks input during in-flight request per edge case) in `frontend/src/organisms/ChatComposer/ChatComposer.tsx` + `frontend/src/organisms/ChatComposer/ChatComposer.css`
- [x] T033 [P] [US1] Create `LoginTemplate` layout skeleton (centered card slot, fullscreen background) in `frontend/src/templates/LoginTemplate/LoginTemplate.tsx` + `frontend/src/templates/LoginTemplate/LoginTemplate.css`
- [x] T034 [US1] Create `LoginPage` page (Google sign-in button via `useAuth.signIn`, loading state, Firebase auth error translated to user-facing message per FR-008) in `frontend/src/pages/LoginPage/LoginPage.tsx`
- [x] T035 [US1] Wire `AuthGuard` routing in `frontend/src/main.tsx`: renders `LoginPage` when `user === null`, renders `ChatPage` (skeleton stub) when authenticated

**Checkpoint**: Run `npx vitest run` — all US1 tests pass. Open app → Google sign-in works → type a message → loading indicator appears → assistant reply visible

---

## Phase 4: User Story 2 — View Conversation History (Priority: P2)

**Goal**: All sent and received messages persist in the visible scrollable view in chronological order within the session; new responses auto-scroll to bottom; Firestore preserves history across page refreshes.

**Independent Test**: Send five messages → scroll up → confirm all exchanges visible in order → send a sixth → view auto-scrolls to it → refresh page → Firestore-backed history reloads.

### Tests for User Story 2 (REQUIRED — Constitution Principle II)

- [x] T036 [P] [US2] Write component tests for `Avatar` atom (renders `<img>` with photoURL, renders initials fallback when no photoURL, always has non-empty `alt`) in `frontend/src/__tests__/integration/atoms/Avatar.test.tsx`
- [x] T037 [P] [US2] Write component tests for `MessageBubble` molecule (user-bubble right-aligned, assistant-bubble left-aligned, renders `TextContent`, shows timestamp, shows `ErrorBanner` on error status) in `frontend/src/__tests__/integration/molecules/MessageBubble.test.tsx`
- [x] T038 [US2] Write integration tests for `ConversationFeed` organism (renders messages in order, auto-scrolls when new message appended, displays `LoadingDots` for in-progress message, accessible list structure) in `frontend/src/__tests__/integration/organisms/ConversationFeed.test.tsx`

### Implementation for User Story 2

- [x] T039 [P] [US2] Create `Avatar` atom (renders photo or two-letter initials fallback, configurable size) in `frontend/src/atoms/Avatar/Avatar.tsx` + `frontend/src/atoms/Avatar/Avatar.css`
- [x] T040 [US2] Create `MessageBubble` molecule (visually distinct user vs assistant alignment + color per FR-004; renders `TextContent`; shows timestamp; shows inline error notice on `status='error'`) in `frontend/src/molecules/MessageBubble/MessageBubble.tsx` + `frontend/src/molecules/MessageBubble/MessageBubble.css`
- [x] T041 [US2] Create `ConversationFeed` organism (scrollable `<ul>` of `MessageBubble` items, auto-scroll via `useRef`/`scrollIntoView` on messages change per FR-009, `LoadingDots` for last in-progress message) in `frontend/src/organisms/ConversationFeed/ConversationFeed.tsx` + `frontend/src/organisms/ConversationFeed/ConversationFeed.css`
- [x] T042 [US2] Create `ChatTemplate` layout skeleton (header slot, scrollable feed slot, pinned composer slot using CSS Grid) in `frontend/src/templates/ChatTemplate/ChatTemplate.tsx` + `frontend/src/templates/ChatTemplate/ChatTemplate.css`
- [x] T043 [US2] Create `ChatPage` page (wires `useConversation` + `useAuth` + `ConversationFeed` + `ChatComposer` + `ChatTemplate`; loads Firestore conversation history on mount via `firebaseService.loadMessages`) in `frontend/src/pages/ChatPage/ChatPage.tsx`

**Checkpoint**: Run `npx vitest run` — all US1 + US2 tests pass. Multi-turn conversation scrolls correctly; page refresh reloads history from Firestore

---

## Phase 5: User Story 3 — View Structured Tool Results (Priority: P3)

**Goal**: Exchange rate figures, Wikipedia summaries, and Google Search result snippets each render in a distinct visually formatted widget — not as undifferentiated prose.

**Independent Test**: Ask "What is EUR to USD rate?" → numeric values and currency codes are visually highlighted. Ask a Wikipedia question → summary renders as readable paragraphs. Ask a search question → results are scannable items.

### Tests for User Story 3 (REQUIRED — Constitution Principle II)

- [x] T044 [P] [US3] Write component tests for `ToolResultWidget` molecule (exchange_rate variant shows rate + codes, wikipedia variant shows prose paragraphs, search variant shows list items, unknown fallback renders summary text) in `frontend/src/__tests__/integration/molecules/ToolResultWidget.test.tsx`
- [x] T045 [US3] Write integration tests for `ConversationFeed` rendering tool-result messages (tool_result `MessageBubble` renders `ToolResultWidget`, not raw JSON) in `frontend/src/__tests__/integration/organisms/ConversationFeed.tool-results.test.tsx`

### Implementation for User Story 3

- [x] T046 [US3] Create `ToolResultWidget` molecule with four `ToolType` variants: `exchange_rate` (highlighted rate + currency codes), `search` (scannable result list), `wikipedia` (readable prose + attribution), `unknown` (plain `summary` text fallback) per FR-007 — `frontend/src/molecules/ToolResultWidget/ToolResultWidget.tsx` + `frontend/src/molecules/ToolResultWidget/ToolResultWidget.css`
- [x] T047 [US3] Extend `MessageBubble` to branch on `content.kind`: render `ToolResultWidget` when `kind === 'tool_result'`, existing text rendering otherwise — `frontend/src/molecules/MessageBubble/MessageBubble.tsx`
- [x] T048 [US3] Extend `useConversation` SSE event reducer to detect `function_response` content parts and construct `ToolResultContent` messages with `toolType` inferred from function name — `frontend/src/hooks/useConversation.ts`

**Checkpoint**: Run `npx vitest run` — all US1 + US2 + US3 tests pass. Tool-result messages render their typed widgets in the conversation view

---

## Phase 6: User Story 4 — Accessible and Responsive Interface (Priority: P4)

**Goal**: The app is fully keyboard-navigable, meets WCAG 2.1 AA baseline (Lighthouse ≥ 90), and renders correctly at 768 px and 1280 px viewport widths.

**Independent Test**: Set viewport to 768 px — no overflow. Set to 1280 px — no overflow. Tab through the interface from login to send without mouse — complete the full flow. Lighthouse accessibility score ≥ 90.

### Tests for User Story 4 (REQUIRED — Constitution Principle II)

- [ ] T049 [P] [US4] Write component tests for `Icon` atom (renders accessible SVG, `aria-hidden="true"` when decorative, `aria-label` present when meaningful) in `frontend/src/__tests__/integration/atoms/Icon.test.tsx`
- [ ] T050 [P] [US4] Write component tests for `AppHeader` organism (renders user display name, `Avatar`, sign-out `Button`; sign-out fires `useAuth.signOut`) in `frontend/src/__tests__/integration/organisms/AppHeader.test.tsx`

### Implementation for User Story 4

- [ ] T051 [P] [US4] Create `Icon` atom (SVG sprite wrapper, accepts `name` + `size` props, `aria-hidden` by default, overridable `aria-label`) in `frontend/src/atoms/Icon/Icon.tsx` + `frontend/src/atoms/Icon/Icon.css`
- [ ] T052 [US4] Audit all interactive components and add missing ARIA attributes — `aria-label` on icon-only buttons, `role="status"` on `LoadingDots`, `aria-live="polite"` on `ConversationFeed`, `aria-invalid` on `TextInput` error state — across files in `frontend/src/atoms/`, `frontend/src/molecules/`, `frontend/src/organisms/`
- [ ] T053 [P] [US4] Add responsive CSS breakpoints — 768 px (tablet) and 1024 px (desktop) — and `clamp()`-based font sizes to `frontend/src/templates/ChatTemplate/ChatTemplate.css`
- [ ] T054 [P] [US4] Add responsive CSS breakpoints to `frontend/src/templates/LoginTemplate/LoginTemplate.css`
- [ ] T055 [US4] Create `AppHeader` organism (user `Avatar` + display name + sign-out `Button`; keyboard focusable sign-out per FR-010) in `frontend/src/organisms/AppHeader/AppHeader.tsx` + `frontend/src/organisms/AppHeader/AppHeader.css`
- [ ] T056 [US4] Wire `AppHeader` into the header slot of `ChatTemplate` in `frontend/src/templates/ChatTemplate/ChatTemplate.tsx`

**Checkpoint**: Run `npx vitest run` — all US1–US4 tests pass. Tab order flows logically from header to input. Resize to 768 px — no overflow

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, production build verification, spec consistency, and developer experience.

- [x] T057 [P] Back-port Firebase Auth + Firestore spec amendments — update Assumptions section in `specs/001-react-assistant-webapp/spec.md` to remove the two superseded assumptions and replace with accurate statements *(done 2026-03-06 — also fixed US2 AS3, FR-015, added FR-016, FR-017)*
- [ ] T058 [P] Create `frontend/.env.local.example` documenting all required `VITE_FIREBASE_*` and `VITE_ADK_BASE_URL` environment variables (safe to commit — no secrets)
- [ ] T059 Write Playwright e2e test for Google sign-in → send message → sign-out flow in `frontend/e2e/auth-flow.spec.ts`
- [ ] T060 [P] Write Playwright e2e test covering the complete keyboard-navigable chat flow (load → Tab to input → type → Enter → response visible) verifying SC-008 in `frontend/e2e/chat-flow.spec.ts`
- [ ] T061 Run `npm run lint && npm run type-check` in `frontend/` and resolve all remaining errors until both commands exit with code 0 (SC-005 / QG-1 / QG-2)
- [ ] T062 Run `npm test -- --coverage` in `frontend/` and ensure ≥ 80% branch + line coverage threshold is met and enforced in CI config
- [ ] T063 Run `npm run build` in `frontend/`, confirm zero build errors, run Playwright e2e suite against local stack, and update `specs/001-react-assistant-webapp/quickstart.md` where any step is inaccurate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 complete — **BLOCKS all user story phases**
- **Phase 3 (US1 P1)**: Requires Phase 2 complete — no dependency on US2/US3/US4
- **Phase 4 (US2 P2)**: Requires Phase 2 complete — may build on US1 atoms (Button, LoadingDots)
- **Phase 5 (US3 P3)**: Requires Phase 2 complete + Phase 4 complete (T040 `MessageBubble` required by T047)
- **Phase 6 (US4 P4)**: Requires US2 complete (ChatTemplate needed for responsive CSS)
- **Phase 7 (Polish)**: Requires all desired user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|---------------------|
| US1 (P1) | Phase 2 done | — (first user story) |
| US2 (P2) | Phase 2 done | US1 tests/atoms |
| US3 (P3) | Phase 2 done + T040 (MessageBubble) | US2 tests after T040 |
| US4 (P4) | T042 (ChatTemplate exists) | US3 |

### Within Each User Story

1. Tests written first → committed → confirmed failing
2. Foundation atoms (no deps within story) → molecules → organisms → templates → pages
3. Hook extensions (T048) after base hook exists (T015)

---

## Parallel Execution Example: User Story 1

After Phase 2 is complete, the following US1 tasks can run in parallel:

**Parallel Group A — All tests (write first):**
T016 · T017 · T018 · T019 · T020 · T021 · T022 · T023 · T024 · T026

**Parallel Group B — Foundation atoms (implement after tests):**
T027 (Button) · T028 (TextInput) · T029 (LoadingDots) · T031 (ErrorBanner) · T033 (LoginTemplate)

**Sequential after Group B:**
T030 (MessageInputBar — needs T027 + T028) →
T032 (ChatComposer — needs T030) →
T034 (LoginPage — needs T033) →
T035 (main.tsx AuthGuard — needs T034)

T025 (ChatComposer integration test — should be written before/alongside T032)

---

## Implementation Strategy

### MVP Scope (Phase 1 + Phase 2 + Phase 3 only)

Completing through Phase 3 delivers a fully working, authenticated chat app with:
- Google sign-in via Firebase Auth
- Send a message → receive streaming response from ADK agent
- Loading indicator + error handling
- All US1 unit + component tests passing
- Conversation history NOT yet persisted (ChatPage is a skeleton)

### Incremental Delivery

| After Phase | Deliverable |
|-------------|-------------|
| Phase 3 | MVP: Send + receive messages (US1 ✅) |
| Phase 4 | Scrollable history + Firestore persistence (US1 + US2 ✅) |
| Phase 5 | Structured tool result widgets (US1 + US2 + US3 ✅) |
| Phase 6 | Accessible, responsive, production-quality (all US ✅) |
| Phase 7 | Fully validated, deployable release |

### Task Count Summary

| Phase | Tasks | Tests | Implementation |
|-------|-------|-------|----------------|
| Phase 1: Setup | 6 | — | 6 |
| Phase 2: Foundational | 9 | — | 9 |
| Phase 3: US1 (P1) | 20 | 11 | 9 |
| Phase 4: US2 (P2) | 8 | 3 | 5 |
| Phase 5: US3 (P3) | 5 | 2 | 3 |
| Phase 6: US4 (P4) | 8 | 2 | 6 |
| Phase 7: Polish | 7 | 2 (e2e) | 5 |
| **Total** | **63** | **20** | **43** |
