'use client';

import { StudentProfileForm } from '@/features/profiles/components/student-profile-form';
import { TeacherProfileForm } from '@/features/profiles/components/teacher-profile-form';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { useT } from '@/shared/hooks/use-t';

type ProfileEditorProps = {
  role: 'teacher' | 'student';
  welcome: boolean;
};

export const ProfileEditor = ({ role, welcome }: ProfileEditorProps) => {
  const { t } = useT();

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeading
        title={welcome ? t.profileEditor.welcomeTitle : t.profileEditor.title}
        description={role === 'teacher' ? t.profileEditor.teacherLead : t.profileEditor.studentLead}
      />
      {role === 'teacher' ? <TeacherProfileForm /> : <StudentProfileForm />}
    </div>
  );
};
