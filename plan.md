# Implementation Plan: React Web App Integration

## Problem
The user wants to integrate a React web application (TypeScript) with the existing Python-based personal assistant agent. The web app should follow Atomic Design principles and be located in the root directory.

## Proposed Approach
1.  **Project Structure**:
    -   Create a `frontend/` directory for the React application.
    -   Create a `server.py` (FastAPI) in the root to serve the agent via REST API.
    -   Keep the existing Python agent code as-is, importing it into `server.py`.

2.  **Frontend (React + TypeScript + Vite)**:
    -   Initialize with Vite.
    -   Configure Tailwind CSS for styling.
    -   Implement Atomic Design directory structure: `src/components/{atoms,molecules,organisms,templates}`.
    -   Create components:
        -   **Atoms**: `Button`, `Input`, `MessageBubble`, `Avatar`.
        -   **Molecules**: `MessageInput` (Input + Button), `MessageItem` (Avatar + Bubble).
        -   **Organisms**: `ChatWindow` (List of Messages + Input).
        -   **Templates**: `MainLayout`.
        -   **Pages**: `ChatPage`.
    -   State management: React `useState` / `useEffect` for chat history.
    -   API integration: Fetch from `/api/chat`.

3.  **Backend (FastAPI)**:
    -   Create `server.py`.
    -   Define `POST /chat` endpoint accepting `{ message: string }`.
    -   Invoke `root_agent` to process the message.
    -   Return response `{ response: string }`.
    -   Enable CORS for local development.

## Todos
- [ ] Create `frontend/` directory and initialize Vite React TS app.
- [ ] Install Tailwind CSS in frontend.
- [ ] Create Atomic Design component structure.
- [ ] Implement core UI components (Button, Input, Chat interface).
- [ ] Create `server.py` with FastAPI to expose `root_agent`.
- [ ] Connect frontend to backend API.
- [ ] Add `run.sh` or instructions to run both services.
