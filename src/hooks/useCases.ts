import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { LegalCase } from '../types';
import { DbLegalCase, mapDbCaseToLegalCase } from '../lib/caseMappers';

// RLS on legal_cases already scopes rows to "own cases" (client) or "all
// cases" (lawyer/admin), so a single query shape works for every role.
const CASE_SELECT = `
  *,
  client:profiles!legal_cases_client_id_fkey(full_name, phone, email),
  assigned_lawyer:profiles!legal_cases_assigned_lawyer_id_fkey(full_name, avatar_url),
  case_documents(*),
  case_timeline_steps(*),
  case_internal_notes(*, author:profiles(full_name))
`;

interface UseCasesResult {
  cases: LegalCase[];
  setCases: Dispatch<SetStateAction<LegalCase[]>>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Loads all legal cases visible to the current session (RLS-scoped) with
 * documents/timeline/notes nested. Message threads load via useCaseMessages.
 */
export function useCases(session: Session | null): UseCasesResult {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!session) {
      setCases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('legal_cases')
      .select(CASE_SELECT)
      .order('created_at', { ascending: false })
      .order('sort_order', { foreignTable: 'case_timeline_steps', ascending: true });

    if (fetchError) {
      console.error('Dosyalar yüklenemedi:', fetchError.message);
      setError(fetchError.message);
      setCases([]);
      setLoading(false);
      return;
    }

    setCases(((data as unknown as DbLegalCase[]) ?? []).map(mapDbCaseToLegalCase));
    setError(null);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cases, setCases, loading, error, refetch };
}
