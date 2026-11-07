import { studentDiscoveryRepository } from '@/features/discovery/repository/student-discovery.repository';
import {
  StudentDiscoveryFilters,
  StudentDiscoveryResult,
} from '@/features/discovery/types/student-discovery.types';
import { ServiceResult } from '@/shared/types/common';
import { subjectFilterValue } from '@/shared/utils/subjects';

export async function listStudentsService(
  role: 'teacher' | 'student',
  filters: StudentDiscoveryFilters
): Promise<ServiceResult<StudentDiscoveryResult>> {
  if (role !== 'teacher') return { data: { error: 'FORBIDDEN' }, status: 403 };
  const subject = typeof filters.subject === 'string' ? subjectFilterValue(filters.subject) : filters.subject;
  const result = await studentDiscoveryRepository.findMany({ ...filters, subject });
  return { data: { ...result, page: filters.page, limit: filters.limit }, status: 200 };
}
