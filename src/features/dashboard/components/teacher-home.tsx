'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useConversations } from '@/features/chat/hooks/use-conversations';
import { DashboardPanel } from '@/features/dashboard/components/dashboard-panel';
import { RecentConversations } from '@/features/dashboard/components/recent-conversations';
import { SetupChecklist } from '@/features/dashboard/components/setup-checklist';
import { useProfileSetup } from '@/features/dashboard/hooks/use-profile-setup';
import { PendingReviewRequests } from '@/features/ratings/components/pending-review-requests';
import { useRatingRequests } from '@/features/ratings/hooks/use-rating-requests';
import { TeacherRatingSummary } from '@/features/ratings/types/rating.types';
import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

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

  const stats = [
    {
      label: t.dashboard.statRating,
      value: rating?.average ? rating.average.toFixed(1) : '—',
      hint: rating?.count ? plural(t.common.reviews, rating.count) : t.dashboard.noReviewsYet,
    },
    { label: t.dashboard.statUnread, value: String(unread), hint: plural(t.common.conversations, conversations.length) },
    { label: t.dashboard.statRequests, value: String(pending.length), hint: pending.length ? t.dashboard.waiting : t.dashboard.allHandled },
  ];

  return (
    <div className="space-y-6">
      {loaded && steps.some((step) => !step.complete) && <SetupChecklist steps={steps} />}

      <dl className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="px-5 py-4">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 font-heading text-2xl font-semibold tabular-nums">{stat.value}</dd>
            <dd className="text-xs text-muted-foreground">{stat.hint}</dd>
          </div>
        ))}
      </dl>

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
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t.dashboard.publicProfileHint}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/teachers/${profile._id}`}>{t.dashboard.viewPublicProfile}</Link>
          </Button>
        </div>
      )}
    </div>
  );
};
