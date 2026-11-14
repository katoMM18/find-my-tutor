'use client';

import { useT } from '@/shared/hooks/use-t';
import { type NextFreeSlot } from '@/shared/utils/availability';

// "Free today 17:00", "Free tomorrow 16:00", "Free Thu 19:00".
export const useNextFreeLabel = () => {
  const { t, fmt } = useT();

  return (slot: NextFreeSlot | null) => {
    if (!slot) return null;
    const when = slot.inDays === 0 ? t.common.today.toLocaleLowerCase() : slot.inDays === 1 ? t.common.tomorrow : t.weekdaysShort[slot.day];
    return fmt(t.lessons.nextFree, { when, time: slot.start });
  };
};
