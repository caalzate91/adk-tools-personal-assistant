# Tasks: React Personal Assistant Web App

**Input**: Design documents from `/specs/001-react-assistant-webapp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Per Constitution Principle II (Testing Standards), test tasks are REQUIRED for all features.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US1-US4]**: Which user story this task belongs to
- Exact file paths are included in the descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling configuration, and base architectural scaffold.

- [x] T001 Update package.json to include Vitest, Playwright, React Testing Library, and TypeScript ESLint dependencies in `frontend/package.json`
- [x] T002 Configure Vitest environment (jsdom, thresholds >= 80%) in `frontend/vite.config.ts`
- [x] T003 Configure Playwright settings in `frontend/playwright.config.ts`
- [x] T004 Enforce strict linting rules and plugins in `frontend/eslint.config.js`
- [x] T005 Enforce TypeScript strictness and domain paths in `frontend/tsconfig.app.json`
- [x] T006 Create Atomic Design directory structure under `frontend/src/` (atoms, molecules, organisms, templates, pages, services, hooks, types, __tests__)

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base state types, global styles, and foundational utilities that block multiple user stories.

- [x] T007 Define core data types (User, Message, MessageContent, ToolType) in `frontend/src/types/message.ts`
- [x] T008 Define conversation-specific types (`Conversation`) in `frontend/src/types/conversation.ts`
- [x] T009 Set up Firebase initialization instance in `frontend/src/firebase.ts`
- [x] T010 Setup global CSS custom properties + reset per atomic philosophy in `frontend/src/index.css`

## Phase 3: [US1] Send a Message and Receive a Response (P1)

**Story Goal**: Users can type messages into the text bar, send them, and see the response incrementally streamed back.
**Independent Test Criteria**: A mock stream can successfully populate a local message state list. User interactions dispatch expected payloads.

- [x] T011 [P] [US1] Create unit tests for ADK service in `frontend/src/__tests__/unit/services/adkService.test.ts`
- [x] T012 [US1] Implement `adkService.ts` to wrap `/run_sse` with native `fetch()` and `ReadableStream` SSE parsing in `frontend/src/services/adkService.ts`
- [x] T013 [P] [US1] Build `Button` atom component in `frontend/src/atoms/Button/Button.tsx`
- [x] T014 [P] [US1] Build `TextInput` atom component in `frontend/src/atoms/TextInput/TextInput.tsx`
- [x] T015 [P] [US1] Build `LoadingDots` atom for typing indicators in `frontend/src/atoms/LoadingDots/LoadingDots.tsx`
- [x] T016 [US1] Combine atoms into `MessageInputBar` molecule to handle submit events in `frontend/src/molecules/MessageInputBar/MessageInputBar.tsx`
- [x] T017 [US1] Combine atoms into `MessageBubble` molecule to render text content in `frontend/src/molecules/MessageBubble/MessageBubble.tsx`
- [x] T018 [US1] Build `ChatComposer` organism orchestrating message input logic in `frontend/src/organisms/ChatComposer/ChatComposer.tsx`
- [x] T019 [US1] Create Layout structure `ChatTemplate` in `frontend/src/templates/ChatTemplate/ChatTemplate.tsx`
- [x] T020 [US1] Write E2E testing specs for basic chat flow in `frontend/e2e/chat-flow.spec.ts`

## Phase 4: [US2] View Conversation History (P2)

**Story Goal**: User conversations persist securely across sessions using Firebase Auth and Firestore.
**Independent Test Criteria**: Unauthorized users cannot access chat. Authenticated users query their specific `userId` documents and populate the feed.

- [x] T021 [P] [US2] Implement logic tests for firebase service in `frontend/src/__tests__/unit/services/firebaseService.test.ts`
- [x] T022 [US2] Implement Firestore wrapper operations in `frontend/src/services/firebaseService.ts`
- [x] T023 [US2] Implement `useAuth` hook wrapping Firebase Auth in `frontend/src/hooks/useAuth.ts`
- [x] T024 [US2] Implement `useConversation` hook wrapping state management and Firestore fetching in `frontend/src/hooks/useConversation.ts`
- [x] T025 [P] [US2] Build `LoginTemplate` layout component in `frontend/src/templates/LoginTemplate/LoginTemplate.tsx`
- [x] T026 [US2] Build wired `LoginPage` enabling Google Auth sign-in in `frontend/src/pages/LoginPage/LoginPage.tsx`
- [x] T027 [US2] Build authentication flow verification E2E test in `frontend/e2e/auth-flow.spec.ts`

## Phase 5: [US3] View Structured Tool Results (P3)

**Story Goal**: Display agent tooling operations (e.g. google search) directly embedded in messages securely and structured.
**Independent Test Criteria**: A mocked JSON tooling response parses cleanly into a non-editable, structured summary widget.

- [x] T028 [P] [US3] Build `Icon` atom component for generic identifiers in `frontend/src/atoms/Icon/Icon.tsx`
- [x] T029 [US3] Build `ToolResultWidget` molecule formatting specialized structured outputs in `frontend/src/molecules/ToolResultWidget/ToolResultWidget.tsx`
- [x] T030 [US3] Update `MessageBubble.tsx` to conditionally render `ToolResultWidget` alongside text content in `frontend/src/molecules/MessageBubble/MessageBubble.tsx`

## Phase 6: [US4] Accessible and Responsive Interface (P4)

**Story Goal**: The application scales securely on mobile devices, manages active state transitions elegantly, and passes accessibility checks.
**Independent Test Criteria**: E2E testing navigation using only Keyboard commands; Lighthouse scores >90.

- [x] T031 [P] [US4] Build `Avatar` atom for user vs AI identification in `frontend/src/atoms/Avatar/Avatar.tsx`
- [x] T032 [P] [US4] Build `ErrorBanner` molecule to catch boundary or network errors safely in `frontend/src/molecules/ErrorBanner/ErrorBanner.tsx`
- [x] T033 [US4] Build `AppHeader` organism containing global controls and Avatar in `frontend/src/organisms/AppHeader/AppHeader.tsx`
- [x] T034 [US4] Build `ConversationFeed` organism wrapping message bubbles and scrolling behaviors in `frontend/src/organisms/ConversationFeed/ConversationFeed.tsx`
- [x] T035 [US4] Integrate remaining organisms via `useConversation` and `useAuth` into `ChatPage` in `frontend/src/pages/ChatPage/ChatPage.tsx`
- [x] T036 [US4] Setup single-page routing tree in `frontend/src/App.tsx`
- [x] T037 [US4] Bind global application tree into root Document Object Model in `frontend/src/main.tsx`

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation constraints and environment deployment metrics.

- [x] T038 Evaluate standard React functional compliance through automated component integrations in `frontend/src/__tests__/integration/App.test.tsx`
- [x] T039 Execute Lighthouse evaluation capturing >=90 A11y metrics (SC-003) via E2E run output verification.
- [x] T040 Validate sub-10 second p95 response time guarantees using automated telemetry via Playwright standard timing output loops in `frontend/e2e/latencies.ts`

---

## Dependencies & Implementation Strategy

### Execution Graph

1. Phase 1 (Setup) and Phase 2 (Foundational) must complete strictly sequentially to unblock component development.
2. After Phase 2, `atoms` in Phase 3 [US1], Phase 5 [US3], and Phase 6 [US4] can be built purely in parallel:
   - Parallel Worker A: Buttons, TextInputs (US1)
   - Parallel Worker B: Icons, Avatars (US3, US4)
3. Higher level Organisms rely sequentially on their child Atoms & Molecules.
4. Services layer (`adkService`, `firebaseService`) can be mocked initially and built independently of UI (US1, US2).

### MVP Scope

The recommended MVP increment is purely Phase 1 + 2 + Phase 3 (US1). Achieving a mocked response stream via the simple ADK adapter provides the entire structural feedback loop needed before scaling out to persist histories via Firebase (US2).
