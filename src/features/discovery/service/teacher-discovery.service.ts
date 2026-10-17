import { teacherDiscoveryRepository } from '@/features/discovery/repository/teacher-discovery.repository';
import {
  PublicTeacher,
  TeacherDiscoveryFilters,
  TeacherDiscoveryResult,
} from '@/features/discovery/types/teacher-discovery.types';
import { ServiceResult } from '@/shared/types/common';

export async function listTeachersService(
  filters: TeacherDiscoveryFilters
): Promise<ServiceResult<TeacherDiscoveryResult>> {
  const result = await teacherDiscoveryRepository.findMany(filters);
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
