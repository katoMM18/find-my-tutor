'use client';

import Link from 'next/link';

import { ReviewForm } from '@/features/ratings/components/review-form';
import { useRatingRequests } from '@/features/ratings/hooks/use-rating-requests';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';
import { firstName } from '@/shared/utils/format';

export const StudentReviews = () => {
  const { requests, loading, error, submit, requestReview } = useRatingRequests();
  const { t, fmt, date } = useT();

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-muted" />;

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="font-heading text-lg font-semibold">{t.reviews.emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {t.reviews.emptyText}
        </p>
        <Button asChild className="mt-4" variant="outline"><Link href="/messages">{t.reviews.goToMessages}</Link></Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((request) => (
        <li key={request.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <UserAvatar name={request.counterpartName} src={request.counterpartAvatar} />
            <div className="min-w-0 flex-1">
              <Link href={`/teachers/${request.teacherProfileId}`} className="font-semibold hover:underline">{request.counterpartName}</Link>
              <p className="text-xs text-muted-foreground">{fmt(t.reviews.requestedOn, { date: date(request.createdAt) })}</p>
            </div>
            <Badge variant={request.status === 'approved' ? 'default' : request.status === 'submitted' ? 'soft' : 'outline'}>
              {t.reviews.status[request.status]}
            </Badge>
          </div>
          {request.status === 'approved' && (
            <div className="mt-4 border-t border-border pt-4">
              <ReviewForm teacherName={firstName(request.counterpartName)} onSubmit={(value, comment) => submit(request.id, value, comment)} />
            </div>
          )}
          {request.status === 'expired' && (
            <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => void requestReview(request.teacherProfileId)}>
              {t.reviews.askAgain}
            </Button>
          )}
        </li>
      ))}
      {error && <li className="text-sm text-destructive">{error}</li>}
    </ul>
  );
};
