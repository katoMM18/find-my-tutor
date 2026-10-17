'use client';

import { StudentReviews } from '@/features/ratings/components/student-reviews';
import { TeacherReviews } from '@/features/ratings/components/teacher-reviews';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { useT } from '@/shared/hooks/use-t';

export const ReviewsCenter = ({ role }: { role: 'teacher' | 'student' }) => {
  const { t } = useT();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeading title={t.reviews.title} description={role === 'teacher' ? t.reviews.teacherLead : t.reviews.studentLead} />
      {role === 'teacher' ? <TeacherReviews /> : <StudentReviews />}
    </div>
  );
};
