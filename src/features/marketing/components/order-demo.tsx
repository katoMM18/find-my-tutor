'use client';

import { useState } from 'react';

import { InkMark } from '@/features/ratings/components/ink-mark';
import { Badge } from '@/shared/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { ORDER_DEMO_TUTORS } from '@/shared/const/order-demo.const';
import { VIP_STATUS_LABELS, VIP_STATUS_RANK } from '@/shared/const/vip.const';
import { useFlip } from '@/shared/hooks/use-flip';
import { useT } from '@/shared/hooks/use-t';

type DemoSort = 'recommended' | 'rating';

// Dramatises the product rule: paying changes the order, never the mark. Same ranking rules as discovery.
export const OrderDemo = () => {
  const { t, subject } = useT();
  const [sort, setSort] = useState<DemoSort>('recommended');
  const rows = [...ORDER_DEMO_TUTORS].sort((a, b) =>
    sort === 'recommended'
      ? VIP_STATUS_RANK[b.vipStatus] - VIP_STATUS_RANK[a.vipStatus] || b.reviews - a.reviews
      : b.rating - a.rating || VIP_STATUS_RANK[b.vipStatus] - VIP_STATUS_RANK[a.vipStatus]
  );
  const listRef = useFlip<HTMLOListElement>(rows.map((row) => row.id).join(','));

  return (
    <div className="paper tape tape-left bg-paper-white rounded-xl pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-4">
        <Badge variant="outline">{t.home.demoLabel}</Badge>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          aria-label={t.home.demoSortLabel}
          value={sort}
          onValueChange={(value) => value && setSort(value === 'rating' ? 'rating' : 'recommended')}
        >
          <ToggleGroupItem value="recommended">{t.sorts.recommended}</ToggleGroupItem>
          <ToggleGroupItem value="rating">{t.sorts.rating}</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ol ref={listRef} className="divide-y divide-rule" aria-live="polite">
        {rows.map((row, index) => (
          <li key={row.id} data-flip-key={row.id} className="flex items-center gap-4 px-5 py-4">
            <span className="w-5 text-sm font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{row.name}</span>
                {row.vipStatus !== 'none' && <Badge variant="stamp">{VIP_STATUS_LABELS[row.vipStatus]}</Badge>}
              </span>
              <span className="text-sm text-muted-foreground">{subject(row.subject)}</span>
            </span>
            <InkMark rating={row.rating} count={row.reviews} />
          </li>
        ))}
      </ol>
    </div>
  );
};
