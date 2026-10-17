import mongoose from 'mongoose';

import { ratingRepository } from '@/features/ratings/repository/rating.repository';
import { RatingRequestDocument } from '@/features/ratings/schema/rating-request.schema';
import {
  PublicReview,
  RatingRequestView,
  TeacherRatingSummary,
  TeacherReviews,
} from '@/features/ratings/types/rating.types';
import {
  CreateRatingRequestInput,
  SubmitRatingInput,
} from '@/features/ratings/validations/rating.validation';
import { ServiceResult } from '@/shared/types/common';

const REQUEST_EXPIRY_DAYS = 14;
const REVIEWS_LIMIT = 20;

const isExpired = (expiresAt: Date) => expiresAt.getTime() <= Date.now();

export async function createRatingRequestService(
  studentId: string,
  role: 'teacher' | 'student',
  input: CreateRatingRequestInput
): Promise<ServiceResult<{ message: string }>> {
  if (role !== 'student') return { data: { error: 'FORBIDDEN' }, status: 403 };
  if (!mongoose.isValidObjectId(studentId)) {
    return { data: { error: 'UNAUTHORIZED' }, status: 401 };
  }
  const teacher = await ratingRepository.findTeacherProfileById(input.teacherProfileId);
  if (!teacher) return { data: { error: 'TEACHER_NOT_FOUND' }, status: 404 };

  const existing = await ratingRepository.findRequestByPair(
    studentId,
    input.teacherProfileId
  );
  const expiresAt = new Date(Date.now() + REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const reusable =
    existing &&
    (existing.status === 'expired' ||
      (existing.status !== 'submitted' && isExpired(existing.expiresAt)));
  if (existing && reusable) {
    await ratingRepository.updateRequest(existing._id.toString(), { status: 'pending', expiresAt });
    return { data: { message: 'Rating request sent' }, status: 201 };
  }
  if (existing) return { data: { error: 'REQUEST_ALREADY_EXISTS' }, status: 409 };

  await ratingRepository.createRequest({
    studentId: new mongoose.Types.ObjectId(studentId),
    teacherProfileId: new mongoose.Types.ObjectId(input.teacherProfileId),
    status: 'pending',
    expiresAt,
  });
  return { data: { message: 'Rating request sent' }, status: 201 };
}

export async function approveRatingRequestService(
  teacherId: string,
  role: 'teacher' | 'student',
  requestId: string
): Promise<ServiceResult<{ message: string }>> {
  if (role !== 'teacher') return { data: { error: 'FORBIDDEN' }, status: 403 };
  const request = await ratingRepository.findRequestById(requestId);
  if (!request) return { data: { error: 'NOT_FOUND' }, status: 404 };
  const teacher = await ratingRepository.findTeacherProfileById(
    request.teacherProfileId.toString()
  );
  if (!teacher || teacher.userId.toString() !== teacherId) {
    return { data: { error: 'FORBIDDEN' }, status: 403 };
  }
  if (request.status !== 'pending') {
    return { data: { error: 'REQUEST_NOT_PENDING' }, status: 409 };
  }
  if (isExpired(request.expiresAt)) {
    await ratingRepository.updateRequest(requestId, { status: 'expired' });
    return { data: { error: 'REQUEST_EXPIRED' }, status: 410 };
  }
  await ratingRepository.updateRequest(requestId, {
    status: 'approved',
    approvedAt: new Date(),
  });
  return { data: { message: 'Rating enabled' }, status: 200 };
}

export async function submitRatingService(
  studentId: string,
  role: 'teacher' | 'student',
  requestId: string,
  input: SubmitRatingInput
): Promise<ServiceResult<{ message: string }>> {
  if (role !== 'student') return { data: { error: 'FORBIDDEN' }, status: 403 };
  const request = await ratingRepository.findRequestById(requestId);
  if (!request) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (request.studentId.toString() !== studentId) {
    return { data: { error: 'FORBIDDEN' }, status: 403 };
  }
  if (request.status !== 'approved') {
    return { data: { error: 'RATING_NOT_ENABLED' }, status: 409 };
  }
  if (isExpired(request.expiresAt)) {
    await ratingRepository.updateRequest(requestId, { status: 'expired' });
    return { data: { error: 'REQUEST_EXPIRED' }, status: 410 };
  }
  await ratingRepository.createRating({
    requestId: request._id,
    studentId: request.studentId,
    teacherProfileId: request.teacherProfileId,
    value: input.value,
    comment: input.comment,
    submittedAt: new Date(),
  });
  await ratingRepository.updateRequest(requestId, {
    status: 'submitted',
    submittedAt: new Date(),
  });
  return { data: { message: 'Rating submitted' }, status: 201 };
}

export async function getTeacherRatingService(
  teacherProfileId: string
): Promise<ServiceResult<TeacherRatingSummary>> {
  const summary = await ratingRepository.aggregateTeacherRating(teacherProfileId);
  return { data: summary, status: 200 };
}

export async function getTeacherReviewsService(
  teacherProfileId: string
): Promise<ServiceResult<TeacherReviews>> {
  const [summary, ratings] = await Promise.all([
    ratingRepository.aggregateTeacherRating(teacherProfileId),
    ratingRepository.findRatingsByTeacher(teacherProfileId, REVIEWS_LIMIT),
  ]);
  const students = await ratingRepository.findUsersByIds(
    ratings.map((rating) => rating.studentId.toString())
  );
  const studentsById = new Map(students.map((student) => [student._id.toString(), student]));
  const reviews: PublicReview[] = ratings.map((rating) => {
    const student = studentsById.get(rating.studentId.toString());
    return {
      id: rating._id.toString(),
      value: rating.value,
      comment: rating.comment ?? '',
      submittedAt: rating.submittedAt.toISOString(),
      studentName: student?.name ?? 'Student',
      studentAvatar: student?.avatar ?? null,
    };
  });
  return { data: { ...summary, reviews }, status: 200 };
}

const resolveTeacherUsers = async (requests: RatingRequestDocument[]) => {
  const profiles = await ratingRepository.findTeacherProfilesByIds(
    requests.map((request) => request.teacherProfileId.toString())
  );
  return new Map(profiles.map((profile) => [profile._id.toString(), profile.userId.toString()]));
};

export async function listRatingRequestsService(
  userId: string,
  role: 'teacher' | 'student'
): Promise<ServiceResult<RatingRequestView[]>> {
  if (!mongoose.isValidObjectId(userId)) {
    return { data: { error: 'UNAUTHORIZED' }, status: 401 };
  }
  const profile = role === 'teacher' ? await ratingRepository.findTeacherProfileByUserId(userId) : null;
  if (role === 'teacher' && !profile) return { data: [], status: 200 };

  const requests = profile
    ? await ratingRepository.findRequestsByTeacher(profile._id.toString())
    : await ratingRepository.findRequestsByStudent(userId);
  const teacherUsers = role === 'student' ? await resolveTeacherUsers(requests) : new Map<string, string>();
  const counterpartIds = requests.map((request) =>
    role === 'teacher'
      ? request.studentId.toString()
      : teacherUsers.get(request.teacherProfileId.toString()) ?? ''
  );
  const users = await ratingRepository.findUsersByIds(counterpartIds.filter(Boolean));
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  const data: RatingRequestView[] = requests.map((request, index) => {
    const expired = request.status !== 'submitted' && isExpired(request.expiresAt);
    const counterpart = usersById.get(counterpartIds[index]);
    return {
      id: request._id.toString(),
      status: expired ? 'expired' : request.status,
      teacherProfileId: request.teacherProfileId.toString(),
      counterpartId: counterpartIds[index],
      counterpartName: counterpart?.name ?? (role === 'teacher' ? 'Student' : 'Teacher'),
      counterpartAvatar: counterpart?.avatar ?? null,
      createdAt: request.createdAt.toISOString(),
      expiresAt: request.expiresAt.toISOString(),
    };
  });
  return { data, status: 200 };
}
