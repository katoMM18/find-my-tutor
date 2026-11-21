import { NextRequest, NextResponse } from 'next/server';

import { createAdminDocumentService, listAdminDocumentsService } from '@/features/admin/service/admin.service';
import { AdminCollectionKeySchema, AdminDocumentBodySchema, AdminListQuerySchema } from '@/features/admin/validations/admin.validation';
import { requireAdmin } from '@/shared/middleware/require-admin';
import { validateBody } from '@/shared/middleware/validate-body';

type Params = { params: Promise<{ collection: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const collection = AdminCollectionKeySchema.safeParse((await params).collection);
    if (!collection.success) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    const query = AdminListQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!query.success) return NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 });

    const result = await listAdminDocumentsService(collection.data, query.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const collection = AdminCollectionKeySchema.safeParse((await params).collection);
    if (!collection.success) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    const validated = await validateBody(req, AdminDocumentBodySchema);
    if (validated instanceof NextResponse) return validated;

    const result = await createAdminDocumentService(collection.data, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
