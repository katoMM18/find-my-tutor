import { TeacherProfilePage } from '@/features/discovery/components/teacher-profile-page';
import { getTeacherService } from '@/features/discovery/service/teacher-discovery.service';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { APP_NAME } from '@/shared/const/app.const';
import { i18n } from '@/shared/lib/i18n';
import { getServerI18n } from '@/shared/utils/server-i18n';
import { humanizeSubjectKey } from '@/shared/utils/subjects';

import type { Metadata } from 'next';

type TeacherPageProps = { params: Promise<{ id: string }> };

// "Nino B. — Mathematics tutor in Vake | Find My Tutor": the line people see in Google and in shared links.
export async function generateMetadata({ params }: TeacherPageProps): Promise<Metadata> {
  const { id } = await params;
  const [result, { t }] = await Promise.all([getTeacherService(id), getServerI18n()]);
  if (!('id' in result.data)) return { title: `${t.profile.notFoundTitle} | ${APP_NAME}` };

  const teacher = result.data;
  const subject = teacher.subjects[0] ? (t.subjects[teacher.subjects[0]] ?? humanizeSubjectKey(teacher.subjects[0])) : '';
  const area = teacher.areas[0] ? t.lessons.areas[teacher.areas[0]] : '';
  const role = subject ? i18n.format(t.meta.tutorRole, { subject }) : t.meta.tutorRoleGeneric;
  const title = `${teacher.name} — ${area ? i18n.format(t.meta.tutorRoleIn, { role, area }) : role} | ${APP_NAME}`;
  const description = (teacher.headline || teacher.bio || t.meta.description).slice(0, 160);

  return {
    title,
    description,
    openGraph: { title, description, type: 'profile', images: teacher.avatar ? [teacher.avatar] : undefined },
  };
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const { id } = await params;

  return (
    <>
      <Header />
      <TeacherProfilePage id={id} />
      <Footer />
    </>
  );
}
