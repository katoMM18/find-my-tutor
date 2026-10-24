import { VipPlanDocument, VipPlanModel } from '@/features/vip/schema/vip-plan.schema';
import { VipSubscriptionDocument, VipSubscriptionModel } from '@/features/vip/schema/vip-subscription.schema';
import { mongo } from '@/shared/lib/mongo';

export const vipRepository = {
  async findByUserId(userId: string): Promise<VipSubscriptionDocument | null> {
    await mongo.connect();
    return VipSubscriptionModel.findOne({ userId }).lean<VipSubscriptionDocument>().exec();
  },

  async upsert(
    userId: string,
    data: Partial<VipSubscriptionDocument> & { status: VipSubscriptionDocument['status'] }
  ): Promise<VipSubscriptionDocument> {
    await mongo.connect();
    return VipSubscriptionModel.findOneAndUpdate(
      { userId },
      { $set: data, $setOnInsert: { userId } },
      { new: true, upsert: true }
    ).lean<VipSubscriptionDocument>().exec() as Promise<VipSubscriptionDocument>;
  },

  async findPlan(status: VipPlanDocument['status']): Promise<VipPlanDocument | null> {
    await mongo.connect();
    return VipPlanModel.findOne({ status }).lean<VipPlanDocument>().exec();
  },

  async findPlanByProductId(productId: string): Promise<VipPlanDocument | null> {
    await mongo.connect();
    return VipPlanModel.findOne({ productId }).lean<VipPlanDocument>().exec();
  },

  async savePlan(status: VipPlanDocument['status'], productId: string): Promise<VipPlanDocument> {
    await mongo.connect();
    return VipPlanModel.findOneAndUpdate(
      { status },
      { $set: { productId }, $setOnInsert: { status } },
      { new: true, upsert: true }
    ).lean<VipPlanDocument>().exec() as Promise<VipPlanDocument>;
  },

  async findByDodoSubscriptionId(dodoSubscriptionId: string): Promise<VipSubscriptionDocument | null> {
    await mongo.connect();
    return VipSubscriptionModel.findOne({ dodoSubscriptionId }).lean<VipSubscriptionDocument>().exec();
  },

  async updateByDodoSubscriptionId(
    dodoSubscriptionId: string,
    data: Partial<VipSubscriptionDocument>
  ): Promise<VipSubscriptionDocument | null> {
    await mongo.connect();
    return VipSubscriptionModel.findOneAndUpdate(
      { dodoSubscriptionId },
      { $set: data },
      { new: true }
    ).lean<VipSubscriptionDocument>().exec();
  },
};
