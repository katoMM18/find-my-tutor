'use client';

import { BookOpen, Presentation, type LucideIcon } from 'lucide-react';

import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

type Role = 'student' | 'teacher';

const ROLE_OPTIONS: { value: Role; title: 'roleStudentTitle' | 'roleTeacherTitle'; description: 'roleStudentText' | 'roleTeacherText'; icon: LucideIcon }[] = [
  { value: 'student', title: 'roleStudentTitle', description: 'roleStudentText', icon: BookOpen },
  { value: 'teacher', title: 'roleTeacherTitle', description: 'roleTeacherText', icon: Presentation },
];

type RolePickerProps = {
  value: Role;
  onChange: (role: Role) => void;
};

export const RolePicker = ({ value, onChange }: RolePickerProps) => {
  const { t } = useT();

  return (
    <div role="radiogroup" aria-label={t.auth.accountType} className="grid grid-cols-2 gap-2">
      {ROLE_OPTIONS.map(({ value: option, title, description, icon: Icon }) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors outline-none',
            'focus-visible:ring-2 focus-visible:ring-ring/50',
            value === option ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/60'
          )}
        >
          <Icon className={cn('size-5', value === option ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
          <span className="text-sm font-semibold">{t.auth[title]}</span>
          <span className="text-xs leading-snug text-muted-foreground">{t.auth[description]}</span>
        </button>
      ))}
    </div>
  );
};
