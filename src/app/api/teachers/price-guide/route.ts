import { NextRequest, NextResponse } from 'next/server';

import { getPriceGuideService } from '@/features/discovery/service/teacher-discovery.service';
import { PriceGuideQuerySchema } from '@/features/discovery/validations/match.validation';

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const query = PriceGuideQuerySchema.safeParse({
      subject: params.get('subject') ?? '',
      area: params.get('area') || undefined,
    });
    if (!query.success) return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
    const result = await getPriceGuideService(query.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
