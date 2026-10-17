'use client';

import { CalendarDays, GraduationCap, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { RatingSummary } from '@/features/ratings/components/star-rating';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { VIP_STATUS_LABELS } from '@/shared/const/vip.const';
import { useT } from '@/shared/hooks/use-t';
import { formatWeekdays } from '@/shared/utils/format';

type TeacherCardProps = {
  teacher: PublicTeacher;
};

export const TeacherCard = ({ teacher }: TeacherCardProps) => {
  const { data: session } = useSession();
  const { t, fmt, subject } = useT();
  const role = (session?.user as { role?: 'teacher' | 'student' } | undefined)?.role;
  const profileHref = `/teachers/${teacher.id}`;
  const messagesHref = `/messages?to=${teacher.userId}`;
  const messageHref = session ? messagesHref : `/sign-in?callbackUrl=${encodeURIComponent(messagesHref)}`;
  const teachesToday = teacher.availableDays.includes(new Date().getDay());
  const days = formatWeekdays(teacher.availableDays, { short: t.weekdaysShort, everyDay: t.discovery.everyDay, weekdays: t.discovery.weekdays });

  return (
    <article className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md sm:flex-row sm:p-5">
      <UserAvatar name={teacher.name} src={teacher.avatar} size="xl" className="size-16 text-xl sm:size-24 sm:text-3xl" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-lg font-semibold">
            <Link href={profileHref} className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:underline">
              {teacher.name}
            </Link>
          </h2>
          {teacher.vipStatus !== 'none' && <Badge variant="default">{VIP_STATUS_LABELS[teacher.vipStatus]}</Badge>}
          <RatingSummary rating={teacher.rating} count={teacher.reviewCount} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {teacher.subjects.slice(0, 5).map((item) => (
            <Badge key={item} variant="muted">{subject(item)}</Badge>
          ))}
          {teacher.subjects.length > 5 && <Badge variant="outline">+{teacher.subjects.length - 5}</Badge>}
        </div>
        <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {teacher.bio || t.discovery.noBio}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="size-4" aria-hidden="true" />
            {teacher.experienceYears > 0 ? fmt(t.discovery.yearsTeaching, { count: teacher.experienceYears }) : t.discovery.newToTeaching}
          </span>
          {days && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {teachesToday ? <span className="font-medium text-foreground">{t.discovery.teachesToday}</span> : fmt(t.discovery.teaches, { days })}
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10 flex gap-2 sm:w-40 sm:flex-col sm:justify-center">
        {role !== 'teacher' && (
          <Button asChild className="flex-1 sm:flex-none">
            <Link href={messageHref}>
              <MessageCircle className="size-4" aria-hidden="true" />
              {t.common.message}
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="flex-1 sm:flex-none">
          <Link href={profileHref}>{t.common.viewProfile}</Link>
        </Button>
      </div>
    </article>
  );
};
