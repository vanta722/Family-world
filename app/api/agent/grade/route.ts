import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentHmac } from '@/lib/agent/hmac';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const ok = verifyAgentHmac(body, request.headers.get('x-agent-signature'));
  if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  // TODO: VPS grading worker writes AI feedback + model metadata.
  return NextResponse.json({ ok: true, message: 'Grade endpoint placeholder' });
}
