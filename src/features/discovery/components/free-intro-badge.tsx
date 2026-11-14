'use client';

import { Gift } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { useT } from '@/shared/hooks/use-t';

export const FreeIntroBadge = () => {
  const { t } = useT();

  return (
    <Badge variant="soft" className="gap-1">
      <Gift className="size-3.5" aria-hidden="true" />
      {t.lessons.freeIntro}
    </Badge>
  );
};
