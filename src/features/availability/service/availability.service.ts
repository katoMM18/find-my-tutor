import { availabilityRepository } from '@/features/availability/repository/availability.repository';
import { PublicAvailability } from '@/features/availability/types/availability.types';
import { AvailabilityInput } from '@/features/availability/validations/availability.validation';
import { ServiceResult } from '@/shared/types/common';

const toPublicAvailability = (availability: {
  timezone: string;
  weekly: PublicAvailability['weekly'];
  exceptions: PublicAvailability['exceptions'];
}): PublicAvailability => ({
  timezone: availability.timezone,
  weekly: availability.weekly,
  exceptions: availability.exceptions,
});

export async function getMyAvailabilityService(
  userId: string,
  role: 'teacher' | 'student'
): Promise<ServiceResult<PublicAvailability | object>> {
  if (role !== 'teacher') return { data: { error: 'FORBIDDEN' }, status: 403 };
  const availability = await availabilityRepository.findByUserId(userId);
  return {
    data: availability ? toPublicAvailability(availability) : {},
    status: 200,
  };
}

export async function updateMyAvailabilityService(
  userId: string,
  role: 'teacher' | 'student',
  input: AvailabilityInput
): Promise<ServiceResult<PublicAvailability>> {
  if (role !== 'teacher') return { data: { error: 'FORBIDDEN' }, status: 403 };
  const availability = await availabilityRepository.upsertByUserId(userId, input);
  return { data: toPublicAvailability(availability), status: 200 };
}

export async function getTeacherAvailabilityService(
  teacherProfileId: string
): Promise<ServiceResult<PublicAvailability | object>> {
  const availability = await availabilityRepository.findByTeacherProfileId(teacherProfileId);
  return {
    data: availability ? toPublicAvailability(availability) : {},
    status: 200,
  };
}
