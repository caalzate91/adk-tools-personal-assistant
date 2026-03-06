import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock dependencies
const mockOnAuthChange = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignOutUser = vi.fn();
const mockUpsertUserProfile = vi.fn();

vi.mock('@/services/firebaseService', () => ({
  onAuthChange: (...args: unknown[]) => mockOnAuthChange(...args),
  signInWithGoogle: () => mockSignInWithGoogle(),
  signOutUser: () => mockSignOutUser(),
  upsertUserProfile: (...args: unknown[]) => mockUpsertUserProfile(...args),
}));

import { useAuth } from '@/hooks/useAuth';

beforeEach(() => {
  vi.clearAllMocks();
  mockUpsertUserProfile.mockResolvedValue(undefined);
});

describe('useAuth', () => {
  it('starts in loading state with null user', () => {
    mockOnAuthChange.mockReturnValue(vi.fn());

    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('updates user on auth state change (sign-in)', async () => {
    mockOnAuthChange.mockImplementation((cb: (user: unknown) => void) => {
      cb({ uid: 'u1', displayName: 'Test', email: 'test@test.com', photoURL: null });
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual({
        uid: 'u1',
        displayName: 'Test',
        email: 'test@test.com',
        photoURL: null,
      });
      expect(result.current.loading).toBe(false);
    });
  });

  it('clears user on sign-out', async () => {
    mockOnAuthChange.mockImplementation((cb: (user: null) => void) => {
      cb(null);
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('signIn calls signInWithGoogle', async () => {
    mockOnAuthChange.mockReturnValue(vi.fn());
    mockSignInWithGoogle.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(mockSignInWithGoogle).toHaveBeenCalledOnce();
  });

  it('signIn sets error on failure', async () => {
    mockOnAuthChange.mockReturnValue(vi.fn());
    mockSignInWithGoogle.mockRejectedValueOnce(new Error('auth/popup-closed'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe('auth/popup-closed');
  });

  it('exposes loading state during sign-in', async () => {
    mockOnAuthChange.mockImplementation((cb: (user: null) => void) => {
      cb(null);
      return vi.fn();
    });
    mockSignInWithGoogle.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn();
    });
  });

  it('signOut calls signOutUser', async () => {
    mockOnAuthChange.mockReturnValue(vi.fn());
    mockSignOutUser.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOutUser).toHaveBeenCalledOnce();
  });

  it('signOut sets error on failure', async () => {
    mockOnAuthChange.mockReturnValue(vi.fn());
    mockSignOutUser.mockRejectedValueOnce(new Error('sign-out-fail'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.error).toBe('sign-out-fail');
  });

  it('signOut with non-Error sets fallback message', async () => {
    mockOnAuthChange.mockReturnValue(vi.fn());
    mockSignOutUser.mockRejectedValueOnce('string-error');

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.error).toBe('Sign-out failed. Please try again.');
  });

  it('signIn with non-Error sets fallback message', async () => {
    mockOnAuthChange.mockReturnValue(vi.fn());
    mockSignInWithGoogle.mockRejectedValueOnce(42);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.error).toBe('Sign-in failed. Please try again.');
  });
});
