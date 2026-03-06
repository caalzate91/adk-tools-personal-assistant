import { useReducer, useCallback, useRef } from 'react';
import type { Message, MessageContent } from '@/types/message';
import { createSession, runSSEStream } from '@/services/adkService';
import {
  createConversation,
  saveMessage,
  loadMessages,
  updateConversation,
} from '@/services/firebaseService';

type ConversationStatus = 'idle' | 'sending' | 'streaming' | 'error';

interface ConversationState {
  messages: Message[];
  status: ConversationStatus;
  sessionId: string | null;
  convId: string | null;
  errorMessage: string | null;
}

type ConversationAction =
  | { type: 'SET_SESSION'; sessionId: string; convId: string }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'UPDATE_LAST_ASSISTANT'; content: MessageContent; status: Message['status'] }
  | { type: 'SET_STATUS'; status: ConversationStatus }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'LOAD_MESSAGES'; messages: Message[] }
  | { type: 'CLEAR_ERROR' };

function reducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, sessionId: action.sessionId, convId: action.convId, messages: [], errorMessage: null };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'UPDATE_LAST_ASSISTANT': {
      const msgs = [...state.messages];
      const lastIdx = msgs.length - 1;
      const last = msgs[lastIdx];
      if (last && last.sender === 'assistant') {
        msgs[lastIdx] = { ...last, content: action.content, status: action.status };
      }
      return { ...state, messages: msgs };
    }
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'SET_ERROR':
      return { ...state, status: 'error', errorMessage: action.error };
    case 'LOAD_MESSAGES':
      return { ...state, messages: action.messages };
    case 'CLEAR_ERROR':
      return { ...state, errorMessage: null, status: 'idle' };
  }
}

const initialState: ConversationState = {
  messages: [],
  status: 'idle',
  sessionId: null,
  convId: null,
  errorMessage: null,
};

interface UseConversationReturn {
  messages: Message[];
  status: ConversationStatus;
  errorMessage: string | null;
  sendMessage: (text: string) => Promise<void>;
  initSession: (userId: string) => Promise<void>;
  loadHistory: (userId: string, convId: string) => Promise<void>;
  clearError: () => void;
}

export function useConversation(userId: string | null): UseConversationReturn {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const initSession = useCallback(
    async (uid: string) => {
      try {
        const sessionId = await createSession(uid);
        const convId = crypto.randomUUID();
        dispatch({ type: 'SET_SESSION', sessionId, convId });
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Failed to initialize session. Please try again.' });
      }
    },
    [],
  );

  const loadHistory = useCallback(async (uid: string, convId: string) => {
    try {
      const messages = await loadMessages(uid, convId);
      dispatch({ type: 'LOAD_MESSAGES', messages });
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Failed to load conversation history.' });
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId || !state.sessionId || !state.convId) return;
      if (inFlightRef.current) return; // block duplicate sends

      inFlightRef.current = true;
      dispatch({ type: 'SET_STATUS', status: 'sending' });

      const userMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'user',
        content: { kind: 'text', text },
        timestamp: new Date(),
        status: 'received',
      };
      dispatch({ type: 'ADD_MESSAGE', message: userMessage });

      // Create Firestore conversation on first message
      if (state.messages.length === 0) {
        const title = text.slice(0, 60);
        await createConversation(userId, state.convId, state.sessionId, title).catch(() => {
          // Firestore write is fire-and-forget
        });
      }

      // Save user message to Firestore
      saveMessage(userId, state.convId, userMessage).catch(() => {
        // fire-and-forget
      });

      // Placeholder for assistant response
      const assistantMsgId = crypto.randomUUID();
      const assistantPlaceholder: Message = {
        id: assistantMsgId,
        sender: 'assistant',
        content: { kind: 'text', text: '' },
        timestamp: new Date(),
        status: 'sending',
      };
      dispatch({ type: 'ADD_MESSAGE', message: assistantPlaceholder });
      dispatch({ type: 'SET_STATUS', status: 'streaming' });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        let finalContent: MessageContent = { kind: 'text', text: '' };

        await runSSEStream(
          userId,
          state.sessionId,
          text,
          (partial) => {
            if (partial.content) {
              finalContent = partial.content;
              dispatch({
                type: 'UPDATE_LAST_ASSISTANT',
                content: partial.content,
                status: partial.status ?? 'sending',
              });
            }
            if (partial.status === 'error') {
              dispatch({
                type: 'SET_ERROR',
                error: partial.content?.kind === 'text' ? partial.content.text : 'An error occurred.',
              });
            }
          },
          controller.signal,
        );

        // Save final assistant message to Firestore
        const finalMsg: Message = {
          id: assistantMsgId,
          sender: 'assistant',
          content: finalContent,
          timestamp: new Date(),
          status: 'received',
        };
        dispatch({
          type: 'UPDATE_LAST_ASSISTANT',
          content: finalContent,
          status: 'received',
        });

        saveMessage(userId, state.convId, finalMsg).catch(() => {
          // fire-and-forget
        });
        updateConversation(userId, state.convId, {}).catch(() => {
          // fire-and-forget — updates updatedAt
        });

        dispatch({ type: 'SET_STATUS', status: 'idle' });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          dispatch({
            type: 'SET_ERROR',
            error: 'Connection lost. Please try again.',
          });
          dispatch({
            type: 'UPDATE_LAST_ASSISTANT',
            content: { kind: 'text', text: 'Error receiving response.' },
            status: 'error',
          });
        }
      } finally {
        inFlightRef.current = false;
        abortRef.current = null;
      }
    },
    [userId, state.sessionId, state.convId, state.messages.length],
  );

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return {
    messages: state.messages,
    status: state.status,
    errorMessage: state.errorMessage,
    sendMessage,
    initSession,
    loadHistory,
    clearError,
  };
}
