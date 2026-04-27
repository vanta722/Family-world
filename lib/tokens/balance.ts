import { createServerSupabase } from '@/lib/supabase/server';

export async function getApprovedTokenBalance(profileId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('profile_id', profileId)
    .eq('status', 'approved');

  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + row.amount, 0);
}
