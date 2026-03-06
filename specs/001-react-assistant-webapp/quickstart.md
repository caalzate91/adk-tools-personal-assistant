# Quickstart: React Personal Assistant Web App

**Feature branch**: `001-react-assistant-webapp`

---

## Prerequisites

| Tool | Min version | Check |
|------|-------------|-------|
| Node.js | 20.x | `node --version` |
| npm | 10.x | `npm --version` |
| Python | 3.10+ | `python3 --version` |
| uv | any | `uv --version` |
| Firebase project | — | console.firebase.google.com |

---

## 1. Firebase Project Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create or open your project.
2. **Enable Authentication**:
   - Build → Authentication → Get started
   - Sign-in method → Google → Enable → Save
3. **Enable Firestore**:
   - Build → Firestore Database → Create database → **Production mode** → choose a location → Done
4. **Deploy Security Rules** (see `contracts/firebase.md`):
   - Firestore → Rules → paste the rules from `contracts/firebase.md` → Publish
5. **Register Web App**:
   - Project settings → Your apps → `</>` (Web) → Register app → copy the `firebaseConfig` object

---

## 2. Configure Environment Variables

### Backend (ADK)
```bash
# personal_assistant/.env  (already exists)
GOOGLE_API_KEY=your-gemini-api-key
# OR  GOOGLE_CLOUD_PROJECT / GOOGLE_CLOUD_LOCATION for Vertex AI
```

### Frontend
```bash
# personal_assistant/frontend/.env.local   (create this file — gitignored)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789010
VITE_FIREBASE_APP_ID=1:123456789010:web:abc123def456

VITE_ADK_BASE_URL=http://localhost:8000
```

Copy the values from the `firebaseConfig` object obtained in step 1.5 above.

---

## 3. Install Dependencies

```bash
# From the project root
cd /opt/repos/adk-agente-viajes/personal_assistant

# Install ADK and Python deps (if not already installed)
uv sync

# Install frontend dependencies
cd frontend
npm install
```

---

## 4. Start the ADK Backend

```bash
# From the project root (personal_assistant/)
adk web personal_assistant
```

The ADK web server starts at `http://localhost:8000`.

Verify it is running:
```bash
curl http://localhost:8000/list-apps
# Expected: ["personal_assistant"]
```

---

## 5. Start the Frontend Dev Server

```bash
# In a separate terminal
cd personal_assistant/frontend
npm run dev
```

The Vite dev server starts at `http://localhost:5173` (default).

Open the URL in your browser. You should see the **Sign in with Google** login screen.

---

## 6. Running Tests

### Unit / Component Tests (Vitest)
```bash
cd frontend
npm test            # run once
npm run test:watch  # watch mode
npm run test:coverage  # with coverage report (target: ≥ 80%)
```

### End-to-End Tests (Playwright)
```bash
# Requires both ADK backend and frontend dev server running (steps 4 & 5)
cd frontend
npm run test:e2e
```

---

## 7. Lint & Type Check

```bash
cd frontend
npm run lint        # ESLint + typescript-eslint
npm run type-check  # tsc --noEmit
```

Both must pass with zero errors before opening a pull request (QG-1 / QG-2).

---

## 8. Build for Production

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

To preview the production build locally:
```bash
npm run preview
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `curl /list-apps` returns empty or 404 | ADK not running | Run `adk web personal_assistant` from project root |
| Firebase popup blocked | Browser blocking popups | Allow popups for `localhost:5173` |
| Firestore permission denied | Security rules not deployed | Follow step 1.4 above |
| `VITE_FIREBASE_*` undefined at runtime | `.env.local` not created | Copy values from Firebase console (step 1.5) |
| TypeScript errors on build | Missing types | Run `npm install` again; check `tsconfig.json` |
| SSE stream returns 422 | Malformed `RunAgentRequest` | Verify `app_name` = `"personal_assistant"` and `session_id` is valid |
