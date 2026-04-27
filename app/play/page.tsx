import Image from 'next/image';
import { redirect } from 'next/navigation';
import { MathKingdom } from '@/components/game/math-kingdom';
import { createServerSupabase } from '@/lib/supabase/server';
import { getActiveProfileId } from '@/lib/auth/active-profile';
import { getApprovedTokenBalance } from '@/lib/tokens/balance';

export default async function PlayPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const activeProfileId = await getActiveProfileId();
  if (!activeProfileId) redirect('/family');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', activeProfileId).single();
  if (!profile) redirect('/family');

  const tokenBalance = await getApprovedTokenBalance(profile.id);

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, skill_id, content')
    .eq('household_id', profile.household_id)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle();

  const content = (lesson?.content as { prompt?: string; answers?: number[]; correctAnswer?: number }) || {};

  return (
    <section className="space-y-4">
      <div className="grid gap-4 rounded-xl bg-white p-4 shadow sm:grid-cols-5">
        <div className="sm:col-span-3 flex items-center gap-3">
          <Image
            src={`https://api.dicebear.com/9.x/${profile.avatar_style}/svg?seed=${encodeURIComponent(profile.avatar_seed)}`}
            alt={profile.display_name}
            width={64}
            height={64}
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            <p className="text-sm text-slate-600">Streak: 0 • Hearts: 3</p>
          </div>
        </div>
        <div className="rounded-lg bg-amber-100 p-3 text-center">
          <p className="text-xs uppercase text-slate-600">Approved Tokens</p>
          <p className="text-2xl font-bold">{tokenBalance}</p>
        </div>
      </div>

      <MathKingdom
        question={{
          lessonId: lesson?.id ?? '',
          skillId: lesson?.skill_id ?? '',
          prompt: content.prompt ?? '2 + 3 = ?',
          answers: content.answers ?? [4, 5, 6, 7],
          correctAnswer: content.correctAnswer ?? 5
        }}
      />
    </section>
  );
}
