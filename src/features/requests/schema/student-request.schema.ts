import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { LESSON_AREAS, LESSON_FORMATS } from '@/shared/const/lesson.const';
import { REQUEST_GOALS } from '@/shared/const/requests.const';

// A student's "I need a tutor for…" post. Tutors who teach the subject see it and can reply.
const StudentRequestSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, index: true },
    goal: { type: String, enum: REQUEST_GOALS, required: true },
    format: { type: String, enum: LESSON_FORMATS, required: false },
    area: { type: String, enum: LESSON_AREAS, required: false },
    budget: { type: Number, required: false, min: 0 },
    note: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    repliedTeacherIds: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  { timestamps: true }
);

export type StudentRequestDocument = InferSchemaType<typeof StudentRequestSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StudentRequestModel = mongoose.models.StudentRequest || mongoose.model('StudentRequest', StudentRequestSchema);
