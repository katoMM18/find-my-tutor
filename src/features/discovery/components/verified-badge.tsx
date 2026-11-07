'use client';

import { BadgeCheck } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { useT } from '@/shared/hooks/use-t';

export const VerifiedBadge = () => {
  const { t } = useT();
  return (
    <Badge variant="outline" title={t.verification.badgeHint} className="gap-1 border-primary/40 bg-primary/8 font-semibold text-primary">
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      {t.verification.badge}
    </Badge>
  );
};
