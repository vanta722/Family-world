import { z } from 'zod';

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
});

const privateSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PARENT_PIN_HASH_SECRET: z.string().min(1),
  AGENT_HMAC_SECRET: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  APP_BASE_URL: z.string().url()
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

export const privateEnv = privateSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PARENT_PIN_HASH_SECRET: process.env.PARENT_PIN_HASH_SECRET,
  AGENT_HMAC_SECRET: process.env.AGENT_HMAC_SECRET,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  APP_BASE_URL: process.env.APP_BASE_URL
});
