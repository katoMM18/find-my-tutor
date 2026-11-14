'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

import { useShortlistStore } from '@/features/shortlist/hooks/useShortlistStore';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type SaveTutorButtonProps = {
  teacherId: string;
  name: string;
  // "tab" sits in a flyer's tear-off row; "button" stands alone with a label.
  variant?: 'tab' | 'button';
  className?: string;
};

export const SaveTutorButton = ({ teacherId, name, variant = 'tab', className }: SaveTutorButtonProps) => {
  const { ids, toggle } = useShortlistStore();
  const { t, fmt } = useT();
  const saved = ids.includes(teacherId);
  // Only a fresh tap pops the heart; hearts already saved on load stay still.
  const [tapped, setTapped] = useState(false);
  const label = fmt(saved ? t.shortlist.unsaveName : t.shortlist.saveName, { name });

  return (
    <button
      type="button"
      onClick={() => {
        setTapped(!saved);
        toggle(teacherId);
      }}
      aria-pressed={saved}
      aria-label={variant === 'tab' ? label : undefined}
      title={variant === 'tab' ? label : undefined}
      className={cn(
        'relative z-10 inline-flex items-center justify-center gap-2 text-sm font-semibold outline-none transition-colors',
        'hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
        variant === 'tab' ? 'w-14 shrink-0 py-3' : 'h-10 rounded-lg border border-border px-4',
        saved && 'text-primary',
        className
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn('size-4 transition-transform duration-200 motion-safe:active:scale-75', saved && 'fill-current', saved && tapped && 'animate-pop')}
      />
      {variant === 'button' && (saved ? t.shortlist.saved : t.shortlist.save)}
    </button>
  );
};
