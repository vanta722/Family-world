import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { createRewardAction, moderateTransactionAction } from './actions';

export default async function ParentPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('flw_parent_pin_ok')?.value !== '1') redirect('/parent/pin');

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: household } = await supabase
    .from('households').select('id, name').eq('parent_user_id', user.id).single();
  if (!household) redirect('/onboarding');

  const [{ data: profiles }, { data: attempts }, { data: pending }, { data: rewards }] = await Promise.all([
    supabase.from('profiles').select('*').eq('household_id', household.id),
    supabase
      .from('attempts')
      .select('id, is_correct, submitted_at, profiles(display_name), lessons(title), transactions(status)')
      .eq('household_id', household.id)
      .order('submitted_at', { ascending: false })
      .limit(10),
    supabase
      .from('transactions')
      .select('id, amount, type, reason, profiles(display_name), attempts(submitted_at)')
      .eq('household_id', household.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('rewards').select('*').eq('household_id', household.id).order('created_at', { ascending: false }),
  ]);

  const today        = new Date().toISOString().slice(0, 10);
  const todayAttempts = (attempts ?? []).filter((a) => (a.submitted_at || '').startsWith(today));
  const correctToday  = todayAttempts.filter((a) => a.is_correct).length;
  const pendingCount  = (pending ?? []).length;

  const stats = [
    { label: 'Attempts Today',   value: String(todayAttempts.length), icon: '⚔️',  accent: 'from-violet-600 to-violet-900', border: 'border-violet-500/30' },
    { label: 'Correct Today',    value: String(correctToday),         icon: '✅',  accent: 'from-emerald-600 to-emerald-900', border: 'border-emerald-500/30' },
    { label: 'Pending Approvals', value: String(pendingCount),         icon: '⏳',  accent: pendingCount > 0 ? 'from-amber-600 to-amber-900' : 'from-slate-600 to-slate-900', border: pendingCount > 0 ? 'border-amber-500/40' : 'border-slate-600/30' },
    { label: 'Heroes',           value: String((profiles ?? []).length), icon: '🧙‍♂️', accent: 'from-cyan-600 to-cyan-900', border: 'border-cyan-500/30' },
  ];

  return (
    <section className="space-y-6">

      {/* ── Royal Council Header ── */}
      <div
        className="relative overflow-hidden rounded-3xl px-7 py-8 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg,#1e1040 0%,#0d1f3c 50%,#1a0a2e 100%)',
          boxShadow: '0 0 60px rgba(183,148,244,0.15)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,#B794F4 0%,transparent 50%), radial-gradient(circle at 80% 50%,#06B6D4 0%,transparent 50%)' }} />
        {/* Decorative stars */}
        {[[8,20],[20,60],[40,15],[70,70],[85,25],[92,55]].map(([l,t],i) => (
          <div key={i} className="absolute h-1 w-1 rounded-full bg-white opacity-40"
               style={{ left:`${l}%`, top:`${t}%`, animation:`star-twinkle ${2+i*0.3}s ease-in-out ${i*0.2}s infinite` }} />
        ))}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-brand-lilac/70">
              ✦ {household.name} ✦
            </p>
            <h1 className="mt-1 text-4xl font-black text-white">
              👑 Royal Council
            </h1>
            <p className="text-sm text-violet-300/50">
              Approve tokens, manage rewards, monitor your heroes
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-violet-400/50 uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-bold text-violet-200">{user.email}</p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon, accent, border }) => (
          <div
            key={label}
            className={`relative overflow-hidden rounded-2xl border ${border} p-5 shadow-lg`}
            style={{ background: 'linear-gradient(135deg,#0d0820,#0a1830)' }}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-[0.08]`} />
            <p className="relative z-10 text-2xl mb-1">{icon}</p>
            <p className="relative z-10 text-3xl font-black text-white">{value}</p>
            <p className="relative z-10 mt-0.5 text-xs font-semibold uppercase tracking-wider text-violet-400/60">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Approval Queue ── */}
      <DarkPanel title="⏳ Approval Queue" subtitle="Review token earnings and reward redemptions">
        <div className="space-y-2">
          {pendingCount === 0 && (
            <div className="rounded-xl border border-violet-800/20 bg-violet-900/10 px-4 py-6 text-center">
              <p className="text-2xl mb-1">✨</p>
              <p className="text-sm text-violet-400/60">All caught up — no pending approvals.</p>
            </div>
          )}
          {(pending ?? []).map((row) => {
            const isRedeem = (row as { type?: string }).type === 'redeem';
            const kidName  = (row.profiles as { display_name?: string } | null)?.display_name ?? 'Hero';
            return (
              <div
                key={row.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition-all ${
                  isRedeem
                    ? 'border-amber-700/40 bg-amber-900/10'
                    : 'border-emerald-700/40 bg-emerald-900/10'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                      isRedeem ? 'bg-amber-800/50 text-amber-300' : 'bg-emerald-800/50 text-emerald-300'
                    }`}>
                      {isRedeem ? '🛒 Redeem' : '⭐ Earn'}
                    </span>
                    <span className="text-sm font-black text-white">{kidName}</span>
                  </div>
                  <p className={`text-sm truncate ${isRedeem ? 'text-amber-200/60' : 'text-emerald-200/60'}`}>
                    {isRedeem
                      ? `${row.reason} · costs ${Math.abs(row.amount)} ✨`
                      : `${row.reason} · +${row.amount} ✨`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={moderateTransactionAction}>
                    <input type="hidden" name="transactionId" value={row.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="rounded-xl border border-emerald-500/40 bg-emerald-700/30 px-4 py-2 text-sm font-black text-emerald-300 transition hover:bg-emerald-700/50 active:scale-95">
                      ✓ Approve
                    </button>
                  </form>
                  <form action={moderateTransactionAction}>
                    <input type="hidden" name="transactionId" value={row.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="rounded-xl border border-rose-500/40 bg-rose-800/30 px-4 py-2 text-sm font-black text-rose-300 transition hover:bg-rose-800/50 active:scale-95">
                      ✕ Reject
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </DarkPanel>

      {/* ── Heroes roster ── */}
      <DarkPanel title="🧙‍♂️ Heroes Roster" subtitle="All champions in your household">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(profiles ?? []).length === 0 && (
            <p className="text-sm text-violet-400/50 col-span-full">No heroes yet. Add profiles to get started.</p>
          )}
          {(profiles ?? []).map((profile) => (
            <div
              key={profile.id}
              className="flex items-center gap-3 rounded-xl border border-violet-700/30 bg-violet-900/10 p-3 transition hover:border-violet-600/50"
            >
              <Image
                src={`https://api.dicebear.com/9.x/${profile.avatar_style}/svg?seed=${encodeURIComponent(profile.avatar_seed)}`}
                alt={profile.display_name}
                width={44}
                height={44}
                className="rounded-full bg-violet-900/40 ring-1 ring-violet-700/40"
              />
              <div className="min-w-0">
                <p className="font-black text-white truncate">{profile.display_name}</p>
                <p className="text-xs text-violet-400/60">Age {profile.age} · {profile.grade_band}</p>
              </div>
            </div>
          ))}
        </div>
      </DarkPanel>

      {/* ── Rewards ── */}
      <DarkPanel title="🎁 Kingdom Rewards" subtitle="Create real-world rewards kids can redeem with tokens">
        <form action={createRewardAction} className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            name="title"
            placeholder="Reward name (e.g. Extra screen time)"
            required
            className="rounded-xl border border-violet-700/40 bg-violet-900/20 px-4 py-2.5 text-sm text-white placeholder-violet-500/50 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition"
          />
          <input
            name="tokenCost"
            type="number"
            min="1"
            placeholder="Token cost"
            required
            className="w-32 rounded-xl border border-violet-700/40 bg-violet-900/20 px-4 py-2.5 text-sm text-white placeholder-violet-500/50 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition"
          />
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-black text-white shadow transition hover:scale-[1.03] active:scale-95"
            style={{ background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }}
          >
            + Create
          </button>
        </form>

        {(rewards ?? []).length === 0 ? (
          <div className="rounded-xl border border-violet-800/20 bg-violet-900/10 px-4 py-6 text-center">
            <p className="text-2xl mb-1">🎁</p>
            <p className="text-sm text-violet-400/60">No rewards yet. Create one above — kids will see them in the Token Emporium!</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(rewards ?? []).map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-amber-700/25 bg-amber-900/10 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{reward.title}</p>
                  {reward.description && (
                    <p className="text-xs text-amber-300/50 truncate">{reward.description}</p>
                  )}
                </div>
                <span className="shrink-0 flex items-center gap-1 rounded-lg bg-amber-800/30 px-2.5 py-1 text-xs font-black text-amber-300">
                  {reward.token_cost} ✨
                </span>
              </div>
            ))}
          </div>
        )}
      </DarkPanel>

      {/* ── Recent Attempts ── */}
      <DarkPanel title="📜 Recent Battle Log" subtitle="Last 10 attempts across all heroes">
        {(attempts ?? []).length === 0 ? (
          <p className="text-sm text-violet-400/50">No attempts yet.</p>
        ) : (
          <div className="space-y-1.5">
            {(attempts ?? []).map((attempt) => {
              const kidName  = (attempt.profiles as { display_name?: string } | null)?.display_name ?? '—';
              const lesson   = (attempt.lessons  as { title?:        string } | null)?.title        ?? '—';
              const txStatus = ((attempt.transactions as { status?: string }[] | null)?.[0]?.status ?? 'n/a');
              const timeStr  = attempt.submitted_at
                ? new Date(attempt.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '—';
              return (
                <div
                  key={attempt.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-xl border border-violet-800/20 bg-violet-900/[0.06] px-4 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-white">{kidName}</span>
                    <span className="mx-1.5 text-violet-600">·</span>
                    <span className="text-violet-300/60 truncate">{lesson}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                    attempt.is_correct
                      ? 'bg-emerald-800/40 text-emerald-300'
                      : 'bg-red-900/40 text-red-300'
                  }`}>
                    {attempt.is_correct ? '✓ Hit' : '✕ Miss'}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    txStatus === 'approved' ? 'bg-emerald-900/40 text-emerald-400' :
                    txStatus === 'pending'  ? 'bg-amber-900/40 text-amber-400' :
                    txStatus === 'rejected' ? 'bg-red-900/40 text-red-400' :
                    'bg-violet-900/30 text-violet-500'
                  }`}>
                    {txStatus}
                  </span>
                  <span className="text-xs text-violet-500/60 tabular-nums">{timeStr}</span>
                </div>
              );
            })}
          </div>
        )}
      </DarkPanel>

      {/* ── Tutor logs placeholder ── */}
      <DarkPanel title="🤖 AI Tutor Logs" subtitle="Anthropic integration — coming soon">
        <div className="rounded-xl border border-violet-800/20 bg-violet-900/10 px-4 py-6 text-center">
          <p className="text-2xl mb-1">🤖</p>
          <p className="text-sm text-violet-400/50">
            AI tutor session logs will appear here once the Anthropic integration is live.
          </p>
        </div>
      </DarkPanel>

    </section>
  );
}

// ── Shared components ───────────────────────────────────────────────────────

function DarkPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-violet-800/30 p-5 shadow-xl"
      style={{ background: 'linear-gradient(135deg,#0d0820 0%,#0a1830 100%)' }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-black text-white">{title}</h2>
        {subtitle && <p className="text-xs text-violet-400/50 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
