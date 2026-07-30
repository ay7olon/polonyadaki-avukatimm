import React from 'react';
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
  Calendar
} from 'lucide-react';
import { LegalCase, ScreenId } from '../types';

interface CaseTimelineScreenProps {
  currentCase: LegalCase;
  onNavigate: (screen: ScreenId, caseId?: string) => void;
}

export const CaseTimelineScreen: React.FC<CaseTimelineScreenProps> = ({
  currentCase,
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Top Header & Back Button */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('client_dashboard')}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 mb-2 font-bold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Müşteri Paneline Dön</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900">Süreç Takip Kartı</h1>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-red-600 shadow-sm">
              {currentCase.caseNumber}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {currentCase.caseType} • <span className="text-slate-900 font-bold">{currentCase.city}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('messaging', currentCase.id)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4 text-red-500" />
            <span>Avukata Mesaj Yaz</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: VERTICAL TIMELINE STEPPER (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-600" />
              <span>Canlı Kronolojik Dosya Süreci</span>
            </h3>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">İlerleme: %{currentCase.progressPercent}</span>
          </div>

          {/* Dikey Timeline Stepper */}
          <div className="relative pl-6 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
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
                      ? 'bg-red-600 border-white text-white shadow-md ring-4 ring-red-100 animate-pulse'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                  </div>

                  {/* Step Card Content */}
                  <div className={`p-4 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-red-50/50 border-red-200 shadow-sm'
                      : isCompleted
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}>
                    <div className="flex items-start justify-between">
                      <h4 className={`font-bold text-sm ${isCurrent ? 'text-red-950' : isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                        {stepItem.title}
                      </h4>
                      {stepItem.date && (
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                          {stepItem.date}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {stepItem.description}
                    </p>

                    {stepItem.actor && (
                      <div className="mt-2 text-[10px] text-slate-500 font-medium">
                        İşlemi Yapan: <span className="text-slate-900 font-bold">{stepItem.actor}</span>
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-red-600">Atanan Sorumlu Avukat</h4>
            <div className="flex items-center space-x-3">
              <img
                src={currentCase.lawyerAvatar}
                alt={currentCase.assignedLawyer}
                className="w-12 h-12 rounded-full object-cover border-2 border-red-600 shadow-sm"
              />
              <div>
                <h5 className="font-bold text-sm text-slate-900">{currentCase.assignedLawyer}</h5>
                <p className="text-xs text-slate-500">Varşova Barosu Kayıtlı</p>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">● Çevrimiçi</div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('messaging', currentCase.id)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-200 transition"
            >
              Doğrudan Mesaj Gönder
            </button>
          </div>

          {/* Uploaded Documents Grid & Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm text-xs">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-red-600">Dosya Evrakları</h4>
              <span className="text-slate-500 font-semibold">{currentCase.documents.length} Evrak</span>
            </div>

            <div className="space-y-2">
              {currentCase.documents.map(doc => (
                <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">{doc.name}</span>
                    </div>
                    {doc.status === 'approved' && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Onaylı</span>}
                    {doc.status === 'pending' && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">İncelemede</span>}
                    {doc.status === 'rejected' && <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">Reddedildi</span>}
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
            <button
              onClick={() => onNavigate('new_application')}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Yeni Evrak Yükle</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
