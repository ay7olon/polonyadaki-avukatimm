import React, { useEffect, useState } from 'react';
import {
  Scale,
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Language, ScreenId } from '../types';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail, isValidFullName, isValidPhone } from '../lib/validation';
import { BackLink } from '../components/BackLink';

interface AuthScreenProps {
  currentLanguage: Language;
  onLanguageChange?: (lang: Language) => void;
  onNavigate: (screen: ScreenId) => void;
  passwordRecoveryPending?: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'update_password';

/** Local-only demo logins — set in `.env`, never hardcode for public repos. */
const DEMO_CLIENT_EMAIL = import.meta.env.VITE_DEMO_CLIENT_EMAIL ?? '';
const DEMO_LAWYER_EMAIL = import.meta.env.VITE_DEMO_LAWYER_EMAIL ?? '';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? '';
const SHOW_DEMO_LOGINS =
  import.meta.env.DEV && Boolean(DEMO_CLIENT_EMAIL && DEMO_LAWYER_EMAIL && DEMO_PASSWORD);

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentLanguage: _currentLanguage,
  onNavigate,
  passwordRecoveryPending = false,
}) => {
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>(passwordRecoveryPending ? 'update_password' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+48 ');
  const [rodoAgreed, setRodoAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (passwordRecoveryPending) {
      setMode('update_password');
      setErrorMessage(null);
      setInfoMessage('Şifre sıfırlama bağlantısı doğrulandı. Yeni şifrenizi belirleyin.');
    }
  }, [passwordRecoveryPending]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMessage(null);
    setInfoMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (mode === 'forgot') {
      if (!isValidEmail(email)) {
        setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
        return;
      }
      setSubmitting(true);
      const { error } = await resetPassword(email);
      setSubmitting(false);
      if (error) {
        setErrorMessage(error);
        return;
      }
      setInfoMessage(
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu (ve spam klasörünü) kontrol edin.',
      );
      return;
    }

    if (mode === 'update_password') {
      if (password.length < 6) {
        setErrorMessage('Şifre en az 6 karakter olmalıdır.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Şifreler eşleşmiyor.');
        return;
      }
      setSubmitting(true);
      const { error } = await updatePassword(password);
      setSubmitting(false);
      if (error) {
        setErrorMessage(error);
        return;
      }
      setInfoMessage('Şifreniz güncellendi. Panele yönlendiriliyorsunuz…');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (mode === 'register') {
      if (!isValidFullName(name)) {
        setErrorMessage('Lütfen adınızı ve soyadınızı eksiksiz girin.');
        return;
      }
      if (!isValidPhone(phone)) {
        setErrorMessage('Lütfen geçerli bir telefon numarası girin (örn. +48 570 123 456).');
        return;
      }
      if (!rodoAgreed) {
        setErrorMessage('Devam etmek için RODO / kişisel veri onayını kabul etmeniz gerekiyor.');
        return;
      }
    }

    setSubmitting(true);
    const { error } =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp({ email, password, fullName: name, phone, rodoAccepted: rodoAgreed });
    setSubmitting(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    if (mode === 'register') {
      setInfoMessage(
        'Hesap oluşturuldu. E-posta doğrulaması açıksa gelen kutunuzdaki bağlantıyı onaylayın, ardından giriş yapın.',
      );
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setErrorMessage(null);
    setInfoMessage(null);
    setSubmitting(true);
    const { error } = await signIn(demoEmail, DEMO_PASSWORD);
    setSubmitting(false);
    if (error) {
      setErrorMessage(`Demo giriş başarısız: ${error}`);
    }
  };

  const inputClass =
    'w-full pl-9 pr-3 py-2.5 rounded-md bg-canvas border border-[#d7dee8] text-navy focus:outline-none focus:border-navy';

  const heading =
    mode === 'register'
      ? 'Hukuki Danışmanlık Hesabı Aç'
      : mode === 'forgot'
        ? 'Şifrenizi Sıfırlayın'
        : mode === 'update_password'
          ? 'Yeni Şifre Belirleyin'
          : 'Müşteri Portalına Giriş Yap';

  return (
    <div className="min-h-screen bg-canvas text-navy flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_320px_at_50%_0%,rgba(11,31,58,0.08),transparent_60%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center relative z-10">
        <div className="flex justify-start">
          <BackLink fallbackTo="/" label="Ana sayfaya dön" />
        </div>
        <div
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-navy border border-navy-2 flex items-center justify-center text-gold">
            <Scale className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-display text-xl font-semibold text-navy tracking-tight leading-tight">
              Polonyadaki Avukatım
            </div>
            <div className="text-[10px] text-gold font-semibold tracking-[0.14em] uppercase">
              Kancelaria
            </div>
          </div>
        </div>

        <h2 className="font-display text-2xl font-semibold text-navy tracking-tight">{heading}</h2>
        <p className="text-xs text-[#5b6b7c] font-medium">
          {mode === 'forgot'
            ? 'Kayıtlı e-posta adresinize sıfırlama bağlantısı göndereceğiz'
            : mode === 'update_password'
              ? 'Güvenliğiniz için güçlü bir şifre seçin'
              : 'Polonya\'daki dava ve Karta Pobytu başvurularınızı güvenle yönetin'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-[#d7dee8] rounded-lg p-6 sm:p-8 space-y-6">
          {(mode === 'login' || mode === 'register') && (
            <div className="grid grid-cols-2 p-1 bg-canvas rounded-md border border-[#d7dee8] text-xs font-bold">
              <button
                onClick={() => switchMode('login')}
                className={`py-2 rounded-md transition ${
                  mode === 'login' ? 'bg-navy text-white' : 'text-[#5b6b7c] hover:text-navy'
                }`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`py-2 rounded-md transition ${
                  mode === 'register' ? 'bg-navy text-white' : 'text-[#5b6b7c] hover:text-navy'
                }`}
              >
                Kayıt Ol
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start space-x-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="flex items-start space-x-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-navy mb-1">Ad Soyad</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5b6b7c] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div>
                <label className="block font-semibold text-navy mb-1">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5b6b7c] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ornek@domain.com"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-navy mb-1">
                  Telefon Numarası (Polonya / Türkiye)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#5b6b7c] absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+48 570 123 456"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'update_password') && (
              <div>
                <label className="block font-semibold text-navy mb-1">
                  {mode === 'update_password' ? 'Yeni Şifre' : 'Şifre'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5b6b7c] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {mode === 'update_password' && (
              <div>
                <label className="block font-semibold text-navy mb-1">Yeni Şifre (Tekrar)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5b6b7c] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Şifreyi tekrar girin"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[11px] font-semibold text-navy hover:text-gold transition"
                >
                  Şifremi unuttum
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rodo"
                  checked={rodoAgreed}
                  onChange={e => setRodoAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-[#d7dee8] text-navy focus:ring-navy bg-canvas"
                />
                <label htmlFor="rodo" className="text-[11px] text-[#5b6b7c] leading-normal">
                  Polonya Kişisel Verilerin Korunması Yasası (RODO / RODO Art. 6) uyarınca bilgilerimin hukuki danışmanlık kapsamında işlenmesini onaylıyorum.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-md bg-gold hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-navy text-sm transition flex items-center justify-center space-x-2 mt-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Müşteri Paneline Giriş Yap'
                      : mode === 'register'
                        ? 'Hesabımı Oluştur ve Devam Et'
                        : mode === 'forgot'
                          ? 'Sıfırlama Bağlantısı Gönder'
                          : 'Şifreyi Güncelle'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'register' && (
              <p className="text-[11px] text-[#5b6b7c] text-center">
                Kayıt sonrası e-posta adresinize gönderilen doğrulama bağlantısına tıklamanız gerekebilir.
              </p>
            )}
          </form>

          {(mode === 'forgot' || mode === 'update_password') && !passwordRecoveryPending && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full text-center text-xs font-semibold text-navy hover:text-gold transition"
            >
              Giriş ekranına dön
            </button>
          )}

          {SHOW_DEMO_LOGINS && mode === 'login' && (
            <div className="pt-4 border-t border-[#d7dee8] space-y-2">
              <p className="text-[10px] font-bold text-[#5b6b7c] uppercase tracking-wider text-center">
                Hızlı Demo Test Girişleri (sadece geliştirme ortamı):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin(DEMO_CLIENT_EMAIL)}
                  disabled={submitting}
                  className="p-2 rounded-md bg-canvas hover:bg-navy-soft border border-[#d7dee8] text-left space-y-0.5 transition disabled:opacity-60"
                >
                  <div className="flex items-center space-x-1 text-navy font-bold text-[11px]">
                    <User className="w-3 h-3 text-gold" />
                    <span>Müşteri Demosu</span>
                  </div>
                  <div className="text-[10px] text-[#5b6b7c] truncate">{DEMO_CLIENT_EMAIL}</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin(DEMO_LAWYER_EMAIL)}
                  disabled={submitting}
                  className="p-2 rounded-md bg-navy-soft hover:bg-navy/10 border border-[#d7dee8] text-left space-y-0.5 transition disabled:opacity-60"
                >
                  <div className="flex items-center space-x-1 text-navy font-bold text-[11px]">
                    <ShieldCheck className="w-3 h-3 text-gold" />
                    <span>Avukat Demosu</span>
                  </div>
                  <div className="text-[10px] text-[#5b6b7c] truncate">{DEMO_LAWYER_EMAIL}</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
