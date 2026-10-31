import { VipSubscriptionManager } from '@/features/vip/components/vip-subscription-manager';
import { auth } from '@/shared/lib/auth';

type SubscriptionPageProps = {
  searchParams: Promise<{ billing?: string }>;
};

export default async function SubscriptionPage({ searchParams }: SubscriptionPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const role = (session?.user as { role?: 'teacher' | 'student' } | undefined)?.role === 'teacher' ? 'teacher' : 'student';

  return (
    <div className="mx-auto w-full max-w-3xl">
      <VipSubscriptionManager role={role} checkoutSucceeded={params.billing === 'success'} />
    </div>
  );
}
