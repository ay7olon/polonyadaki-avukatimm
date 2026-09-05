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
  Info,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { LegalCase, ScreenId, UserRole } from '../types';
import { useCaseMessages } from '../hooks/useCaseMessages';
import { formatFileSize, uploadCaseDocumentFile } from '../lib/storage';
import { useToast } from '../hooks/useToast';
import { validateUploadFile } from '../lib/validation';

interface MessagingScreenProps {
  cases: LegalCase[];
  activeCaseId?: string;
  currentUserId: string;
  currentUserRole: UserRole;
  onNavigate: (screen: ScreenId) => void;
}

export const MessagingScreen: React.FC<MessagingScreenProps> = ({
  cases,
  activeCaseId,
  currentUserId,
  currentUserRole,
  onNavigate,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(activeCaseId || cases[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(activeCaseId));
  const [searchTerm, setSearchTerm] = useState('');
  const { showError } = useToast();

  const filteredCases = cases.filter(c => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      c.caseNumber.toLowerCase().includes(q) ||
      c.assignedLawyer.toLowerCase().includes(q) ||
      c.caseType.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q)
    );
  });

  const selectedCase =
    filteredCases.find(c => c.id === selectedCaseId) ||
    cases.find(c => c.id === selectedCaseId) ||
    filteredCases[0] ||
    cases[0];
  const senderRole: 'client' | 'lawyer' = currentUserRole === 'client' ? 'client' : 'lawyer';

  const { messages, sendMessage } = useCaseMessages(selectedCase?.id, {
    clientName: selectedCase?.clientName ?? '',
    lawyerName: selectedCase?.assignedLawyer ?? '',
    lawyerAvatar: selectedCase?.lawyerAvatar,
  });

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setMobileShowChat(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || (!inputText.trim() && !attachedFile)) return;

    setSending(true);
    let attachments: { name: string; size: string; type: string; path?: string }[] | undefined;

    if (attachedFile) {
      const { path, error } = await uploadCaseDocumentFile(selectedCase.id, attachedFile);
      if (error) {
        showError(`Ek dosya yüklenemedi: ${error}`);
      }
      attachments = [
        {
          name: attachedFile.name,
          size: formatFileSize(attachedFile.size),
          type: attachedFile.name.split('.').pop()?.toLowerCase() ?? 'dosya',
          path: path ?? undefined,
        },
      ];
    }

    const { error } = await sendMessage(currentUserId, senderRole, inputText.trim(), attachments);
    if (error) showError(`Mesaj gönderilemedi: ${error}`);

    setInputText('');
    setAttachedFile(null);
    setSending(false);
  };

  if (!selectedCase) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-3">
        <MessageSquare className="w-8 h-8 text-[#5b6b7c]" />
        <p className="text-sm text-[#5b6b7c]">Görüntülenecek bir dosya bulunamadı.</p>
        <button
          onClick={() => onNavigate('new_application')}
          className="px-5 py-2.5 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-xs shadow-md transition"
        >
          Yeni Başvuru Başlat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-canvas text-navy flex flex-col md:flex-row h-[calc(100dvh-68px)] md:h-[calc(100vh-80px)] overflow-hidden font-sans">
      
      {/* 1. LEFT CONVERSATIONS / CASE LIST (320px) */}
      <div className={`w-full md:w-80 bg-white border-r border-[#d7dee8] flex-col shrink-0 ${mobileShowChat ? 'hidden md:flex' : 'flex'} h-full`}>
        
        <div className="p-4 border-b border-[#d7dee8] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-navy">Avukat Mesajları</h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-navy-soft text-navy font-bold border border-[#d7dee8]">
              Canlı Takip
            </span>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-[#5b6b7c] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Dosya no veya avukat ara..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-navy-soft border border-[#d7dee8] text-xs text-navy focus:outline-none focus:border-navy font-medium"
            />
          </div>
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#d7dee8]">
          {filteredCases.length === 0 && (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs text-[#5b6b7c]">
                {searchTerm.trim()
                  ? 'Aramanızla eşleşen dosya bulunamadı.'
                  : 'Henüz mesajlaşılacak bir dosya yok.'}
              </p>
              {!searchTerm.trim() && (
                <button
                  onClick={() => onNavigate('new_application')}
                  className="text-xs font-bold text-navy underline underline-offset-2"
                >
                  Yeni başvuru oluştur
                </button>
              )}
            </div>
          )}
          {filteredCases.map(c => {
            const lastMsg = c.messages[c.messages.length - 1];
            const isSelected = c.id === selectedCaseId;

            return (
              <div
                key={c.id}
                onClick={() => handleSelectCase(c.id)}
                className={`p-4 cursor-pointer transition flex items-start space-x-3 ${
                  isSelected ? 'bg-navy-soft border-l-4 border-navy' : 'hover:bg-navy-soft/50'
                }`}
              >
                <img
                  src={c.lawyerAvatar}
                  alt={c.assignedLawyer}
                  className="w-10 h-10 rounded-full object-cover border border-[#d7dee8] shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-navy truncate">{c.assignedLawyer}</h4>
                    <span className="text-[10px] text-[#5b6b7c] font-mono font-bold shrink-0">{c.caseNumber}</span>
                  </div>
                  <p className="text-[11px] text-gold font-bold truncate">{c.caseType}</p>
                  <p className="text-[11px] text-[#5b6b7c] truncate">
                    {lastMsg ? lastMsg.text : 'Yeni konuşma başlatıldı.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 2. RIGHT CHAT WINDOW AREA */}
      <div className={`flex-1 bg-canvas flex-col h-full overflow-hidden min-w-0 ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Chat Header Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-[#d7dee8] flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileShowChat(false)}
              className="md:hidden p-1.5 rounded-md text-[#5b6b7c] hover:text-navy hover:bg-navy-soft shrink-0"
              aria-label="Konuşma listesine dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={selectedCase.lawyerAvatar}
              alt={selectedCase.assignedLawyer}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-navy shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <h3 className="font-bold text-sm text-navy truncate">{selectedCase.assignedLawyer}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Varşova Barosu Kayıtlı Avukat" />
              </div>
              <p className="text-[11px] text-[#5b6b7c] flex items-center space-x-1 truncate">
                <span className="text-emerald-600 font-bold shrink-0">● Çevrimiçi</span>
                <span className="shrink-0">•</span>
                <span className="font-mono font-bold truncate">Dosya: {selectedCase.caseNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('case_timeline')}
            className="px-2.5 sm:px-3 py-1.5 rounded-md bg-navy-soft hover:bg-[#d7dee8] text-navy text-xs font-bold flex items-center space-x-1 transition border border-[#d7dee8] shrink-0"
          >
            <Info className="w-3.5 h-3.5 text-[#5b6b7c]" />
            <span className="hidden sm:inline">Süreç Kartını Gör</span>
          </button>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Encryption & Legal Disclaimer Banner */}
          <div className="max-w-md mx-auto p-3 rounded-lg bg-white border border-[#d7dee8] text-center space-y-1 text-[#5b6b7c] text-[11px] shadow-xs">
            <p className="font-bold text-navy">🔒 Uçtan Uca Güvenli Avukat-Müvekkil Yazışması</p>
            <p>Bu sohbette paylaşılan evraklar Polonya Avukatlık Meslek Sırrı (Tajemnica adwokacka) koruması altındadır.</p>
          </div>

          {messages.map(msg => {
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
                    className="w-7 h-7 rounded-full object-cover border border-[#d7dee8] shrink-0 mb-1 shadow-xs"
                  />
                )}

                <div className={`max-w-[min(100%,28rem)] p-3.5 rounded-lg space-y-1.5 shadow-xs ${
                  isMe
                    ? 'bg-navy text-white rounded-br-none border border-navy'
                    : 'bg-white text-navy rounded-bl-none border border-[#d7dee8]'
                }`}>
                  
                  <div className={`flex items-center justify-between text-[10px] space-x-3 ${isMe ? 'text-white/50' : 'text-[#5b6b7c]'}`}>
                    <span className="font-bold">{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="leading-relaxed text-xs">{msg.text}</p>

                  {/* Attachment if present */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="pt-2">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className={`p-2 rounded border flex items-center space-x-2 text-[11px] font-semibold ${
                          isMe ? 'bg-navy-2 border-white/10 text-gold' : 'bg-navy-soft border-[#d7dee8] text-navy'
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
        <div className="p-4 bg-white border-t border-[#d7dee8] shadow-sm">
          
          {attachedFile && (
            <div className="mb-2 p-2 rounded-lg bg-navy-soft border border-[#d7dee8] text-xs text-navy flex items-center justify-between">
              <span className="font-bold">Ek Evrak: {attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="text-[#5b6b7c] hover:text-navy font-bold">✕</button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            
            {/* Attachment Button */}
            <label className="p-2.5 rounded-lg bg-navy-soft hover:bg-[#d7dee8] text-[#5b6b7c] hover:text-navy cursor-pointer border border-[#d7dee8] transition shrink-0">
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  const validation = validateUploadFile(file);
                  if (!validation.valid) {
                    showError(validation.error!);
                    return;
                  }
                  setAttachedFile(file);
                }}
              />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 min-w-0 px-3 sm:px-4 py-3 rounded-lg bg-navy-soft border border-[#d7dee8] text-xs text-navy focus:outline-none focus:border-navy font-medium"
            />

            <button
              type="submit"
              disabled={sending}
              className="px-3 sm:px-5 py-3 rounded-md bg-gold hover:brightness-105 disabled:opacity-60 text-navy font-bold text-xs shadow-md transition flex items-center space-x-1 shrink-0"
            >
              <span className="hidden sm:inline">{sending ? 'Gönderiliyor...' : 'Gönder'}</span>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
