import mongoose, { PipelineStage } from 'mongoose';

import {
  enrichmentStages,
  listedEnrichedMatch,
  listedFlagStage,
  listedProfileMatch,
  publicProjection,
  SORT_STAGES,
} from '@/features/discovery/repository/teacher-discovery.pipeline';
import { TeacherDiscoveryFilters, TeacherRow } from '@/features/discovery/types/teacher-discovery.types';
import { TeacherProfileModel } from '@/features/profiles/schema/teacher-profile.schema';
import { type LessonArea } from '@/shared/const/lesson.const';
import { mongo } from '@/shared/lib/mongo';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const teacherDiscoveryRepository = {
  async findMany(
    filters: TeacherDiscoveryFilters
  ): Promise<{ items: TeacherRow[]; total: number }> {
    await mongo.connect();

    const match: Record<string, unknown> = {};
    if (filters.subject) match.subjects = filters.subject;
    if (filters.minExperience !== undefined) match.experienceYears = { $gte: filters.minExperience };
    if (filters.format) match.lessonFormats = filters.format;
    if (filters.area) match.areas = filters.area;
    if (filters.maxPrice !== undefined) match.pricePerLesson = { $lte: filters.maxPrice };

    const search = filters.search?.trim();
    const pattern = search ? escapeRegex(search) : '';
    const pipeline: PipelineStage[] = [
      { $match: match },
      ...enrichmentStages(new Date()),
      listedFlagStage,
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
      ...(filters.day !== undefined ? [{ $match: { availableDays: filters.day } }] : []),
      {
        $facet: {
          items: [
            { $sort: { listed: -1, ...SORT_STAGES[filters.sort ?? 'recommended'] } },
            { $skip: (filters.page - 1) * filters.limit },
            { $limit: filters.limit },
            publicProjection,
          ],
          total: [{ $count: 'value' }],
        },
      },
    ];

    const [result] = await TeacherProfileModel.aggregate<{ items: TeacherRow[]; total: { value: number }[] }>(pipeline).exec();

    return {
      items: result?.items ?? [],
      total: result?.total[0]?.value ?? 0,
    };
  },

  // How many tutors list each subject, for the home page subject directory.
  async countBySubject(): Promise<{ subject: string; count: number }[]> {
    await mongo.connect();
    return TeacherProfileModel.aggregate<{ subject: string; count: number }>([
      { $unwind: '$subjects' },
      { $group: { _id: '$subjects', count: { $sum: 1 } } },
      { $project: { _id: 0, subject: '$_id', count: 1 } },
    ]).exec();
  },

  // Prices of listed tutors for a subject, optionally only those covering one area.
  async findListedPrices(subject: string | RegExp, area?: LessonArea): Promise<number[]> {
    await mongo.connect();

    const rows = await TeacherProfileModel.aggregate<{ price: number }>([
      { $match: area ? { subjects: subject, areas: area } : { subjects: subject } }, listedProfileMatch,
      ...enrichmentStages(new Date()), listedEnrichedMatch, { $project: { _id: 0, price: '$pricePerLesson' } },
    ]).exec();
    return rows.map((row) => row.price);
  },

  async findById(id: string): Promise<TeacherRow | null> {
    await mongo.connect();
    if (!mongoose.isValidObjectId(id)) return null;

    const [teacher] = await TeacherProfileModel.aggregate<TeacherRow>([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...enrichmentStages(new Date()),
      publicProjection,
    ]).exec();

    return teacher ?? null;
  },
};
