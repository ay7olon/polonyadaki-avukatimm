import React, { useState } from 'react';
import { 
  ArrowLeft, 
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
  Plus
} from 'lucide-react';
import { LegalCase, CaseStatus, CaseDocument, ScreenId } from '../types';

interface AdminCaseDetailScreenProps {
  currentCase: LegalCase;
  onUpdateCaseStatus: (caseId: string, newStatus: CaseStatus) => void;
  onApproveDocument: (caseId: string, docId: string) => void;
  onRejectDocument: (caseId: string, docId: string, reason: string) => void;
  onAddInternalNote: (caseId: string, noteText: string) => void;
  onSendMessage: (caseId: string, messageText: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const AdminCaseDetailScreen: React.FC<AdminCaseDetailScreenProps> = ({
  currentCase,
  onUpdateCaseStatus,
  onApproveDocument,
  onRejectDocument,
  onAddInternalNote,
  onSendMessage,
  onNavigate,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [adminChatText, setAdminChatText] = useState('');

  const handleRejectSubmit = (docId: string) => {
    if (!rejectionReason.trim()) return;
    onRejectDocument(currentCase.id, docId, rejectionReason);
    setRejectingDocId(null);
    setRejectionReason('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddInternalNote(currentCase.id, newNoteText);
    setNewNoteText('');
  };

  const handleAdminChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatText.trim()) return;
    onSendMessage(currentCase.id, adminChatText);
    setAdminChatText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Top Header & Quick Navigation */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('admin_case_list')}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 mb-2 font-bold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dosya Cetveline Dön</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900">Avukat İnceleme Paneli</h1>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-900 text-white shadow-sm">
              {currentCase.caseNumber}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Müşteri: <strong className="text-slate-900">{currentCase.clientName}</strong> • {currentCase.caseType} ({currentCase.city})
          </p>
        </div>

        {/* Process Status Update Dropdown Widget */}
        <div className="flex items-center space-x-3 bg-white p-2.5 rounded-2xl border border-slate-200 text-xs shadow-sm">
          <span className="font-bold text-slate-700">Süreç Durumu Değiştir:</span>
          <select
            value={currentCase.status}
            onChange={e => onUpdateCaseStatus(currentCase.id, e.target.value as CaseStatus)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-red-700 focus:outline-none focus:border-red-600"
          >
            <option value="received">Başvuru Alındı</option>
            <option value="in_review">İnceleniyor</option>
            <option value="pending_docs">Ek Belge Bekleniyor</option>
            <option value="submitted">Valiliğe Sunuldu</option>
            <option value="completed">Sonuçlandı (Olumlu)</option>
            <option value="rejected">Reddedildi (Odwołanie)</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CLIENT SUMMARY + FORM ANSWERS + DOCUMENTS + INTERNAL NOTES (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. CLIENT INFO SUMMARY CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-red-700 uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Müşteri İletişim & Statü Bilgileri</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block font-medium">E-posta</span>
                <span className="font-bold text-slate-900">{currentCase.clientEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Telefon</span>
                <span className="font-bold text-slate-900">{currentCase.clientPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Polonya Şehir</span>
                <span className="font-bold text-slate-900">{currentCase.city}</span>
              </div>
            </div>

            {/* Form Answers Grid */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800">Müşterinin Doldurduğu Başvuru Formu Yanıtları:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-800">
                {Object.entries(currentCase.formSummary).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[11px] block font-medium">{key}:</span>
                    <span className="font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. UPLOADED DOCUMENTS APPROVE / REJECT SECTION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span>Yüklü Müşteri Belgeleri Denetimi</span>
              </h3>
              <span className="text-slate-500 font-semibold">{currentCase.documents.length} Evrak</span>
            </div>

            <div className="space-y-3">
              {currentCase.documents.map(doc => (
                <div key={doc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white text-red-600 border border-slate-200 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-[11px] text-slate-500">Yüklenme: {doc.uploadedAt} • {doc.size}</p>
                      </div>
                    </div>

                    {/* Status badge & Actions */}
                    <div className="flex items-center space-x-2">
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
                            onClick={() => onApproveDocument(currentCase.id, doc.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => setRejectingDocId(doc.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-xs"
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
                        className="w-full p-2.5 rounded-lg bg-white border border-red-300 text-slate-900 text-xs focus:outline-none font-medium"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setRejectingDocId(null)}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleRejectSubmit(doc.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
                        >
                          Reddi Kaydet
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
                  <div key={note.id} className="p-3 rounded-xl bg-white border border-amber-200 text-slate-900 space-y-1 shadow-xs">
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
                className="flex-1 p-2.5 rounded-xl bg-white border border-amber-300 text-slate-900 placeholder-amber-800/50 text-xs focus:outline-none font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Not Ekle</span>
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: CLIENT CHAT STREAM (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs h-[580px] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900">
                <MessageSquare className="w-4 h-4 text-red-600" />
                <h4 className="font-bold text-slate-900 text-xs">Müşteriyle Canlı Yazışma</h4>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">● Müşteri Aktif</span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {currentCase.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl space-y-1 ${
                    msg.senderRole === 'lawyer'
                      ? 'bg-red-50 border border-red-200 text-red-950 ml-4'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 mr-4'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Admin Quick Reply Form */}
            <form onSubmit={handleAdminChatSubmit} className="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                value={adminChatText}
                onChange={e => setAdminChatText(e.target.value)}
                placeholder="Müşteriye avukat cevabı yazın..."
                className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs"
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
