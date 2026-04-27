'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { setActiveProfile } from '@/lib/auth/active-profile';
import { hashParentPin } from '@/lib/auth/pin';
import { privateEnv } from '@/lib/supabase/env';

export async function selectProfileAction(formData: FormData) {
  const profileId = String(formData.get('profileId') || '');
  if (!profileId) return;
  await setActiveProfile(profileId);
  redirect('/play');
}

export async function createHouseholdAction(formData: FormData) {
  const householdName = String(formData.get('householdName') || '');
  const pin = String(formData.get('pin') || '');

  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');
  const parentPinHash = hashParentPin(pin, privateEnv.PARENT_PIN_HASH_SECRET);

  const { data: household } = await supabase
    .from('households')
    .insert({ name: householdName, parent_user_id: user.id, parent_pin_hash: parentPinHash })
    .select('id')
    .single();

  if (!household) return;

  const starterProfiles = [
    { display_name: 'Kid 1', age: 6, grade_band: 'K-2' },
    { display_name: 'Kid 2', age: 8, grade_band: '3-4' },
    { display_name: 'Kid 3', age: 10, grade_band: '5-6' }
  ];

  await supabase.from('profiles').insert(
    starterProfiles.map((profile) => ({
      household_id: household.id,
      ...profile,
      avatar_seed: profile.display_name.toLowerCase().replace(/\s+/g, '-')
    }))
  );

  const { data: skills } = await supabase
    .from('skills')
    .select('id, key')
    .in('key', ['math-addition-1', 'reading-sight-words-1']);

  if (skills?.length) {
    const lessonRows = skills.map((skill) =>
      skill.key === 'math-addition-1'
        ? {
            household_id: household.id,
            skill_id: skill.id,
            title: 'Math Kingdom: Add to 5',
            lesson_type: 'phaser-math-kingdom',
            content: { prompt: '2 + 3 = ?', answers: [4, 5, 6, 7], correctAnswer: 5 },
            created_by: 'seed'
          }
        : {
            household_id: household.id,
            skill_id: skill.id,
            title: 'Reading Trail: Find the word',
            lesson_type: 'reading-choice',
            content: { prompt: 'Pick the sight word "the"', options: ['teh', 'the', 'tha'] },
            created_by: 'seed'
          }
    );

    await supabase.from('lessons').insert(lessonRows);
  }

  redirect('/family');
}
