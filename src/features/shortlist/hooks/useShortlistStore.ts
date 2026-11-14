'use client';
import { createContext, useContext } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { createShortlistStore } from '@/features/shortlist/store/shortlist-store';
import { ShortlistStore } from '@/features/shortlist/types/shortlist.types';

export type ShortlistStoreApi = ReturnType<typeof createShortlistStore>;

export const ShortlistStoreContext = createContext<ShortlistStoreApi | null>(null);

export const useShortlistStore = () => {
  const store = useContext(ShortlistStoreContext);
  if (!store) throw new Error('useShortlistStore must be used within StoreProvider');
  return useStore(
    store,
    useShallow((state: ShortlistStore) => ({
      ids: state.ids,
      toggle: state.toggle,
      remove: state.remove,
      clear: state.clear,
    }))
  );
};
