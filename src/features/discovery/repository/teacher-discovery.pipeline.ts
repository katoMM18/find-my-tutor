import { PipelineStage } from 'mongoose';

import { LISTING_MAX_EXPERIENCE_YEARS, LISTING_MIN_BIO_LENGTH } from '@/shared/const/listing.const';
import { type TeacherSort } from '@/shared/const/subjects.const';
import { VIP_STATUS_RANK } from '@/shared/const/vip.const';

// Aggregation stages shared by the teacher discovery queries.
const cloudinaryImageBase = process.env.CLOUDINARY_CLOUD_NAME
  ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`
  : '';

export const SORT_STAGES: Record<TeacherSort, Record<string, 1 | -1>> = {
  recommended: { vipRank: -1, reviewCount: -1, rating: -1, experienceYears: -1, _id: 1 },
  rating: { rating: -1, reviewCount: -1, vipRank: -1, _id: 1 },
  experience: { experienceYears: -1, vipRank: -1, _id: 1 },
};

// Listed flyers only. Profile fields first (cheap, before any lookup): a price, believable experience, subjects, a real intro.
export const listedProfileMatch: PipelineStage.Match = {
  $match: {
    pricePerLesson: { $gt: 0 },
    experienceYears: { $lte: LISTING_MAX_EXPERIENCE_YEARS },
    'subjects.0': { $exists: true },
    $expr: { $gte: [{ $strLenCP: { $trim: { input: { $ifNull: ['$bio', ''] } } } }, LISTING_MIN_BIO_LENGTH] },
  },
};

// Then, after the lookups: at least one teaching day and a photo (OAuth avatar or upload).
export const listedEnrichedMatch: PipelineStage.Match = {
  $match: {
    'availableDays.0': { $exists: true },
    $or: [{ 'user.avatar': { $nin: [null, ''] } }, { 'profileMedia.0': { $exists: true } }],
  },
};

// Search shows every tutor, but complete flyers (same rules as above) are pinned ahead of unfinished ones.
export const listedFlagStage: PipelineStage.Set = {
  $set: {
    listed: {
      $and: [
        { $gt: [{ $ifNull: ['$pricePerLesson', 0] }, 0] },
        { $lte: ['$experienceYears', LISTING_MAX_EXPERIENCE_YEARS] },
        { $gt: [{ $size: { $ifNull: ['$subjects', []] } }, 0] },
        { $gte: [{ $strLenCP: { $trim: { input: { $ifNull: ['$bio', ''] } } } }, LISTING_MIN_BIO_LENGTH] },
        { $gt: [{ $size: '$availableDays' }, 0] },
        { $or: [{ $gt: [{ $strLenCP: { $ifNull: ['$user.avatar', ''] } }, 0] }, { $gt: [{ $size: '$profileMedia' }, 0] }] },
      ],
    },
  },
};

export const enrichmentStages = (now: Date): PipelineStage[] => [
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

export const publicProjection: PipelineStage.Project = {
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
    bio: 1, subjects: 1, experienceYears: 1, education: 1, qualifications: 1,
    rating: 1, reviewCount: 1, availableDays: 1,
    timezone: { $ifNull: ['$availability.timezone', null] },
    vipStatus: 1,
    pricePerLesson: { $ifNull: ['$pricePerLesson', null] },
    lessonFormats: { $ifNull: ['$lessonFormats', ['online']] },
    areas: { $ifNull: ['$areas', []] },
    acceptingStudents: { $ifNull: ['$acceptingStudents', true] },
    verified: { $ifNull: ['$verified', false] },
    responseMinutes: { $ifNull: ['$responseMinutes', null] },
  },
};
