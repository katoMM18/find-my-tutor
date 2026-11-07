import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { LESSON_AREAS, LESSON_FORMATS, PRICE_MAX_GEL, PRICE_MIN_GEL } from '@/shared/const/lesson.const';

const TeacherProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '', maxlength: 2000 },
    subjects: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0, min: 0, max: 80 },
    education: { type: String, default: '', maxlength: 1000 },
    qualifications: { type: String, default: '', maxlength: 2000 },
    pricePerLesson: { type: Number, required: false, min: PRICE_MIN_GEL, max: PRICE_MAX_GEL },
    lessonFormats: { type: [{ type: String, enum: LESSON_FORMATS }], default: ['online'] },
    areas: { type: [{ type: String, enum: LESSON_AREAS }], default: [] },
    acceptingStudents: { type: Boolean, default: true },
    // Set only by an admin after checking an uploaded diploma.
    verified: { type: Boolean, default: false },
    // Running average of how fast the tutor first replies to a new conversation; set by the chat service.
    responseMinutes: { type: Number, required: false },
    responseSamples: { type: Number, default: 0 },
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
