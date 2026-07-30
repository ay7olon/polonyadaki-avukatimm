import React, { useState } from 'react';
import { Code2, X, Copy, Check, ChevronRight, Sparkles, Layout, Palette, Layers, Terminal } from 'lucide-react';
import { ScreenId } from '../types';
import { SCREEN_DESIGN_NOTES } from '../data/designNotes';

interface CursorNotesDrawerProps {
  activeScreen: ScreenId;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screenId: ScreenId) => void;
}

export const CursorNotesDrawer: React.FC<CursorNotesDrawerProps> = ({
  activeScreen,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);
  const note = SCREEN_DESIGN_NOTES[activeScreen];

  if (!isOpen || !note) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(note.devNotesForCursor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-800 overflow-hidden animate-in slide-in-from-right duration-300 font-sans">
      
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <span>Cursor & Dev UI/UX Referans Notu</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-white font-extrabold uppercase shadow-xs">
                Ekran #{note.screenNumber}
              </span>
            </h3>
            <p className="text-xs text-red-600 font-bold">
              {note.screenName}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs leading-relaxed">
        
        {/* Screen Purpose */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="flex items-center space-x-1.5 text-red-600 font-bold uppercase text-[10px] tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ekran Amacı & Hedef Kitle ({note.targetUser})</span>
          </div>
          <p className="text-slate-700 font-medium">{note.purpose}</p>
        </div>

        {/* Layout & Grid Structure */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
            <Layout className="w-3.5 h-3.5 text-red-600" />
            <span>Yerleşim Düzeni & Izgara (Layout & Grid)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 font-mono text-[11px] font-medium">
            {note.layoutStructure}
          </div>
        </div>

        {/* Color Palette & UX Rationale */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
            <Palette className="w-3.5 h-3.5 text-red-600" />
            <span>Renk Paleti & Hukuki Güven Psikolojisi</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 font-medium">
            {note.colorPaletteNotes}
          </div>
        </div>

        {/* Component Architecture */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
            <Layers className="w-3.5 h-3.5 text-red-600" />
            <span>Bileşen Yapısı (React Components)</span>
          </div>
          <ul className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700">
            {note.componentArchitecture.map((comp, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span className="font-mono text-[11px] font-semibold">{comp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Copyable Code Comment Block for Cursor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-red-600" />
              <span>Cursor Prompt / Dev Doc Snippet</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
          </div>
          <pre className="bg-slate-900 p-3.5 rounded-xl border border-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
            {note.devNotesForCursor}
          </pre>
        </div>

        {/* Screen Switcher Shortcuts */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Diğer Ekran Tasarım Notlarını İncele:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              ['landing', '1. Ana Sayfa'],
              ['auth', '2. Kayıt/Giriş'],
              ['client_dashboard', '3. Müşteri Dashboard'],
              ['new_application', '4. Yeni Başvuru'],
              ['case_timeline', '5. Süreç Takip'],
              ['messaging', '6. Mesajlaşma'],
              ['admin_case_list', '7. Admin Tablo'],
              ['admin_case_detail', '8. Admin Detay'],
            ] as const).map(([sId, label]) => (
              <button
                key={sId}
                onClick={() => onNavigate(sId)}
                className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition ${
                  activeScreen === sId ? 'bg-red-50 text-red-700 font-bold border border-red-200' : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{label}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
