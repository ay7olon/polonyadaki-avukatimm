import React, { useEffect, useMemo, useState } from 'react';
import {
  FolderLock,
  PlusCircle,
  MessageSquare,
  FileText,
  User,
  Bell,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileCheck,
  ShieldAlert,
  Eye,
  Loader2,
  XCircle,
} from 'lucide-react';
import { Language, LegalCase, ScreenId } from '../types';
import { useNowTick } from '../hooks/useNowTick';
import { getDeadlineInfo } from '../lib/deadline';
import { DeadlineBadge } from '../components/DeadlineBadge';
import { getSignedDocumentUrl } from '../lib/storage';
import { isValidFullName, isValidPhone } from '../lib/validation';
import { useToast } from '../hooks/useToast';
import type { UpdateProfileParams } from '../hooks/useAuth';

interface ClientDashboardScreenProps {
  cases: LegalCase[];
  loading?: boolean;
  currentUserName: string;
  currentUserEmail: string;
  currentUserPhone: string;
  currentLanguagePref: string;
  onUpdateProfile: (params: UpdateProfileParams) => Promise<{ error: string | null }>;
  onNavigate: (screen: ScreenId, caseId?: string) => void;
  onSelectCase: (c: LegalCase) => void;
}

type DashboardTab = 'dosyalarim' | 'belgelerim' | 'profil';

export const ClientDashboardScreen: React.FC<ClientDashboardScreenProps> = ({
  cases,
  loading,
  currentUserName,
  currentUserEmail,
  currentUserPhone,
  currentLanguagePref,
  onUpdateProfile,
  onNavigate,
  onSelectCase,
}) => {
  const initials = currentUserName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '?';
  const [activeTab, setActiveTab] = useState<DashboardTab>('dosyalarim');
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState(currentUserName);
  const [profilePhone, setProfilePhone] = useState(currentUserPhone || '+48 ');
  const [profileLang, setProfileLang] = useState<Language>(
    (['TR', 'PL', 'EN'].includes(currentLanguagePref)
      ? currentLanguagePref
      : 'TR') as Language,
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const now = useNowTick();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    setProfileName(currentUserName);
    setProfilePhone(currentUserPhone || '+48 ');
    if (['TR', 'PL', 'EN'].includes(currentLanguagePref)) {
      setProfileLang(currentLanguagePref as Language);
    }
  }, [currentUserName, currentUserPhone, currentLanguagePref]);

  const allDocuments = useMemo(
    () =>
      cases.flatMap(c =>
        c.documents.map(doc => ({
          ...doc,
          caseId: c.id,
          caseNumber: c.caseNumber,
          caseType: c.caseType,
          caseRef: c,
        })),
      ),
    [cases],
  );

  const reminders = cases
    .map(c => ({ case: c, deadline: getDeadlineInfo(c.deadlineAt, now) }))
    .filter(
      r =>
        r.case.status === 'pending_docs' ||
        r.deadline.tone === 'critical' ||
        r.deadline.tone === 'warning' ||
        r.deadline.isOverdue,
    )
    .sort((a, b) => a.deadline.msRemaining - b.deadline.msRemaining);

  const getStatusBadge = (status: LegalCase['status']) => {
    switch (status) {
      case 'in_review':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>İnceleniyor</span>
          </span>
        );
      case 'pending_docs':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center space-x-1">
            <AlertCircle className="w-3 h-3 animate-pulse" />
            <span>Ek Belge Bekleniyor</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="px-2.5 py-1 rounded-full bg-navy-soft border border-[#d7dee8] text-navy font-bold text-xs flex items-center space-x-1">
            <FileCheck className="w-3 h-3" />
            <span>Valiliğe Sunuldu</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Sonuçlandı</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-navy-soft text-navy border border-[#d7dee8] text-xs font-semibold">
            Atandı
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: LegalCase['urgency']) => {
    if (urgency === 'critical') {
      return (
        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider animate-pulse">
          Çok Acil (48h)
        </span>
      );
    }
    if (urgency === 'urgent') {
      return (
        <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider">
          Acil
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-navy-soft text-[#5b6b7c] border border-[#d7dee8] text-[10px] font-semibold">
        Normal
      </span>
    );
  };

  const getDocStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    if (status === 'approved') {
      return (
        <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center space-x-1 w-fit">
          <CheckCircle2 className="w-3 h-3" />
          <span>Onaylandı</span>
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-800 font-bold text-[11px] flex items-center space-x-1 w-fit">
          <XCircle className="w-3 h-3" />
          <span>Reddedildi</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px] flex items-center space-x-1 w-fit">
        <Clock className="w-3 h-3" />
        <span>İncelemede</span>
      </span>
    );
  };

  const handleViewDocument = async (docId: string, storagePath?: string) => {
    if (!storagePath) {
      showError('Bu belgenin dosya yolu bulunamadı.');
      return;
    }
    setViewingDocId(docId);
    const url = await getSignedDocumentUrl(storagePath);
    setViewingDocId(null);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      showError('Belge açılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (!isValidFullName(profileName)) {
      setProfileError('Lütfen ad ve soyadınızı girin (en az iki kelime).');
      return;
    }
    if (!isValidPhone(profilePhone)) {
      setProfileError('Lütfen geçerli bir telefon girin (örn. +48 570 123 456).');
      return;
    }

    setSavingProfile(true);
    const { error } = await onUpdateProfile({
      fullName: profileName,
      phone: profilePhone,
      languagePref: profileLang,
    });
    setSavingProfile(false);

    if (error) {
      setProfileError(error);
      showError(`Profil güncellenemedi: ${error}`);
      return;
    }
    showSuccess('Profil bilgileriniz kaydedildi.');
  };

  const tabTitle =
    activeTab === 'belgelerim'
      ? 'Belgelerim'
      : activeTab === 'profil'
        ? 'Profilim & Ayarlar'
        : 'Müşteri Paneli';

  const tabSubtitle =
    activeTab === 'belgelerim'
      ? 'Tüm dosyalarınıza yüklediğiniz evrakların özeti'
      : activeTab === 'profil'
        ? 'İletişim bilgilerinizi güncelleyin'
        : 'Aktif Polonya idari dosyalarınızın canlı durum özeti';

  return (
    <div className="min-h-screen bg-canvas text-navy flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-white border-r border-[#d7dee8] shrink-0 p-4 space-y-6 shadow-sm">
        <div className="p-3.5 rounded-lg bg-navy-soft border border-[#d7dee8] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-navy text-white font-extrabold flex items-center justify-center text-sm shadow">
            {initials}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-navy truncate">{currentUserName}</h4>
            <p className="text-[11px] text-[#5b6b7c] truncate">{currentUserEmail}</p>
          </div>
        </div>

        <nav className="space-y-1 text-xs">
          <button
            onClick={() => setActiveTab('dosyalarim')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-bold transition ${
              activeTab === 'dosyalarim'
                ? 'bg-navy text-white shadow-sm'
                : 'text-[#5b6b7c] hover:bg-navy-soft'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FolderLock className="w-4 h-4" />
              <span>Dosyalarım</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'dosyalarim' ? 'bg-gold text-navy' : 'bg-navy-soft text-navy'
              }`}
            >
              {cases.length}
            </span>
          </button>

          <button
            onClick={() => onNavigate('new_application')}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-[#5b6b7c] hover:bg-navy-soft font-semibold transition"
          >
            <PlusCircle className="w-4 h-4 text-gold" />
            <span>Yeni Başvuru</span>
          </button>

          <button
            onClick={() => onNavigate('messaging')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[#5b6b7c] hover:bg-navy-soft font-semibold transition"
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4 text-navy" />
              <span>Mesajlar</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('belgelerim')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-semibold transition ${
              activeTab === 'belgelerim' ? 'bg-navy text-white' : 'text-[#5b6b7c] hover:bg-navy-soft'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FileText className={`w-4 h-4 ${activeTab === 'belgelerim' ? 'text-white' : 'text-gold'}`} />
              <span>Belgelerim</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'belgelerim' ? 'bg-gold text-navy' : 'bg-navy-soft text-navy'
              }`}
            >
              {allDocuments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profil')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg font-semibold transition ${
              activeTab === 'profil' ? 'bg-navy text-white' : 'text-[#5b6b7c] hover:bg-navy-soft'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'profil' ? 'text-white' : 'text-gold'}`} />
            <span>Profilim & Ayarlar</span>
          </button>
        </nav>

        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-red-700 font-bold text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Acil Hukuki Destek</span>
          </div>
          <p className="text-[#5b6b7c] text-[11px] leading-tight">
            Valilikten polis tebliğ kağıdı mı aldınız?
          </p>
          <button
            onClick={() => onNavigate('messaging')}
            className="w-full py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition text-center shadow-sm"
          >
            Nöbetçi Avukata Bağlan
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#d7dee8] gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy">{tabTitle}</h1>
            <p className="text-xs text-[#5b6b7c]">{tabSubtitle}</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-white border border-[#d7dee8] text-[#5b6b7c] hover:text-navy hover:bg-navy-soft relative transition shadow-sm"
              >
                <Bell className="w-5 h-5" />
                {reminders.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#d7dee8] rounded-lg shadow-xl p-4 z-50 space-y-3 text-navy">
                  <div className="flex items-center justify-between text-xs border-b border-[#d7dee8] pb-2">
                    <span className="font-bold text-navy">Bildirimler ({reminders.length})</span>
                  </div>
                  <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                    {reminders.length === 0 && (
                      <p className="text-[#5b6b7c] text-[11px] italic py-2">
                        Şu anda bekleyen bir hatırlatma yok.
                      </p>
                    )}
                    {reminders.map(({ case: c, deadline }) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectCase(c);
                          onNavigate('case_timeline', c.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border space-y-1 transition hover:opacity-90 ${
                          deadline.isOverdue || deadline.tone === 'critical'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div
                          className={`flex justify-between font-bold text-[11px] ${
                            deadline.isOverdue || deadline.tone === 'critical'
                              ? 'text-red-800'
                              : 'text-amber-800'
                          }`}
                        >
                          <span>{c.caseNumber}</span>
                          {deadline.hasDeadline && <DeadlineBadge info={deadline} />}
                        </div>
                        <p className="text-[#5b6b7c] text-[11px]">
                          {c.status === 'pending_docs'
                            ? `${c.caseType} dosyanız için ek evrak yüklemeniz bekleniyor.`
                            : `${c.caseType} dosyanızın son tarihi yaklaşıyor.`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('new_application')}
              className="hidden sm:flex px-4 py-2 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-xs shadow-md items-center space-x-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Başvuru Başlat</span>
            </button>
          </div>
        </div>

        {activeTab === 'dosyalarim' && (
          <>
            {cases.some(c => c.status === 'pending_docs') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5 sm:mt-0 shadow-sm">
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900 text-sm">
                      Dikkat: Eksik Evrak Beklenen Dosyanız Var
                    </h4>
                    <p className="text-xs text-red-700">
                      Valilik reddini önlemek için eksik belgeleri süreç takibinden yükleyiniz.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const targetCase = cases.find(c => c.status === 'pending_docs') || cases[0];
                    onSelectCase(targetCase);
                    onNavigate('case_timeline', targetCase.id);
                  }}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 shadow transition"
                >
                  Evrak Yükle ve Detay Gör
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-base text-navy">
                  Aktif Başvurularım ({cases.length})
                </h3>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-7 h-7 border-2 border-[#d7dee8] border-t-navy rounded-full animate-spin" />
                </div>
              )}

              {!loading && cases.length === 0 && (
                <div className="text-center py-16 space-y-3 bg-white border border-dashed border-[#d7dee8] rounded-lg">
                  <p className="text-sm text-[#5b6b7c]">Henüz bir başvurunuz bulunmuyor.</p>
                  <button
                    onClick={() => onNavigate('new_application')}
                    className="px-5 py-2.5 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-xs shadow-md transition"
                  >
                    Yeni Başvuru Başlat
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!loading &&
                  cases.map(c => (
                    <div
                      key={c.id}
                      className="bg-white border border-[#d7dee8] hover:border-navy/20 rounded-lg p-6 space-y-5 transition shadow-sm hover:shadow-md relative overflow-hidden group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-mono text-xs font-bold text-gold">{c.caseNumber}</span>
                            {getUrgencyBadge(c.urgency)}
                            {getDeadlineInfo(c.deadlineAt, now).hasDeadline && (
                              <DeadlineBadge info={getDeadlineInfo(c.deadlineAt, now)} />
                            )}
                          </div>
                          <h4 className="font-display font-semibold text-lg text-navy group-hover:text-gold transition">
                            {c.caseType}
                          </h4>
                          <p className="text-xs text-[#5b6b7c] flex items-center space-x-1 font-medium">
                            <span>{c.city}</span>
                            <span>•</span>
                            <span>Oluşturulma: {c.createdAt}</span>
                          </p>
                        </div>
                        <div>{getStatusBadge(c.status)}</div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#5b6b7c]">Süreç İlerlemesi</span>
                          <span className="text-gold font-bold">{c.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-navy-soft overflow-hidden border border-[#d7dee8]">
                          <div
                            className="h-full bg-gradient-to-r from-navy to-gold rounded-full transition-all duration-500"
                            style={{ width: `${c.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#d7dee8] flex items-center justify-between text-xs text-[#5b6b7c]">
                        <div className="flex items-center space-x-2">
                          <img
                            src={c.lawyerAvatar}
                            alt={c.assignedLawyer}
                            className="w-7 h-7 rounded-full object-cover border border-[#d7dee8] shadow-sm"
                          />
                          <span className="font-semibold text-navy">{c.assignedLawyer}</span>
                        </div>
                        <div className="text-[#5b6b7c] font-medium">{c.documents.length} Yüklü Belge</div>
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSelectCase(c);
                            onNavigate('case_timeline', c.id);
                          }}
                          className="flex-1 py-2.5 rounded-md bg-navy hover:bg-navy-2 text-white font-bold text-xs transition flex items-center justify-center space-x-1 shadow-sm"
                        >
                          <span>Süreç Takip (Timeline)</span>
                          <ChevronRight className="w-4 h-4 text-white/60" />
                        </button>
                        <button
                          onClick={() => {
                            onSelectCase(c);
                            onNavigate('messaging', c.id);
                          }}
                          className="px-4 py-2.5 rounded-md bg-white hover:bg-navy-soft text-navy border border-[#d7dee8] font-bold text-xs transition flex items-center space-x-1 shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4 text-navy" />
                          <span>Mesaj At</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'belgelerim' && (
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-[#d7dee8] border-t-navy rounded-full animate-spin" />
              </div>
            )}

            {!loading && allDocuments.length === 0 && (
              <div className="text-center py-16 space-y-3 bg-white border border-dashed border-[#d7dee8] rounded-lg">
                <FileText className="w-8 h-8 text-[#5b6b7c] mx-auto" />
                <p className="text-sm text-[#5b6b7c]">Henüz yüklenmiş bir belgeniz yok.</p>
                <p className="text-xs text-[#5b6b7c] max-w-sm mx-auto">
                  Yeni başvuru oluştururken veya süreç takibinden evrak ekleyebilirsiniz.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigate('new_application')}
                    className="px-5 py-2.5 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-xs shadow-md transition"
                  >
                    Yeni Başvuru Başlat
                  </button>
                  {cases[0] && (
                    <button
                      onClick={() => {
                        onSelectCase(cases[0]);
                        onNavigate('case_timeline', cases[0].id);
                      }}
                      className="px-5 py-2.5 rounded-md bg-navy hover:bg-navy-2 text-white font-bold text-xs shadow-sm transition"
                    >
                      Dosyaya Git
                    </button>
                  )}
                </div>
              </div>
            )}

            {!loading && allDocuments.length > 0 && (
              <div className="bg-white border border-[#d7dee8] rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy-soft border-b border-[#d7dee8] text-[11px] font-bold text-[#5b6b7c] uppercase tracking-wider">
                      <tr>
                        <th className="p-3 sm:p-4">Belge</th>
                        <th className="p-3 sm:p-4">Dosya</th>
                        <th className="p-3 sm:p-4">Durum</th>
                        <th className="p-3 sm:p-4">Yüklenme</th>
                        <th className="p-3 sm:p-4 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d7dee8]">
                      {allDocuments.map(doc => (
                        <tr key={`${doc.caseId}-${doc.id}`} className="hover:bg-navy-soft/40">
                          <td className="p-3 sm:p-4">
                            <div className="flex items-start space-x-2 min-w-[140px]">
                              <FileText className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                              <div>
                                <div className="font-bold text-navy">{doc.name}</div>
                                <div className="text-[10px] text-[#5b6b7c]">{doc.size}</div>
                                {doc.status === 'rejected' && doc.rejectionReason && (
                                  <p className="text-[10px] text-red-700 mt-1 max-w-xs">
                                    {doc.rejectionReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="space-y-0.5 min-w-[120px]">
                              <div className="font-mono font-bold text-gold text-[11px]">
                                {doc.caseNumber}
                              </div>
                              <div className="text-[#5b6b7c] text-[11px]">{doc.caseType}</div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">{getDocStatusBadge(doc.status)}</td>
                          <td className="p-3 sm:p-4 text-[#5b6b7c] font-medium whitespace-nowrap">
                            {doc.uploadedAt}
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center justify-end gap-2">
                              {doc.fileUrl && (
                                <button
                                  onClick={() => handleViewDocument(doc.id, doc.fileUrl)}
                                  disabled={viewingDocId === doc.id}
                                  className="p-1.5 rounded-md border border-[#d7dee8] text-[#5b6b7c] hover:text-navy hover:bg-navy-soft transition disabled:opacity-60"
                                  title="Belgeyi görüntüle"
                                >
                                  {viewingDocId === doc.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  onSelectCase(doc.caseRef);
                                  onNavigate('case_timeline', doc.caseId);
                                }}
                                className="px-2.5 py-1.5 rounded-md bg-navy hover:bg-navy-2 text-white font-bold text-[11px] transition"
                              >
                                Dosyaya Git
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profil' && (
          <div className="max-w-xl">
            <form
              onSubmit={handleSaveProfile}
              className="bg-white border border-[#d7dee8] rounded-lg p-5 sm:p-6 space-y-5 shadow-sm"
            >
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-base text-navy">İletişim Bilgileri</h3>
                <p className="text-xs text-[#5b6b7c]">
                  Avukatlarınızın size ulaşabilmesi için bilgilerinizi güncel tutun.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Ad Soyad</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-canvas border border-[#d7dee8] text-sm text-navy focus:outline-none focus:border-navy font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">E-posta</label>
                <input
                  type="email"
                  value={currentUserEmail}
                  disabled
                  className="w-full p-3 rounded-lg bg-navy-soft border border-[#d7dee8] text-sm text-[#5b6b7c] font-medium cursor-not-allowed"
                />
                <p className="text-[10px] text-[#5b6b7c]">E-posta adresi hesap güvenliği için değiştirilemez.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Telefon</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  placeholder="+48 570 123 456"
                  className="w-full p-3 rounded-lg bg-canvas border border-[#d7dee8] text-sm text-navy focus:outline-none focus:border-navy font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy">Dil tercihi</label>
                <select
                  value={profileLang}
                  onChange={e => setProfileLang(e.target.value as Language)}
                  className="w-full p-3 rounded-lg bg-canvas border border-[#d7dee8] text-sm text-navy focus:outline-none focus:border-navy font-medium"
                >
                  <option value="TR">Türkçe (TR)</option>
                  <option value="PL">Polski (PL)</option>
                  <option value="EN">English (EN)</option>
                </select>
                <p className="text-[10px] text-[#5b6b7c]">
                  Tercih profilinize kaydedilir. Panel metinlerinin tam çevirisi sonraki aşamada eklenecek.
                </p>
              </div>

              {profileError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {profileError}
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-navy hover:bg-navy-2 disabled:opacity-60 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-2"
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{savingProfile ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
