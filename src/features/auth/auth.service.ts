import { supabase } from '../../services/supabase/client';
import type { SignUpResult } from './types';

export const signInWithPassword = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
};

export const signUpWithPassword = async (email: string, password: string): Promise<SignUpResult> => {
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) throw error;
  return { requiresEmailConfirmation: data.session === null };
};

export const signOutCurrentUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
