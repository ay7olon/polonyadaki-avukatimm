import { supabase } from './supabaseClient';

export const PENDING_DOCS_STEP_TITLE = 'Ek belge bekleniyor';
export const REVIEW_AFTER_UPLOAD_TITLE = 'Yüklenen evrak incelenecek';

async function nextSortOrder(caseId: string): Promise<number> {
  const { data } = await supabase
    .from('case_timeline_steps')
    .select('sort_order')
    .eq('case_id', caseId)
    .order('sort_order', { ascending: false })
    .limit(1);
  return (data?.[0]?.sort_order ?? -1) + 1;
}

/** Staff: mark process as waiting for client documents (timeline step). */
export async function ensurePendingDocsTimelineStep(
  caseId: string,
  description: string,
  actor?: string
): Promise<{ error: string | null }> {
  await supabase
    .from('case_timeline_steps')
    .update({ status: 'completed' })
    .eq('case_id', caseId)
    .eq('status', 'current');

  const { data: existing } = await supabase
    .from('case_timeline_steps')
    .select('id')
    .eq('case_id', caseId)
    .eq('title', PENDING_DOCS_STEP_TITLE)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from('case_timeline_steps')
      .update({
        status: 'current',
        description: description.trim() || 'Müşteriden ek belge bekleniyor.',
        actor: actor ?? null,
        step_date: new Date().toISOString().slice(0, 10),
      })
      .eq('id', existing.id);
    return { error: error?.message ?? null };
  }

  const sortOrder = await nextSortOrder(caseId);
  const { error } = await supabase.from('case_timeline_steps').insert({
    case_id: caseId,
    title: PENDING_DOCS_STEP_TITLE,
    description: description.trim() || 'Müşteriden ek belge bekleniyor.',
    status: 'current',
    actor: actor ?? null,
    sort_order: sortOrder,
    step_date: new Date().toISOString().slice(0, 10),
  });
  return { error: error?.message ?? null };
}

/** Staff: record lawyer file share on the linear process (does not steal "current"). */
export async function addLawyerShareTimelineStep(
  caseId: string,
  fileName: string,
  actor?: string
): Promise<{ error: string | null }> {
  const sortOrder = await nextSortOrder(caseId);
  const { error } = await supabase.from('case_timeline_steps').insert({
    case_id: caseId,
    title: `Avukat dosya paylaştı: ${fileName}`,
    description: 'Avukatınız dosyanıza bir belge ekledi. Dosya Evrakları bölümünden görüntüleyebilirsiniz.',
    status: 'completed',
    actor: actor ?? null,
    sort_order: sortOrder,
    step_date: new Date().toISOString().slice(0, 10),
  });
  return { error: error?.message ?? null };
}
