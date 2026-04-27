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

  const { data: profiles } = await supabase.from('profiles').select('*').eq('household_id', household.id).order('created_at');

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-brand-navy">Choose Your Explorer</h1>
        <p className="text-slate-600">{household.name}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(profiles ?? []).map((profile) => (
          <ProfileCard
            key={profile.id}
            id={profile.id}
            displayName={profile.display_name}
            age={profile.age}
            avatarSeed={profile.avatar_seed}
            avatarStyle={profile.avatar_style}
            action={selectProfileAction}
          />
        ))}
      </div>
      <Link href="/parent/pin" className="inline-block rounded-lg bg-brand-lilac px-4 py-2 font-semibold text-slate-900">
        Parent Dashboard (PIN)
      </Link>
    </section>
  );
}
