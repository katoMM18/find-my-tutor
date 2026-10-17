import { NextRequest, NextResponse } from 'next/server';

import { listMediaService, uploadMediaService } from '@/features/media/service/media.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const result = await listMediaService(userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const formData = await req.formData();
    const kind = formData.get('kind');
    const file = formData.get('file');
    if (
      (kind !== 'profile_image' && kind !== 'qualification') ||
      !(file instanceof File)
    ) {
      return NextResponse.json({ error: 'INVALID_UPLOAD' }, { status: 400 });
    }
    const result = await uploadMediaService(userId, { kind, file });
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
