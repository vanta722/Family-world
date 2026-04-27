import crypto from 'crypto';
import { privateEnv } from '@/lib/supabase/env';

export function verifyAgentHmac(payload: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', privateEnv.AGENT_HMAC_SECRET).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
