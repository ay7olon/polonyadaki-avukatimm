import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Lock, 
  Send, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Building, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  Plus,
  Eye,
  Loader2
} from 'lucide-react';
import { BackLink } from '../components/BackLink';
import { LegalCase, CaseStatus, CaseDocument, ScreenId } from '../types';
import { getSignedDocumentUrl } from '../lib/storage';
import { useCaseMessages } from '../hooks/useCaseMessages';
import { LawyerOption } from '../hooks/useLawyers';
import { useToast } from '../hooks/useToast';

interface AdminCaseDetailScreenProps {
  currentCase: LegalCase;
  currentUserId: string;
  lawyers: LawyerOption[];
  onUpdateCaseStatus: (caseId: string, newStatus: CaseStatus) => void | Promise<void>;
  onApproveDocument: (caseId: string, docId: string) => void | Promise<void>;
  onRejectDocument: (caseId: string, docId: string, reason: string) => void | Promise<void>;
  onAddInternalNote: (caseId: string, noteText: string) => void | Promise<void>;
  onAssignLawyer: (caseId: string, lawyerId: string) => void | Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const AdminCaseDetailScreen: React.FC<AdminCaseDetailScreenProps> = ({
  currentCase,
  currentUserId,
  lawyers,
  onUpdateCaseStatus,
  onApproveDocument,
  onRejectDocument,
  onAddInternalNote,
  onAssignLawyer,
  onNavigate,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [adminChatText, setAdminChatText] = useState('');
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [sendingChat, setSendingChat] = useState(false);
  const [assigningLawyer, setAssigningLawyer] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const [addingNote, setAddingNote] = useState(false);
  const { showError } = useToast();

  const { messages, sendMessage } = useCaseMessages(currentCase.id, {
    clientName: currentCase.clientName,
    lawyerName: currentCase.assignedLawyer,
    lawyerAvatar: currentCase.lawyerAvatar,
  });

  const handleViewDocument = async (docId: string, storagePath?: string) => {
    if (!storagePath) return;
    setViewingDocId(docId);
    const url = await getSignedDocumentUrl(storagePath);
    setViewingDocId(null);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleApproveClick = async (docId: string) => {
    setProcessingDocId(docId);
    await onApproveDocument(currentCase.id, docId);
    setProcessingDocId(null);
  };

  const handleRejectSubmit = async (docId: string) => {
    if (!rejectionReason.trim()) return;
    setProcessingDocId(docId);
    await onRejectDocument(currentCase.id, docId, rejectionReason);
    setProcessingDocId(null);
    setRejectingDocId(null);
    setRejectionReason('');
  };

  const handleStatusChange = async (newStatus: CaseStatus) => {
    setUpdatingStatus(true);
    await onUpdateCaseStatus(currentCase.id, newStatus);
    setUpdatingStatus(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setAddingNote(true);
    await onAddInternalNote(currentCase.id, newNoteText);
    setAddingNote(false);
    setNewNoteText('');
  };

  const handleAssignLawyerChange = async (lawyerId: string) => {
    if (!lawyerId) return;
    setAssigningLawyer(true);
    await onAssignLawyer(currentCase.id, lawyerId);
    setAssigningLawyer(false);
  };

  const handleAdminChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatText.trim()) return;
    setSendingChat(true);
    const { error } = await sendMessage(currentUserId, 'lawyer', adminChatText.trim());
    if (error) showError(`Mesaj gönderilemedi: ${error}`);
    setAdminChatText('');
    setSendingChat(false);
  };

  return (
    <div className="min-h-screen bg-canvas text-navy py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Top Header & Quick Navigation */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#d7dee8] pb-6">
        <div className="space-y-1">
          <BackLink fallbackTo="/admin/cases" label="Admin dosya listesine dön" className="mb-2" />
          
          <div className="flex items-center space-x-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold font-display text-navy">Avukat İnceleme Paneli</h1>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-navy text-white shadow-sm">
              {currentCase.caseNumber}
            </span>
          </div>
          <p className="text-xs text-[#5b6b7c]">
            Müşteri: <strong className="text-navy">{currentCase.clientName}</strong> • {currentCase.caseType} ({currentCase.city})
          </p>
        </div>

        {/* Process Status & Lawyer Assignment Widgets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#d7dee8] text-xs shadow-sm w-full sm:w-auto min-w-0">
            <span className="font-bold text-navy shrink-0">Avukat Ata:</span>
            <select
              value={currentCase.assignedLawyerId ?? ''}
              onChange={e => handleAssignLawyerChange(e.target.value)}
              disabled={assigningLawyer}
              className="px-3 py-1.5 rounded-xl bg-canvas border border-[#d7dee8] font-bold text-navy focus:outline-none focus:border-navy disabled:opacity-60 min-w-0 w-full sm:w-auto"
            >
              <option value="" disabled>Avukat Seçin</option>
              {lawyers.map(l => (
                <option key={l.id} value={l.id}>{l.fullName}</option>
              ))}
            </select>
            {assigningLawyer && <Loader2 className="w-3.5 h-3.5 text-[#5b6b7c] animate-spin" />}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#d7dee8] text-xs shadow-sm w-full sm:w-auto min-w-0">
            <span className="font-bold text-navy shrink-0">Süreç Durumu Değiştir:</span>
            <select
              value={currentCase.status}
              onChange={e => handleStatusChange(e.target.value as CaseStatus)}
              disabled={updatingStatus}
              className="px-3 py-1.5 rounded-xl bg-canvas border border-[#d7dee8] font-bold text-navy focus:outline-none focus:border-navy disabled:opacity-60 min-w-0 w-full sm:w-auto"
            >
              <option value="received">Başvuru Alındı</option>
              <option value="assigned">Avukat Atandı</option>
              <option value="in_review">İnceleniyor</option>
              <option value="pending_docs">Ek Belge Bekleniyor</option>
              <option value="submitted">Valiliğe Sunuldu</option>
              <option value="completed">Sonuçlandı (Olumlu)</option>
              <option value="rejected">Reddedildi (Odwołanie)</option>
            </select>
            {updatingStatus && <Loader2 className="w-3.5 h-3.5 text-[#5b6b7c] animate-spin" />}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CLIENT SUMMARY + FORM ANSWERS + DOCUMENTS + INTERNAL NOTES (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. CLIENT INFO SUMMARY CARD */}
          <div className="bg-white border border-[#d7dee8] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-navy uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-gold" />
              <span>Müşteri İletişim & Statü Bilgileri</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-navy-soft p-4 rounded-xl border border-[#d7dee8]">
              <div>
                <span className="text-[#5b6b7c] block font-medium">E-posta</span>
                <span className="font-bold text-navy">{currentCase.clientEmail}</span>
              </div>
              <div>
                <span className="text-[#5b6b7c] block font-medium">Telefon</span>
                <span className="font-bold text-navy">{currentCase.clientPhone}</span>
              </div>
              <div>
                <span className="text-[#5b6b7c] block font-medium">Polonya Şehir</span>
                <span className="font-bold text-navy">{currentCase.city}</span>
              </div>
            </div>

            {/* Form Answers Grid */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-navy">Müşterinin Doldurduğu Başvuru Formu Yanıtları:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-navy">
                {Object.entries(currentCase.formSummary).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-navy-soft border border-[#d7dee8]">
                    <span className="text-[#5b6b7c] text-[11px] block font-medium">{key}:</span>
                    <span className="font-bold break-words">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. UPLOADED DOCUMENTS APPROVE / REJECT SECTION */}
          <div className="bg-white border border-[#d7dee8] rounded-2xl p-6 shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-[#d7dee8] pb-3">
              <h3 className="font-extrabold text-sm text-navy flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gold" />
                <span>Yüklü Müşteri Belgeleri Denetimi</span>
              </h3>
              <span className="text-[#5b6b7c] font-semibold">{currentCase.documents.length} Evrak</span>
            </div>

            <div className="space-y-3">
              {currentCase.documents.map(doc => (
                <div key={doc.id} className="p-4 rounded-xl bg-navy-soft border border-[#d7dee8] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white text-navy border border-[#d7dee8] shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-navy">{doc.name}</h4>
                        <p className="text-[11px] text-[#5b6b7c]">Yüklenme: {doc.uploadedAt} • {doc.size}</p>
                      </div>
                    </div>

                    {/* Status badge & Actions */}
                    <div className="flex items-center space-x-2">
                      {doc.fileUrl && (
                        <button
                          onClick={() => handleViewDocument(doc.id, doc.fileUrl)}
                          disabled={viewingDocId === doc.id}
                          className="p-1.5 rounded-lg text-[#5b6b7c] hover:text-navy hover:bg-white border border-transparent hover:border-[#d7dee8] transition"
                          title="Belgeyi Görüntüle"
                        >
                          {viewingDocId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                      {doc.status === 'approved' && (
                        <span className="px-3 py-1 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Onaylandı</span>
                        </span>
                      )}

                      {doc.status === 'rejected' && (
                        <span className="px-3 py-1 rounded bg-red-100 border border-red-300 text-red-800 font-bold text-xs flex items-center space-x-1">
                          <XCircle className="w-3.5 h-3.5 text-red-700" />
                          <span>Reddedildi</span>
                        </span>
                      )}

                      {doc.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveClick(doc.id)}
                            disabled={processingDocId === doc.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs transition shadow-xs flex items-center space-x-1.5"
                          >
                            {processingDocId === doc.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>Onayla</span>
                          </button>
                          <button
                            onClick={() => setRejectingDocId(doc.id)}
                            disabled={processingDocId === doc.id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-xs transition shadow-xs"
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reject Prompt Reason Textarea */}
                  {rejectingDocId === doc.id && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs animate-in fade-in">
                      <label className="font-bold text-red-900 block">Red Gerekçesi (Müşteriye İletilecek):</label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Örn: Ev sahibinin noter onaylı imzası eksik veya süresi dolmuş..."
                        className="w-full p-2.5 rounded-lg bg-white border border-red-300 text-navy text-xs focus:outline-none font-medium"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setRejectingDocId(null)}
                          disabled={processingDocId === doc.id}
                          className="px-2.5 py-1 rounded-lg border border-[#d7dee8] bg-white text-navy font-bold text-xs disabled:opacity-60"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleRejectSubmit(doc.id)}
                          disabled={processingDocId === doc.id || !rejectionReason.trim()}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5"
                        >
                          {processingDocId === doc.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>Reddi Kaydet</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {doc.rejectionReason && (
                    <p className="text-[11px] text-red-900 bg-red-50 p-2.5 rounded-lg border border-red-200">
                      <strong>Kayıtlı Red Sebebi:</strong> {doc.rejectionReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. INTERNAL LAWYER NOTES PANEL (CONFIDENTIAL LAWYER NOTES) */}
          <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center space-x-2 text-amber-900">
                <Lock className="w-4 h-4 text-amber-700" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">İç Avukat Notları</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[10px] uppercase shadow-xs">
                Sadece Avukatlar Görür (Gizli)
              </span>
            </div>

            {/* Existing Internal Notes */}
            <div className="space-y-2">
              {currentCase.internalNotes.length === 0 ? (
                <p className="text-amber-800 italic text-[11px]">Henüz iç not düşülmedi.</p>
              ) : (
                currentCase.internalNotes.map(note => (
                  <div key={note.id} className="p-3 rounded-xl bg-white border border-amber-200 text-navy space-y-1 shadow-xs">
                    <div className="flex justify-between text-[10px] text-amber-900 font-bold">
                      <span>{note.author}</span>
                      <span>{note.date}</span>
                    </div>
                    <p className="leading-relaxed text-xs font-medium">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add New Note Input */}
            <form onSubmit={handleAddNote} className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Avukat ekibine gizli duruşma/valilik notu ekleyin..."
                disabled={addingNote}
                className="flex-1 p-2.5 rounded-xl bg-white border border-amber-300 text-navy placeholder-amber-800/50 text-xs focus:outline-none font-medium disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={addingNote || !newNoteText.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1"
              >
                {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Not Ekle</span>
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: CLIENT CHAT STREAM (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-[#d7dee8] rounded-2xl p-5 shadow-sm space-y-4 text-xs h-[580px] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-[#d7dee8] pb-3">
              <div className="flex items-center space-x-2 text-navy">
                <MessageSquare className="w-4 h-4 text-gold" />
                <h4 className="font-bold text-navy text-xs">Müşteriyle Yazışma</h4>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl space-y-1 ${
                    msg.senderRole === 'lawyer'
                      ? 'bg-navy-soft border border-navy/10 text-navy ml-4'
                      : 'bg-canvas border border-[#d7dee8] text-navy mr-4'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-[#5b6b7c] font-bold">
                    <span>{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Admin Quick Reply Form */}
            <form onSubmit={handleAdminChatSubmit} className="pt-2 border-t border-[#d7dee8] flex items-center space-x-2">
              <input
                type="text"
                value={adminChatText}
                onChange={e => setAdminChatText(e.target.value)}
                placeholder="Müşteriye avukat cevabı yazın..."
                className="flex-1 p-2.5 rounded-xl bg-canvas border border-[#d7dee8] text-xs text-navy focus:outline-none focus:border-navy font-medium"
              />
              <button
                type="submit"
                disabled={sendingChat}
                className="p-2.5 rounded-xl bg-navy hover:bg-navy-2 disabled:opacity-60 text-white font-bold transition shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
