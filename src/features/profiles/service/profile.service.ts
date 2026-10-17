import { profileRepository } from '@/features/profiles/repository/profile.repository';
import {
  StudentProfileInput,
  TeacherProfileInput,
} from '@/features/profiles/validations/profile.validation';
import { ServiceResult } from '@/shared/types/common';
import { normalizeSubjects } from '@/shared/utils/subjects';

export async function getMyProfileService(
  userId: string,
  role: 'teacher' | 'student'
): Promise<ServiceResult<object>> {
  const profile =
    role === 'teacher'
      ? await profileRepository.findTeacherByUserId(userId)
      : await profileRepository.findStudentByUserId(userId);

  if (profile) return { data: profile, status: 200 };

  return {
    data:
        role === 'teacher'
          ? {
            bio: '',
            subjects: [],
            experienceYears: 0,
            education: '',
            qualifications: '',
            certificates: [],
            licenses: [],
          }
          : { bio: '', subjects: [] },
    status: 200,
  };
}

export async function updateMyProfileService(
  userId: string,
  role: 'teacher' | 'student',
  input: TeacherProfileInput | StudentProfileInput
): Promise<ServiceResult<object>> {
  const normalized = { ...input, subjects: normalizeSubjects(input.subjects) };
  const profile =
    role === 'teacher'
      ? await profileRepository.upsertTeacher(userId, normalized as TeacherProfileInput)
      : await profileRepository.upsertStudent(userId, normalized as StudentProfileInput);

  return { data: profile, status: 200 };
}
