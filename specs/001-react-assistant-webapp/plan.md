# Implementation Plan: React Personal Assistant Web App

**Branch**: `001-react-assistant-webapp` | **Date**: 2026-03-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-react-assistant-webapp/spec.md`

> **⚠️ Spec Amendments** — The planning session introduced requirements that supersede two
> assumptions in spec.md:
> 1. Firebase Authentication (Google OAuth) is **required** — overrides "no auth needed".
> 2. Firebase Firestore conversation persistence is **required** — overrides "session-scoped
>    only, no cross-session persistence".
>
> These amendments should be back-ported to spec.md in the same PR via a normal amendment
> note before tasks are generated.

## Summary

Build a Vite + React 19 + TypeScript single-page chat application that lets an authenticated
user (Firebase Auth — Google OAuth) converse with the ADK personal assistant backend. Messages
are streamed from the ADK `POST /run_sse` endpoint via native `fetch()` + `ReadableStream` SSE
parsing (not the `EventSource` browser API, which only supports GET) and persisted per-user in
Firebase Firestore. The UI follows Atomic Design (Atoms → Molecules → Organisms →
Templates → Pages) with zero third-party UI or CSS libraries — vanilla CSS custom properties,
Grid, and Flexbox throughout.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode), React 19, Node.js 20+ (dev toolchain)  
**Primary Dependencies**: Vite 7, React 19, Firebase SDK 10+ (Auth + Firestore)  
**Storage**: Firebase Firestore — per-user conversation and message collections; ADK server
manages its own in-memory session state keyed by `user_id` + `session_id`  
**Testing**: Vitest + @testing-library/react (unit/component); Playwright (e2e)  
**Target Platform**: Modern browsers — Chrome latest, Firefox latest (no IE, no pre-2023)  
**Project Type**: Single-page web application (frontend SPA)  
**Performance Goals**: Agent response visible in conversation view < 10 s at p95 (SC-001);
Lighthouse Accessibility ≥ 90 (SC-003); First Contentful Paint < 2 s (standard expectation)  
**Constraints**: Minimal libraries — only React, Vite, Firebase SDK, and test tooling are
permitted; no CSS preprocessors, no UI component libraries, no HTTP libraries, no state
management libraries; native `fetch()` and `EventSource` only  
**Scale/Scope**: Single personal-use app; one authenticated user per Firebase project; one
active conversation thread per session; no multi-tenancy requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance Evidence / Exception |
|-----------|----------------------------------|
| I. Code Quality | TypeScript strict mode enforces type correctness project-wide. ESLint + typescript-eslint runs in CI (QG-1/QG-2). Each Atomic Design component has a single stated responsibility by structural mandate. Vanilla CSS removes library abstraction leakage. No Python ADK tools are modified by this feature — Python code-quality rules do not apply here, but the spirit (single responsibility, no dead code) extends to TypeScript. |
| II. Testing Standards | Vitest for unit + component tests; @testing-library/react for React component assertions; Playwright for e2e keyboard-navigation test (SC-008). Coverage gate ≥ 80% via `vitest --coverage`. Tests written before implementation (TDD). Test directories: `src/__tests__/unit/`, `src/__tests__/integration/`, `e2e/`. **Note**: Constitution's `tests/unit/` convention adapts to frontend Vite project structure — documented as justified exception. |
| III. UX Consistency | FR-007 (structured tool result rendering), FR-008 (error fallback — no stack traces exposed), SC-003 (Lighthouse ≥ 90), multilingual response handled by ADK backend. Firebase Auth error codes translated to user-facing messages before display. No raw ADK event JSON shown to user. |
| IV. Performance | Native `EventSource` SSE enables streaming display per Constitution requirement ("streaming MUST be used"). SC-001 target < 10 s p95. Vite production bundle enables code splitting. No duplicate ADK `/run_sse` calls while response is in-flight (request lock). Firebase Firestore writes are fire-and-forget (non-blocking to UX). |

**Gate result**: ✅ PASS — no violations. One justified exception documented (test directory adaptation).



## Project Structure

### Documentation (this feature)

```text
specs/001-react-assistant-webapp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── adk-api.md       # ADK web server API contract
│   └── firebase.md      # Firestore schema + security rules
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
personal_assistant/               ← ADK Python backend (unchanged)
├── agent.py
├── custom_agents.py
├── custom_functions.py
├── third_party_tools.py
├── __init__.py
└── .env                          ← ADK + Firebase env vars

frontend/                         ← Vite SPA root (web app)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
└── src/
    ├── atoms/                    ← Atomic: primitive UI building blocks
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   ├── Button.css
    │   │   └── Button.test.tsx
    │   ├── TextInput/
    │   ├── Avatar/
    │   ├── LoadingDots/
    │   └── Icon/
    ├── molecules/                ← Atomic: composed groups of atoms
    │   ├── MessageBubble/
    │   │   ├── MessageBubble.tsx
    │   │   ├── MessageBubble.css
    │   │   └── MessageBubble.test.tsx
    │   ├── MessageInputBar/
    │   ├── ToolResultWidget/
    │   └── ErrorBanner/
    ├── organisms/                ← Atomic: self-contained UI sections
    │   ├── ConversationFeed/
    │   ├── ChatComposer/
    │   └── AppHeader/
    ├── templates/                ← Atomic: layout skeletons (no business logic)
    │   ├── ChatTemplate/
    │   └── LoginTemplate/
    ├── pages/                    ← Atomic: wired pages (full data binding)
    │   ├── ChatPage/
    │   └── LoginPage/
    ├── services/                 ← External integrations (side-effect boundary)
    │   ├── adkService.ts         ← ADK web server API calls
    │   └── firebaseService.ts    ← Firestore read/write operations
    ├── hooks/                    ← React custom hooks (stateful logic)
    │   ├── useConversation.ts
    │   └── useAuth.ts
    ├── types/                    ← Shared TypeScript types (no runtime code)
    │   ├── message.ts
    │   └── conversation.ts
    ├── firebase.ts               ← Firebase app init (single instance)
    ├── main.tsx                  ← React root mount
    └── index.css                 ← Global CSS custom properties + reset

    __tests__/                    ← Vitest tests mirror src structure
    ├── unit/
    │   ├── services/
    │   └── hooks/
    └── integration/
        ├── atoms/
        ├── molecules/
        └── organisms/

e2e/                              ← Playwright end-to-end tests
├── chat-flow.spec.ts             ← US1 + US2 + US3 e2e
└── auth-flow.spec.ts             ← Firebase Auth login/logout flow
```

**Structure Decision**: Web application variant (co-located Python backend + Vite SPA).
The Vite SPA lives at `personal_assistant/frontend/` — the existing scaffold is expanded
in-place rather than replaced. All Atomic Design layers are implemented as co-located
component folders (`ComponentName/ComponentName.tsx` + `ComponentName.css` +
`ComponentName.test.tsx`).

## Complexity Tracking

| Item | Why Needed | Simpler Alternative Rejected Because |
|------|------------|-------------------------------------|
| Firebase SDK | Auth + Firestore persistence are explicit user requirements | Plain `localStorage` gives no authentication; cross-device persistence requires a backend |
| `fetch()` + `ReadableStream` SSE | Constitution Principle IV mandates streaming; ADK `/run_sse` is SSE POST; `EventSource` only supports GET so cannot send the request body | Long-polling adds latency; WebSocket is overkill for one-way streaming from ADK |
| Vitest + Playwright | Constitution Principle II mandates automated tests with ≥ 80% coverage | No viable alternative for Vite-native unit tests + keyboard-navigation e2e |

