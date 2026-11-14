export type ShortlistState = {
  // Teacher profile ids, most recently saved first.
  ids: string[];
};

export type ShortlistActions = {
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export type ShortlistStore = ShortlistState & ShortlistActions;
