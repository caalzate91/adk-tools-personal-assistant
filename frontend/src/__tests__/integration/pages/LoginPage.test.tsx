import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '@/pages/LoginPage/LoginPage';

const mockSignIn = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    signIn: mockSignIn,
    signOut: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a Google sign-in button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('calls signIn on button click', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(mockSignIn).toHaveBeenCalledOnce();
  });

  it('shows loading state during authentication', async () => {
    vi.mocked(await import('@/hooks/useAuth')).useAuth = () => ({
      user: null,
      loading: true,
      error: null,
      signIn: mockSignIn,
      signOut: vi.fn(),
    });

    render(<LoginPage />);
    // Button should be disabled or hidden during loading
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('displays auth error message', async () => {
    vi.mocked(await import('@/hooks/useAuth')).useAuth = () => ({
      user: null,
      loading: false,
      error: 'Authentication failed',
      signIn: mockSignIn,
      signOut: vi.fn(),
    });

    render(<LoginPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Authentication failed');
  });
});
