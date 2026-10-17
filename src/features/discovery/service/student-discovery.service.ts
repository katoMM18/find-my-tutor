import { studentDiscoveryRepository } from '@/features/discovery/repository/student-discovery.repository';
import {
  StudentDiscoveryFilters,
  StudentDiscoveryResult,
} from '@/features/discovery/types/student-discovery.types';
import { ServiceResult } from '@/shared/types/common';

export async function listStudentsService(
  role: 'teacher' | 'student',
  filters: StudentDiscoveryFilters
): Promise<ServiceResult<StudentDiscoveryResult>> {
  if (role !== 'teacher') return { data: { error: 'FORBIDDEN' }, status: 403 };
  const result = await studentDiscoveryRepository.findMany(filters);
  return { data: { ...result, page: filters.page, limit: filters.limit }, status: 200 };
}
