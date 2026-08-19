import type { Session, User } from '@supabase/supabase-js';

export interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}
