import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/availability/repository/availability.repository', () => ({
  availabilityRepository: {
    findByUserId: vi.fn(),
    upsertByUserId: vi.fn(),
    findByTeacherProfileId: vi.fn(),
  },
}));

import { availabilityRepository } from '@/features/availability/repository/availability.repository';

import {
  getMyAvailabilityService,
  getTeacherAvailabilityService,
  updateMyAvailabilityService,
} from './availability.service';

const mockRepository = vi.mocked(availabilityRepository);
const input = {
  timezone: 'Europe/Tbilisi',
  weekly: [{ day: 1, intervals: [{ start: '09:00', end: '12:00' }] }],
  exceptions: [],
};

describe('availability service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects student availability updates', async () => {
    const result = await updateMyAvailabilityService('student-id', 'student', input);

    expect(result).toEqual({ data: { error: 'FORBIDDEN' }, status: 403 });
    expect(mockRepository.upsertByUserId).not.toHaveBeenCalled();
  });

  it('reads teacher availability through the owner repository path', async () => {
    mockRepository.findByUserId.mockResolvedValueOnce({
      ...input,
      _id: { toString: () => 'availability-id' },
    } as never);

    const result = await getMyAvailabilityService('teacher-id', 'teacher');

    expect(mockRepository.findByUserId).toHaveBeenCalledWith('teacher-id');
    expect(result.data).toMatchObject(input);
  });

  it('returns public availability by teacher profile id', async () => {
    mockRepository.findByTeacherProfileId.mockResolvedValueOnce({
      ...input,
      _id: { toString: () => 'availability-id' },
    } as never);

    const result = await getTeacherAvailabilityService('profile-id');

    expect(result).toMatchObject({ status: 200, data: input });
  });
});
