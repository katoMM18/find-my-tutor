import mongoose from 'mongoose';

import { UserDocument, UserModel } from '@/features/auth/schema/user.schema';
import {
  TeacherProfileDocument,
  TeacherProfileModel,
} from '@/features/profiles/schema/teacher-profile.schema';
import {
  RatingRequestDocument,
  RatingRequestModel,
} from '@/features/ratings/schema/rating-request.schema';
import { RatingDocument, RatingModel } from '@/features/ratings/schema/rating.schema';
import { mongo } from '@/shared/lib/mongo';

export const ratingRepository = {
  async findTeacherProfileById(id: string) {
    await mongo.connect();
    if (!mongoose.isValidObjectId(id)) return null;
    return TeacherProfileModel.findById(id).select('userId').lean().exec();
  },

  async findTeacherProfileByUserId(userId: string) {
    await mongo.connect();
    return TeacherProfileModel.findOne({ userId }).select('_id userId').lean().exec();
  },

  async findRequestById(id: string): Promise<RatingRequestDocument | null> {
    await mongo.connect();
    if (!mongoose.isValidObjectId(id)) return null;
    return RatingRequestModel.findById(id).lean<RatingRequestDocument>().exec();
  },

  async findRequestByPair(
    studentId: string,
    teacherProfileId: string
  ): Promise<RatingRequestDocument | null> {
    await mongo.connect();
    return RatingRequestModel.findOne({ studentId, teacherProfileId })
      .lean<RatingRequestDocument>()
      .exec();
  },

  async findRequestsByStudent(studentId: string): Promise<RatingRequestDocument[]> {
    await mongo.connect();
    return RatingRequestModel.find({ studentId })
      .sort({ createdAt: -1 })
      .lean<RatingRequestDocument[]>()
      .exec();
  },

  async findRequestsByTeacher(teacherProfileId: string): Promise<RatingRequestDocument[]> {
    await mongo.connect();
    return RatingRequestModel.find({ teacherProfileId })
      .sort({ createdAt: -1 })
      .lean<RatingRequestDocument[]>()
      .exec();
  },

  async createRequest(
    data: Omit<RatingRequestDocument, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<RatingRequestDocument> {
    await mongo.connect();
    return RatingRequestModel.create(data) as Promise<RatingRequestDocument>;
  },

  async updateRequest(
    id: string,
    data: Partial<RatingRequestDocument>
  ): Promise<RatingRequestDocument | null> {
    await mongo.connect();
    return RatingRequestModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .lean<RatingRequestDocument>()
      .exec();
  },

  async createRating(
    data: Omit<RatingDocument, '_id'>
  ): Promise<RatingDocument> {
    await mongo.connect();
    return RatingModel.create(data) as Promise<RatingDocument>;
  },

  async findRatingByRequestId(requestId: string): Promise<RatingDocument | null> {
    await mongo.connect();
    return RatingModel.findOne({ requestId }).lean<RatingDocument>().exec();
  },

  async findRatingsByTeacher(teacherProfileId: string, limit: number): Promise<RatingDocument[]> {
    await mongo.connect();
    if (!mongoose.isValidObjectId(teacherProfileId)) return [];
    return RatingModel.find({ teacherProfileId })
      .sort({ submittedAt: -1 })
      .limit(limit)
      .lean<RatingDocument[]>()
      .exec();
  },

  async findUsersByIds(ids: string[]): Promise<Pick<UserDocument, '_id' | 'name' | 'avatar'>[]> {
    await mongo.connect();
    return UserModel.find({ _id: { $in: ids } })
      .select('name avatar')
      .lean<Pick<UserDocument, '_id' | 'name' | 'avatar'>[]>()
      .exec();
  },

  async findTeacherProfilesByIds(ids: string[]): Promise<Pick<TeacherProfileDocument, '_id' | 'userId'>[]> {
    await mongo.connect();
    return TeacherProfileModel.find({ _id: { $in: ids } })
      .select('userId')
      .lean<Pick<TeacherProfileDocument, '_id' | 'userId'>[]>()
      .exec();
  },

  async aggregateTeacherRating(
    teacherProfileId: string
  ): Promise<{ average: number | null; count: number }> {
    await mongo.connect();
    if (!mongoose.isValidObjectId(teacherProfileId)) return { average: null, count: 0 };
    const [aggregate] = await RatingModel.aggregate<{
      average: number;
      count: number;
    }>([
      { $match: { teacherProfileId: new mongoose.Types.ObjectId(teacherProfileId) } },
      { $group: { _id: null, average: { $avg: '$value' }, count: { $sum: 1 } } },
    ]).exec();
    return { average: aggregate?.average ?? null, count: aggregate?.count ?? 0 };
  },
};
