'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { privateEnv } from '@/lib/supabase/env';
import { verifyParentPin } from '@/lib/auth/pin';

export async function verifyParentPinAction(formData: FormData) {
  const pin = String(formData.get('pin') || '');
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: household } = await supabase
    .from('households')
    .select('parent_pin_hash')
    .eq('parent_user_id', user.id)
    .single();

  if (!household) redirect('/onboarding');

  const ok = verifyParentPin(pin, household.parent_pin_hash, privateEnv.PARENT_PIN_HASH_SECRET);
  if (!ok) return;

  const cookieStore = await cookies();
  cookieStore.set('flw_parent_pin_ok', '1', { httpOnly: true, secure: true, sameSite: 'lax', path: '/parent' });
  redirect('/parent');
}
