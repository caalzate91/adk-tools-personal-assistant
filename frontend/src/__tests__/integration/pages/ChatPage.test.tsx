import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatPage } from '@/pages/ChatPage/ChatPage';

const mockInitSession = vi.fn();
const mockSendMessage = vi.fn();
const mockClearError = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'u1', displayName: 'Ada', email: 'ada@test.com', photoURL: 'https://example.com/ada.jpg' },
    signOut: mockSignOut,
  }),
}));

vi.mock('@/hooks/useConversation', () => ({
  useConversation: () => ({
    messages: [],
    status: 'idle' as const,
    errorMessage: null,
    sendMessage: mockSendMessage,
    initSession: mockInitSession,
    clearError: mockClearError,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockInitSession.mockResolvedValue(undefined);
});

describe('ChatPage', () => {
  it('calls initSession on mount with user uid', () => {
    render(<ChatPage />);
    expect(mockInitSession).toHaveBeenCalledWith('u1');
  });

  it('renders AppHeader with user name', () => {
    render(<ChatPage />);
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('renders the message input', () => {
    render(<ChatPage />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
