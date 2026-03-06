# Contract: Firebase Services

**Consumer**: `frontend/src/firebase.ts`, `frontend/src/services/firebaseService.ts`
**Providers**: Firebase Auth SDK, Firebase Firestore SDK (v10+ modular API)

---

## Firebase Project Setup Checklist

- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable **Authentication** → Sign-in providers → **Google** (primary)
- [ ] Enable **Firestore Database** → Production mode (start with strict rules below)
- [ ] Register a **Web App** in the project and copy the config object
- [ ] Configure authorised domains (add `localhost` for dev)

---

## Environment Variables

The frontend reads Firebase config from Vite env vars (prefix `VITE_`):

```env
# frontend/.env.local  (gitignored)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# ADK backend URL
VITE_ADK_BASE_URL=http://localhost:8000
```

**Firebase init** (`frontend/src/firebase.ts`):
```ts
import { initializeApp } from 'firebase/app';
import { getAuth }        from 'firebase/auth';
import { getFirestore }   from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app       = initializeApp(firebaseConfig);
export const auth      = getAuth(app);
export const firestore = getFirestore(app);
```

---

## Firestore Collection Schema

### `/users/{uid}`

```
Field          Type        Required  Notes
─────────────────────────────────────────────────────────────
displayName    string      ✅        From Firebase Auth profile
email          string      ✅        From Firebase Auth profile
photoURL       string      ❌        null if not available
createdAt      Timestamp   ✅        Set on first sign-in
lastActiveAt   Timestamp   ✅        Updated on each session start
```

### `/users/{uid}/conversations/{convId}`

```
Field          Type        Required  Notes
─────────────────────────────────────────────────────────────
id             string      ✅        = convId (denormalised)
adkSessionId   string      ✅        Value from ADK POST /sessions response
title          string      ✅        First 60 chars of first user message
createdAt      Timestamp   ✅        Set when conversation is created
updatedAt      Timestamp   ✅        Updated on every new message
```

### `/users/{uid}/conversations/{convId}/messages/{msgId}`

```
Field          Type              Required  Notes
──────────────────────────────────────────────────────────────────────
id             string            ✅        UUID; = msgId (denormalised)
sender         'user'|'assistant'✅
contentKind    'text'|'tool_result' ✅
text           string            ❌        Present when contentKind='text'
toolType       string            ❌        Present when contentKind='tool_result'
payload        map               ❌        Tool-specific JSON; e.g. exchange rate data
summary        string            ❌        Human-readable of tool result
timestamp      Timestamp         ✅        Creation time
status         'sent'|'received'|'error' ✅
```

---

## Firestore Security Rules

```firestore-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own data tree
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      match /conversations/{convId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId;

        match /messages/{msgId} {
          allow read, write: if request.auth != null
                             && request.auth.uid == userId;
        }
      }
    }

  }
}
```

> ⚠ Deploy these rules before opening the app to the internet.
> In the Firebase console: Firestore → Rules → paste and publish.

---

## Firebase Auth Contract

### Sign-in Flow

```
1. User clicks "Sign in with Google"
2. Frontend calls signInWithPopup(auth, new GoogleAuthProvider())
3. Firebase opens Google OAuth popup
4. On success: FirebaseUser object available via onAuthStateChanged()
5. user.uid  → used as ADK user_id in all API calls
6. user info → written/merged into Firestore /users/{uid}
```

**Implementation stub** (`firebaseService.ts`):
```ts
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'firebase/auth';
import { auth } from '../firebase';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser      = () => signOut(auth);
export const onAuthChange     = (cb: (user: AppUser | null) => void) =>
  onAuthStateChanged(auth, fb => cb(fb ? toAppUser(fb) : null));
```

### Auth State → App Routing

| Auth state | Rendered component |
|------------|--------------------|
| `null` (loading) | `LoadingDots` fullscreen |
| `null` (unauthenticated) | `LoginPage` |
| `AppUser` (authenticated) | `ChatPage` |

The `AuthGuard` organism wraps `ChatPage` and handles this routing logic using
`onAuthStateChanged` via the `useAuth` hook.

---

## Firestore Query Patterns

### Load conversation list
```ts
query(
  collection(firestore, `users/${uid}/conversations`),
  orderBy('updatedAt', 'desc'),
  limit(20)
)
```

### Load messages for a conversation
```ts
query(
  collection(firestore, `users/${uid}/conversations/${convId}/messages`),
  orderBy('timestamp', 'asc')
)
```

### Write a new message
```ts
setDoc(
  doc(firestore, `users/${uid}/conversations/${convId}/messages/${msg.id}`),
  { ...msg, timestamp: serverTimestamp() }
)
```

### Update conversation `updatedAt`
```ts
updateDoc(
  doc(firestore, `users/${uid}/conversations/${convId}`),
  { updatedAt: serverTimestamp() }
)
```
