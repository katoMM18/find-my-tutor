'use client';

import { useState } from 'react';

import { RatingRequestView } from '@/features/ratings/types/rating.types';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';

type PendingReviewRequestsProps = {
  requests: RatingRequestView[];
  onApprove: (id: string) => Promise<boolean>;
};

export const PendingReviewRequests = ({ requests, onApprove }: PendingReviewRequestsProps) => {
  const { t, fmt, date } = useT();
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <ul className="space-y-3">
      {requests.map((request) => (
        <li key={request.id} className="flex flex-wrap items-center gap-3">
          <UserAvatar name={request.counterpartName} src={request.counterpartAvatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{request.counterpartName}</p>
            <p className="text-xs text-muted-foreground">
              {fmt(t.reviews.askedOn, { asked: date(request.createdAt), expires: date(request.expiresAt) })}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={busyId === request.id}
            onClick={async () => {
              setBusyId(request.id);
              await onApprove(request.id);
              setBusyId(null);
            }}
          >
            {busyId === request.id ? t.reviews.enabling : t.reviews.enable}
          </Button>
        </li>
      ))}
      <li className="pt-1 text-xs text-muted-foreground">
        {t.reviews.enableNote}
      </li>
    </ul>
  );
};
