'use client';

import { createContext, useContext } from 'react';
import type { UserProfile } from '@/lib/types';

const UserContext = createContext<UserProfile | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: UserProfile | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): UserProfile {
  const u = useContext(UserContext);
  if (!u) {
    // Fallback for dev without backend — keeps UI from crashing.
    return {
      id: 'demo',
      fullName: 'Invité',
      email: '',
      locale: 'fr',
      currency: 'EUR',
      country: 'FR',
      planTier: 'free',
    };
  }
  return u;
}
