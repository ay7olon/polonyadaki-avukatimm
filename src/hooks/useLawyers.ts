import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface LawyerOption {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

/**
 * Loads the list of lawyer profiles for staff-only UI (case assignment
 * dropdowns, list filters). RLS on `profiles` already restricts non-staff
 * callers to their own row, so this naturally returns an empty list for
 * client sessions.
 */
export function useLawyers(enabled: boolean): { lawyers: LawyerOption[]; loading: boolean } {
  const [lawyers, setLawyers] = useState<LawyerOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLawyers([]);
      return;
    }

    let active = true;
    setLoading(true);

    supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('role', 'lawyer')
      .order('full_name', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Avukat listesi yüklenemedi:', error.message);
          setLawyers([]);
        } else {
          setLawyers(
            (data ?? []).map(row => ({
              id: row.id,
              fullName: row.full_name || 'İsimsiz Avukat',
              avatarUrl: row.avatar_url,
            }))
          );
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return { lawyers, loading };
}
