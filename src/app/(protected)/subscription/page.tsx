import { VipSubscriptionManager } from '@/features/vip/components/vip-subscription-manager';
import { PageHeading } from '@/shared/components/layout/page-heading';

export default function SubscriptionPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading title="Subscription" description="Promote your profile with a recurring VIP badge." />
      <VipSubscriptionManager />
    </div>
  );
}
