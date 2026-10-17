'use client';

import { StarRating } from '@/features/ratings/components/star-rating';
import { PublicReview } from '@/features/ratings/types/rating.types';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { useT } from '@/shared/hooks/use-t';

type ReviewListProps = {
  reviews: PublicReview[];
  emptyText: string;
};

export const ReviewList = ({ reviews, emptyText }: ReviewListProps) => {
  const { date } = useT();

  if (reviews.length === 0) {
    return <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {reviews.map((review) => (
        <li key={review.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <UserAvatar name={review.studentName} src={review.studentAvatar} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-sm font-semibold">{review.studentName}</span>
              <StarRating value={review.value} />
              <time className="text-xs text-muted-foreground" dateTime={review.submittedAt}>
                {date(review.submittedAt)}
              </time>
            </div>
            {review.comment && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
};
