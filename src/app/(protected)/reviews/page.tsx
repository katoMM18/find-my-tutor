import { ReviewsCenter } from '@/features/ratings/components/reviews-center';
import { auth } from '@/shared/lib/auth';

export default async function ReviewsPage() {
  const session = await auth();
  const role = (session?.user as { role?: 'teacher' | 'student' } | undefined)?.role === 'teacher' ? 'teacher' : 'student';

  return <ReviewsCenter role={role} />;
}
