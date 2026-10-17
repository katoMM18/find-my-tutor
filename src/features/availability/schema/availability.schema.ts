import mongoose, { InferSchemaType, Schema } from 'mongoose';

const TimeRangeSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const WeeklyAvailabilitySchema = new Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    intervals: { type: [TimeRangeSchema], default: [] },
  },
  { _id: false }
);

const AvailabilityExceptionSchema = new Schema(
  {
    date: { type: String, required: true },
    isAvailable: { type: Boolean, required: true },
    intervals: { type: [TimeRangeSchema], default: [] },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema(
  {
    teacherProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      required: true,
      unique: true,
    },
    timezone: { type: String, required: true, default: 'UTC' },
    weekly: { type: [WeeklyAvailabilitySchema], default: [] },
    exceptions: { type: [AvailabilityExceptionSchema], default: [] },
  },
  { timestamps: true }
);

export type AvailabilityDocument = InferSchemaType<typeof AvailabilitySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AvailabilityModel =
  mongoose.models.Availability ||
  mongoose.model('Availability', AvailabilitySchema);
