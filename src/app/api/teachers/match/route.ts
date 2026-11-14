import { NextRequest, NextResponse } from 'next/server';

import { matchTutorsService } from '@/features/discovery/service/teacher-discovery.service';
import { MatchSchema } from '@/features/discovery/validations/match.validation';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, MatchSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await matchTutorsService(validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
