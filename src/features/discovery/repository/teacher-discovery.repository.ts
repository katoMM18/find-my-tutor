import mongoose, { PipelineStage } from 'mongoose';

import {
  PublicTeacher,
  TeacherDiscoveryFilters,
} from '@/features/discovery/types/teacher-discovery.types';
import { TeacherProfileModel } from '@/features/profiles/schema/teacher-profile.schema';
import { type TeacherSort } from '@/shared/const/subjects.const';
import { VIP_STATUS_RANK } from '@/shared/const/vip.const';
import { mongo } from '@/shared/lib/mongo';

const cloudinaryImageBase = process.env.CLOUDINARY_CLOUD_NAME
  ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`
  : '';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_STAGES: Record<TeacherSort, Record<string, 1 | -1>> = {
  recommended: { vipRank: -1, reviewCount: -1, rating: -1, experienceYears: -1, _id: 1 },
  rating: { rating: -1, reviewCount: -1, vipRank: -1, _id: 1 },
  experience: { experienceYears: -1, vipRank: -1, _id: 1 },
};

const enrichmentStages = (now: Date): PipelineStage[] => [
  { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
  { $unwind: '$user' },
  {
    $lookup: {
      from: 'media',
      let: { ownerId: '$user._id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$ownerId', '$$ownerId'] }, kind: 'profile_image' } },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
      ],
      as: 'profileMedia',
    },
  },
  { $lookup: { from: 'vipsubscriptions', localField: 'user._id', foreignField: 'userId', as: 'vip' } },
  { $unwind: { path: '$vip', preserveNullAndEmptyArrays: true } },
  { $lookup: { from: 'ratings', localField: '_id', foreignField: 'teacherProfileId', as: 'ratings' } },
  { $lookup: { from: 'availabilities', localField: '_id', foreignField: 'teacherProfileId', as: 'availability' } },
  { $unwind: { path: '$availability', preserveNullAndEmptyArrays: true } },
  {
    $set: {
      vipStatus: {
        $cond: [
          {
            $and: [
              { $ne: ['$vip.status', 'none'] },
              { $or: [{ $eq: ['$vip.expiresAt', null] }, { $gt: ['$vip.expiresAt', now] }] },
            ],
          },
          { $ifNull: ['$vip.status', 'none'] },
          'none',
        ],
      },
      rating: { $cond: [{ $gt: [{ $size: '$ratings' }, 0] }, { $avg: '$ratings.value' }, null] },
      reviewCount: { $size: '$ratings' },
      availableDays: {
        $map: {
          input: {
            $filter: {
              input: { $ifNull: ['$availability.weekly', []] },
              as: 'entry',
              cond: { $gt: [{ $size: '$$entry.intervals' }, 0] },
            },
          },
          as: 'entry',
          in: '$$entry.day',
        },
      },
    },
  },
  {
    $set: {
      vipRank: {
        $switch: {
          branches: Object.entries(VIP_STATUS_RANK)
            .filter(([status]) => status !== 'none')
            .map(([status, rank]) => ({ case: { $eq: ['$vipStatus', status] }, then: rank })),
          default: 0,
        },
      },
    },
  },
];

const publicProjection: PipelineStage.Project = {
  $project: {
    _id: 0,
    id: { $toString: '$_id' },
    userId: { $toString: '$user._id' },
    name: '$user.name',
    avatar: {
      $ifNull: [
        '$user.avatar',
        {
          $cond: [
            { $gt: [{ $size: '$profileMedia' }, 0] },
            {
              $ifNull: [
                { $arrayElemAt: ['$profileMedia.secureUrl', 0] },
                { $concat: [cloudinaryImageBase, { $arrayElemAt: ['$profileMedia.publicId', 0] }] },
              ],
            },
            null,
          ],
        },
      ],
    },
    bio: 1,
    subjects: 1,
    experienceYears: 1,
    education: 1,
    qualifications: 1,
    rating: 1,
    reviewCount: 1,
    availableDays: 1,
    timezone: { $ifNull: ['$availability.timezone', null] },
    vipStatus: 1,
  },
};

export const teacherDiscoveryRepository = {
  async findMany(
    filters: TeacherDiscoveryFilters
  ): Promise<{ items: PublicTeacher[]; total: number }> {
    await mongo.connect();

    const match: Record<string, unknown> = {};
    if (filters.subject) match.subjects = filters.subject;
    if (filters.minExperience !== undefined) match.experienceYears = { $gte: filters.minExperience };

    const search = filters.search?.trim();
    const pattern = search ? escapeRegex(search) : '';
    const pipeline: PipelineStage[] = [
      { $match: match },
      ...enrichmentStages(new Date()),
      ...(pattern
        ? [{
          $match: {
            $or: [
              { 'user.name': { $regex: pattern, $options: 'i' } },
              { bio: { $regex: pattern, $options: 'i' } },
              { subjects: { $regex: pattern, $options: 'i' } },
            ],
          },
        }]
        : []),
      ...(filters.minRating ? [{ $match: { rating: { $gte: filters.minRating } } }] : []),
      {
        $facet: {
          items: [
            { $sort: SORT_STAGES[filters.sort ?? 'recommended'] },
            { $skip: (filters.page - 1) * filters.limit },
            { $limit: filters.limit },
            publicProjection,
          ],
          total: [{ $count: 'value' }],
        },
      },
    ];

    const [result] = await TeacherProfileModel.aggregate<{
      items: PublicTeacher[];
      total: { value: number }[];
    }>(pipeline).exec();

    return {
      items: result?.items ?? [],
      total: result?.total[0]?.value ?? 0,
    };
  },

  async findById(id: string): Promise<PublicTeacher | null> {
    await mongo.connect();
    if (!mongoose.isValidObjectId(id)) return null;

    const [teacher] = await TeacherProfileModel.aggregate<PublicTeacher>([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...enrichmentStages(new Date()),
      publicProjection,
    ]).exec();

    return teacher ?? null;
  },
};
