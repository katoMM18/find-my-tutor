'use client';

import { MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { useStartConversation } from '@/features/chat/hooks/use-start-conversation';
import { WeekCells } from '@/features/discovery/components/week-cells';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { LEARNER_LEVELS, type LearnerLevel } from '@/shared/const/learner-levels.const';
import { WEEK_DISPLAY_ORDER } from '@/shared/const/week.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';
import { firstName } from '@/shared/utils/format';

type TeacherContactCardProps = {
  teacher: PublicTeacher;
};

const fieldLabelClassName = 'text-sm font-semibold text-muted-foreground';

export const TeacherContactCard = ({ teacher }: TeacherContactCardProps) => {
  const { data: session, status } = useSession();
  const { t, fmt, subject: subjectName } = useT();
  const user = session?.user as { id?: string; role?: 'teacher' | 'student' } | undefined;
  const name = firstName(teacher.name);
  const [subject, setSubject] = useState(teacher.subjects[0] ?? '');
  const [level, setLevel] = useState<LearnerLevel | null>(null);
  const [days, setDays] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const { start, sending, error } = useStartConversation();
  const isOwnProfile = user?.id === teacher.userId;
  const teachingDays = WEEK_DISPLAY_ORDER.filter((day) => teacher.availableDays.includes(day));

  const message = [
    fmt(t.profile.composedGreeting, { name, subject: subject ? subjectName(subject) : '' }),
    level && fmt(t.profile.composedLevel, { level: t.profile.levels[level] }),
    days.length > 0 && fmt(t.profile.composedDays, {
      days: WEEK_DISPLAY_ORDER.filter((day) => days.includes(day)).map((day) => t.weekdaysLong[day]).join(', '),
    }),
  ].filter(Boolean).join(' ') + (note.trim() ? `\n\n${note.trim()}` : '');

  return (
    <div id="message" className="scroll-mt-24 overflow-hidden rounded-lg paper shadow-sm">
      <div className="border-b border-rule p-5">
        <h2 className="text-xl font-bold">{fmt(t.profile.messageName, { name })}</h2>
        <div className="mt-3">
          <WeekCells days={teacher.availableDays} />
        </div>
      </div>

      <div className="p-5">
        {isOwnProfile ? (
          <div className="space-y-3 text-sm">
            <p>{t.profile.ownProfile}</p>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/profile">{t.profile.editProfile}</Link>
            </Button>
          </div>
        ) : user?.role === 'teacher' ? (
          <p className="text-sm text-muted-foreground">{t.profile.onlyStudents}</p>
        ) : user ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void start(teacher.userId, message);
            }}
          >
            {teacher.subjects.length > 0 && (
              <fieldset>
                <legend className={fieldLabelClassName}>{t.profile.composeSubject}</legend>
                <ToggleGroup type="single" variant="outline" size="sm" value={subject} onValueChange={(value) => value && setSubject(value)} className="mt-2">
                  {teacher.subjects.map((item) => (
                    <ToggleGroupItem key={item} value={item}>{subjectName(item)}</ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </fieldset>
            )}
            <fieldset>
              <legend className={fieldLabelClassName}>{t.profile.composeLevel}</legend>
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={level ?? ''}
                onValueChange={(value) => setLevel(LEARNER_LEVELS.find((item) => item === value) ?? null)}
                className="mt-2"
              >
                {LEARNER_LEVELS.map((item) => (
                  <ToggleGroupItem key={item} value={item}>{t.profile.levels[item]}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </fieldset>
            {teachingDays.length > 0 && (
              <fieldset>
                <legend className={fieldLabelClassName}>{t.profile.composeDays}</legend>
                <p className="mt-1 text-xs text-muted-foreground">{fmt(t.profile.composeDaysHint, { name })}</p>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  size="sm"
                  value={days.map(String)}
                  onValueChange={(values) => setDays(values.map(Number))}
                  className="mt-2"
                >
                  {teachingDays.map((day) => (
                    <ToggleGroupItem key={day} value={String(day)}>{t.weekdaysShort[day]}</ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </fieldset>
            )}
            <div>
              <Label htmlFor="first-message-note" className={fieldLabelClassName}>{t.profile.composeNote}</Label>
              <Textarea
                id="first-message-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t.profile.composeNotePlaceholder}
                rows={3}
                maxLength={4000}
                className="mt-2"
              />
            </div>

            <figure className="rounded-lg bg-primary/5 px-4 py-3">
              <figcaption className={fieldLabelClassName}>{fmt(t.profile.previewLabel, { name })}</figcaption>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground">{message}</p>
            </figure>

            {error && <Alert variant="destructive">{t.profile.startError}</Alert>}
            <Button type="submit" size="lg" className="w-full" disabled={sending || !subject}>
              <Send className={cn('size-4', sending && 'animate-lift')} aria-hidden="true" />
              {sending ? t.profile.sending : t.profile.sendMessage}
            </Button>
            <p className="text-center text-xs text-muted-foreground">{t.profile.freeToMessage}</p>
          </form>
        ) : status !== 'loading' && (
          <div className="space-y-2">
            <Button asChild size="lg" className="w-full">
              <Link href={`/sign-in?callbackUrl=${encodeURIComponent(`/teachers/${teacher.id}#message`)}`}>
                <MessageCircle className="size-4" aria-hidden="true" />
                {fmt(t.profile.messageName, { name })}
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">{fmt(t.profile.accountNeeded, { name })}</p>
          </div>
        )}
      </div>
    </div>
  );
};
