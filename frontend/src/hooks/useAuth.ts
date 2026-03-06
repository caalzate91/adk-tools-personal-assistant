import { useState, useEffect, useCallback } from 'react';
import type { AppUser } from '@/types/user';
import {
  onAuthChange,
  signInWithGoogle,
  signOutUser,
  upsertUserProfile,
} from '@/services/firebaseService';

interface UseAuthReturn {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((appUser) => {
      setUser(appUser);
      setLoading(false);
      if (appUser) {
        upsertUserProfile(appUser).catch(() => {
          // profile upsert is fire-and-forget
        });
      }
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setError(message);
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setError(null);
    try {
      await signOutUser();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign-out failed. Please try again.';
      setError(message);
    }
  }, []);

  return { user, loading, error, signIn, signOut: handleSignOut };
}
