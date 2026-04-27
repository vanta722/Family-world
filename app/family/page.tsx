import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfileCard } from '@/components/family/profile-card';
import { createServerSupabase } from '@/lib/supabase/server';
import { selectProfileAction } from './actions';

export default async function FamilyPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: household } = await supabase
    .from('households')
    .select('id, name')
    .eq('parent_user_id', user.id)
    .maybeSingle();

  if (!household) redirect('/onboarding');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('household_id', household.id)
    .order('created_at');

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl px-8 py-10 text-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg,#0f0a1e 0%,#1a0a2e 40%,#0d1f3c 100%)',
          boxShadow: '0 0 60px rgba(124,58,237,0.25)',
        }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 opacity-20"
             style={{ backgroundImage: 'radial-gradient(circle at 30% 50%,#7C3AED 0%,transparent 50%), radial-gradient(circle at 70% 50%,#06B6D4 0%,transparent 50%)' }} />

        {/* Stars */}
        {[
          [10,20],[25,60],[45,15],[65,70],[80,30],[90,55],[35,80],[55,40]
        ].map(([l, t], i) => (
          <div key={i} className="absolute h-1 w-1 rounded-full bg-white"
               style={{ left: `${l}%`, top: `${t}%`, opacity: 0.5,
                        animation: `star-twinkle ${2.2 + i * 0.25}s ease-in-out ${i * 0.3}s infinite` }} />
        ))}

        <div className="relative z-10 space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-brand-neon/80">
            ✦ {household.name} ✦
          </p>
          <h1
            className="text-4xl font-black sm:text-5xl"
            style={{
              background: 'linear-gradient(90deg,#A78BFA,#06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Choose Your Hero
          </h1>
          <p className="text-sm text-violet-300/60">
            Select a champion to begin today&apos;s quest
          </p>
        </div>
      </div>

      {/* ── Hero grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(profiles ?? []).map((profile, i) => (
          <div
            key={profile.id}
            className="animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <ProfileCard
              id={profile.id}
              displayName={profile.display_name}
              age={profile.age}
              avatarSeed={profile.avatar_seed}
              avatarStyle={profile.avatar_style}
              action={selectProfileAction}
            />
          </div>
        ))}
      </div>

      {/* ── Parent link ── */}
      <div className="flex justify-center">
        <Link
          href="/parent/pin"
          className="rounded-xl border border-violet-700/40 bg-violet-900/20 px-5 py-2.5 text-sm font-semibold text-violet-400 backdrop-blur-sm transition-all hover:border-violet-500/60 hover:bg-violet-800/30 hover:text-violet-200"
        >
          👑 Parent Council (PIN required)
        </Link>
      </div>
    </div>
  );
}
