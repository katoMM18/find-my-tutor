import { NextRequest, NextResponse } from 'next/server';

import { syncVipWebhookService } from '@/features/vip/service/vip.service';
import { dodo } from '@/shared/lib/dodo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const event = dodo.client.webhooks.unwrap(body, {
      headers,
      key: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    });

    if (event.type.startsWith('subscription.')) {
      await syncVipWebhookService(event);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'INVALID_WEBHOOK' }, { status: 400 });
  }
}
