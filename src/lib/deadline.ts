export type DeadlineTone = 'overdue' | 'critical' | 'warning' | 'normal' | 'none';

export interface DeadlineInfo {
  hasDeadline: boolean;
  isOverdue: boolean;
  msRemaining: number;
  tone: DeadlineTone;
  /** Short badge label, e.g. "18 saat kaldı", "3 gün gecikti". */
  label: string;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * Computes a human-readable (Turkish) deadline status for a case, driven by
 * the DB-calculated `deadline_at` (see compute_case_deadline() trigger).
 * Cases without a hard deadline (normal urgency) return tone 'none'.
 */
export function getDeadlineInfo(deadlineAt: string | undefined, now: Date = new Date()): DeadlineInfo {
  if (!deadlineAt) {
    return { hasDeadline: false, isOverdue: false, msRemaining: 0, tone: 'none', label: 'Sabit süre yok' };
  }

  const deadline = new Date(deadlineAt);
  if (Number.isNaN(deadline.getTime())) {
    return { hasDeadline: false, isOverdue: false, msRemaining: 0, tone: 'none', label: 'Sabit süre yok' };
  }

  const msRemaining = deadline.getTime() - now.getTime();
  const isOverdue = msRemaining <= 0;
  const absMs = Math.abs(msRemaining);

  const label = isOverdue
    ? `Süresi ${formatDuration(absMs)} önce doldu`
    : `${formatDuration(absMs)} kaldı`;

  let tone: DeadlineTone;
  if (isOverdue) {
    tone = 'overdue';
  } else if (absMs <= 24 * HOUR_MS) {
    tone = 'critical';
  } else if (absMs <= 3 * DAY_MS) {
    tone = 'warning';
  } else {
    tone = 'normal';
  }

  return { hasDeadline: true, isOverdue, msRemaining, tone, label };
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / HOUR_MS);
  if (hours < 1) {
    const minutes = Math.max(1, Math.floor(ms / (60 * 1000)));
    return `${minutes} dakika`;
  }
  if (hours < 24) {
    return `${hours} saat`;
  }
  const days = Math.floor(hours / 24);
  return `${days} gün`;
}

export function formatDeadlineDateTime(deadlineAt: string | undefined): string {
  if (!deadlineAt) return '';
  const d = new Date(deadlineAt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' });
}
