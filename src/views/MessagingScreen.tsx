import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  FileText, 
  ShieldCheck, 
  Search, 
  ArrowLeft, 
  CheckCheck, 
  User, 
  Smile,
  Info
} from 'lucide-react';
import { LegalCase, ChatMessage, ScreenId } from '../types';

interface MessagingScreenProps {
  cases: LegalCase[];
  activeCaseId?: string;
  onNavigate: (screen: ScreenId) => void;
  onSendMessage: (caseId: string, messageText: string, attachmentName?: string) => void;
}

export const MessagingScreen: React.FC<MessagingScreenProps> = ({
  cases,
  activeCaseId,
  onNavigate,
  onSendMessage,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(activeCaseId || cases[0]?.id || 'case-101');
  const [inputText, setInputText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | undefined>(undefined);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFileName) return;

    onSendMessage(selectedCaseId, inputText, attachedFileName);
    setInputText('');
    setAttachedFileName(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden font-sans">
      
      {/* 1. LEFT CONVERSATIONS / CASE LIST (320px) */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Avukat Mesajları</h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold border border-red-200">
              Canlı Takip
            </span>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Dosya no veya avukat ara..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
            />
          </div>
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {cases.map(c => {
            const lastMsg = c.messages[c.messages.length - 1];
            const isSelected = c.id === selectedCaseId;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`p-4 cursor-pointer transition flex items-start space-x-3 ${
                  isSelected ? 'bg-red-50/60 border-l-4 border-red-600' : 'hover:bg-slate-50'
                }`}
              >
                <img
                  src={c.lawyerAvatar}
                  alt={c.assignedLawyer}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{c.assignedLawyer}</h4>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{c.caseNumber}</span>
                  </div>
                  <p className="text-[11px] text-red-600 font-bold truncate">{c.caseType}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {lastMsg ? lastMsg.text : 'Yeni konuşma başlatıldı.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 2. RIGHT CHAT WINDOW AREA */}
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
        
        {/* Chat Header Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <img
              src={selectedCase.lawyerAvatar}
              alt={selectedCase.assignedLawyer}
              className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm text-slate-900">{selectedCase.assignedLawyer}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600" title="Varşova Barosu Kayıtlı Avukat" />
              </div>
              <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                <span className="text-emerald-600 font-bold">● Çevrimiçi</span>
                <span>•</span>
                <span className="font-mono font-bold">Dosya: {selectedCase.caseNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('case_timeline')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1 transition border border-slate-200"
          >
            <Info className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Süreç Kartını Gör</span>
          </button>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Encryption & Legal Disclaimer Banner */}
          <div className="max-w-md mx-auto p-3 rounded-xl bg-white border border-slate-200 text-center space-y-1 text-slate-600 text-[11px] shadow-xs">
            <p className="font-bold text-slate-900">🔒 Uçtan Uca Güvenli Avukat-Müvekkil Yazışması</p>
            <p>Bu sohbette paylaşılan evraklar Polonya Avukatlık Meslek Sırrı (Tajemnica adwokacka) koruması altındadır.</p>
          </div>

          {selectedCase.messages.map(msg => {
            const isMe = msg.senderRole === 'client';

            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={msg.avatar || selectedCase.lawyerAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mb-1 shadow-xs"
                  />
                )}

                <div className={`max-w-md p-3.5 rounded-2xl space-y-1.5 shadow-xs ${
                  isMe
                    ? 'bg-slate-900 text-white rounded-br-none border border-slate-900'
                    : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
                }`}>
                  
                  <div className={`flex items-center justify-between text-[10px] space-x-3 ${isMe ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="font-bold">{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="leading-relaxed text-xs">{msg.text}</p>

                  {/* Attachment if present */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="pt-2">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className={`p-2 rounded border flex items-center space-x-2 text-[11px] font-semibold ${
                          isMe ? 'bg-slate-800 border-slate-700 text-red-300' : 'bg-slate-50 border-slate-200 text-red-600'
                        }`}>
                          <FileText className="w-4 h-4" />
                          <span>{att.name} ({att.size})</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

        </div>

        {/* Chat Input Field */}
        <div className="p-4 bg-white border-t border-slate-200 shadow-sm">
          
          {attachedFileName && (
            <div className="mb-2 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
              <span className="font-bold">Ek Evrak: {attachedFileName}</span>
              <button onClick={() => setAttachedFileName(undefined)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center space-x-2">
            
            {/* Attachment Button */}
            <label className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer border border-slate-200 transition">
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachedFileName(e.target.files[0].name);
                  }
                }}
              />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Avukatınıza mesaj yazın veya evrak sorularınızı sorun..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-red-600 font-medium"
            />

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1"
            >
              <span>Gönder</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
