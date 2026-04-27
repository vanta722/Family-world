import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MathKingdom } from '@/components/game/math-kingdom';
import { createServerSupabase } from '@/lib/supabase/server';
import { getActiveProfileId } from '@/lib/auth/active-profile';
import { getApprovedTokenBalance } from '@/lib/tokens/balance';

export default async function PlayPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const activeProfileId = await getActiveProfileId();
  if (!activeProfileId) redirect('/family');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', activeProfileId).single();
  if (!profile) redirect('/family');

  const tokenBalance = await getApprovedTokenBalance(profile.id);

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id, skill_id, content')
    .eq('household_id', profile.household_id)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle();

  const content = (lesson?.content as { prompt?: string; answers?: number[]; correctAnswer?: number }) ?? {};
  const hasLesson = !!lesson?.id;

  return (
    <section className="space-y-4">
      {/* ── Hero HUD ── */}
      <div
        className="flex flex-wrap items-center gap-4 rounded-2xl border border-violet-800/30 px-5 py-4 shadow-xl"
        style={{ background: 'linear-gradient(135deg,#0f0a1e,#0d1f3c)' }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="absolute inset-0 rounded-full"
                 style={{ boxShadow: '0 0 0 2px rgba(167,139,250,0.4), 0 0 16px rgba(167,139,250,0.3)' }} />
            <Image
              src={`https://api.dicebear.com/9.x/${profile.avatar_style}/svg?seed=${encodeURIComponent(profile.avatar_seed)}`}
              alt={profile.display_name}
              width={56}
              height={56}
              className="rounded-full bg-violet-900/40"
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{profile.display_name}</h1>
            <p className="text-xs text-violet-400/60">Hero · Crystal Kingdom</p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 rounded-xl border border-brand-gold/30 px-4 py-2.5"
          style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(245,158,11,0.05))' }}
        >
          <span className="text-xl">✨</span>
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-gold/70">Royal Tokens</p>
            <p className="text-2xl font-black text-brand-gold leading-none">{tokenBalance}</p>
          </div>
        </div>
      </div>

      {/* ── No lesson fallback ── */}
      {!hasLesson ? (
        <div
          className="overflow-hidden rounded-3xl border border-violet-700/30 shadow-2xl"
          style={{ background: 'linear-gradient(180deg,#0f0a1e,#1a0a2e 40%,#0d1f3c)' }}
        >
          <div className="px-8 py-16 text-center space-y-5">
            <div className="text-6xl">🏰</div>
            <div>
              <h2 className="text-2xl font-black text-white">No Quests Available</h2>
              <p className="mt-2 text-sm text-violet-300/60 max-w-sm mx-auto">
                The Quest Board is empty. Ask a parent to create a new lesson in the Royal Council, then come back to battle!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/world"
                className="rounded-xl px-6 py-3 text-sm font-black text-white shadow transition hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(90deg,#7C3AED,#06B6D4)' }}
              >
                🗺️ Explore the World
              </Link>
              <Link
                href="/shop"
                className="rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-6 py-3 text-sm font-bold text-brand-gold transition hover:bg-brand-gold/20"
              >
                🏪 Visit the Shop
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <MathKingdom
          question={{
            lessonId:       lesson.id,
            skillId:        lesson.skill_id,
            prompt:         content.prompt        ?? '2 + 3 = ?',
            answers:        content.answers       ?? [4, 5, 6, 7],
            correctAnswer:  content.correctAnswer ?? 5,
          }}
        />
      )}
    </section>
  );
}
