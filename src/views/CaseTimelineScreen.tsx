import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  MessageSquare,
  Loader2,
  Eye,
} from 'lucide-react';
import { BackLink } from '../components/BackLink';
import { CaseStatus, LegalCase, ScreenId } from '../types';
import { getSignedDocumentUrl } from '../lib/storage';

interface CaseTimelineScreenProps {
  currentCase: LegalCase;
  onNavigate: (screen: ScreenId, caseId?: string) => void;
  onUploadDocument: (caseId: string, file: File) => Promise<void>;
}

function statusLabel(status: CaseStatus): { text: string; className: string } {
  switch (status) {
    case 'pending_docs':
      return { text: 'Ek Belge Bekleniyor', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'in_review':
      return { text: 'İnceleniyor', className: 'bg-amber-100 text-amber-900 border-amber-200' };
    case 'submitted':
      return { text: 'Valiliğe Sunuldu', className: 'bg-sky-100 text-sky-900 border-sky-200' };
    case 'completed':
      return { text: 'Sonuçlandı', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'rejected':
      return { text: 'Reddedildi', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'assigned':
      return { text: 'Avukat Atandı', className: 'bg-navy-soft text-navy border-[#d7dee8]' };
    default:
      return { text: 'Başvuru Alındı', className: 'bg-navy-soft text-navy border-[#d7dee8]' };
  }
}

export const CaseTimelineScreen: React.FC<CaseTimelineScreenProps> = ({
  currentCase,
  onNavigate,
  onUploadDocument,
}) => {
  const [uploading, setUploading] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rejectedDocs = useMemo(
    () => currentCase.documents.filter((d) => d.status === 'rejected'),
    [currentCase.documents]
  );
  const pendingDocsStepNote = useMemo(() => {
    const step = currentCase.timeline.find(
      (s) => s.title === 'Ek belge bekleniyor' && s.status === 'current'
    );
    return step?.description?.trim() || null;
  }, [currentCase.timeline]);
  const needsDocs = currentCase.status === 'pending_docs' || rejectedDocs.length > 0;
  const statusBadge = statusLabel(currentCase.status);

  useEffect(() => {
    if (!needsDocs) return;
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [needsDocs, currentCase.id]);

  const focusUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    fileInputRef.current?.click();
  };

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
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#d7dee8] pb-6">
        <div className="space-y-1">
          <BackLink fallbackTo="/app" label="Müşteri paneline dön" className="mb-2" />
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="font-display text-2xl font-semibold text-navy">Süreç Takip Kartı</h1>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-[#d7dee8] text-gold shadow-sm">
              {currentCase.caseNumber}
            </span>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${statusBadge.className}`}
            >
              {statusBadge.text}
            </span>
          </div>
          <p className="text-xs text-[#5b6b7c]">
            {currentCase.caseType} • <span className="text-navy font-bold">{currentCase.city}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onNavigate('messaging', currentCase.id)}
            className="px-4 py-2 rounded-md bg-navy hover:bg-navy-2 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4 text-gold" />
            <span>Avukata Mesaj Yaz</span>
          </button>
        </div>
      </div>

      {needsDocs && (
        <div className="max-w-5xl mx-auto rounded-lg border border-red-200 bg-red-50 px-4 py-4 sm:px-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              <h2 className="font-bold text-sm text-red-900">Ek Belge Bekleniyor</h2>
              <p className="text-xs text-red-800/90 leading-relaxed">
                {pendingDocsStepNote ??
                  'Valilik reddini önlemek için eksik veya düzeltilmesi istenen belgeleri bu ekrandan yükleyiniz. Avukatınızın notlarını aşağıda görebilirsiniz.'}
              </p>
            </div>
          </div>
          {rejectedDocs.length > 0 && (
            <ul className="space-y-2 pl-8">
              {rejectedDocs.map((doc) => (
                <li
                  key={doc.id}
                  className="text-xs text-red-900 bg-white/70 border border-red-100 rounded-md px-3 py-2"
                >
                  <span className="font-bold">{doc.name}</span>
                  {doc.rejectionReason ? (
                    <span className="block mt-0.5 text-red-800">
                      Avukat notu: {doc.rejectionReason}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={focusUpload}
            className="ml-8 px-4 py-2 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-xs shadow-sm transition"
          >
            Evrak Yükle
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-[#d7dee8] rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#d7dee8] pb-4">
            <h3 className="font-display font-semibold text-base text-navy flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gold" />
              <span>Canlı Kronolojik Dosya Süreci</span>
            </h3>
            <span className="text-xs font-bold text-[#5b6b7c] bg-navy-soft px-2.5 py-1 rounded-full">
              İlerleme: %{currentCase.progressPercent}
            </span>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d7dee8]">
            {currentCase.timeline.map((stepItem, idx) => {
              const isCompleted = stepItem.status === 'completed';
              const isCurrent = stepItem.status === 'current';

              return (
                <div key={stepItem.id} className="relative group">
                  <div
                    className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : isCurrent
                          ? 'bg-navy border-white text-white shadow-md ring-4 ring-navy-soft'
                          : 'bg-white border-[#d7dee8] text-[#5b6b7c]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border transition ${
                      isCurrent
                        ? 'bg-navy-soft/60 border-navy/20 shadow-sm'
                        : isCompleted
                          ? 'bg-navy-soft border-[#d7dee8]'
                          : 'bg-white border-[#d7dee8] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`font-bold text-sm ${
                          isCurrent ? 'text-navy' : isCompleted ? 'text-navy' : 'text-[#5b6b7c]'
                        }`}
                      >
                        {stepItem.title}
                      </h4>
                      {stepItem.date && (
                        <span className="text-[10px] font-bold text-[#5b6b7c] bg-white px-2 py-0.5 rounded border border-[#d7dee8] shadow-xs shrink-0">
                          {stepItem.date}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#5b6b7c] mt-1 leading-relaxed">{stepItem.description}</p>

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

        <div className="lg:col-span-4 space-y-6">
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
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('messaging', currentCase.id)}
              className="w-full py-2 rounded-md bg-navy-soft hover:bg-[#d7dee8] text-navy font-bold text-xs border border-[#d7dee8] transition"
            >
              Doğrudan Mesaj Gönder
            </button>
          </div>

          <div
            ref={uploadSectionRef}
            id="evrak-yukle"
            className={`bg-white border rounded-lg p-5 space-y-4 shadow-sm text-xs ${
              needsDocs ? 'border-gold ring-2 ring-gold/30' : 'border-[#d7dee8]'
            }`}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gold">Dosya Evrakları</h4>
              <span className="text-[#5b6b7c] font-semibold">{currentCase.documents.length} Evrak</span>
            </div>

            <div className="space-y-2">
              {currentCase.documents.length === 0 && (
                <p className="text-[#5b6b7c] italic text-[11px]">Henüz evrak yüklenmedi.</p>
              )}
              {currentCase.documents.map((doc) => (
                <div key={doc.id} className="p-3 rounded-lg bg-navy-soft border border-[#d7dee8] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 truncate pr-2 min-w-0">
                      <FileText className="w-4 h-4 text-navy shrink-0" />
                      <span className="font-semibold text-navy truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {doc.type === 'lawyer_share' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-navy text-white font-bold">
                          Avukat
                        </span>
                      )}
                      {doc.status === 'approved' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Onaylı
                        </span>
                      )}
                      {doc.status === 'pending' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          İncelemede
                        </span>
                      )}
                      {doc.status === 'rejected' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                          Reddedildi
                        </span>
                      )}
                      {doc.fileUrl && (
                        <button
                          type="button"
                          onClick={() => handleViewDocument(doc.id, doc.fileUrl)}
                          disabled={viewingDocId === doc.id}
                          className="p-1 rounded text-[#5b6b7c] hover:text-navy hover:bg-white transition"
                          title="Belgeyi Görüntüle"
                        >
                          {viewingDocId === doc.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {doc.rejectionReason && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-[10px] text-red-900">
                      <strong>Avukat Notu:</strong> {doc.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <label className="w-full py-2.5 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploading ? 'Yükleniyor...' : 'Yeni Evrak Yükle'}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
