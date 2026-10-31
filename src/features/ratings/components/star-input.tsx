'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
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
      <ToggleGroup
        type="single"
        aria-label={t.reviews.rating}
        value={value ? String(value) : ''}
        onValueChange={(next) => next && onChange(Number(next))}
        onMouseLeave={() => setHovered(0)}
        className="gap-0"
      >
        {[1, 2, 3, 4, 5].map((index) => (
          <ToggleGroupItem
            key={index}
            value={String(index)}
            aria-label={`${index} — ${t.reviews.ratingLabels[index - 1]}`}
            onMouseEnter={() => setHovered(index)}
            className="size-10 p-0 hover:bg-transparent aria-checked:bg-transparent aria-checked:text-foreground"
          >
            <Star
              aria-hidden="true"
              className={cn('size-7 transition-colors', index <= shown ? 'fill-mark text-mark' : 'fill-transparent text-muted-foreground/50')}
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <span className="text-sm font-medium text-muted-foreground">
        {shown ? t.reviews.ratingLabels[shown - 1] : t.reviews.selectRating}
      </span>
    </div>
  );
};
