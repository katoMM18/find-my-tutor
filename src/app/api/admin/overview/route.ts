import { NextResponse } from 'next/server';

import { getAdminOverviewService } from '@/features/admin/service/admin.service';
import { requireAdmin } from '@/shared/middleware/require-admin';

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;
    const result = await getAdminOverviewService();
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
