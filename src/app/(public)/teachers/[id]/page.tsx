import { TeacherProfilePage } from '@/features/discovery/components/teacher-profile-page';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';

export default async function TeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Header />
      <TeacherProfilePage id={id} />
      <Footer />
    </>
  );
}
