export const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB, matches wizard copy & Supabase Storage policy
export const ALLOWED_UPLOAD_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts +48/+90 (or generic +CC) numbers with 7-15 digits, spaces/dashes allowed.
const PHONE_REGEX = /^\+\d{1,3}[\s-]?\d[\d\s-]{6,14}\d$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim());
}

export function isValidFullName(name: string): boolean {
  return name.trim().length >= 3 && name.trim().includes(' ');
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(file: File): FileValidationResult {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { valid: false, error: `Dosya boyutu 15 MB sınırını aşıyor (${(file.size / (1024 * 1024)).toFixed(1)} MB).` };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Desteklenmeyen dosya türü (.${ext}). İzin verilenler: ${ALLOWED_UPLOAD_EXTENSIONS.join(', ')}.` };
  }
  return { valid: true };
}
