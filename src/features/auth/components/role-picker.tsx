'use client';

import { BookOpen, Presentation, type LucideIcon } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { useT } from '@/shared/hooks/use-t';

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
    <ToggleGroup
      type="single"
      aria-label={t.auth.accountType}
      value={value}
      onValueChange={(next) => next && onChange(next === 'teacher' ? 'teacher' : 'student')}
      className="grid w-full grid-cols-2 gap-2"
    >
      {ROLE_OPTIONS.map(({ value: option, title, description, icon: Icon }) => (
        <ToggleGroupItem
          key={option}
          value={option}
          variant="outline"
          className="h-auto flex-col items-start gap-2 whitespace-normal rounded-lg p-3 text-left"
        >
          <Icon className="size-5" aria-hidden="true" />
          <span className="text-sm font-semibold">{t.auth[title]}</span>
          <span className="text-xs leading-snug opacity-80">{t.auth[description]}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
