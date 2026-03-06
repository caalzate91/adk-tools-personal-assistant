import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '@/App';

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/pages/LoginPage/LoginPage', () => ({
  LoginPage: () => <div data-testid="login-page">Login</div>,
}));

vi.mock('@/pages/ChatPage/ChatPage', () => ({
  ChatPage: () => <div data-testid="chat-page">Chat</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('shows loading state while auth is initializing', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<App />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders LoginPage when user is null and not loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<App />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders ChatPage when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'u1', displayName: 'Test', email: 'test@test.com', photoURL: null },
      loading: false,
    });
    render(<App />);
    expect(screen.getByTestId('chat-page')).toBeInTheDocument();
  });
});
