import { teacherDiscoveryRepository } from '@/features/discovery/repository/teacher-discovery.repository';
import {
  PublicTeacher,
  TeacherDiscoveryFilters,
  TeacherDiscoveryResult,
} from '@/features/discovery/types/teacher-discovery.types';
import { ServiceResult } from '@/shared/types/common';
import { subjectFilterValue } from '@/shared/utils/subjects';

export async function listTeachersService(
  filters: TeacherDiscoveryFilters
): Promise<ServiceResult<TeacherDiscoveryResult>> {
  const subject = typeof filters.subject === 'string' ? subjectFilterValue(filters.subject) : filters.subject;
  const result = await teacherDiscoveryRepository.findMany({ ...filters, subject });
  return {
    data: { ...result, page: filters.page, limit: filters.limit },
    status: 200,
  };
}

export async function getTeacherService(
  id: string
): Promise<ServiceResult<PublicTeacher>> {
  const teacher = await teacherDiscoveryRepository.findById(id);
  if (!teacher) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: teacher, status: 200 };
}
