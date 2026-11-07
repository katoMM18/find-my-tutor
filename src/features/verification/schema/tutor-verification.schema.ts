import mongoose, { InferSchemaType, Schema } from 'mongoose';

export const VERIFICATION_STATUSES = ['pending', 'approved', 'rejected'] as const;

// One record per tutor: the latest diploma or certificate they submitted and what an admin decided.
const TutorVerificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    mediaId: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
    status: { type: String, enum: VERIFICATION_STATUSES, required: true, default: 'pending', index: true },
    reason: { type: String, default: '', maxlength: 500 },
    submittedAt: { type: Date, required: true },
    reviewedAt: { type: Date, required: false },
    reviewerEmail: { type: String, required: false },
  },
  { timestamps: true }
);

export type TutorVerificationDocument = InferSchemaType<typeof TutorVerificationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TutorVerificationModel =
  mongoose.models.TutorVerification || mongoose.model('TutorVerification', TutorVerificationSchema);
