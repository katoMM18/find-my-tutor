import {
  StudentProfileDocument,
  StudentProfileModel,
} from '@/features/profiles/schema/student-profile.schema';
import {
  TeacherProfileDocument,
  TeacherProfileModel,
} from '@/features/profiles/schema/teacher-profile.schema';
import {
  StudentProfileInput,
  TeacherProfileInput,
} from '@/features/profiles/validations/profile.validation';
import { mongo } from '@/shared/lib/mongo';

export const profileRepository = {
  async findTeacherByUserId(userId: string): Promise<TeacherProfileDocument | null> {
    await mongo.connect();
    return TeacherProfileModel.findOne({ userId }).lean<TeacherProfileDocument>().exec();
  },

  async upsertTeacher(
    userId: string,
    data: TeacherProfileInput
  ): Promise<TeacherProfileDocument> {
    await mongo.connect();
    return TeacherProfileModel.findOneAndUpdate(
      { userId },
      { $set: data, $setOnInsert: { userId } },
      { new: true, upsert: true }
    )
      .lean<TeacherProfileDocument>()
      .exec() as Promise<TeacherProfileDocument>;
  },

  async findStudentByUserId(userId: string): Promise<StudentProfileDocument | null> {
    await mongo.connect();
    return StudentProfileModel.findOne({ userId }).lean<StudentProfileDocument>().exec();
  },

  async upsertStudent(
    userId: string,
    data: StudentProfileInput
  ): Promise<StudentProfileDocument> {
    await mongo.connect();
    return StudentProfileModel.findOneAndUpdate(
      { userId },
      { $set: data, $setOnInsert: { userId } },
      { new: true, upsert: true }
    )
      .lean<StudentProfileDocument>()
      .exec() as Promise<StudentProfileDocument>;
  },
};
