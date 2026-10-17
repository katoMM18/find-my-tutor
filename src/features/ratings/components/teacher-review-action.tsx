'use client';

import { CheckCircle2, Clock3, MessageSquareQuote } from 'lucide-react';

import { ReviewForm } from '@/features/ratings/components/review-form';
import { useRatingRequests } from '@/features/ratings/hooks/use-rating-requests';
import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';
import { firstName } from '@/shared/utils/format';

type TeacherReviewActionProps = {
  teacherProfileId: string;
  teacherName: string;
  onReviewPosted: () => void;
};

export const TeacherReviewAction = ({ teacherProfileId, teacherName, onReviewPosted }: TeacherReviewActionProps) => {
  const { requests, loading, error, requestReview, submit } = useRatingRequests();
  const { t, fmt } = useT();
  const request = requests.find((item) => item.teacherProfileId === teacherProfileId);
  const name = firstName(teacherName);

  if (loading) return null;

  return (
    <div id="review" className="scroll-mt-24 rounded-lg border border-border bg-muted/40 p-4">
      {request?.status === 'approved' ? (
        <>
          <p className="mb-3 text-sm font-semibold">{fmt(t.reviews.enabledByTeacher, { name })}</p>
          <ReviewForm
            teacherName={name}
            onSubmit={async (value, comment) => {
              const ok = await submit(request.id, value, comment);
              if (ok) onReviewPosted();
              return ok;
            }}
          />
        </>
      ) : request?.status === 'submitted' ? (
        <p className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
          {t.reviews.published}
        </p>
      ) : request?.status === 'pending' ? (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {fmt(t.reviews.requested, { name })}
        </p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MessageSquareQuote className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {request?.status === 'expired' ? t.reviews.expiredAsk : fmt(t.reviews.askPrompt, { name })}
          </p>
          <Button type="button" size="sm" variant="outline" onClick={() => void requestReview(teacherProfileId)}>
            {t.reviews.askButton}
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
};
