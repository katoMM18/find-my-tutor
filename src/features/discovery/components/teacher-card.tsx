'use client';

import { ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { TearTab } from '@/features/discovery/components/tear-tab';
import { TutorFacts } from '@/features/discovery/components/tutor-facts';
import { VerifiedBadge } from '@/features/discovery/components/verified-badge';
import { WeekCells } from '@/features/discovery/components/week-cells';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { InkMark } from '@/features/ratings/components/ink-mark';
import { SaveTutorButton } from '@/features/shortlist/components/save-tutor-button';
import { Badge } from '@/shared/components/ui/badge';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { VIP_STATUS_LABELS } from '@/shared/const/vip.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type TeacherCardProps = {
  teacher: PublicTeacher;
  inkDelay?: 0 | 1 | 2 | 3;
  className?: string;
};

// One tutor, one flyer on the wall: a taped photo, the days they teach, a mark circled in marker, and tear-off tabs.
export const TeacherCard = ({ teacher, inkDelay = 0, className }: TeacherCardProps) => {
  const { data: session } = useSession();
  const { t, fmt, subject } = useT();
  const role = (session?.user as { role?: 'teacher' | 'student' } | undefined)?.role;
  const profileHref = `/teachers/${teacher.id}`;

  return (
    <article
      className={cn(
        'paper tape group flex h-full flex-col rounded-xl pt-6 transition duration-300 hover:-translate-y-1',
        className
      )}
    >
      <div className="flex flex-1 flex-col px-5">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={teacher.name}
            src={teacher.avatar}
            size="xl"
            className="size-18 -rotate-3 rounded-sm text-xl shadow-md ring-4 ring-white transition duration-300 group-hover:rotate-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-2xl font-extrabold leading-tight tracking-tight">
              <Link href={profileHref} className="outline-none hover:underline focus-visible:underline">{teacher.name}</Link>
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {teacher.experienceYears > 0 ? fmt(t.discovery.yearsTeaching, { count: teacher.experienceYears }) : t.discovery.newToTeaching}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {teacher.verified && <VerifiedBadge />}
              {teacher.vipStatus !== 'none' && <Badge variant="stamp">{VIP_STATUS_LABELS[teacher.vipStatus]}</Badge>}
            </div>
          </div>
          <InkMark
            rating={teacher.rating}
            count={teacher.reviewCount}
            inkDelay={inkDelay}
            className="max-w-24 shrink-0 items-end text-right whitespace-normal"
          />
        </div>

        <p className="mt-4 text-lg font-semibold leading-snug">
          {teacher.subjects.slice(0, 4).map(subject).join(' · ')}
          {teacher.subjects.length > 4 && <span className="text-muted-foreground"> +{teacher.subjects.length - 4}</span>}
        </p>
        <TutorFacts teacher={teacher} className="mt-3" />
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{teacher.bio || t.discovery.noBio}</p>
        <WeekCells days={teacher.availableDays} className="mb-5 mt-auto pt-4" />
      </div>

      <div className="perforation flex">
        {role !== 'teacher' && (
          <TearTab href={`${profileHref}#message`} className="flex-1 rounded-bl-xl border-r border-dashed border-border">
            <MessageCircle className="size-4" aria-hidden="true" />
            {t.common.message}
          </TearTab>
        )}
        <TearTab href={profileHref} className={cn('flex-1', role === 'teacher' && 'rounded-b-xl')}>
          {t.common.viewProfile}
          <ArrowRight className="size-4" aria-hidden="true" />
        </TearTab>
        {role !== 'teacher' && (
          <SaveTutorButton teacherId={teacher.id} name={teacher.name} className="rounded-br-xl border-l border-dashed border-border" />
        )}
      </div>
    </article>
  );
};
