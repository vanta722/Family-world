import { createClient } from '@supabase/supabase-js';
import { privateEnv, publicEnv } from './env';

export const supabaseService = createClient(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL,
  privateEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
