import React from 'react';
import { AlarmClock, AlertTriangle, Clock } from 'lucide-react';
import { DeadlineInfo } from '../lib/deadline';

const TONE_STYLES: Record<DeadlineInfo['tone'], string> = {
  overdue: 'bg-red-600 text-white border-red-700 animate-pulse',
  critical: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
  warning: 'bg-amber-100 text-amber-800 border-amber-300',
  normal: 'bg-slate-100 text-slate-600 border-slate-200',
  none: 'bg-slate-50 text-slate-400 border-slate-200',
};

const TONE_ICON: Record<DeadlineInfo['tone'], React.ReactNode> = {
  overdue: <AlertTriangle className="w-3 h-3" />,
  critical: <AlarmClock className="w-3 h-3" />,
  warning: <Clock className="w-3 h-3" />,
  normal: <Clock className="w-3 h-3" />,
  none: <Clock className="w-3 h-3" />,
};

export function DeadlineBadge({ info, className = '' }: { info: DeadlineInfo; className?: string }) {
  if (!info.hasDeadline) {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${TONE_STYLES.none} ${className}`}>
        {TONE_ICON.none}
        <span>Sabit Süre Yok</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${TONE_STYLES[info.tone]} ${className}`}>
      {TONE_ICON[info.tone]}
      <span>{info.label}</span>
    </span>
  );
}
