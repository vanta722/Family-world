'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';

// ── helpers ──────────────────────────────────────────────────────────────────

async function getAuthedHousehold() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: household } = await supabase
    .from('households').select('id').eq('parent_user_id', user.id).single();
  return household ? { supabase, user, householdId: household.id } : null;
}

function gradeBandFromAge(age: number): string {
  if (age <= 6)  return 'K-2';
  if (age <= 8)  return '3-4';
  if (age <= 10) return '5-6';
  return '7-8';
}

function generateDistractors(correct: number): number[] {
  const candidates = [-4, -3, -2, -1, 1, 2, 3, 4]
    .map((o) => correct + o)
    .filter((n) => n >= 0 && n !== correct);
  return candidates.sort(() => Math.random() - 0.5).slice(0, 3);
}

// ── Token approval ───────────────────────────────────────────────────────────

export async function moderateTransactionAction(formData: FormData) {
  const transactionId = String(formData.get('transactionId') || '');
  const status        = String(formData.get('status') || '');
  const ctx = await getAuthedHousehold();
  if (!ctx || !transactionId || !['approved', 'rejected'].includes(status)) return;

  await ctx.supabase
    .from('transactions')
    .update({ status, approved_at: new Date().toISOString(), approved_by: ctx.user.id })
    .eq('id', transactionId)
    .eq('household_id', ctx.householdId); // RLS belt-and-suspenders

  revalidatePath('/parent');
}

// ── Rewards ──────────────────────────────────────────────────────────────────

export async function createRewardAction(formData: FormData) {
  const title     = String(formData.get('title') || '').trim();
  const tokenCost = Number(formData.get('tokenCost') || 0);
  const ctx = await getAuthedHousehold();
  if (!ctx || !title || tokenCost < 1) return;

  await ctx.supabase.from('rewards').insert({
    household_id: ctx.householdId,
    title,
    token_cost: tokenCost,
  });
  revalidatePath('/parent');
}

export async function deactivateRewardAction(formData: FormData) {
  const rewardId = String(formData.get('rewardId') || '');
  const ctx = await getAuthedHousehold();
  if (!ctx || !rewardId) return;

  await ctx.supabase
    .from('rewards')
    .update({ is_active: false })
    .eq('id', rewardId)
    .eq('household_id', ctx.householdId);

  revalidatePath('/parent');
  revalidatePath('/shop');
}

// ── Profiles ─────────────────────────────────────────────────────────────────

export async function createProfileAction(formData: FormData) {
  const displayName  = String(formData.get('displayName') || '').trim();
  const age          = Number(formData.get('age') || 0);
  const avatarStyle  = String(formData.get('avatarStyle') || 'adventurer');
  const ctx = await getAuthedHousehold();
  if (!ctx || !displayName || age < 3 || age > 18) return;

  const avatarSeed = displayName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

  await ctx.supabase.from('profiles').insert({
    household_id: ctx.householdId,
    display_name: displayName,
    age,
    avatar_seed:  avatarSeed,
    avatar_style: avatarStyle,
    grade_band:   gradeBandFromAge(age),
  });
  revalidatePath('/parent');
  revalidatePath('/family');
}

// ── Lessons ──────────────────────────────────────────────────────────────────

export async function createLessonAction(formData: FormData) {
  const prompt        = String(formData.get('prompt') || '').trim();
  const correctAnswer = Number(formData.get('correctAnswer'));
  const skillId       = String(formData.get('skillId') || '');
  const ctx = await getAuthedHousehold();
  if (!ctx || !prompt || isNaN(correctAnswer) || !skillId) return;

  const distractors = generateDistractors(correctAnswer);
  const answers     = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

  await ctx.supabase.from('lessons').insert({
    household_id: ctx.householdId,
    skill_id:     skillId,
    title:        prompt,
    lesson_type:  'phaser-math-kingdom',
    content:      { prompt, answers, correctAnswer },
    status:       'approved',
    created_by:   'parent',
  });
  revalidatePath('/parent');
  revalidatePath('/play');
}
