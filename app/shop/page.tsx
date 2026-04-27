import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { getActiveProfileId } from '@/lib/auth/active-profile';
import { getApprovedTokenBalance } from '@/lib/tokens/balance';
import { redeemRewardAction } from './actions';

export default async function ShopPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const activeProfileId = await getActiveProfileId();
  if (!activeProfileId) redirect('/family');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', activeProfileId).single();
  if (!profile) redirect('/family');

  const { data: household } = await supabase
    .from('households').select('id').eq('parent_user_id', user.id).single();
  if (!household) redirect('/onboarding');

  const [tokenBalance, { data: rewards }, { data: pendingRedemptions }] = await Promise.all([
    getApprovedTokenBalance(profile.id),
    supabase.from('rewards')
      .select('*')
      .eq('household_id', household.id)
      .eq('is_active', true)
      .order('token_cost'),
    supabase.from('transactions')
      .select('reason, created_at')
      .eq('profile_id', profile.id)
      .eq('type', 'redeem')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ]);

  const shopItems = rewards ?? [];

  return (
    <div className="space-y-6">
      {/* ── Header banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl px-7 py-8 shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#1c0e00 0%,#431407 50%,#1c0e00 100%)',
                 boxShadow: '0 0 60px rgba(251,191,36,0.15)' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10"
             style={{ backgroundImage: 'radial-gradient(circle at 50% 50%,#fbbf24,transparent 60%)' }} />
        <p className="relative z-10 text-xs font-black uppercase tracking-[0.4em] text-brand-gold/70">
          ✦ Royal Exchange ✦
        </p>
        <h1 className="relative z-10 mt-1 text-4xl font-black text-white">Token Emporium</h1>
        <p className="relative z-10 text-sm text-amber-200/60">
          Trade your hard-earned tokens for real-world rewards. Parent approves every redemption.
        </p>

        {/* Balance pill */}
        <div
          className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-gold/50 px-4 py-2"
          style={{ background: 'rgba(251,191,36,0.12)' }}
        >
          <span className="text-2xl">✨</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-brand-gold/60">Your Balance</p>
            <p className="text-2xl font-black leading-none text-brand-gold">{tokenBalance}</p>
          </div>
          <span className="text-sm text-brand-gold/50">tokens</span>
        </div>
      </div>

      {/* ── Pending redemptions ── */}
      {(pendingRedemptions ?? []).length > 0 && (
        <div className="rounded-2xl border border-amber-700/30 bg-amber-900/10 p-4">
          <p className="mb-2 text-sm font-black text-amber-300">⏳ Awaiting Parent Approval</p>
          <div className="space-y-1.5">
            {pendingRedemptions!.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-amber-900/20 px-3 py-2">
                <span className="text-xs text-amber-200/80">{r.reason.replace('Reward: ', '')}</span>
                <span className="rounded-full bg-amber-700/40 px-2 py-0.5 text-xs font-bold text-amber-300">pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Reward grid ── */}
      {shopItems.length === 0 ? (
        <div
          className="rounded-2xl border border-violet-800/30 p-10 text-center"
          style={{ background: 'linear-gradient(135deg,#0d0820,#0a1830)' }}
        >
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-lg font-black text-white">Shop is empty!</p>
          <p className="text-sm text-violet-300/50 mt-1">Ask a parent to add rewards in the Parent Dashboard.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shopItems.map((reward) => {
            const canAfford = tokenBalance >= reward.token_cost;
            return (
              <div
                key={reward.id}
                className={`group relative overflow-hidden rounded-2xl border p-5 shadow-xl transition-all duration-300 ${
                  canAfford
                    ? 'border-brand-gold/40 hover:border-brand-gold/70 hover:shadow-brand-gold/10 hover:-translate-y-1'
                    : 'border-violet-800/20 opacity-70'
                }`}
                style={{ background: canAfford
                  ? 'linear-gradient(135deg,#1c0e00,#2d1700)'
                  : 'linear-gradient(135deg,#0d0820,#0a1830)' }}
              >
                {/* Glow on affordable items */}
                {canAfford && (
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                       style={{ background: 'radial-gradient(circle at 50% 0%,rgba(251,191,36,0.12),transparent 60%)' }} />
                )}

                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base font-black text-white leading-tight">{reward.title}</p>
                    <div className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1 ${
                      canAfford ? 'bg-brand-gold/20 text-brand-gold' : 'bg-violet-900/40 text-violet-400'
                    }`}>
                      <span className="text-sm">✨</span>
                      <span className="text-sm font-black">{reward.token_cost}</span>
                    </div>
                  </div>

                  {reward.description && (
                    <p className="text-xs text-amber-200/50 leading-relaxed">{reward.description}</p>
                  )}

                  <form action={redeemRewardAction}>
                    <input type="hidden" name="rewardId"  value={reward.id} />
                    <input type="hidden" name="tokenCost" value={reward.token_cost} />
                    <input type="hidden" name="title"     value={reward.title} />
                    <button
                      type="submit"
                      disabled={!canAfford}
                      className="w-full rounded-xl py-2.5 text-sm font-black text-white shadow transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      style={canAfford ? { background: 'linear-gradient(90deg,#b45309,#d97706)' } : { background: '#374151' }}
                    >
                      {canAfford ? '🛒 Redeem for Approval' : `🔒 Need ${reward.token_cost - tokenBalance} more ✨`}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Earn more CTA ── */}
      <div
        className="flex items-center justify-between rounded-2xl border border-violet-700/30 px-5 py-4"
        style={{ background: 'linear-gradient(135deg,#0d0820,#0a1830)' }}
      >
        <div>
          <p className="text-sm font-black text-white">Need more tokens?</p>
          <p className="text-xs text-violet-300/50">Complete math quests in the Crystal Kingdom!</p>
        </div>
        <a
          href="/play"
          className="rounded-xl px-5 py-2.5 text-sm font-black text-white shadow transition hover:scale-105"
          style={{ background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }}
        >
          ⚔️ Battle Now
        </a>
      </div>
    </div>
  );
}
