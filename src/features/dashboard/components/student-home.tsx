'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useConversations } from '@/features/chat/hooks/use-conversations';
import { DashboardPanel } from '@/features/dashboard/components/dashboard-panel';
import { RecentConversations } from '@/features/dashboard/components/recent-conversations';
import { SetupChecklist } from '@/features/dashboard/components/setup-checklist';
import { useProfileSetup } from '@/features/dashboard/hooks/use-profile-setup';
import { TeacherCard } from '@/features/discovery/components/teacher-card';
import { PublicTeacher, TeacherDiscoveryResult } from '@/features/discovery/types/teacher-discovery.types';
import { useRatingRequests } from '@/features/ratings/hooks/use-rating-requests';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { ALL_SUBJECTS } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

export const StudentHome = () => {
  const { profile, steps, loaded } = useProfileSetup('student');
  const { t, fmt, subject } = useT();
  const { conversations, loading: conversationsLoading } = useConversations();
  const { requests } = useRatingRequests();
  const [recommended, setRecommended] = useState<{ subject?: string; items: PublicTeacher[] }>({ items: [] });
  const subjects = profile?.subjects ?? [];
  const matchSubject = subjects
    .map((subject) => ALL_SUBJECTS.find((item) => item.toLowerCase() === subject.trim().toLowerCase()))
    .find(Boolean);
  const toReview = requests.filter((request) => request.status === 'approved');

  useEffect(() => {
    if (!loaded) return;
    const load = async () => {
      const bySubject = matchSubject
        ? await http.get<TeacherDiscoveryResult>('/teachers', { params: { subject: matchSubject, limit: 3 } })
        : null;
      if (bySubject?.items.length) return setRecommended({ subject: matchSubject, items: bySubject.items });
      const all = await http.get<TeacherDiscoveryResult>('/teachers', { params: { limit: 3 } });
      setRecommended({ items: all.items });
    };
    void load().catch(() => setRecommended({ items: [] }));
  }, [loaded, matchSubject]);

  return (
    <div className="space-y-6">
      {loaded && steps.some((step) => !step.complete) && <SetupChecklist steps={steps} />}

      {toReview.length > 0 && (
        <DashboardPanel title={t.dashboard.reviewsToWrite}>
          <ul className="space-y-3">
            {toReview.map((request) => (
              <li key={request.id} className="flex items-center gap-3">
                <UserAvatar name={request.counterpartName} src={request.counterpartAvatar} size="sm" />
                <p className="flex-1 text-sm">
                  <span className="font-semibold">{request.counterpartName}</span> {t.dashboard.enabledYourReview}
                </p>
                <Button asChild size="sm">
                  <Link href={`/teachers/${request.teacherProfileId}#review`}>
                    <Star className="size-4" aria-hidden="true" /> {t.chat.writeReview}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </DashboardPanel>
      )}

      <RecentConversations
        conversations={conversations}
        loading={conversationsLoading}
        emptyText={t.dashboard.studentEmpty}
      />

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {recommended.subject ? fmt(t.dashboard.tutorsFor, { subject: subject(recommended.subject) }) : t.dashboard.tutorsToExplore}
          </h2>
          <Link
            href={recommended.subject ? `/teachers?subject=${encodeURIComponent(recommended.subject)}` : '/teachers'}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t.common.seeAll}
          </Link>
        </div>
        <div className="space-y-3">
          {recommended.items.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
          {loaded && recommended.items.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {t.dashboard.noTutors} <Link href="/teachers" className="text-primary hover:underline">{t.dashboard.browseAll}</Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
