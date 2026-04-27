'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { getActiveProfileId } from '@/lib/auth/active-profile';
import { getApprovedTokenBalance } from '@/lib/tokens/balance';

export async function redeemRewardAction(formData: FormData) {
  const rewardId  = String(formData.get('rewardId') || '');
  const tokenCost = Number(formData.get('tokenCost') || 0);
  const title     = String(formData.get('title') || '');

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !rewardId) return { error: 'Unauthorized' };

  const profileId = await getActiveProfileId();
  if (!profileId) return { error: 'No active profile' };

  const { data: household } = await supabase
    .from('households').select('id').eq('parent_user_id', user.id).single();
  if (!household) return { error: 'No household' };

  // Guard: enough tokens?
  const balance = await getApprovedTokenBalance(profileId);
  if (balance < tokenCost) return { error: 'Not enough tokens' };

  // Check reward belongs to this household and is active
  const { data: reward } = await supabase
    .from('rewards')
    .select('id')
    .eq('id', rewardId)
    .eq('household_id', household.id)
    .eq('is_active', true)
    .single();
  if (!reward) return { error: 'Reward not found' };

  // Create a pending redemption transaction (negative amount = debit on approval)
  await supabase.from('transactions').insert({
    household_id: household.id,
    profile_id:   profileId,
    amount:       -tokenCost,
    type:         'redeem',
    reason:       `Reward: ${title}`,
    status:       'pending',
  });

  revalidatePath('/shop');
  revalidatePath('/world');
  return { success: true };
}
