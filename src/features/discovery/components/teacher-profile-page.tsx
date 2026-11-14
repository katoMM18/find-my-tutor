'use client';

import { ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { AvailabilityPreview } from '@/features/availability/components/availability-preview';
import { PriceGuideNote } from '@/features/discovery/components/price-guide';
import { TeacherContactCard } from '@/features/discovery/components/teacher-contact-card';
import { TutorFacts } from '@/features/discovery/components/tutor-facts';
import { VerifiedBadge } from '@/features/discovery/components/verified-badge';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { InkMark } from '@/features/ratings/components/ink-mark';
import { ReviewList } from '@/features/ratings/components/review-list';
import { TeacherReviewAction } from '@/features/ratings/components/teacher-review-action';
import { TeacherReviews } from '@/features/ratings/types/rating.types';
import { SaveTutorButton } from '@/features/shortlist/components/save-tutor-button';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { VIP_STATUS_LABELS } from '@/shared/const/vip.const';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { firstName } from '@/shared/utils/format';

const ProfileSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-rule py-8">
    <h2 className="mb-4 text-2xl font-bold">{title}</h2>
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
  if (!teacher) {
    return (
      <main aria-busy="true" className="min-h-screen">
        <div className="px-4 pt-8 sm:px-8">
          <div className="paper mx-auto flex w-full max-w-6xl gap-6 rounded-xl p-6 sm:p-8">
            <Skeleton className="size-24 shrink-0 sm:size-32" />
            <span className="flex-1 space-y-3 pt-4">
              <Skeleton className="h-8 w-64 max-w-full" />
              <Skeleton className="h-5 w-48" />
            </span>
          </div>
        </div>
      </main>
    );
  }

  const name = firstName(teacher.name);

  return (
    <main className="pb-28 lg:pb-16">
      <div className="px-4 pt-6 sm:px-8">
        <div className="paper mx-auto w-full max-w-6xl rounded-xl p-6 sm:p-8">
          <Link href="/teachers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" /> {t.profile.allTutors}
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <UserAvatar
                name={teacher.name}
                src={teacher.avatar}
                size="xl"
                className="size-28 rounded-xl text-4xl shadow-lg ring-4 ring-white/80 sm:size-36"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-heading text-4xl font-extrabold leading-none sm:text-6xl">{teacher.name}</h1>
                  {teacher.verified && <VerifiedBadge />}
                  {teacher.vipStatus !== 'none' && <Badge variant="stamp">{VIP_STATUS_LABELS[teacher.vipStatus]}</Badge>}
                </div>
                <p className="mt-2 text-muted-foreground">
                  {teacher.experienceYears > 0 ? fmt(t.discovery.yearsTeaching, { count: teacher.experienceYears }) : t.discovery.newToTeaching}
                </p>
                <TutorFacts teacher={teacher} className="mt-3" />
                <PriceGuideNote teacher={teacher} className="mt-2" />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {teacher.subjects.map((item) => <Badge key={item} variant="outline" className="text-foreground">{subject(item)}</Badge>)}
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 sm:flex-col">
              <InkMark rating={reviews?.average ?? teacher.rating} count={reviews?.count ?? teacher.reviewCount} size="lg" />
              {role !== 'teacher' && <SaveTutorButton teacherId={teacher.id} name={name} variant="button" />}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 grid w-full max-w-6xl gap-10 px-4 sm:px-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
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

        <aside className="lg:sticky lg:top-24 lg:mt-8 lg:self-start">
          <TeacherContactCard teacher={teacher} />
        </aside>
      </div>

      {role !== 'teacher' && (
        <div className="paper fixed inset-x-3 bottom-3 z-30 flex items-center gap-2 rounded-lg p-2 lg:hidden">
          <div className="min-w-0 flex-1 px-2">
            <p className="truncate text-sm font-semibold">{name}</p>
            {teacher.pricePerLesson !== null && (
              <p className="text-xs text-muted-foreground">{fmt(t.lessons.pricePerLesson, { price: teacher.pricePerLesson })}</p>
            )}
          </div>
          <SaveTutorButton teacherId={teacher.id} name={name} className="h-11 rounded-lg" />
          <Button asChild size="lg">
            <a href="#message"><MessageCircle className="size-4" aria-hidden="true" /> {t.common.message}</a>
          </Button>
        </div>
      )}
    </main>
  );
};
