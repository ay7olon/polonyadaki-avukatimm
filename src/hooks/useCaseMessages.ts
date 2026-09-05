import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ChatMessage } from '../types';

interface DbMessageRow {
  id: string;
  sender_id: string | null;
  sender_role: 'client' | 'lawyer' | 'system';
  body: string;
  attachments: { name: string; size: string; type: string; path?: string }[] | null;
  created_at: string;
  sender?: { full_name: string | null } | null;
}

interface MessageFallbackNames {
  clientName: string;
  lawyerName: string;
  lawyerAvatar?: string;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
}

function mapRow(row: DbMessageRow, fallback: MessageFallbackNames): ChatMessage {
  const isLawyer = row.sender_role === 'lawyer';
  return {
    id: row.id,
    senderId: row.sender_id ?? 'system',
    senderName:
      row.sender?.full_name ||
      (isLawyer ? fallback.lawyerName : row.sender_role === 'client' ? fallback.clientName : 'Sistem'),
    senderRole: row.sender_role,
    avatar: isLawyer ? fallback.lawyerAvatar : undefined,
    text: row.body,
    timestamp: formatTimestamp(row.created_at),
    attachments: row.attachments && row.attachments.length > 0 ? row.attachments : undefined,
  };
}

/**
 * Loads + live-syncs the message thread for a single case via Supabase
 * Realtime. Sending a message only performs the INSERT — the new row
 * (for both the sender and the other party) arrives back through the
 * realtime subscription, so there is a single source of truth for the UI.
 */
export function useCaseMessages(caseId: string | undefined, fallback: MessageFallbackNames) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    supabase
      .from('case_messages')
      .select('*, sender:profiles(full_name)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Mesajlar yüklenemedi:', error.message);
          setMessages([]);
        } else {
          setMessages(((data as unknown as DbMessageRow[]) ?? []).map(row => mapRow(row, fallback)));
        }
        setLoading(false);
      });

    const channel = supabase
      .channel(`case_messages_${caseId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'case_messages', filter: `case_id=eq.${caseId}` },
        payload => {
          const row = payload.new as DbMessageRow;
          setMessages(prev => (prev.some(m => m.id === row.id) ? prev : [...prev, mapRow(row, fallback)]));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, fallback.clientName, fallback.lawyerName, fallback.lawyerAvatar]);

  const sendMessage = useCallback(
    async (
      senderId: string,
      senderRole: 'client' | 'lawyer',
      text: string,
      attachments?: { name: string; size: string; type: string; path?: string }[]
    ): Promise<{ error: string | null }> => {
      if (!caseId) return { error: 'Dosya seçilmedi.' };
      const { error } = await supabase.from('case_messages').insert({
        case_id: caseId,
        sender_id: senderId,
        sender_role: senderRole,
        body: text,
        attachments: attachments ?? [],
      });
      return { error: error?.message ?? null };
    },
    [caseId]
  );

  return { messages, loading, sendMessage };
}
