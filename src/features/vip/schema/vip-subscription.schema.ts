import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { VIP_STATUSES } from '@/shared/const/vip.const';

const VipSubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: VIP_STATUSES, required: true, default: 'none' },
    expiresAt: { type: Date, required: false },
    plan: { type: String, enum: VIP_STATUSES, required: true, default: 'none' },
    dodoSubscriptionId: { type: String, required: false, unique: true, sparse: true },
    dodoProductId: { type: String, required: false },
    billingStatus: { type: String, required: false },
    cancelAtPeriodEnd: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export type VipSubscriptionDocument = InferSchemaType<typeof VipSubscriptionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const VipSubscriptionModel =
  mongoose.models.VipSubscription ||
  mongoose.model('VipSubscription', VipSubscriptionSchema);
