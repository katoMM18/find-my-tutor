import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/profiles/repository/profile.repository', () => ({
  profileRepository: {
    findTeacherByUserId: vi.fn(),
    findStudentByUserId: vi.fn(),
    upsertTeacher: vi.fn(),
    upsertStudent: vi.fn(),
  },
}));

import { profileRepository } from '@/features/profiles/repository/profile.repository';

import { getMyProfileService, updateMyProfileService } from './profile.service';

const mockRepository = vi.mocked(profileRepository);

describe('profile service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns complete teacher defaults when none exists', async () => {
    mockRepository.findTeacherByUserId.mockResolvedValueOnce(null);

    const result = await getMyProfileService('teacher-id', 'teacher');

    expect(result).toEqual({
      data: {
        bio: '',
        subjects: [],
        experienceYears: 0,
        education: '',
        qualifications: '',
        certificates: [],
        licenses: [],
      },
      status: 200,
    });
  });

  it('reads the student profile through the student repository', async () => {
    const profile = { userId: 'student-id', bio: 'Learning', subjects: ['Math'] };
    mockRepository.findStudentByUserId.mockResolvedValueOnce(profile as never);

    const result = await getMyProfileService('student-id', 'student');

    expect(mockRepository.findStudentByUserId).toHaveBeenCalledWith('student-id');
    expect(result.data).toEqual(profile);
  });

  it('updates a teacher profile through the teacher repository', async () => {
    const input = {
      bio: 'Teacher',
      subjects: ['English'],
      experienceYears: 5,
      education: 'University',
      qualifications: '',
      certificates: [],
      licenses: [],
    };
    mockRepository.upsertTeacher.mockResolvedValueOnce({ ...input, userId: 'teacher-id' } as never);

    const result = await updateMyProfileService('teacher-id', 'teacher', input);

    expect(mockRepository.upsertTeacher).toHaveBeenCalledWith('teacher-id', input);
    expect(result.status).toBe(200);
  });
});
