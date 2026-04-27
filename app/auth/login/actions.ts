'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect('/family');
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.APP_BASE_URL}/auth/callback` }
  });
  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}&tab=signup`);
  }
  redirect('/auth/login?message=Check+your+email+to+confirm+your+account');
}

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
