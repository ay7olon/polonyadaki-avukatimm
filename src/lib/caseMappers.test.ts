import { describe, expect, it } from 'vitest';
import { DbLegalCase, mapDbCaseToLegalCase } from './caseMappers';

function baseRow(overrides: Partial<DbLegalCase> = {}): DbLegalCase {
  return {
    id: 'case-1',
    case_number: 'PL-2026-1234',
    case_type: 'Geçici Oturma İzni',
    case_category: 'oturtma',
    city: 'Varşova (Mazowieckie)',
    status: 'received',
    urgency: 'normal',
    progress_percent: 10,
    form_summary: { Şehir: 'Varşova' },
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z',
    deadline_at: null,
    assigned_lawyer_id: null,
    client: { full_name: 'Ahmet Yılmaz', email: 'ahmet@gmail.com', phone: '+48 570 123 456' },
    assigned_lawyer: null,
    case_documents: null,
    case_timeline_steps: null,
    case_internal_notes: null,
    case_messages: null,
    ...overrides,
  };
}

describe('mapDbCaseToLegalCase', () => {
  it('maps a minimal row with null relations to sensible defaults', () => {
    const result = mapDbCaseToLegalCase(baseRow());

    expect(result.id).toBe('case-1');
    expect(result.clientName).toBe('Ahmet Yılmaz');
    expect(result.assignedLawyer).toBe('Henüz Atanmadı');
    expect(result.assignedLawyerId).toBeUndefined();
    expect(result.documents).toEqual([]);
    expect(result.timeline).toEqual([]);
    expect(result.deadlineAt).toBeUndefined();
    expect(result.createdAt).toBe('2026-08-01');
  });

  it('sorts timeline steps by sort_order regardless of input order', () => {
    const result = mapDbCaseToLegalCase(
      baseRow({
        case_timeline_steps: [
          { id: 't2', title: 'İkinci Adım', description: '', step_date: null, status: 'upcoming', actor: null, sort_order: 2 },
          { id: 't1', title: 'İlk Adım', description: '', step_date: null, status: 'completed', actor: null, sort_order: 1 },
        ],
      })
    );

    expect(result.timeline.map(t => t.id)).toEqual(['t1', 't2']);
  });

  it('carries through deadline_at and assigned lawyer info', () => {
    const result = mapDbCaseToLegalCase(
      baseRow({
        deadline_at: '2026-08-05T11:36:00.000Z',
        assigned_lawyer_id: 'lawyer-1',
        assigned_lawyer: { full_name: 'Av. Piotr Kowalski', avatar_url: 'https://example.com/a.png' },
      })
    );

    expect(result.deadlineAt).toBe('2026-08-05T11:36:00.000Z');
    expect(result.assignedLawyerId).toBe('lawyer-1');
    expect(result.assignedLawyer).toBe('Av. Piotr Kowalski');
    expect(result.lawyerAvatar).toBe('https://example.com/a.png');
  });

  it('falls back to the assigned lawyer for lawyer-authored messages without a joined sender', () => {
    const result = mapDbCaseToLegalCase(
      baseRow({
        assigned_lawyer: { full_name: 'Av. Piotr Kowalski', avatar_url: null },
        case_messages: [
          {
            id: 'm1',
            sender_id: null,
            sender_role: 'lawyer',
            body: 'Merhaba',
            attachments: null,
            created_at: '2026-08-01T12:00:00.000Z',
            sender: null,
          },
        ],
      })
    );

    expect(result.messages[0].senderName).toBe('Av. Piotr Kowalski');
  });
});
