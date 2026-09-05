import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserRole } from '../types';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url: string | null;
  language_pref: string;
  rodo_accepted_at: string | null;
  created_at: string;
}

interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  rodoAccepted: boolean;
}

export interface UpdateProfileParams {
  fullName: string;
  phone: string;
  languagePref: string;
}

interface UseAuthResult {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  passwordRecoveryPending: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (params: UpdateProfileParams) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  clearPasswordRecovery: () => void;
}

/**
 * Central auth/session hook. Keeps `session` (Supabase auth) and `profile`
 * (public.profiles row, including role) in sync via onAuthStateChange so the
 * rest of the app can react to login/logout without prop drilling.
 */
export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecoveryPending, setPasswordRecoveryPending] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Profil bilgisi alınamadı:', error.message);
      setProfile(null);
      return;
    }
    setProfile(data as Profile);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryPending(true);
      }
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setPasswordRecoveryPending(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async ({ email, password, fullName, phone, rodoAccepted }: SignUpParams) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          rodo_accepted: rodoAccepted,
        },
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    setPasswordRecoveryPending(false);
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(
    async ({ fullName, phone, languagePref }: UpdateProfileParams) => {
      if (!session?.user.id) {
        return { error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          language_pref: languagePref,
        })
        .eq('id', session.user.id)
        .select('*')
        .single();

      if (error) {
        return { error: error.message };
      }

      setProfile(data as Profile);
      return { error: null };
    },
    [session?.user.id],
  );

  const resetPassword = useCallback(async (email: string) => {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      setPasswordRecoveryPending(false);
    }
    return { error: error?.message ?? null };
  }, []);

  const clearPasswordRecovery = useCallback(() => {
    setPasswordRecoveryPending(false);
  }, []);

  return {
    session,
    profile,
    loading,
    passwordRecoveryPending,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    clearPasswordRecovery,
  };
}
