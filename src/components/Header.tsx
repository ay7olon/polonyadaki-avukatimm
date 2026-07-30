import React, { useState } from 'react';
import { 
  Scale, 
  Globe, 
  User, 
  ShieldCheck, 
  Code2, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles,
  Smartphone,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Language, ScreenId } from '../types';
import { UI_TRANSLATIONS } from '../data/mockData';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  userRole: 'client' | 'admin';
  onToggleRole: () => void;
  showNotes: boolean;
  onToggleNotes: () => void;
  isMobileSimulated: boolean;
  onToggleMobileSimulated: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeScreen,
  onNavigate,
  userRole,
  onToggleRole,
  showNotes,
  onToggleNotes,
  isMobileSimulated,
  onToggleMobileSimulated,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenDropdownOpen, setScreenDropdownOpen] = useState(false);
  const t = UI_TRANSLATIONS[currentLanguage];

  const screensList: { id: ScreenId; label: string; group: 'Client' | 'Admin' | 'Public' }[] = [
    { id: 'landing', label: '1. Ana Sayfa (Landing)', group: 'Public' },
    { id: 'auth', label: '2. Kayıt / Giriş Ekranı', group: 'Public' },
    { id: 'client_dashboard', label: '3. Müşteri Dashboard', group: 'Client' },
    { id: 'new_application', label: '4. Yeni Başvuru Formu', group: 'Client' },
    { id: 'case_timeline', label: '5. Süreç Takip (Timeline)', group: 'Client' },
    { id: 'messaging', label: '6. Mesajlaşma Ekranı', group: 'Client' },
    { id: 'admin_case_list', label: '7. Admin Dosya Listesi', group: 'Admin' },
    { id: 'admin_case_detail', label: '8. Admin Dosya Detayı', group: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-900 shadow-sm">
      {/* Top Flag Accent Line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-600 to-slate-200" />

      {/* Top Banner for Screen Switcher & Cursor Dev Reference Bar */}
      <div className="bg-slate-100 text-slate-700 text-xs px-4 py-1.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 font-semibold">
            🇵🇱 Polonya & 🇹🇷 Türkiye
          </span>
          <span className="hidden sm:inline text-slate-600">
            Hukuki Danışmanlık ve Karta Pobytu Portalı
          </span>
        </div>

        {/* Quick Screen Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setScreenDropdownOpen(!screenDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm transition"
              title="Hızlı Ekran Değiştirici"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-slate-900">Ekran Seçici:</span>
              <span className="truncate max-w-[130px] sm:max-w-none text-slate-700 font-medium">
                {screensList.find(s => s.id === activeScreen)?.label}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {screenDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Müşteri Ekranları
                </div>
                {screensList.filter(s => s.group !== 'Admin').map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate(s.id);
                      setScreenDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      activeScreen === s.id ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600' : 'text-slate-700'
                    }`}
                  >
                    <span>{s.label}</span>
                    {activeScreen === s.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}

                <div className="px-3 py-1 mt-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider border-t border-slate-100">
                  Avukat / Admin Ekranları
                </div>
                {screensList.filter(s => s.group === 'Admin').map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate(s.id);
                      setScreenDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-amber-50 transition ${
                      activeScreen === s.id ? 'bg-amber-100 text-amber-900 font-semibold border-l-2 border-amber-600' : 'text-slate-700'
                    }`}
                  >
                    <span>{s.label}</span>
                    {activeScreen === s.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Cursor Developer Notes */}
          <button
            onClick={onToggleNotes}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition border shadow-sm ${
              showNotes 
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' 
                : 'bg-white hover:bg-slate-50 text-amber-700 border-amber-300'
            }`}
            title="Cursor için UI/UX Geliştirici Tasarım Notları"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cursor Tasarım Notu</span>
          </button>

          {/* Toggle Mobile Simulator */}
          <button
            onClick={onToggleMobileSimulated}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition border shadow-sm ${
              isMobileSimulated
                ? 'bg-slate-900 text-white border-slate-800 font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="Mobil Görünüm Simülatörü"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isMobileSimulated ? 'Mobil Kapalı' : 'Mobil Önizle'}</span>
          </button>
        </div>
      </div>

      {/* Primary Brand Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center relative shadow group-hover:bg-slate-800 transition">
            <Scale className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white" title="Polonya Vurgusu" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">POLONYADAKİ</span>
              <span className="font-extrabold text-lg text-red-600 tracking-tight">AVUKATIM</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wide">
              POLSKA KANCELARIA PRAWNA
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6">
          <button
            onClick={() => onNavigate('landing')}
            className={`text-sm font-medium transition ${activeScreen === 'landing' ? 'text-red-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {t.nav_home}
          </button>
          
          <button
            onClick={() => onNavigate('client_dashboard')}
            className={`text-sm font-medium transition flex items-center space-x-1 ${activeScreen === 'client_dashboard' || activeScreen === 'new_application' || activeScreen === 'case_timeline' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <span>{t.nav_dashboard}</span>
          </button>

          <button
            onClick={() => onNavigate('admin_case_list')}
            className={`text-sm font-medium transition flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 ${activeScreen.startsWith('admin') ? 'text-amber-800 font-bold' : 'text-amber-700 hover:text-amber-900'}`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.nav_admin}</span>
          </button>
        </nav>

        {/* Right Action Tools: Language Switcher + Auth Buttons */}
        <div className="hidden sm:flex items-center space-x-4">
          
          {/* Language Selector (TR / PL / EN) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            {(['TR', 'PL', 'EN'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition ${
                  currentLanguage === lang
                    ? 'bg-white text-red-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* User Role Quick Switcher */}
          <button
            onClick={onToggleRole}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center space-x-1 shadow-sm"
            title="Müşteri vs Avukat modunu değiştir"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{userRole === 'client' ? 'Rol: Müşteri' : 'Rol: Avukat'}</span>
          </button>

          {/* Login / Register Buttons */}
          <button
            onClick={() => onNavigate('auth')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-sm"
          >
            {t.nav_login}
          </button>

          <button
            onClick={() => onNavigate('new_application')}
            className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow transition flex items-center space-x-1"
          >
            <span>{t.hero_cta}</span>
          </button>
        </div>

        {/* Mobile menu icon */}
        <div className="lg:hidden flex items-center space-x-2">
          {/* Language selector for mobile header */}
          <div className="flex items-center bg-slate-100 p-1 rounded border border-slate-200 text-xs">
            {(['TR', 'PL', 'EN'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-1.5 py-0.5 rounded ${currentLanguage === lang ? 'bg-white text-red-600 font-bold shadow-sm' : 'text-slate-600'}`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
            Ekranlar & Menü
          </div>
          <div className="grid grid-cols-1 gap-1">
            {screensList.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  onNavigate(s.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-sm transition ${
                  activeScreen === s.id ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col space-y-2">
            <button
              onClick={() => {
                onNavigate('auth');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm"
            >
              {t.nav_login}
            </button>
            <button
              onClick={() => {
                onNavigate('new_application');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-bold shadow"
            >
              {t.hero_cta}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
