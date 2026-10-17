import mongoose, { InferSchemaType, Schema } from 'mongoose';

const StudentProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '', maxlength: 1000 },
    subjects: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type StudentProfileDocument = InferSchemaType<typeof StudentProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StudentProfileModel =
  mongoose.models.StudentProfile ||
  mongoose.model('StudentProfile', StudentProfileSchema);
