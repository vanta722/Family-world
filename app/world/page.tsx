import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { getActiveProfileId } from '@/lib/auth/active-profile';
import { getApprovedTokenBalance } from '@/lib/tokens/balance';
import { WorldScene } from '@/components/game/world-scene';

export default async function WorldPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const activeProfileId = await getActiveProfileId();
  if (!activeProfileId) redirect('/family');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', activeProfileId).single();
  if (!profile) redirect('/family');

  const { data: household } = await supabase
    .from('households').select('id, name').eq('parent_user_id', user.id).single();
  if (!household) redirect('/onboarding');

  // ── Parallel data fetches ──
  const today = new Date().toISOString().slice(0, 10);

  const [tokenBalance, { data: allProfiles }, { data: todayAttempts }, { data: allTokens }] = await Promise.all([
    getApprovedTokenBalance(profile.id),
    supabase.from('profiles').select('id, display_name').eq('household_id', household.id),
    supabase.from('attempts')
      .select('is_correct')
      .eq('profile_id', profile.id)
      .gte('submitted_at', today + 'T00:00:00')
      .lte('submitted_at', today + 'T23:59:59'),
    // For leaderboard: fetch approved transactions for all profiles in household
    supabase.from('transactions')
      .select('profile_id, amount')
      .eq('household_id', household.id)
      .eq('status', 'approved'),
  ]);

  const correctToday = (todayAttempts ?? []).filter((a) => a.is_correct).length;
  const totalToday   = (todayAttempts ?? []).length;
  const questGoal    = 5;
  const questDone    = Math.min(correctToday, questGoal);
  const questPct     = Math.round((questDone / questGoal) * 100);

  // Build leaderboard from all transactions
  const balanceMap: Record<string, number> = {};
  for (const tx of allTokens ?? []) {
    balanceMap[tx.profile_id] = (balanceMap[tx.profile_id] ?? 0) + tx.amount;
  }
  const leaderboard = (allProfiles ?? [])
    .map((p) => ({ name: p.display_name, tokens: balanceMap[p.id] ?? 0, isMe: p.id === profile.id }))
    .sort((a, b) => b.tokens - a.tokens);

  return (
    <div className="space-y-4">
      {/* ── Page header ── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-violet-800/30 px-6 py-5 shadow-xl"
        style={{ background: 'linear-gradient(135deg,#0f0a1e,#0d1f3c)' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,#7C3AED 0%,transparent 50%), radial-gradient(circle at 80% 50%,#06B6D4 0%,transparent 50%)' }} />
        <p className="relative z-10 text-xs font-black uppercase tracking-widest text-brand-neon/70">
          Crystal Kingdom — Free Roam
        </p>
        <h1 className="relative z-10 text-3xl font-black text-white">
          Welcome back, <span className="text-brand-plasma">{profile.display_name}</span>!
        </h1>
        <p className="relative z-10 text-sm text-violet-300/60">
          Explore the kingdom. Visit zones to learn, earn tokens, and spend them on real rewards.
        </p>
      </div>

      {/* ── Main layout: map + sidebar ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Phaser world */}
        <WorldScene playerName={profile.display_name} tokenBalance={tokenBalance} />

        {/* Sidebar */}
        <div className="space-y-4">

          {/* ── Daily Quest ── */}
          <div
            className="rounded-2xl border border-emerald-800/40 p-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#052e16,#0a2a1e)' }}
          >
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-emerald-400/70">
              📋 Daily Quest
            </p>
            <p className="text-base font-black text-white">Crystal Gauntlet</p>
            <p className="mb-3 text-xs text-emerald-300/60">Solve {questGoal} math riddles correctly</p>

            <div className="mb-1 flex justify-between text-xs text-emerald-400/70">
              <span>{questDone} / {questGoal} done</span>
              <span>{questPct}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-emerald-900/60">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${questPct}%`, background: 'linear-gradient(90deg,#059669,#34d399)' }}
              />
            </div>

            {questDone >= questGoal ? (
              <p className="mt-3 text-center text-sm font-black text-emerald-300">
                🏆 Quest Complete! Claim your glory!
              </p>
            ) : (
              <div className="mt-3 space-y-1 text-xs text-emerald-400/60">
                <p>✅ {totalToday} attempts today &nbsp;•&nbsp; {correctToday} correct</p>
                <p>🎯 {questGoal - questDone} more correct answers to finish</p>
              </div>
            )}

            <a
              href="/play"
              className="mt-3 block rounded-xl py-2.5 text-center text-sm font-black text-white shadow-md transition hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(90deg,#059669,#06b6d4)' }}
            >
              ⚔️ Go Battle Now
            </a>
          </div>

          {/* ── Family Leaderboard ── */}
          <div
            className="rounded-2xl border border-brand-gold/20 p-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#1c0e00,#1a1400)' }}
          >
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-brand-gold/70">
              🏆 Kingdom Leaderboard
            </p>
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all ${
                    entry.isMe
                      ? 'border border-brand-gold/40 bg-brand-gold/10'
                      : 'border border-transparent bg-white/[0.03]'
                  }`}
                >
                  <span className="text-base">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'}
                  </span>
                  <span className={`flex-1 text-sm font-bold truncate ${entry.isMe ? 'text-brand-gold' : 'text-white/80'}`}>
                    {entry.name}
                    {entry.isMe && <span className="ml-1 text-xs text-brand-gold/60">(you)</span>}
                  </span>
                  <span className="text-sm font-black text-brand-gold">{entry.tokens}</span>
                  <span className="text-xs text-brand-gold/50">✨</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick links ── */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '⚔️ Battle',     href: '/play',   from: '#7C3AED', to: '#06B6D4' },
              { label: '🏪 Shop',       href: '/shop',   from: '#D97706', to: '#F59E0B' },
              { label: '🧑‍🤝‍🧑 Heroes', href: '/family', from: '#0891B2', to: '#06B6D4' },
              { label: '✨ Tokens',     href: '/shop',   from: '#059669', to: '#34D399' },
            ].map(({ label, href, from, to }) => (
              <a
                key={label}
                href={href}
                className="rounded-xl py-3 text-center text-xs font-black text-white shadow transition hover:scale-[1.04] hover:shadow-md active:scale-95"
                style={{ background: `linear-gradient(135deg,${from},${to})` }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
