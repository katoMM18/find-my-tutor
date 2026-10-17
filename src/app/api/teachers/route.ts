import { NextRequest, NextResponse } from 'next/server';

import { listTeachersService } from '@/features/discovery/service/teacher-discovery.service';
import { TeacherDiscoveryFilters } from '@/features/discovery/types/teacher-discovery.types';
import { TEACHER_SORTS, type TeacherSort } from '@/shared/const/subjects.const';

const MAX_LIMIT = 24;

const toPositiveNumber = (value: string | null) => {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const page = Math.max(Number(params.get('page')) || 1, 1);
    const limit = Math.min(Math.max(Number(params.get('limit')) || 12, 1), MAX_LIMIT);
    const sort = params.get('sort');
    const filters: TeacherDiscoveryFilters = {
      search: params.get('search') || undefined,
      subject: params.get('subject') || undefined,
      minExperience: toPositiveNumber(params.get('minExperience')),
      minRating: toPositiveNumber(params.get('minRating')),
      sort: TEACHER_SORTS.includes(sort as TeacherSort) ? (sort as TeacherSort) : 'recommended',
      page,
      limit,
    };
    const result = await listTeachersService(filters);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
