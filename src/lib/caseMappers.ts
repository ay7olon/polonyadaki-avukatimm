import { CaseDocument, ChatMessage, LawyerNote, LegalCase, TimelineStep } from '../types';

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const DEFAULT_LAWYER_AVATAR =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80';

function toIsoDateOnly(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function formatTurkishDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const iso = value.length <= 10 ? `${value}T00:00:00` : value;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${d.getDate()} ${TURKISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTurkishDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatTurkishDate(value)} - ${hh}:${mm}`;
}

// Loosely typed shapes matching the nested Supabase select used in useCases.
// Kept intentionally permissive (nullable joins) since PostgREST returns
// null for to-one relations that don't resolve (e.g. no lawyer assigned yet).
interface DbProfileRef {
  full_name: string | null;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface DbCaseDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  storage_path: string | null;
  uploaded_at: string;
}

interface DbTimelineStep {
  id: string;
  title: string;
  description: string;
  step_date: string | null;
  status: 'completed' | 'current' | 'upcoming';
  actor: string | null;
  sort_order: number;
}

interface DbInternalNote {
  id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  author: DbProfileRef | null;
}

interface DbMessage {
  id: string;
  sender_id: string | null;
  sender_role: 'client' | 'lawyer' | 'system';
  body: string;
  attachments: { name: string; size: string; type: string }[] | null;
  created_at: string;
  sender: DbProfileRef | null;
}

export interface DbLegalCase {
  id: string;
  case_number: string;
  case_type: string;
  case_category: LegalCase['caseCategory'];
  city: string;
  status: LegalCase['status'];
  urgency: LegalCase['urgency'];
  progress_percent: number;
  form_summary: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  assigned_lawyer_id: string | null;
  client: DbProfileRef | null;
  assigned_lawyer: DbProfileRef | null;
  case_documents: DbCaseDocument[] | null;
  case_timeline_steps: DbTimelineStep[] | null;
  case_internal_notes: DbInternalNote[] | null;
  case_messages: DbMessage[] | null;
}

function mapDocument(d: DbCaseDocument): CaseDocument {
  return {
    id: d.id,
    name: d.name,
    size: d.size,
    type: d.type,
    uploadedAt: toIsoDateOnly(d.uploaded_at),
    status: d.status,
    rejectionReason: d.rejection_reason ?? undefined,
    fileUrl: d.storage_path ?? undefined,
  };
}

function mapTimelineStep(t: DbTimelineStep): TimelineStep {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    date: formatTurkishDate(t.step_date),
    status: t.status,
    actor: t.actor ?? undefined,
  };
}

function mapInternalNote(n: DbInternalNote): LawyerNote {
  return {
    id: n.id,
    author: n.author?.full_name ?? 'Avukat',
    date: formatTurkishDateTime(n.created_at),
    content: n.content,
    isPrivate: n.is_private,
  };
}

function mapMessage(m: DbMessage, fallbackClientName: string, fallbackLawyer: DbProfileRef | null): ChatMessage {
  const isLawyer = m.sender_role === 'lawyer';
  return {
    id: m.id,
    senderId: m.sender_id ?? 'system',
    senderName: m.sender?.full_name ?? (isLawyer ? fallbackLawyer?.full_name ?? 'Avukat' : fallbackClientName),
    senderRole: m.sender_role,
    avatar: isLawyer ? fallbackLawyer?.avatar_url ?? undefined : undefined,
    text: m.body,
    timestamp: formatTurkishDateTime(m.created_at),
    attachments: m.attachments && m.attachments.length > 0 ? m.attachments : undefined,
  };
}

export function mapDbCaseToLegalCase(row: DbLegalCase): LegalCase {
  const clientName = row.client?.full_name ?? '';

  return {
    id: row.id,
    caseNumber: row.case_number,
    clientName,
    clientEmail: row.client?.email ?? '',
    clientPhone: row.client?.phone ?? '',
    caseType: row.case_type,
    caseCategory: row.case_category,
    city: row.city,
    status: row.status,
    urgency: row.urgency,
    createdAt: toIsoDateOnly(row.created_at),
    updatedAt: toIsoDateOnly(row.updated_at),
    assignedLawyerId: row.assigned_lawyer_id ?? undefined,
    assignedLawyer: row.assigned_lawyer?.full_name ?? 'Henüz Atanmadı',
    lawyerAvatar: row.assigned_lawyer?.avatar_url ?? DEFAULT_LAWYER_AVATAR,
    progressPercent: row.progress_percent,
    documents: (row.case_documents ?? []).map(mapDocument),
    timeline: (row.case_timeline_steps ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapTimelineStep),
    internalNotes: (row.case_internal_notes ?? []).map(mapInternalNote),
    messages: (row.case_messages ?? []).map((m) => mapMessage(m, clientName, row.assigned_lawyer)),
    formSummary: row.form_summary ?? {},
  };
}
