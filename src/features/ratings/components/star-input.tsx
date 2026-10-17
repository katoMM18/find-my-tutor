'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type StarInputProps = {
  value: number;
  onChange: (value: number) => void;
};

export const StarInput = ({ value, onChange }: StarInputProps) => {
  const { t } = useT();
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label={t.reviews.rating} className="flex" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            type="button"
            role="radio"
            aria-checked={value === index}
            aria-label={`${index} — ${t.reviews.ratingLabels[index - 1]}`}
            onMouseEnter={() => setHovered(index)}
            onClick={() => onChange(index)}
            className="rounded-md p-1 transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Star
              aria-hidden="true"
              className={cn(
                'size-7 transition-colors',
                index <= shown ? 'fill-primary text-primary' : 'fill-transparent text-muted-foreground/50'
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {shown ? t.reviews.ratingLabels[shown - 1] : t.reviews.selectRating}
      </span>
    </div>
  );
};
