import { PipelineStage } from 'mongoose';

import {
  PublicStudent,
  StudentDiscoveryFilters,
} from '@/features/discovery/types/student-discovery.types';
import { StudentProfileModel } from '@/features/profiles/schema/student-profile.schema';
import { mongo } from '@/shared/lib/mongo';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const studentDiscoveryRepository = {
  async findMany(
    filters: StudentDiscoveryFilters
  ): Promise<{ items: PublicStudent[]; total: number }> {
    await mongo.connect();

    const search = filters.search?.trim();
    const pattern = search ? escapeRegex(search) : '';
    const pipeline: PipelineStage[] = [
      { $match: filters.subject ? { subjects: filters.subject } : {} },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
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
      {
        $facet: {
          items: [
            { $sort: { updatedAt: -1, _id: 1 } },
            { $skip: (filters.page - 1) * filters.limit },
            { $limit: filters.limit },
            {
              $project: {
                _id: 0,
                id: { $toString: '$_id' },
                userId: { $toString: '$user._id' },
                name: '$user.name',
                avatar: { $ifNull: ['$user.avatar', null] },
                bio: 1,
                subjects: 1,
              },
            },
          ],
          total: [{ $count: 'value' }],
        },
      },
    ];

    const [result] = await StudentProfileModel.aggregate<{
      items: PublicStudent[];
      total: { value: number }[];
    }>(pipeline).exec();

    return { items: result?.items ?? [], total: result?.total[0]?.value ?? 0 };
  },
};
