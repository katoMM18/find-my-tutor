'use client';
import { type ReactNode, useEffect, useState } from 'react';
import { type StoreApi } from 'zustand';

import { AuthStoreContext } from '@/features/auth/hooks/useAuthStore';
import { createAuthStore } from '@/features/auth/store/auth-store';
import { AuthStore } from '@/features/auth/types/auth.types';
import { ShortlistStoreContext, type ShortlistStoreApi } from '@/features/shortlist/hooks/useShortlistStore';
import { createShortlistStore } from '@/features/shortlist/store/shortlist-store';

export type StoreProviderProps = { children: ReactNode };

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [authStore] = useState<StoreApi<AuthStore>>(() => createAuthStore());
  const [shortlistStore] = useState<ShortlistStoreApi>(() => createShortlistStore());

  useEffect(() => {
    void shortlistStore.persist.rehydrate();
  }, [shortlistStore]);

  return (
    <AuthStoreContext.Provider value={authStore}>
      <ShortlistStoreContext.Provider value={shortlistStore}>
        {children}
      </ShortlistStoreContext.Provider>
    </AuthStoreContext.Provider>
  );
};
