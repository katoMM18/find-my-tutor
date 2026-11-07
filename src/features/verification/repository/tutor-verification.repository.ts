import { TutorVerificationDocument, TutorVerificationModel } from '@/features/verification/schema/tutor-verification.schema';
import { mongo } from '@/shared/lib/mongo';

export const tutorVerificationRepository = {
  async findByUserId(userId: string): Promise<TutorVerificationDocument | null> {
    await mongo.connect();
    return TutorVerificationModel.findOne({ userId }).lean<TutorVerificationDocument>().exec();
  },

  async findById(id: string): Promise<TutorVerificationDocument | null> {
    await mongo.connect();
    return TutorVerificationModel.findById(id).lean<TutorVerificationDocument>().exec();
  },

  async upsertPending(userId: string, mediaId: string): Promise<void> {
    await mongo.connect();
    await TutorVerificationModel.updateOne(
      { userId },
      {
        $set: { mediaId, status: 'pending', reason: '', submittedAt: new Date() },
        $unset: { reviewedAt: '', reviewerEmail: '' },
      },
      { upsert: true }
    );
  },

  async findPending(): Promise<TutorVerificationDocument[]> {
    await mongo.connect();
    return TutorVerificationModel.find({ status: 'pending' }).sort({ submittedAt: 1 }).lean<TutorVerificationDocument[]>().exec();
  },

  async setDecision(id: string, data: { status: 'approved' | 'rejected'; reason: string; reviewerEmail: string }): Promise<void> {
    await mongo.connect();
    await TutorVerificationModel.updateOne({ _id: id }, { $set: { ...data, reviewedAt: new Date() } });
  },
};
