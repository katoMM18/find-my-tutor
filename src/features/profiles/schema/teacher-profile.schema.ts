import mongoose, { InferSchemaType, Schema } from 'mongoose';

const TeacherProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '', maxlength: 2000 },
    subjects: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0, min: 0, max: 80 },
    education: { type: String, default: '', maxlength: 1000 },
    qualifications: { type: String, default: '', maxlength: 2000 },
    certificates: {
      type: [
        {
          name: { type: String, required: true },
          issuer: { type: String, required: true },
          issueDate: { type: String, required: true },
          expirationDate: { type: String, default: '' },
        },
      ],
      default: [],
    },
    licenses: {
      type: [
        {
          name: { type: String, required: true },
          issuer: { type: String, required: true },
          issueDate: { type: String, required: true },
          expirationDate: { type: String, default: '' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export type TeacherProfileDocument = InferSchemaType<typeof TeacherProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TeacherProfileModel =
  mongoose.models.TeacherProfile ||
  mongoose.model('TeacherProfile', TeacherProfileSchema);
