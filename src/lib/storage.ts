import { supabase } from './supabaseClient';

const BUCKET = 'case-documents';

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Uploads a file under `${caseId}/...` so storage RLS (which checks the
 * first path segment against legal_cases ownership) can authorize it.
 */
export async function uploadCaseDocumentFile(
  caseId: string,
  file: File
): Promise<{ path: string; error: null } | { path: null; error: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${caseId}/${Date.now()}-${safeName}`;

  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error || !data) {
    return { path: null, error: error?.message ?? 'Dosya yüklenemedi.' };
  }

  return { path: data.path, error: null };
}

/** Private bucket: generate a short-lived signed URL for viewing/downloading. */
export async function getSignedDocumentUrl(path: string, expiresInSeconds = 300): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error || !data) {
    console.error('İmzalı bağlantı oluşturulamadı:', error?.message);
    return null;
  }
  return data.signedUrl;
}
