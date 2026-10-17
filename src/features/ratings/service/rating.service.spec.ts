import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/ratings/repository/rating.repository', () => ({
  ratingRepository: {
    findTeacherProfileById: vi.fn(),
    findRequestById: vi.fn(),
    findRequestByPair: vi.fn(),
    createRequest: vi.fn(),
    updateRequest: vi.fn(),
    createRating: vi.fn(),
    aggregateTeacherRating: vi.fn(),
    findRatingsByTeacher: vi.fn(),
    findUsersByIds: vi.fn(),
    findTeacherProfilesByIds: vi.fn(),
    findTeacherProfileByUserId: vi.fn(),
    findRequestsByTeacher: vi.fn(),
    findRequestsByStudent: vi.fn(),
  },
}));

import { ratingRepository } from '@/features/ratings/repository/rating.repository';

import {
  approveRatingRequestService,
  createRatingRequestService,
  getTeacherRatingService,
  getTeacherReviewsService,
  listRatingRequestsService,
  submitRatingService,
} from './rating.service';

const mockRepository = vi.mocked(ratingRepository);
const studentId = '507f1f77bcf86cd799439011';
const teacherId = '507f1f77bcf86cd799439012';
const profileId = '507f1f77bcf86cd799439013';
const requestId = '507f1f77bcf86cd799439014';

describe('rating service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('allows a student to create one rating request', async () => {
    mockRepository.findTeacherProfileById.mockResolvedValueOnce({
      userId: new mongoose.Types.ObjectId(teacherId),
    } as never);
    mockRepository.findRequestByPair.mockResolvedValueOnce(null);

    const result = await createRatingRequestService(studentId, 'student', {
      teacherProfileId: profileId,
    });

    expect(result.status).toBe(201);
    expect(mockRepository.createRequest).toHaveBeenCalledOnce();
  });

  it('does not allow a student to approve a request', async () => {
    const result = await approveRatingRequestService(studentId, 'student', requestId);

    expect(result).toEqual({ data: { error: 'FORBIDDEN' }, status: 403 });
    expect(mockRepository.findRequestById).not.toHaveBeenCalled();
  });

  it('allows only the owning teacher to approve a pending request', async () => {
    mockRepository.findRequestById.mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(requestId),
      teacherProfileId: new mongoose.Types.ObjectId(profileId),
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000),
    } as never);
    mockRepository.findTeacherProfileById.mockResolvedValueOnce({
      userId: new mongoose.Types.ObjectId(teacherId),
    } as never);

    const result = await approveRatingRequestService(teacherId, 'teacher', requestId);

    expect(result.status).toBe(200);
    expect(mockRepository.updateRequest).toHaveBeenCalledWith(
      requestId,
      expect.objectContaining({ status: 'approved' })
    );
  });

  it('requires approval before submitting a rating', async () => {
    mockRepository.findRequestById.mockResolvedValueOnce({
      studentId: new mongoose.Types.ObjectId(studentId),
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000),
    } as never);

    const result = await submitRatingService(studentId, 'student', requestId, {
      value: 5,
      comment: 'Great teacher',
    });

    expect(result).toEqual({ data: { error: 'RATING_NOT_ENABLED' }, status: 409 });
    expect(mockRepository.createRating).not.toHaveBeenCalled();
  });

  it('returns an empty aggregate without misleading zero rating', async () => {
    mockRepository.aggregateTeacherRating.mockResolvedValueOnce({ average: null, count: 0 });

    const result = await getTeacherRatingService(profileId);

    expect(result).toEqual({ data: { average: null, count: 0 }, status: 200 });
  });

  it('reopens an expired request instead of blocking the pair forever', async () => {
    mockRepository.findTeacherProfileById.mockResolvedValueOnce({
      userId: new mongoose.Types.ObjectId(teacherId),
    } as never);
    mockRepository.findRequestByPair.mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(requestId),
      status: 'expired',
      expiresAt: new Date(Date.now() - 1000),
    } as never);

    const result = await createRatingRequestService(studentId, 'student', { teacherProfileId: profileId });

    expect(result.status).toBe(201);
    expect(mockRepository.updateRequest).toHaveBeenCalledWith(
      requestId,
      expect.objectContaining({ status: 'pending' })
    );
    expect(mockRepository.createRequest).not.toHaveBeenCalled();
  });

  it('returns public reviews with student names', async () => {
    mockRepository.aggregateTeacherRating.mockResolvedValueOnce({ average: 5, count: 1 });
    mockRepository.findRatingsByTeacher.mockResolvedValueOnce([
      {
        _id: new mongoose.Types.ObjectId(requestId),
        studentId: new mongoose.Types.ObjectId(studentId),
        value: 5,
        comment: 'Great',
        submittedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ] as never);
    mockRepository.findUsersByIds.mockResolvedValueOnce([
      { _id: new mongoose.Types.ObjectId(studentId), name: 'Luka', avatar: null },
    ] as never);

    const result = await getTeacherReviewsService(profileId);

    expect(result.data).toMatchObject({
      average: 5,
      count: 1,
      reviews: [{ value: 5, comment: 'Great', studentName: 'Luka' }],
    });
  });

  it('lists teacher requests with the student name and marks stale ones expired', async () => {
    mockRepository.findTeacherProfileByUserId.mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(profileId),
    } as never);
    mockRepository.findRequestsByTeacher.mockResolvedValueOnce([
      {
        _id: new mongoose.Types.ObjectId(requestId),
        studentId: new mongoose.Types.ObjectId(studentId),
        teacherProfileId: new mongoose.Types.ObjectId(profileId),
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 1000),
      },
    ] as never);
    mockRepository.findUsersByIds.mockResolvedValueOnce([
      { _id: new mongoose.Types.ObjectId(studentId), name: 'Luka', avatar: null },
    ] as never);

    const result = await listRatingRequestsService(teacherId, 'teacher');

    expect(result.data).toMatchObject([{ counterpartName: 'Luka', status: 'expired', counterpartId: studentId }]);
  });
});
