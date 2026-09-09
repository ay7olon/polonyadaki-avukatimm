import React, { useState } from 'react';
import {
  Scale,
  Globe,
  Menu,
  X,
  Lock,
  LogOut,
} from 'lucide-react';
import { Language, ScreenId, UserRole } from '../types';
import { UI_TRANSLATIONS } from '../data/mockData';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userFullName: string | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeScreen,
  onNavigate,
  isAuthenticated,
  userRole,
  userFullName,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = UI_TRANSLATIONS[currentLanguage];
  const isStaff = userRole === 'lawyer' || userRole === 'admin';
  const isClient = userRole === 'client';

  const closeMobile = () => setMobileMenuOpen(false);

  const langSwitcher = (
    <div className="flex items-center bg-white/5 p-1 rounded-md border border-white/10">
      <Globe className="w-3.5 h-3.5 text-white/50 ml-1.5 mr-1 hidden sm:block" />
      {(['TR', 'PL', 'EN'] as Language[]).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onLanguageChange(lang)}
          className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
            currentLanguage === lang
              ? 'bg-gold text-navy font-bold'
              : 'text-white/65 hover:text-white'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-navy text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group min-w-0 shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/15 transition shrink-0">
              <Scale className="w-5 h-5 text-gold" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-[15px] sm:text-[17px] font-semibold tracking-tight leading-tight truncate">
                Polonyadaki Avukatım
              </div>
              <p className="text-[10px] text-gold font-semibold tracking-[0.14em] uppercase">
                Kancelaria
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-5 ml-2">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className={`text-sm font-medium transition ${
                activeScreen === 'landing' ? 'text-white' : 'text-white/65 hover:text-white'
              }`}
            >
              {t.nav_home}
            </button>

            {isClient && (
              <button
                type="button"
                onClick={() => onNavigate('client_dashboard')}
                className={`text-sm font-medium transition ${
                  activeScreen === 'client_dashboard' ||
                  activeScreen === 'new_application' ||
                  activeScreen === 'case_timeline' ||
                  activeScreen === 'messaging'
                    ? 'text-white'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                {t.nav_dashboard}
              </button>
            )}

            {isStaff && (
              <button
                type="button"
                onClick={() => onNavigate('admin_case_list')}
                className={`text-sm font-medium transition flex items-center space-x-1.5 px-2.5 py-1 rounded-md border ${
                  activeScreen.startsWith('admin')
                    ? 'bg-gold text-navy border-gold'
                    : 'text-gold border-gold/30 hover:border-gold/60'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t.nav_admin}</span>
              </button>
            )}
          </nav>
        </div>

                <div className="hidden lg:flex items-center gap-3 shrink-0 ml-auto">
          {langSwitcher}

          {isAuthenticated ? (
            <>
              <span
                className="text-xs px-2.5 py-1.5 rounded-md border border-white/15 bg-white/5 text-white/90 max-w-[160px] truncate"
                title={userFullName || undefined}
              >
                {userFullName || (isClient ? 'Müşteri' : 'Avukat')}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-md bg-transparent hover:bg-white/10 text-white/85 border border-white/15 transition flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış Yap</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="text-xs font-semibold px-3 py-1.5 rounded-md text-white border border-white/20 hover:border-white/40 transition"
              >
                {t.nav_login}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="text-xs font-bold px-3.5 py-1.5 rounded-md bg-gold hover:brightness-105 text-navy transition"
              >
                {t.hero_cta}
              </button>
            </>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-2 shrink-0 ml-auto">
          {langSwitcher}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10"
            aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-2 border-t border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="font-semibold text-xs text-white/45 uppercase tracking-wider mb-1">Menü</div>
          <div className="grid grid-cols-1 gap-1">
            <button
              type="button"
              onClick={() => {
                onNavigate('landing');
                closeMobile();
              }}
              className={`text-left px-3 py-2 rounded-md text-sm transition ${
                activeScreen === 'landing' ? 'bg-gold text-navy font-bold' : 'text-white/80 hover:bg-white/5'
              }`}
            >
              {t.nav_home}
            </button>

            {isClient && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('client_dashboard');
                  closeMobile();
                }}
                className={`text-left px-3 py-2 rounded-md text-sm transition ${
                  activeScreen === 'client_dashboard'
                    ? 'bg-gold text-navy font-bold'
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                {t.nav_dashboard}
              </button>
            )}

            {isStaff && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('admin_case_list');
                  closeMobile();
                }}
                className={`text-left px-3 py-2 rounded-md text-sm transition ${
                  activeScreen.startsWith('admin')
                    ? 'bg-gold text-navy font-bold'
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                {t.nav_admin}
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
            {isAuthenticated && (
              <div className="px-3 py-1 text-xs text-white/70 truncate">
                {userFullName || (isClient ? 'Müşteri' : 'Avukat')}
              </div>
            )}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  closeMobile();
                }}
                className="w-full py-2 rounded-md border border-white/15 text-white text-sm font-semibold flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('auth');
                    closeMobile();
                  }}
                  className="w-full py-2 rounded-md border border-white/15 text-white text-sm font-semibold"
                >
                  {t.nav_login}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('auth');
                    closeMobile();
                  }}
                  className="w-full py-2 rounded-md bg-gold text-navy text-sm font-bold"
                >
                  {t.hero_cta}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
