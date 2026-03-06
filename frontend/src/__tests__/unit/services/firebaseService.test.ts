import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase modules before importing firebaseService
vi.mock('@/firebase', () => ({
  auth: {},
  firestore: {},
}));

const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockSetDoc = vi.fn();
const mockGetDocs = vi.fn();

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((...args: unknown[]) => args.join('/')),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  collection: vi.fn((...args: unknown[]) => args.join('/')),
  query: vi.fn((...args: unknown[]) => args),
  orderBy: vi.fn(),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  serverTimestamp: vi.fn(() => 'SERVER_TS'),
  updateDoc: vi.fn(),
}));

import {
  signInWithGoogle,
  signOutUser,
  onAuthChange,
  saveMessage,
  loadMessages,
  upsertUserProfile,
  createConversation,
  updateConversation,
} from '@/services/firebaseService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('signInWithGoogle', () => {
  it('calls signInWithPopup', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({ user: { uid: 'u1' } });
    await signInWithGoogle();
    expect(mockSignInWithPopup).toHaveBeenCalledOnce();
  });
});

describe('signOutUser', () => {
  it('calls signOut', async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    await signOutUser();
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});

describe('onAuthChange', () => {
  it('maps Firebase user to AppUser on sign-in', () => {
    const cb = vi.fn();
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, handler: (user: unknown) => void) => {
      handler({ uid: 'u1', displayName: 'Test', email: 'test@test.com', photoURL: null });
      return vi.fn();
    });

    onAuthChange(cb);
    expect(cb).toHaveBeenCalledWith({
      uid: 'u1',
      displayName: 'Test',
      email: 'test@test.com',
      photoURL: null,
    });
  });

  it('passes null on sign-out', () => {
    const cb = vi.fn();
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, handler: (user: null) => void) => {
      handler(null);
      return vi.fn();
    });

    onAuthChange(cb);
    expect(cb).toHaveBeenCalledWith(null);
  });
});

describe('saveMessage', () => {
  it('saves a text message to Firestore', async () => {
    mockSetDoc.mockResolvedValueOnce(undefined);

    await saveMessage('uid-1', 'conv-1', {
      id: 'msg-1',
      sender: 'user',
      content: { kind: 'text', text: 'Hello' },
      timestamp: new Date(),
      status: 'received',
    });

    expect(mockSetDoc).toHaveBeenCalledOnce();
    const [, data] = mockSetDoc.mock.calls[0] as [unknown, Record<string, unknown>];
    expect(data).toMatchObject({
      id: 'msg-1',
      sender: 'user',
      contentKind: 'text',
      text: 'Hello',
    });
  });
});

describe('loadMessages', () => {
  it('returns mapped messages ordered by timestamp', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            id: 'msg-1',
            sender: 'user',
            contentKind: 'text',
            text: 'Hi',
            timestamp: { toDate: () => new Date('2026-01-01') },
            status: 'sent',
          }),
        },
      ],
    });

    const messages = await loadMessages('uid-1', 'conv-1');
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'msg-1',
      sender: 'user',
      content: { kind: 'text', text: 'Hi' },
      status: 'received', // 'sent' maps to 'received' on load
    });
  });

  it('maps a tool_result message from Firestore', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            id: 'msg-2',
            sender: 'assistant',
            contentKind: 'tool_result',
            text: null,
            toolType: 'exchange_rate',
            payload: { rate: 0.92 },
            summary: 'EUR/USD = 0.92',
            timestamp: { toDate: () => new Date('2026-01-01') },
            status: 'sent',
          }),
        },
      ],
    });

    const messages = await loadMessages('uid-1', 'conv-1');
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      id: 'msg-2',
      sender: 'assistant',
      content: {
        kind: 'tool_result',
        toolType: 'exchange_rate',
        payload: { rate: 0.92 },
        summary: 'EUR/USD = 0.92',
      },
    });
  });

  it('handles null timestamp gracefully', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            id: 'msg-3',
            sender: 'user',
            contentKind: 'text',
            text: 'test',
            timestamp: null,
            status: 'received',
          }),
        },
      ],
    });

    const messages = await loadMessages('uid-1', 'conv-1');
    expect(messages[0]?.timestamp).toBeInstanceOf(Date);
  });
});

describe('upsertUserProfile', () => {
  it('calls setDoc with merge option', async () => {
    mockSetDoc.mockResolvedValueOnce(undefined);
    await upsertUserProfile({
      uid: 'u1',
      displayName: 'Test',
      email: 'test@test.com',
      photoURL: null,
    });
    expect(mockSetDoc).toHaveBeenCalledOnce();
    const args = mockSetDoc.mock.calls[0] as [unknown, Record<string, unknown>, { merge: boolean }];
    expect(args[2]).toEqual({ merge: true });
  });
});

describe('createConversation', () => {
  it('creates a conversation document', async () => {
    mockSetDoc.mockResolvedValueOnce(undefined);
    await createConversation('uid-1', 'conv-1', 'session-1', 'Test Chat');
    expect(mockSetDoc).toHaveBeenCalledOnce();
    const data = (mockSetDoc.mock.calls[0] as [unknown, Record<string, unknown>])[1];
    expect(data).toMatchObject({
      id: 'conv-1',
      adkSessionId: 'session-1',
      title: 'Test Chat',
    });
  });
});

describe('updateConversation', () => {
  it('calls updateDoc with partial data', async () => {
    const mockUpdateDoc = (await import('firebase/firestore')).updateDoc as ReturnType<typeof vi.fn>;
    mockUpdateDoc.mockResolvedValueOnce(undefined);
    await updateConversation('uid-1', 'conv-1', { title: 'New Title' });
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
  });
});

describe('saveMessage - tool_result', () => {
  it('saves a tool_result message to Firestore', async () => {
    mockSetDoc.mockResolvedValueOnce(undefined);
    await saveMessage('uid-1', 'conv-1', {
      id: 'msg-2',
      sender: 'assistant',
      content: {
        kind: 'tool_result',
        toolType: 'exchange_rate',
        payload: { rate: 0.92 },
        summary: 'EUR/USD = 0.92',
      },
      timestamp: new Date(),
      status: 'received',
    });
    const data = (mockSetDoc.mock.calls[0] as [unknown, Record<string, unknown>])[1];
    expect(data).toMatchObject({
      contentKind: 'tool_result',
      toolType: 'exchange_rate',
      text: null,
    });
  });

  it('maps sending status to sent when saving', async () => {
    mockSetDoc.mockResolvedValueOnce(undefined);
    await saveMessage('uid-1', 'conv-1', {
      id: 'msg-3',
      sender: 'user',
      content: { kind: 'text', text: 'Hello' },
      timestamp: new Date(),
      status: 'sending',
    });
    const data = (mockSetDoc.mock.calls[0] as [unknown, Record<string, unknown>])[1];
    expect(data).toMatchObject({ status: 'sent' });
  });
});
