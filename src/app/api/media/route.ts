import { NextRequest, NextResponse } from 'next/server';

import { listMediaService, uploadMediaService } from '@/features/media/service/media.service';
import { submitVerificationService } from '@/features/verification/service/tutor-verification.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string; role?: 'teacher' | 'student' };

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
    // A tutor's diploma or certificate goes straight into the admin review queue.
    if (kind === 'qualification' && 'media' in result.data && (session?.user as SessionUser | undefined)?.role === 'teacher') {
      await submitVerificationService(userId, result.data.media._id.toString());
    }
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
