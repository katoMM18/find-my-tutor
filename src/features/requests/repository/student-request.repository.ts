import { StudentRequestDocument, StudentRequestModel } from '@/features/requests/schema/student-request.schema';
import { CreateRequestType } from '@/features/requests/validations/request.validation';
import { mongo } from '@/shared/lib/mongo';

export const studentRequestRepository = {
  async create(studentId: string, data: CreateRequestType): Promise<StudentRequestDocument> {
    await mongo.connect();
    const doc = await StudentRequestModel.create({ ...data, studentId });
    return doc.toObject();
  },

  async findById(id: string): Promise<StudentRequestDocument | null> {
    await mongo.connect();
    return StudentRequestModel.findById(id).lean<StudentRequestDocument>().exec();
  },

  async findByStudent(studentId: string): Promise<StudentRequestDocument[]> {
    await mongo.connect();
    return StudentRequestModel.find({ studentId }).sort({ createdAt: -1 }).limit(20).lean<StudentRequestDocument[]>().exec();
  },

  async countOpenByStudent(studentId: string): Promise<number> {
    await mongo.connect();
    return StudentRequestModel.countDocuments({ studentId, status: 'open' });
  },

  async findOpenForSubjects(subjects: (string | RegExp)[], limit: number): Promise<StudentRequestDocument[]> {
    await mongo.connect();
    return StudentRequestModel.find({ status: 'open', subject: { $in: subjects } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<StudentRequestDocument[]>()
      .exec();
  },

  async close(id: string, studentId: string): Promise<boolean> {
    await mongo.connect();
    const result = await StudentRequestModel.updateOne({ _id: id, studentId }, { $set: { status: 'closed' } });
    return result.matchedCount > 0;
  },

  async addReply(id: string, teacherId: string): Promise<void> {
    await mongo.connect();
    await StudentRequestModel.updateOne({ _id: id }, { $addToSet: { repliedTeacherIds: teacherId } });
  },
};
