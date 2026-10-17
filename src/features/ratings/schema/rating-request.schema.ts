import mongoose, { InferSchemaType, Schema } from 'mongoose';

const RatingRequestSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacherProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'submitted', 'expired'],
      default: 'pending',
      required: true,
    },
    expiresAt: { type: Date, required: true },
    approvedAt: { type: Date },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

RatingRequestSchema.index({ studentId: 1, teacherProfileId: 1 }, { unique: true });

export type RatingRequestDocument = InferSchemaType<typeof RatingRequestSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RatingRequestModel =
  mongoose.models.RatingRequest ||
  mongoose.model('RatingRequest', RatingRequestSchema);
