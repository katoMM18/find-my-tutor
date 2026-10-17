'use client';

import { CalendarDays, GraduationCap, MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { useStartConversation } from '@/features/chat/hooks/use-start-conversation';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useT } from '@/shared/hooks/use-t';
import { firstName, formatWeekdays } from '@/shared/utils/format';

type TeacherContactCardProps = {
  teacher: PublicTeacher;
};

export const TeacherContactCard = ({ teacher }: TeacherContactCardProps) => {
  const { data: session, status } = useSession();
  const { t, fmt, plural, subject: subjectName } = useT();
  const user = session?.user as { id?: string; role?: 'teacher' | 'student' } | undefined;
  const name = firstName(teacher.name);
  const subject = teacher.subjects[0] ? subjectName(teacher.subjects[0]) : t.profile.yourSubject;
  const [message, setMessage] = useState(() => fmt(t.profile.messageTemplate, { name, subject }));
  const { start, sending, error } = useStartConversation();
  const isOwnProfile = user?.id === teacher.userId;
  const days = formatWeekdays(teacher.availableDays, { short: t.weekdaysShort, everyDay: t.discovery.everyDay, weekdays: t.discovery.weekdays });

  return (
    <div id="contact" className="scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-sm">
      <dl className="grid grid-cols-3 gap-2 border-b border-border pb-4 text-center">
        <div>
          <dt className="sr-only">{t.discovery.rating}</dt>
          <dd className="flex items-center justify-center gap-1 font-heading text-xl font-semibold tabular-nums">
            {teacher.rating !== null ? (
              <>
                <Star className="size-4 fill-primary text-primary" aria-hidden="true" />
                {teacher.rating.toFixed(1)}
              </>
            ) : t.profile.new}
          </dd>
          <dd className="text-xs text-muted-foreground">{plural(t.common.reviews, teacher.reviewCount)}</dd>
        </div>
        <div>
          <dt className="sr-only">{t.discovery.experience}</dt>
          <dd className="font-heading text-xl font-semibold tabular-nums">{teacher.experienceYears}</dd>
          <dd className="text-xs text-muted-foreground">{t.profile.yearsTeaching}</dd>
        </div>
        <div>
          <dt className="sr-only">{t.discovery.subject}</dt>
          <dd className="font-heading text-xl font-semibold tabular-nums">{teacher.subjects.length}</dd>
          <dd className="text-xs text-muted-foreground">{teacher.subjects.length === 1 ? t.common.subjects.one : t.common.subjects.other}</dd>
        </div>
      </dl>

      <ul className="space-y-2 py-4 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          {days ? fmt(t.discovery.teaches, { days }) : t.profile.noAvailability}
        </li>
        <li className="flex items-center gap-2">
          <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
          {teacher.education || t.profile.noEducation}
        </li>
      </ul>

      {isOwnProfile ? (
        <div className="space-y-2 rounded-lg bg-muted/60 p-3 text-sm">
          <p>{t.profile.ownProfile}</p>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href="/profile">{t.profile.editProfile}</Link>
          </Button>
        </div>
      ) : user?.role === 'teacher' ? (
        <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{t.profile.onlyStudents}</p>
      ) : user ? (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void start(teacher.userId, message);
          }}
        >
          <label htmlFor="first-message" className="text-sm font-semibold">{fmt(t.profile.messageName, { name })}</label>
          <Textarea id="first-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={4} maxLength={5000} />
          {error && <p className="text-sm text-destructive">{t.profile.startError}</p>}
          <Button type="submit" className="w-full" disabled={sending || !message.trim()}>
            <MessageCircle className="size-4" aria-hidden="true" />
            {sending ? t.profile.sending : t.profile.sendMessage}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{fmt(t.profile.freeToMessage, { name })}</p>
        </form>
      ) : status !== 'loading' && (
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/teachers/${teacher.id}#contact`)}`}>
              <MessageCircle className="size-4" aria-hidden="true" />
              {fmt(t.profile.messageName, { name })}
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">{fmt(t.profile.accountNeeded, { name })}</p>
        </div>
      )}
    </div>
  );
};
