'use client';

import { CalendarClock, Clock3, MapPin, Wallet } from 'lucide-react';

import { useNextFreeLabel } from '@/features/discovery/hooks/use-next-free-label';
import { useResponseTime } from '@/features/discovery/hooks/use-response-time';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type TutorFactsProps = {
  teacher: Pick<PublicTeacher, 'pricePerLesson' | 'lessonFormats' | 'areas' | 'responseMinutes' | 'acceptingStudents' | 'nextFree'>;
  className?: string;
};

// The practical facts parents compare first: price, where lessons happen, and how quickly the tutor replies.
export const TutorFacts = ({ teacher, className }: TutorFactsProps) => {
  const { t, fmt } = useT();
  const formatResponseTime = useResponseTime();
  const where = [
    ...teacher.lessonFormats.map((format) => t.lessons.formats[format]),
    ...teacher.areas.slice(0, 3).map((area) => t.lessons.areas[area]),
  ];
  const responseTime = formatResponseTime(teacher.responseMinutes);
  const nextFree = useNextFreeLabel()(teacher.nextFree);

  return (
    <ul className={cn('space-y-1 text-sm', className)}>
      {teacher.pricePerLesson !== null && (
        <li className="flex items-center gap-2 font-semibold">
          <Wallet className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {fmt(t.lessons.pricePerLesson, { price: teacher.pricePerLesson })}
        </li>
      )}
      {nextFree && teacher.acceptingStudents && (
        <li className="flex items-center gap-2 font-medium text-primary">
          <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
          {nextFree}
        </li>
      )}
      {where.length > 0 && (
        <li className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{where.join(' · ')}{teacher.areas.length > 3 && ` +${teacher.areas.length - 3}`}</span>
        </li>
      )}
      <li className="flex items-center gap-2 text-muted-foreground">
        <Clock3 className="size-4 shrink-0" aria-hidden="true" />
        {responseTime ? fmt(t.lessons.repliesWithin, { time: responseTime }) : t.lessons.repliesUnknown}
      </li>
      {!teacher.acceptingStudents && <li className="font-medium text-destructive">{t.lessons.notAccepting}</li>}
    </ul>
  );
};
