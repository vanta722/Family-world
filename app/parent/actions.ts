'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';

export async function moderateTransactionAction(formData: FormData) {
  const transactionId = String(formData.get('transactionId') || '');
  const status = String(formData.get('status') || '');
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !transactionId || !['approved', 'rejected'].includes(status)) return;

  await supabase
    .from('transactions')
    .update({ status, approved_at: new Date().toISOString(), approved_by: user.id })
    .eq('id', transactionId);

  revalidatePath('/parent');
}

export async function createRewardAction(formData: FormData) {
  const title = String(formData.get('title') || '');
  const tokenCost = Number(formData.get('tokenCost') || 0);
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user || !title) return;

  const { data: household } = await supabase.from('households').select('id').eq('parent_user_id', user.id).single();
  if (!household) return;

  await supabase.from('rewards').insert({ household_id: household.id, title, token_cost: tokenCost });
  revalidatePath('/parent');
}
