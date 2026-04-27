import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { createRewardAction, moderateTransactionAction } from './actions';

export default async function ParentPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('flw_parent_pin_ok')?.value !== '1') redirect('/parent/pin');

  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: household } = await supabase.from('households').select('id, name').eq('parent_user_id', user.id).single();
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
    supabase.from('rewards').select('*').eq('household_id', household.id).order('created_at', { ascending: false })
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const todayAttempts = (attempts ?? []).filter((a) => (a.submitted_at || '').startsWith(today));
  const correctToday = todayAttempts.filter((a) => a.is_correct).length;

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-navy">Parent Dashboard</h1>

      <div className="grid gap-3 md:grid-cols-4">
        <Card label="Attempts Today" value={String(todayAttempts.length)} />
        <Card label="Correct Today" value={String(correctToday)} />
        <Card label="Pending Approvals" value={String((pending ?? []).length)} />
        <Card label="Profiles" value={String((profiles ?? []).length)} />
      </div>

      <Panel title="Profiles">
        <ul className="grid gap-2 md:grid-cols-3">
          {(profiles ?? []).map((profile) => (
            <li key={profile.id} className="rounded border p-3">
              <p className="font-semibold">{profile.display_name}</p>
              <p className="text-sm text-slate-600">Age {profile.age}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Attempts">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Kid</th><th>Lesson</th><th>Correct</th><th>Time</th><th>Approval</th>
              </tr>
            </thead>
            <tbody>
              {(attempts ?? []).map((attempt) => (
                <tr key={attempt.id} className="border-t">
                  <td>{(attempt.profiles as { display_name?: string } | null)?.display_name ?? '-'}</td>
                  <td>{(attempt.lessons as { title?: string } | null)?.title ?? '-'}</td>
                  <td>{attempt.is_correct ? 'Yes' : 'No'}</td>
                  <td>{attempt.submitted_at ?? '-'}</td>
                  <td>{((attempt.transactions as { status?: string }[] | null)?.[0]?.status ?? 'n/a').toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Approval Queue">
        <div className="space-y-2">
          {(pending ?? []).length === 0 && (
            <p className="text-sm text-slate-500">No pending approvals.</p>
          )}
          {(pending ?? []).map((row) => {
            const isRedeem = (row as { type?: string }).type === 'redeem';
            return (
              <div key={row.id} className={`flex items-center justify-between rounded-lg border p-3 ${isRedeem ? 'border-amber-200 bg-amber-50' : 'border-green-100 bg-green-50'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isRedeem ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
                      {isRedeem ? '🛒 Redeem' : '⭐ Earn'}
                    </span>
                    <p className="font-semibold text-slate-800">
                      {(row.profiles as { display_name?: string } | null)?.display_name ?? 'Kid'}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {isRedeem
                      ? `${row.reason} • costs ${Math.abs(row.amount)} tokens`
                      : `${row.reason} • +${row.amount} tokens`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={moderateTransactionAction}>
                    <input type="hidden" name="transactionId" value={row.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700">
                      ✓ Approve
                    </button>
                  </form>
                  <form action={moderateTransactionAction}>
                    <input type="hidden" name="transactionId" value={row.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">
                      ✕ Reject
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Rewards">
        <form action={createRewardAction} className="mb-3 grid gap-2 md:grid-cols-3">
          <input name="title" placeholder="Reward title" className="rounded border px-3 py-2" />
          <input name="tokenCost" type="number" placeholder="Token cost" className="rounded border px-3 py-2" />
          <button className="rounded bg-brand-navy px-4 py-2 text-white">Create</button>
        </form>
        <ul className="space-y-2">
          {(rewards ?? []).map((reward) => (
            <li key={reward.id} className="rounded border p-3">
              {reward.title} • {reward.token_cost} tokens
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Tutor Logs (Placeholder)">
        <p className="text-slate-600">No tutor logs yet. Anthropic integration intentionally deferred.</p>
      </Panel>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}
