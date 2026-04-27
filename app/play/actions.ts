'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { getActiveProfileId } from '@/lib/auth/active-profile';

export async function submitAttemptAction(payload: {
  lessonId: string;
  skillId: string;
  selectedAnswer: number;
  correctAnswer: number;
  durationMs: number;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: household } = await supabase
    .from('households')
    .select('id, parent_user_id')
    .eq('parent_user_id', user.id)
    .single();

  const profileId = await getActiveProfileId();
  if (!household?.id || !profileId) throw new Error('Missing household/profile context');

  const isCorrect = payload.selectedAnswer === payload.correctAnswer;

  const { data: attempt } = await supabase
    .from('attempts')
    .insert({
      household_id: household.id,
      profile_id: profileId,
      lesson_id: payload.lessonId,
      skill_id: payload.skillId,
      duration_ms: payload.durationMs,
      response: { selectedAnswer: payload.selectedAnswer, correctAnswer: payload.correctAnswer },
      is_correct: isCorrect,
      submitted_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (isCorrect && attempt) {
    await supabase.from('transactions').insert({
      household_id: household.id,
      profile_id: profileId,
      attempt_id: attempt.id,
      amount: 5,
      type: 'earn',
      reason: 'Correct lesson answer',
      status: 'pending'
    });
  }

  return { isCorrect };
}
