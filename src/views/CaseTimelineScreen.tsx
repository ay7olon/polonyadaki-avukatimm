import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  Upload, 
  MessageSquare, 
  ArrowLeft, 
  UserCheck, 
  Building,
  ShieldCheck,
  Calendar,
  Loader2,
  Eye
} from 'lucide-react';
import { LegalCase, ScreenId } from '../types';
import { getSignedDocumentUrl } from '../lib/storage';
import { useNowTick } from '../hooks/useNowTick';
import { getDeadlineInfo, formatDeadlineDateTime } from '../lib/deadline';
import { DeadlineBadge } from '../components/DeadlineBadge';

interface CaseTimelineScreenProps {
  currentCase: LegalCase;
  onNavigate: (screen: ScreenId, caseId?: string) => void;
  onUploadDocument: (caseId: string, file: File) => Promise<void>;
}

export const CaseTimelineScreen: React.FC<CaseTimelineScreenProps> = ({
  currentCase,
  onNavigate,
  onUploadDocument,
}) => {
  const [uploading, setUploading] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const now = useNowTick();
  const deadlineInfo = getDeadlineInfo(currentCase.deadlineAt, now);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    await onUploadDocument(currentCase.id, file);
    setUploading(false);
  };

  const handleViewDocument = async (docId: string, storagePath?: string) => {
    if (!storagePath) return;
    setViewingDocId(docId);
    const url = await getSignedDocumentUrl(storagePath);
    setViewingDocId(null);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div className="min-h-screen bg-canvas text-navy py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Top Header & Back Button */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#d7dee8] pb-6">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('client_dashboard')}
            className="text-xs text-[#5b6b7c] hover:text-navy flex items-center space-x-1 mb-2 font-bold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Müşteri Paneline Dön</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="font-display text-2xl font-semibold text-navy">Süreç Takip Kartı</h1>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-[#d7dee8] text-gold shadow-sm">
              {currentCase.caseNumber}
            </span>
          </div>
          <p className="text-xs text-[#5b6b7c]">
            {currentCase.caseType} • <span className="text-navy font-bold">{currentCase.city}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('messaging', currentCase.id)}
            className="px-4 py-2 rounded-md bg-navy hover:bg-navy-2 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4 text-gold" />
            <span>Avukata Mesaj Yaz</span>
          </button>
        </div>
      </div>

      {/* Deadline Reminder Banner */}
      {deadlineInfo.hasDeadline && (
        <div className={`max-w-5xl mx-auto rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border shadow-sm ${
          deadlineInfo.isOverdue
            ? 'bg-red-600 border-red-700 text-white'
            : deadlineInfo.tone === 'critical'
            ? 'bg-red-50 border-red-200 text-red-900'
            : deadlineInfo.tone === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-navy-soft border-[#d7dee8] text-[#5b6b7c]'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-bold">
            <Calendar className="w-4 h-4" />
            <span>
              {deadlineInfo.isOverdue ? 'Yasal son tarih geçti, avukatınızla iletişime geçin' : 'Yasal Son Tarih'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono font-semibold">{formatDeadlineDateTime(currentCase.deadlineAt)}</span>
            <DeadlineBadge info={deadlineInfo} />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: VERTICAL TIMELINE STEPPER (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#d7dee8] rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between border-b border-[#d7dee8] pb-4">
            <h3 className="font-display font-semibold text-base text-navy flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gold" />
              <span>Canlı Kronolojik Dosya Süreci</span>
            </h3>
            <span className="text-xs font-bold text-[#5b6b7c] bg-navy-soft px-2.5 py-1 rounded-full">İlerleme: %{currentCase.progressPercent}</span>
          </div>

          {/* Dikey Timeline Stepper */}
          <div className="relative pl-6 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d7dee8]">
            {currentCase.timeline.map((stepItem, idx) => {
              const isCompleted = stepItem.status === 'completed';
              const isCurrent = stepItem.status === 'current';

              return (
                <div key={stepItem.id} className="relative group">
                  
                  {/* Stepper Dot */}
                  <div className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-navy border-white text-white shadow-md ring-4 ring-navy-soft'
                      : 'bg-white border-[#d7dee8] text-[#5b6b7c]'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                  </div>

                  {/* Step Card Content */}
                  <div className={`p-4 rounded-lg border transition ${
                    isCurrent
                      ? 'bg-navy-soft/60 border-navy/20 shadow-sm'
                      : isCompleted
                      ? 'bg-navy-soft border-[#d7dee8]'
                      : 'bg-white border-[#d7dee8] opacity-60'
                  }`}>
                    <div className="flex items-start justify-between">
                      <h4 className={`font-bold text-sm ${isCurrent ? 'text-navy' : isCompleted ? 'text-navy' : 'text-[#5b6b7c]'}`}>
                        {stepItem.title}
                      </h4>
                      {stepItem.date && (
                        <span className="text-[10px] font-bold text-[#5b6b7c] bg-white px-2 py-0.5 rounded border border-[#d7dee8] shadow-xs">
                          {stepItem.date}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-[#5b6b7c] mt-1 leading-relaxed">
                      {stepItem.description}
                    </p>

                    {stepItem.actor && (
                      <div className="mt-2 text-[10px] text-[#5b6b7c] font-medium">
                        İşlemi Yapan: <span className="text-navy font-bold">{stepItem.actor}</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: LAWYER PROFILE & DOCUMENTS (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Assigned Lawyer Card */}
          <div className="bg-white border border-[#d7dee8] rounded-lg p-5 space-y-4 shadow-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gold">Atanan Sorumlu Avukat</h4>
            <div className="flex items-center space-x-3">
              <img
                src={currentCase.lawyerAvatar}
                alt={currentCase.assignedLawyer}
                className="w-12 h-12 rounded-full object-cover border-2 border-navy shadow-sm"
              />
              <div>
                <h5 className="font-bold text-sm text-navy">{currentCase.assignedLawyer}</h5>
                <p className="text-xs text-[#5b6b7c]">Varşova Barosu Kayıtlı</p>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">● Çevrimiçi</div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('messaging', currentCase.id)}
              className="w-full py-2 rounded-md bg-navy-soft hover:bg-[#d7dee8] text-navy font-bold text-xs border border-[#d7dee8] transition"
            >
              Doğrudan Mesaj Gönder
            </button>
          </div>

          {/* Uploaded Documents Grid & Status */}
          <div className="bg-white border border-[#d7dee8] rounded-lg p-5 space-y-4 shadow-sm text-xs">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gold">Dosya Evrakları</h4>
              <span className="text-[#5b6b7c] font-semibold">{currentCase.documents.length} Evrak</span>
            </div>

            <div className="space-y-2">
              {currentCase.documents.length === 0 && (
                <p className="text-[#5b6b7c] italic text-[11px]">Henüz evrak yüklemediniz.</p>
              )}
              {currentCase.documents.map(doc => (
                <div key={doc.id} className="p-3 rounded-lg bg-navy-soft border border-[#d7dee8] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-navy shrink-0" />
                      <span className="font-semibold text-navy truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {doc.status === 'approved' && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Onaylı</span>}
                      {doc.status === 'pending' && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">İncelemede</span>}
                      {doc.status === 'rejected' && <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">Reddedildi</span>}
                      {doc.fileUrl && (
                        <button
                          onClick={() => handleViewDocument(doc.id, doc.fileUrl)}
                          disabled={viewingDocId === doc.id}
                          className="p-1 rounded text-[#5b6b7c] hover:text-navy hover:bg-white transition"
                          title="Belgeyi Görüntüle"
                        >
                          {viewingDocId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason if any */}
                  {doc.rejectionReason && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-[10px] text-red-900">
                      <strong>Avukat Notu:</strong> {doc.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Action Button */}
            <label className="w-full py-2.5 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60">
              <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploading ? 'Yükleniyor...' : 'Yeni Evrak Yükle'}</span>
            </label>
          </div>

        </div>

      </div>
    </div>
  );
};
