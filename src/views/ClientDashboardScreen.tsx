import React, { useState } from 'react';
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
  ArrowUpRight, 
  Search, 
  FileCheck, 
  Calendar,
  ShieldAlert,
  Download
} from 'lucide-react';
import { LegalCase, ScreenId } from '../types';

interface ClientDashboardScreenProps {
  cases: LegalCase[];
  onNavigate: (screen: ScreenId, caseId?: string) => void;
  onSelectCase: (c: LegalCase) => void;
}

export const ClientDashboardScreen: React.FC<ClientDashboardScreenProps> = ({
  cases,
  onNavigate,
  onSelectCase,
}) => {
  const [activeTab, setActiveTab] = useState<'dosyalarim' | 'yeni' | 'mesajlar' | 'belgelerim' | 'profil'>('dosyalarim');
  const [showNotifications, setShowNotifications] = useState(false);

  const getStatusBadge = (status: LegalCase['status']) => {
    switch (status) {
      case 'in_review':
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center space-x-1"><Clock className="w-3 h-3" /><span>İnceleniyor</span></span>;
      case 'pending_docs':
        return <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center space-x-1"><AlertCircle className="w-3 h-3 animate-pulse" /><span>Ek Belge Bekleniyor</span></span>;
      case 'submitted':
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center space-x-1"><FileCheck className="w-3 h-3" /><span>Valiliğe Sunuldu</span></span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Sonuçlandı</span></span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">Atandı</span>;
    }
  };

  const getUrgencyBadge = (urgency: LegalCase['urgency']) => {
    if (urgency === 'critical') {
      return <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider animate-pulse">Çok Acil (48h)</span>;
    }
    if (urgency === 'urgent') {
      return <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider">Acil</span>;
    }
    return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">Normal</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      
      {/* 1. LEFT SIDEBAR MENU */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 p-4 space-y-6 shadow-sm">
        
        {/* User Info Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow">
            AY
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-slate-900 truncate">Ahmet Yılmaz</h4>
            <p className="text-[11px] text-slate-500 truncate">ahmet.yilmaz@gmail.com</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="space-y-1 text-xs">
          
          <button
            onClick={() => setActiveTab('dosyalarim')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition ${
              activeTab === 'dosyalarim'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FolderLock className="w-4 h-4" />
              <span>Dosyalarım</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'dosyalarim' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {cases.length}
            </span>
          </button>

          <button
            onClick={() => onNavigate('new_application')}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Yeni Başvuru</span>
          </button>

          <button
            onClick={() => onNavigate('messaging')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition"
          >
            <div className="flex items-center space-x-2.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Mesajlar</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('belgelerim')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition ${
              activeTab === 'belgelerim' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Belgelerim</span>
          </button>

          <button
            onClick={() => setActiveTab('profil')}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition ${
              activeTab === 'profil' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4 text-amber-600" />
            <span>Profilim & Ayarlar</span>
          </button>

        </nav>

        {/* Urgent Lawyer Hotline Box */}
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-red-700 font-bold text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Acil Hukuki Destek</span>
          </div>
          <p className="text-slate-700 text-[11px] leading-tight">
            Valilikten polis tebliğ kağıdı mı aldınız?
          </p>
          <button
            onClick={() => onNavigate('messaging')}
            className="w-full py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition text-center shadow-sm"
          >
            Nöbetçi Avukata Bağlan
          </button>
        </div>

      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Bar with Title and Notifications */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Müşteri Paneli</h1>
            <p className="text-xs text-slate-500">Aktif Polonya idari dosyalarınızın canlı durum özeti</p>
          </div>

          <div className="flex items-center space-x-3">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 relative transition shadow-sm"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white animate-pulse" />
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 space-y-3 text-slate-900">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900">Bildirimler (2)</span>
                    <span className="text-[10px] text-red-600 font-semibold cursor-pointer">Tümünü Oku</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 space-y-1">
                      <div className="flex justify-between font-bold text-red-800 text-[11px]">
                        <span>Ek Belge Uyarısı</span>
                        <span className="text-slate-500 font-normal">Dün</span>
                      </div>
                      <p className="text-slate-700 text-[11px]">
                        PL-2026-8842 nolu dosya için noter onaylı kira kontratı yüklemeniz bekleniyor.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-blue-800 text-[11px]">
                        <span>Avukat Mesaj Gönderdi</span>
                        <span className="text-slate-500 font-normal">27 Tem</span>
                      </div>
                      <p className="text-slate-700 text-[11px]">
                        Av. Piotr Kowalski: "Dilekçe taslağınız hazırlandı."
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick CTA to New Application */}
            <button
              onClick={() => onNavigate('new_application')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Başvuru Başlat</span>
            </button>
          </div>
        </div>

        {/* Action Required Banner if pending docs exist */}
        {cases.some(c => c.status === 'pending_docs') && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-red-600 text-white shrink-0 mt-0.5 sm:mt-0 shadow-sm">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-red-900 text-sm">Dikkat: Eksik Evrak Beklenen Dosyanız Var</h4>
                <p className="text-xs text-red-700">
                  Valilik reddini önlemek için eksik kira kontratını 7 gün içinde sisteme yükleyiniz.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const targetCase = cases.find(c => c.status === 'pending_docs') || cases[0];
                onSelectCase(targetCase);
                onNavigate('case_timeline', targetCase.id);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 shadow transition"
            >
              Evrak Yükle ve Detay Gör
            </button>
          </div>
        )}

        {/* Active Cases Grid / Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Aktif Başvurularım ({cases.length})</h3>
            <span className="text-xs text-slate-500">Son Güncelleme: Bugün</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cases.map(c => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 space-y-5 transition shadow-sm hover:shadow-md relative overflow-hidden group"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-red-600">{c.caseNumber}</span>
                      {getUrgencyBadge(c.urgency)}
                    </div>
                    <h4 className="font-extrabold text-lg text-slate-900 group-hover:text-red-600 transition">
                      {c.caseType}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                      <span>{c.city}</span>
                      <span>•</span>
                      <span>Oluşturulma: {c.createdAt}</span>
                    </p>
                  </div>

                  <div>{getStatusBadge(c.status)}</div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Süreç İlerlemesi</span>
                    <span className="text-red-600 font-bold">{c.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Attorney & Documents count */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <img
                      src={c.lawyerAvatar}
                      alt={c.assignedLawyer}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                    <span className="font-semibold text-slate-800">{c.assignedLawyer}</span>
                  </div>

                  <div className="text-slate-500 font-medium">
                    {c.documents.length} Yüklü Belge
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectCase(c);
                      onNavigate('case_timeline', c.id);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <span>Süreç Takip (Timeline)</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectCase(c);
                      onNavigate('messaging', c.id);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs transition flex items-center space-x-1 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-700" />
                    <span>Mesaj At</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};
