import { NextRequest, NextResponse } from 'next/server';
import { verifyAgentHmac } from '@/lib/agent/hmac';

export async function GET(request: NextRequest) {
  const signature = request.headers.get('x-agent-signature');
  const pathWithQuery = request.nextUrl.pathname + request.nextUrl.search;
  const ok = verifyAgentHmac(pathWithQuery, signature);
  if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  // TODO: Return computed struggling skills for proactive lesson generation.
  return NextResponse.json({ ok: true, household_id: request.nextUrl.searchParams.get('household_id'), skills: [] });
}
