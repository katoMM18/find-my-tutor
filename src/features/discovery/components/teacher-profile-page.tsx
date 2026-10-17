'use client';

import { ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { AvailabilityPreview } from '@/features/availability/components/availability-preview';
import { TeacherContactCard } from '@/features/discovery/components/teacher-contact-card';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { ReviewList } from '@/features/ratings/components/review-list';
import { RatingSummary } from '@/features/ratings/components/star-rating';
import { TeacherReviewAction } from '@/features/ratings/components/teacher-review-action';
import { TeacherReviews } from '@/features/ratings/types/rating.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { VIP_STATUS_LABELS } from '@/shared/const/vip.const';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { firstName } from '@/shared/utils/format';

const ProfileSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-border py-8">
    <h2 className="mb-4 text-xl font-semibold">{title}</h2>
    {children}
  </section>
);

export const TeacherProfilePage = ({ id }: { id: string }) => {
  const { data: session } = useSession();
  const { t, fmt, subject } = useT();
  const role = (session?.user as { role?: 'teacher' | 'student' } | undefined)?.role;
  const [teacher, setTeacher] = useState<PublicTeacher | null>(null);
  const [reviews, setReviews] = useState<TeacherReviews | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadReviews = useCallback(() => {
    void http.get<TeacherReviews>(`/teachers/${id}/ratings`).then(setReviews).catch(() => setReviews(null));
  }, [id]);

  useEffect(() => {
    void http.get<PublicTeacher>(`/teachers/${id}`).then(setTeacher).catch(() => setNotFound(true));
    loadReviews();
  }, [id, loadReviews]);

  if (notFound) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">{t.profile.notFoundTitle}</h1>
        <p className="text-muted-foreground">{t.profile.notFoundText}</p>
        <Button asChild><Link href="/teachers">{t.profile.browseTutors}</Link></Button>
      </main>
    );
  }
  if (!teacher) return <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8"><div className="h-64 animate-pulse rounded-xl bg-muted" /></main>;

  const name = firstName(teacher.name);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-8 lg:pb-16">
      <Link href="/teachers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> {t.profile.allTutors}
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-5 pb-8 sm:flex-row sm:items-center">
            <UserAvatar name={teacher.name} src={teacher.avatar} size="xl" className="size-28 text-4xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold sm:text-4xl">{teacher.name}</h1>
                {teacher.vipStatus !== 'none' && <Badge variant="default">{VIP_STATUS_LABELS[teacher.vipStatus]}</Badge>}
              </div>
              <RatingSummary rating={reviews?.average ?? teacher.rating} count={reviews?.count ?? teacher.reviewCount} className="mt-2" />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {teacher.subjects.map((item) => <Badge key={item} variant="soft">{subject(item)}</Badge>)}
              </div>
            </div>
          </div>

          <ProfileSection title={fmt(t.profile.about, { name })}>
            <p className="max-w-prose whitespace-pre-line leading-relaxed text-muted-foreground">
              {teacher.bio || fmt(t.profile.noBio, { name })}
            </p>
          </ProfileSection>

          {(teacher.education || teacher.qualifications) && (
            <ProfileSection title={t.profile.educationTitle}>
              <dl className="space-y-4 text-sm">
                {teacher.education && (
                  <div>
                    <dt className="font-semibold">{t.profile.education}</dt>
                    <dd className="mt-1 text-muted-foreground">{teacher.education}</dd>
                  </div>
                )}
                {teacher.qualifications && (
                  <div>
                    <dt className="font-semibold">{t.profile.qualifications}</dt>
                    <dd className="mt-1 whitespace-pre-line text-muted-foreground">{teacher.qualifications}</dd>
                  </div>
                )}
              </dl>
            </ProfileSection>
          )}

          <ProfileSection title={t.profile.availabilityTitle}>
            <AvailabilityPreview teacherProfileId={teacher.id} />
          </ProfileSection>

          <ProfileSection title={reviews?.count ? fmt(t.profile.reviewsTitleCount, { count: reviews.count }) : t.profile.reviewsTitle}>
            {role === 'student' && (
              <div className="mb-6">
                <TeacherReviewAction teacherProfileId={teacher.id} teacherName={teacher.name} onReviewPosted={loadReviews} />
              </div>
            )}
            <ReviewList reviews={reviews?.reviews ?? []} emptyText={fmt(t.profile.noReviews, { name })} />
          </ProfileSection>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <TeacherContactCard teacher={teacher} />
        </aside>
      </div>

      {role !== 'teacher' && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
          <Button asChild className="w-full">
            <a href="#contact"><MessageCircle className="size-4" aria-hidden="true" /> {fmt(t.profile.messageName, { name })}</a>
          </Button>
        </div>
      )}
    </main>
  );
};
