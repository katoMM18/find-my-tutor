'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';

import { useRatingRequests } from '@/features/ratings/hooks/use-rating-requests';
import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';
import { firstName } from '@/shared/utils/format';

type ThreadReviewBannerProps = {
  role: 'teacher' | 'student';
  participantId: string;
  participantName: string;
  participantProfileId: string | null;
};

export const ThreadReviewBanner = ({ role, participantId, participantName, participantProfileId }: ThreadReviewBannerProps) => {
  const { requests, approve } = useRatingRequests();
  const { t, fmt } = useT();
  const name = firstName(participantName);

  if (role === 'teacher') {
    const pending = requests.find((request) => request.counterpartId === participantId && request.status === 'pending');
    if (!pending) return null;
    return (
      <div className="flex flex-col gap-2 border-b border-border bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">{fmt(t.chat.wantsReview, { name })}</p>
        <Button type="button" size="sm" onClick={() => void approve(pending.id)}>
          {t.chat.enableReview}
        </Button>
      </div>
    );
  }

  const approved = requests.find(
    (request) => request.teacherProfileId === participantProfileId && request.status === 'approved'
  );
  if (!approved || !participantProfileId) return null;
  return (
    <div className="flex flex-col gap-2 border-b border-border bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm">
        <Star className="size-4 fill-primary text-primary" aria-hidden="true" />
        {fmt(t.chat.enabledReview, { name })}
      </p>
      <Button asChild size="sm">
        <Link href={`/teachers/${participantProfileId}#review`}>{t.chat.writeReview}</Link>
      </Button>
    </div>
  );
};
