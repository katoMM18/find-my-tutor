import mongoose, { InferSchemaType, Schema } from 'mongoose';

const RatingSchema = new Schema(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'RatingRequest',
      required: true,
      unique: true,
      immutable: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    teacherProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      required: true,
      immutable: true,
    },
    value: { type: Number, required: true, min: 1, max: 5, immutable: true },
    comment: { type: String, default: '', maxlength: 2000, immutable: true },
    // What the lessons led to, in the student's words: an exam score, an admission. Optional, permanent like the rest.
    result: { type: String, default: '', maxlength: 120, immutable: true },
    submittedAt: { type: Date, required: true, immutable: true },
  },
  { timestamps: false }
);

export type RatingDocument = InferSchemaType<typeof RatingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RatingModel =
  mongoose.models.Rating || mongoose.model('Rating', RatingSchema);
