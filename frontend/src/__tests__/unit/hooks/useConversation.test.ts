import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const mockCreateSession = vi.fn();
const mockRunSSEStream = vi.fn();
const mockCreateConversation = vi.fn();
const mockSaveMessage = vi.fn();
const mockUpdateConversation = vi.fn();
const mockLoadMessages = vi.fn();

vi.mock('@/services/adkService', () => ({
  createSession: (...args: unknown[]) => mockCreateSession(...args),
  runSSEStream: (...args: unknown[]) => mockRunSSEStream(...args),
  deleteSession: vi.fn(),
}));

vi.mock('@/services/firebaseService', () => ({
  createConversation: (...args: unknown[]) => mockCreateConversation(...args),
  saveMessage: (...args: unknown[]) => mockSaveMessage(...args),
  updateConversation: (...args: unknown[]) => mockUpdateConversation(...args),
  loadMessages: (...args: unknown[]) => mockLoadMessages(...args),
}));

// Mock crypto.randomUUID
let uuidCounter = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => `uuid-${++uuidCounter}`,
});

import { useConversation } from '@/hooks/useConversation';

beforeEach(() => {
  vi.clearAllMocks();
  uuidCounter = 0;
  mockCreateConversation.mockResolvedValue(undefined);
  mockSaveMessage.mockResolvedValue(undefined);
  mockUpdateConversation.mockResolvedValue(undefined);
});

describe('useConversation', () => {
  it('starts with empty messages and idle status', () => {
    const { result } = renderHook(() => useConversation('uid-1'));
    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
  });

  it('initSession creates a session and sets convId', async () => {
    mockCreateSession.mockResolvedValueOnce('session-42');

    const { result } = renderHook(() => useConversation('uid-1'));

    await act(async () => {
      await result.current.initSession('uid-1');
    });

    expect(mockCreateSession).toHaveBeenCalledWith('uid-1');
  });

  it('sendMessage appends user message then streams assistant response', async () => {
    mockCreateSession.mockResolvedValueOnce('session-42');
    mockRunSSEStream.mockImplementation(
      async (_uid: string, _sid: string, _text: string, onEvent: (msg: unknown) => void) => {
        onEvent({
          content: { kind: 'text', text: 'Hello!' },
          sender: 'assistant',
          status: 'received',
          isFinal: true,
        });
      },
    );

    const { result } = renderHook(() => useConversation('uid-1'));

    await act(async () => {
      await result.current.initSession('uid-1');
    });

    await act(async () => {
      await result.current.sendMessage('Hi there');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0]?.sender).toBe('user');
      expect(result.current.messages[0]?.content).toMatchObject({ kind: 'text', text: 'Hi there' });
      expect(result.current.messages[1]?.sender).toBe('assistant');
    });
  });

  it('sets error status when SSE stream fails', async () => {
    mockCreateSession.mockResolvedValueOnce('session-42');
    mockRunSSEStream.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useConversation('uid-1'));

    await act(async () => {
      await result.current.initSession('uid-1');
    });

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.errorMessage).toBeTruthy();
    });
  });

  it('blocks second send while in-flight', async () => {
    mockCreateSession.mockResolvedValueOnce('session-42');
    let resolveStream: (() => void) | null = null;
    mockRunSSEStream.mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolveStream = resolve;
      });
    });

    const { result } = renderHook(() => useConversation('uid-1'));

    await act(async () => {
      await result.current.initSession('uid-1');
    });

    // First send
    let firstSend: Promise<void>;
    await act(async () => {
      firstSend = result.current.sendMessage('first');
    });

    // Second send while first is in-flight should be blocked
    await act(async () => {
      await result.current.sendMessage('second');
    });

    // Only one SSE call should have been made
    expect(mockRunSSEStream).toHaveBeenCalledTimes(1);

    // Resolve the first stream
    await act(async () => {
      resolveStream?.();
      await firstSend;
    });
  });

  it('clearError resets error state', async () => {
    mockCreateSession.mockResolvedValueOnce('session-42');
    mockRunSSEStream.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() => useConversation('uid-1'));

    await act(async () => {
      await result.current.initSession('uid-1');
    });

    await act(async () => {
      await result.current.sendMessage('test');
    });

    await waitFor(() => expect(result.current.errorMessage).toBeTruthy());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.status).toBe('idle');
  });
});
