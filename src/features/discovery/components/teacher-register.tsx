'use client';

import { type ReactNode } from 'react';

import { TeacherCard } from '@/features/discovery/components/teacher-card';
import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { useFlip } from '@/shared/hooks/use-flip';

type TeacherRegisterProps = {
  teachers: PublicTeacher[];
  footer?: ReactNode;
  className?: string;
  // Home board only: notices hang slightly crooked. Lists people scan stay straight.
  tilted?: boolean;
};

// The notice board: one taped notice per tutor. Notices glide to their new place when the order changes.
export const TeacherRegister = ({ teachers, footer, className, tilted = false }: TeacherRegisterProps) => {
  const listRef = useFlip<HTMLOListElement>(teachers.map((teacher) => teacher.id).join(','));

  return (
    <div className={className}>
      <ol ref={listRef} className="register pin-drop grid grid-cols-1 gap-x-6 gap-y-10 pt-3 sm:grid-cols-2 xl:grid-cols-3">
        {teachers.map((teacher, index) => (
          <li key={teacher.id} data-flip-key={teacher.id} className="min-w-0">
            <TeacherCard
              teacher={teacher}
              inkDelay={Math.min(index, 3) as 0 | 1 | 2 | 3}
              className={tilted ? (index % 2 === 0 ? 'tilt-l' : 'tilt-r') : undefined}
            />
          </li>
        ))}
      </ol>
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
};
