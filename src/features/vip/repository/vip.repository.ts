import { VipSubscriptionDocument, VipSubscriptionModel } from '@/features/vip/schema/vip-subscription.schema';
import { mongo } from '@/shared/lib/mongo';

export const vipRepository = {
  async findByUserId(userId: string): Promise<VipSubscriptionDocument | null> {
    await mongo.connect();
    return VipSubscriptionModel.findOne({ userId }).lean<VipSubscriptionDocument>().exec();
  },

  async upsert(
    userId: string,
    data: { status: VipSubscriptionDocument['status']; expiresAt?: Date }
  ): Promise<VipSubscriptionDocument> {
    await mongo.connect();
    return VipSubscriptionModel.findOneAndUpdate(
      { userId },
      { $set: data, $setOnInsert: { userId } },
      { new: true, upsert: true }
    ).lean<VipSubscriptionDocument>().exec() as Promise<VipSubscriptionDocument>;
  },
};
