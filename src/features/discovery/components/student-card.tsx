'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

import { PublicStudent } from '@/features/discovery/types/student-discovery.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { UserAvatar } from '@/shared/components/ui/user-avatar';
import { VIP_STATUS_LABELS } from '@/shared/const/vip.const';
import { useT } from '@/shared/hooks/use-t';

export const StudentCard = ({ student }: { student: PublicStudent }) => {
  const { t, subject } = useT();

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <UserAvatar name={student.name} src={student.avatar} size="lg" />
        <h2 className="truncate text-base font-semibold">{student.name}</h2>
        {student.vipStatus !== 'none' && <Badge variant="default">{VIP_STATUS_LABELS[student.vipStatus]}</Badge>}
      </div>
      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {student.bio || t.students.noBio}
      </p>
      {student.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {student.subjects.slice(0, 4).map((item) => <Badge key={item}>{subject(item)}</Badge>)}
          {student.subjects.length > 4 && <Badge variant="outline">+{student.subjects.length - 4}</Badge>}
        </div>
      )}
      <Button asChild variant="outline" size="sm">
        <Link href={`/messages?to=${student.userId}`}>
          <MessageCircle className="size-4" aria-hidden="true" /> {t.common.message}
        </Link>
      </Button>
    </article>

  );
};
