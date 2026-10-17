'use client';

import { StudentHome } from '@/features/dashboard/components/student-home';
import { TeacherHome } from '@/features/dashboard/components/teacher-home';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { useT } from '@/shared/hooks/use-t';
import { firstName } from '@/shared/utils/format';

type DashboardHomeProps = {
  role: 'teacher' | 'student';
  userName: string;
};

export const DashboardHome = ({ role, userName }: DashboardHomeProps) => {
  const { t, fmt } = useT();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading
        title={fmt(t.dashboard.greeting, { name: firstName(userName) })}
        description={role === 'teacher' ? t.dashboard.teacherLead : t.dashboard.studentLead}
      />
      {role === 'teacher' ? <TeacherHome /> : <StudentHome />}
    </div>
  );
};
