import mongoose from 'mongoose';

import {
  AvailabilityDocument,
  AvailabilityModel,
} from '@/features/availability/schema/availability.schema';
import { AvailabilityInput } from '@/features/availability/validations/availability.validation';
import { TeacherProfileModel } from '@/features/profiles/schema/teacher-profile.schema';
import { mongo } from '@/shared/lib/mongo';

export const availabilityRepository = {
  async findByUserId(userId: string): Promise<AvailabilityDocument | null> {
    await mongo.connect();
    const profile = await TeacherProfileModel.findOne({ userId }).select('_id').lean().exec();
    if (!profile) return null;
    return AvailabilityModel.findOne({ teacherProfileId: profile._id })
      .lean<AvailabilityDocument>()
      .exec();
  },

  async upsertByUserId(
    userId: string,
    data: AvailabilityInput
  ): Promise<AvailabilityDocument> {
    await mongo.connect();
    const profile = await TeacherProfileModel.findOne({ userId }).select('_id').lean().exec();
    if (!profile) throw new Error('TEACHER_PROFILE_NOT_FOUND');
    return AvailabilityModel.findOneAndUpdate(
      { teacherProfileId: profile._id },
      { $set: data, $setOnInsert: { teacherProfileId: profile._id } },
      { new: true, upsert: true }
    )
      .lean<AvailabilityDocument>()
      .exec() as Promise<AvailabilityDocument>;
  },

  async findByTeacherProfileId(
    teacherProfileId: string
  ): Promise<AvailabilityDocument | null> {
    await mongo.connect();
    if (!mongoose.isValidObjectId(teacherProfileId)) return null;
    return AvailabilityModel.findOne({ teacherProfileId })
      .lean<AvailabilityDocument>()
      .exec();
  },
};
