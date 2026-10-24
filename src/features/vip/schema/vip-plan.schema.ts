import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { VIP_STATUSES } from '@/shared/const/vip.const';

const VipPlanSchema = new Schema(
  {
    status: { type: String, enum: VIP_STATUSES.filter((status) => status !== 'none'), required: true, unique: true },
    productId: { type: String, required: true },
  },
  { timestamps: true }
);

export type VipPlanDocument = InferSchemaType<typeof VipPlanSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const VipPlanModel =
  mongoose.models.VipPlan || mongoose.model('VipPlan', VipPlanSchema);
