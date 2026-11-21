import { type Model } from 'mongoose';

import {
  type AdminCollectionKey,
  type AdminRawDocument,
  type AdminSearchFilter,
  type AdminWriteData,
} from '@/features/admin/types/admin.types';
import { AuthTokenModel } from '@/features/auth/schema/auth-token.schema';
import { UserModel } from '@/features/auth/schema/user.schema';
import { AvailabilityModel } from '@/features/availability/schema/availability.schema';
import { ConversationModel } from '@/features/chat/schema/conversation.schema';
import { MessageModel } from '@/features/chat/schema/message.schema';
import { MediaModel } from '@/features/media/schema/media.schema';
import { StudentProfileModel } from '@/features/profiles/schema/student-profile.schema';
import { TeacherProfileModel } from '@/features/profiles/schema/teacher-profile.schema';
import { RatingRequestModel } from '@/features/ratings/schema/rating-request.schema';
import { RatingModel } from '@/features/ratings/schema/rating.schema';
import { StudentRequestModel } from '@/features/requests/schema/student-request.schema';
import { TutorVerificationModel } from '@/features/verification/schema/tutor-verification.schema';
import { VipPlanModel } from '@/features/vip/schema/vip-plan.schema';
import { VipSubscriptionModel } from '@/features/vip/schema/vip-subscription.schema';
import { mongo } from '@/shared/lib/mongo';

const ADMIN_MODELS: Record<AdminCollectionKey, Model<AdminRawDocument>> = {
  users: UserModel,
  teacherProfiles: TeacherProfileModel,
  studentProfiles: StudentProfileModel,
  availability: AvailabilityModel,
  tutorVerifications: TutorVerificationModel,
  media: MediaModel,
  studentRequests: StudentRequestModel,
  conversations: ConversationModel,
  messages: MessageModel,
  ratingRequests: RatingRequestModel,
  ratings: RatingModel,
  vipSubscriptions: VipSubscriptionModel,
  vipPlans: VipPlanModel,
  authTokens: AuthTokenModel,
};

type AdminCountFilter = Record<string, string | boolean | { $ne: string } | { $gt: Date } | { $gte: Date }>;

export const adminRepository = {
  async count(key: AdminCollectionKey, filter: AdminSearchFilter | AdminCountFilter = {}): Promise<number> {
    await mongo.connect();
    return ADMIN_MODELS[key].countDocuments(filter).exec();
  },

  // Newest first: ObjectIds grow with creation time, and every collection has one (ratings have no createdAt).
  async list(key: AdminCollectionKey, filter: AdminSearchFilter, skip: number, limit: number): Promise<AdminRawDocument[]> {
    await mongo.connect();
    return ADMIN_MODELS[key].find(filter).sort({ _id: -1 }).skip(skip).limit(limit).lean<AdminRawDocument[]>().exec();
  },

  async findById(key: AdminCollectionKey, id: string): Promise<AdminRawDocument | null> {
    await mongo.connect();
    return ADMIN_MODELS[key].findById(id).lean<AdminRawDocument>().exec();
  },

  async create(key: AdminCollectionKey, data: AdminWriteData): Promise<string> {
    await mongo.connect();
    const doc = await ADMIN_MODELS[key].create(data);
    return doc._id.toString();
  },

  async updateById(key: AdminCollectionKey, id: string, data: AdminWriteData): Promise<AdminRawDocument | null> {
    await mongo.connect();
    return ADMIN_MODELS[key]
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .lean<AdminRawDocument>()
      .exec();
  },

  async deleteById(key: AdminCollectionKey, id: string): Promise<boolean> {
    await mongo.connect();
    const result = await ADMIN_MODELS[key].findByIdAndDelete(id).exec();
    return result !== null;
  },

  async averageRating(): Promise<number | null> {
    await mongo.connect();
    const [row] = await RatingModel.aggregate<{ average: number }>([{ $group: { _id: null, average: { $avg: '$value' } } }]).exec();
    return row?.average ?? null;
  },

  async recentUsers(limit: number): Promise<AdminRawDocument[]> {
    await mongo.connect();
    return UserModel.find({}, { name: 1, email: 1, role: 1, createdAt: 1 }).sort({ _id: -1 }).limit(limit).lean<AdminRawDocument[]>().exec();
  },
};
