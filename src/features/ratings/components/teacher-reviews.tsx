'use client';

import { useEffect, useState } from 'react';

import { PendingReviewRequests } from '@/features/ratings/components/pending-review-requests';
import { ReviewList } from '@/features/ratings/components/review-list';
import { RatingSummary } from '@/features/ratings/components/star-rating';
import { useRatingRequests } from '@/features/ratings/hooks/use-rating-requests';
import { TeacherReviews as TeacherReviewsData } from '@/features/ratings/types/rating.types';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

export const TeacherReviews = () => {
  const { requests, approve } = useRatingRequests();
  const { t, fmt } = useT();
  const [reviews, setReviews] = useState<TeacherReviewsData | null>(null);
  const pending = requests.filter((request) => request.status === 'pending');
  const waiting = requests.filter((request) => request.status === 'approved');

  useEffect(() => {
    void http
      .get<{ _id?: string }>('/profiles/me')
      .then((profile) => (profile._id ? http.get<TeacherReviewsData>(`/teachers/${profile._id}/ratings`) : null))
      .then(setReviews)
      .catch(() => setReviews(null));
  }, []);

  return (
    <div className="space-y-8">
      <section aria-labelledby="requests-heading" className="rounded-xl border border-border bg-card p-5">
        <h2 id="requests-heading" className="mb-4 text-base font-semibold">{fmt(t.reviews.requestsTitle, { count: pending.length })}</h2>
        {pending.length ? (
          <PendingReviewRequests requests={pending} onApprove={approve} />
        ) : (
          <p className="text-sm text-muted-foreground">{t.reviews.noRequests}</p>
        )}
        {waiting.length > 0 && (
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            {fmt(t.reviews.waitingFor, { names: waiting.map((request) => request.counterpartName).join(', ') })}
          </p>
        )}
      </section>

      <section aria-labelledby="received-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="received-heading" className="text-lg font-semibold">{t.reviews.receivedTitle}</h2>
          <RatingSummary rating={reviews?.average ?? null} count={reviews?.count ?? 0} />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <ReviewList reviews={reviews?.reviews ?? []} emptyText={t.reviews.receivedEmpty} />
        </div>
      </section>
    </div>
  );
};
