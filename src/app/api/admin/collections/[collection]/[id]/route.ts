import { NextRequest, NextResponse } from 'next/server';

import {
  deleteAdminDocumentService,
  getAdminDocumentService,
  updateAdminDocumentService,
} from '@/features/admin/service/admin.service';
import { AdminCollectionKeySchema, AdminDocumentBodySchema } from '@/features/admin/validations/admin.validation';
import { requireAdmin } from '@/shared/middleware/require-admin';
import { validateBody } from '@/shared/middleware/validate-body';

type Params = { params: Promise<{ collection: string; id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { collection, id } = await params;
    const key = AdminCollectionKeySchema.safeParse(collection);
    if (!key.success) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    const result = await getAdminDocumentService(key.data, id);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { collection, id } = await params;
    const key = AdminCollectionKeySchema.safeParse(collection);
    if (!key.success) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    const validated = await validateBody(req, AdminDocumentBodySchema);
    if (validated instanceof NextResponse) return validated;

    const result = await updateAdminDocumentService(key.data, id, validated.data, admin.userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { collection, id } = await params;
    const key = AdminCollectionKeySchema.safeParse(collection);
    if (!key.success) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    const result = await deleteAdminDocumentService(key.data, id, admin.userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
