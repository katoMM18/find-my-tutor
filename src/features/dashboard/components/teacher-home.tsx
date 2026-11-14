'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useConversations } from '@/features/chat/hooks/use-conversations';
import { DashboardPanel } from '@/features/dashboard/components/dashboard-panel';
import { RecentConversations } from '@/features/dashboard/components/recent-conversations';
import { SetupChecklist } from '@/features/dashboard/components/setup-checklist';
import { useProfileSetup } from '@/features/dashboard/hooks/use-profile-setup';
import { InkMark } from '@/features/ratings/components/ink-mark';
import { PendingReviewRequests } from '@/features/ratings/components/pending-review-requests';
import { useRatingRequests } from '@/features/ratings/hooks/use-rating-requests';
import { TeacherRatingSummary } from '@/features/ratings/types/rating.types';
import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

const rowLinkClassName = 'flex items-center justify-between gap-4 px-5 py-4 transition-colors outline-none hover:bg-accent focus-visible:bg-accent';

export const TeacherHome = () => {
  const { profile, steps, loaded } = useProfileSetup('teacher');
  const { t, plural } = useT();
  const { conversations, loading: conversationsLoading } = useConversations();
  const ratingRequests = useRatingRequests();
  const [rating, setRating] = useState<TeacherRatingSummary | null>(null);
  const pending = ratingRequests.requests.filter((request) => request.status === 'pending');
  const unread = conversations.filter((conversation) => conversation.unread).length;

  useEffect(() => {
    if (!profile?._id) return;
    void http.get<TeacherRatingSummary>(`/teachers/${profile._id}/ratings`).then(setRating).catch(() => setRating(null));
  }, [profile?._id]);

  return (
    <div className="space-y-6">
      {loaded && steps.some((step) => !step.complete) && <SetupChecklist steps={steps} note={t.dashboard.hiddenFromSearch} />}

      <ul className="divide-y divide-rule rounded-lg paper pl-2">
        <li className="flex items-center justify-between gap-4 px-5 py-4">
          <span className="font-medium">{t.dashboard.statRating}</span>
          <InkMark rating={rating?.average ?? null} count={rating?.count ?? 0} />
        </li>
        <li>
          <Link href="/messages" className={rowLinkClassName}>
            <span>
              <span className="block font-medium">{t.dashboard.statUnread}</span>
              <span className="block text-sm text-muted-foreground">{plural(t.common.conversations, conversations.length)}</span>
            </span>
            <span className="font-heading text-3xl font-extrabold tabular-nums text-ink">{unread}</span>
          </Link>
        </li>
        <li>
          <Link href="/reviews" className={rowLinkClassName}>
            <span>
              <span className="block font-medium">{t.dashboard.statRequests}</span>
              <span className="block text-sm text-muted-foreground">{pending.length ? t.dashboard.waiting : t.dashboard.allHandled}</span>
            </span>
            <span className="font-heading text-3xl font-extrabold tabular-nums text-ink">{pending.length}</span>
          </Link>
        </li>
      </ul>

      {pending.length > 0 && (
        <DashboardPanel title={t.dashboard.askingToReview} action={{ href: '/reviews', label: t.dashboard.allReviews }}>
          <PendingReviewRequests requests={pending} onApprove={ratingRequests.approve} />
        </DashboardPanel>
      )}

      <RecentConversations
        conversations={conversations}
        loading={conversationsLoading}
        emptyText={t.dashboard.teacherEmpty}
      />

      {profile?._id && (
        <div className="flex flex-col gap-3 rounded-xl paper bg-muted p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t.dashboard.publicProfileHint}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/teachers/${profile._id}`}>{t.dashboard.viewPublicProfile}</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
