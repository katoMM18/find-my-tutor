import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { ShortlistState, ShortlistStore } from '@/features/shortlist/types/shortlist.types';
import { SHORTLIST_MAX, SHORTLIST_STORAGE_KEY } from '@/shared/const/shortlist.const';

export const createShortlistStore = (initState: Partial<ShortlistState> = {}) => {
  const DEFAULT_STATE: ShortlistState = { ids: [] };

  return createStore<ShortlistStore>()(
    persist(
      (set) => ({
        ...DEFAULT_STATE,
        ...initState,
        toggle: (id) =>
          set((state) => ({
            ids: state.ids.includes(id)
              ? state.ids.filter((item) => item !== id)
              : [id, ...state.ids].slice(0, SHORTLIST_MAX),
          })),
        remove: (id) => set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
        clear: () => set({ ids: [] }),
      }),
      {
        name: SHORTLIST_STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ ids: state.ids }),
        // Read storage after mount so server and first client render agree.
        skipHydration: true,
      }
    )
  );
};
