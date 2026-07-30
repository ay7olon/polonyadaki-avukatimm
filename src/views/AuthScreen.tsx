import React, { useState } from 'react';
import { 
  Scale, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { Language, ScreenId } from '../types';
import { UI_TRANSLATIONS } from '../data/mockData';

interface AuthScreenProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (screen: ScreenId) => void;
  onLoginSuccess: (role: 'client' | 'admin') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentLanguage,
  onLanguageChange,
  onNavigate,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('ahmet.yilmaz@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Ahmet Yılmaz');
  const [phone, setPhone] = useState('+48 570 123 456');
  const [rodoAgreed, setRodoAgreed] = useState(true);

  const t = UI_TRANSLATIONS[currentLanguage];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess('client');
    onNavigate('client_dashboard');
  };

  const handleAdminDemoLogin = () => {
    onLoginSuccess('admin');
    onNavigate('admin_case_list');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center space-x-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-md">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">POLONYADAKİ</span>
            <span className="font-extrabold text-xl text-red-600 tracking-tight">AVUKATIM</span>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {mode === 'login' ? 'Müşteri Portalına Giriş Yap' : 'Hukuki Danışmanlık Hesabı Aç'}
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          Polonya'daki dava ve Karta Pobytu başvurularınızı güvenle yönetin
        </p>

        {/* Language Switcher Component inside Auth */}
        <div className="inline-flex items-center bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-sm">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {(['TR', 'PL', 'EN'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2.5 py-1 rounded font-bold transition ${
                currentLanguage === lang ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Main Centered Form Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Segmented Control Tabs (Giriş Yap / Kayıt Ol) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMode('login')}
              className={`py-2 rounded-lg transition ${
                mode === 'login' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setMode('register')}
              className={`py-2 rounded-lg transition ${
                mode === 'register' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Register specific: Full Name */}
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ad Soyad
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ornek@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Phone Field (for Register) */}
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Telefon Numarası (Polonya / Türkiye)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+48 570 123 456"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Şifre
                </label>
                {mode === 'login' && (
                  <a href="#" className="text-[11px] text-red-600 hover:underline font-semibold">
                    Şifremi Unuttum?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* RODO / GDPR Checkbox for Register */}
            {mode === 'register' && (
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rodo"
                  checked={rodoAgreed}
                  onChange={e => setRodoAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500 bg-slate-50"
                />
                <label htmlFor="rodo" className="text-[11px] text-slate-600 leading-normal">
                  Polonya Kişisel Verilerin Korunması Yasası (RODO / RODO Art. 6) uyarınca bilgilerimin hukuki danışmanlık kapsamında işlenmesini onaylıyorum.
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white text-sm shadow-md transition flex items-center justify-center space-x-2 mt-2"
            >
              <span>{mode === 'login' ? 'Müşteri Paneline Giriş Yap' : 'Hesabımı Oluştur ve Devam Et'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Presets for Development Testing */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Hızlı Demo Test Girişleri:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onLoginSuccess('client');
                  onNavigate('client_dashboard');
                }}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left space-y-0.5 group transition"
              >
                <div className="flex items-center space-x-1 text-slate-900 font-bold text-[11px]">
                  <User className="w-3 h-3 text-red-600" />
                  <span>Müşteri Demosu</span>
                </div>
                <div className="text-[10px] text-slate-500">Ahmet Yılmaz (Karta Pobytu)</div>
              </button>

              <button
                onClick={handleAdminDemoLogin}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left space-y-0.5 group transition"
              >
                <div className="flex items-center space-x-1 text-amber-900 font-bold text-[11px]">
                  <ShieldCheck className="w-3 h-3 text-amber-700" />
                  <span>Avukat Demosu</span>
                </div>
                <div className="text-[10px] text-amber-800">Av. Piotr Kowalski</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
