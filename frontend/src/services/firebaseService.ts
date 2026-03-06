import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, firestore } from '@/firebase';
import type { AppUser } from '@/types/user';
import type { Message, ToolType } from '@/types/message';
import type { Conversation } from '@/types/conversation';

const provider = new GoogleAuthProvider();

function toAppUser(fbUser: FirebaseUser): AppUser {
  return {
    uid: fbUser.uid,
    displayName: fbUser.displayName,
    email: fbUser.email,
    photoURL: fbUser.photoURL,
  };
}

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function signOutUser() {
  return signOut(auth);
}

export function onAuthChange(cb: (user: AppUser | null) => void) {
  return onAuthStateChanged(auth, (fbUser) => {
    cb(fbUser ? toAppUser(fbUser) : null);
  });
}

export async function upsertUserProfile(user: AppUser): Promise<void> {
  const userRef = doc(firestore, 'users', user.uid);
  await setDoc(
    userRef,
    {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastActiveAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createConversation(
  userId: string,
  convId: string,
  adkSessionId: string,
  title: string,
): Promise<void> {
  const convRef = doc(firestore, 'users', userId, 'conversations', convId);
  await setDoc(convRef, {
    id: convId,
    adkSessionId,
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateConversation(
  userId: string,
  convId: string,
  data: Partial<Pick<Conversation, 'title'>>,
): Promise<void> {
  const convRef = doc(firestore, 'users', userId, 'conversations', convId);
  await updateDoc(convRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function saveMessage(
  userId: string,
  convId: string,
  message: Message,
): Promise<void> {
  const msgRef = doc(
    firestore,
    'users',
    userId,
    'conversations',
    convId,
    'messages',
    message.id,
  );

  const content = message.content;
  await setDoc(msgRef, {
    id: message.id,
    sender: message.sender,
    contentKind: content.kind,
    text: content.kind === 'text' ? content.text : null,
    toolType: content.kind === 'tool_result' ? content.toolType : null,
    payload: content.kind === 'tool_result' ? content.payload : null,
    summary: content.kind === 'tool_result' ? content.summary : null,
    timestamp: serverTimestamp(),
    status: message.status === 'sending' ? 'sent' : message.status,
  });
}

interface FirestoreMessageDoc {
  id: string;
  sender: 'user' | 'assistant';
  contentKind: 'text' | 'tool_result';
  text: string | null;
  toolType: string | null;
  payload: Record<string, unknown> | null;
  summary: string | null;
  timestamp: { toDate: () => Date } | null;
  status: 'sent' | 'received' | 'error';
}

export async function loadMessages(
  userId: string,
  convId: string,
): Promise<Message[]> {
  const messagesRef = collection(
    firestore,
    'users',
    userId,
    'conversations',
    convId,
    'messages',
  );
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as FirestoreMessageDoc;
    const timestamp = data.timestamp?.toDate() ?? new Date();

    if (data.contentKind === 'tool_result') {
      return {
        id: data.id,
        sender: data.sender,
        content: {
          kind: 'tool_result' as const,
          toolType: (data.toolType ?? 'unknown') as ToolType,
          payload: data.payload ?? {},
          summary: data.summary ?? '',
        },
        timestamp,
        status: data.status === 'sent' ? ('received' as const) : data.status,
      } satisfies Message;
    }

    return {
      id: data.id,
      sender: data.sender,
      content: {
        kind: 'text' as const,
        text: data.text ?? '',
      },
      timestamp,
      status: data.status === 'sent' ? ('received' as const) : data.status,
    } satisfies Message;
  });
}
