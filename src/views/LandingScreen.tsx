import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileCheck, 
  Building2, 
  Users, 
  Briefcase, 
  Award, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  PhoneCall, 
  MessageSquare, 
  Lock,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  UserCheck
} from 'lucide-react';
import { Language, ScreenId } from '../types';
import { UI_TRANSLATIONS, SERVICE_CATEGORIES, MOCK_LAWYERS } from '../data/mockData';

interface LandingScreenProps {
  currentLanguage: Language;
  onNavigate: (screen: ScreenId) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ currentLanguage, onNavigate }) => {
  const t = UI_TRANSLATIONS[currentLanguage];
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileCheck': return <FileCheck className="w-6 h-6 text-red-600" />;
      case 'Building2': return <Building2 className="w-6 h-6 text-slate-800" />;
      case 'Users': return <Users className="w-6 h-6 text-slate-800" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6 text-slate-800" />;
      case 'Award': return <Award className="w-6 h-6 text-slate-800" />;
      default: return <Scale className="w-6 h-6 text-slate-800" />;
    }
  };

  const faqs = [
    {
      q: 'Karta Pobytu başvurumda Türkçe dil desteği alabilir miyim?',
      a: 'Evet. Tüm görüşmeleriniz, evrak kontrolünüz ve valilik yazışmaları Türkçe dil desteği sunan Polonyalı ve Türk avukatlarımız tarafından eksiksiz yürütülür.',
    },
    {
      q: 'Valilikten (Urząd Wojewódzki) gelen olumsuz karara (Decyzja) itiraz edebilir misiniz?',
      a: 'Evet, kararın size tebliğ edilmesinden itibaren 14 günlük yasal süre içinde Şef UdsC (Szef Urzędu ds. Cudzoziemców) nezdinde itiraz (Odwołanie) dilekçenizi hazırlayıp sunuyoruz.',
    },
    {
      q: 'Polonya’da şirket kurmak için Polonya’da bulunmam şart mı?',
      a: 'Hayır. S24 elektronik sistemi veya elçilik onaylı noter vekaletnamesi ile Türkiye’den ayrılmadan Limited Şirketinizi (Spółka z o.o.) kurabiliyoruz.',
    },
    {
      q: 'Ücretsiz ön değerlendirme süreci nasıl işler?',
      a: 'Web sitemizdeki 4 adımlı hızlı formu doldurduğunuzda, uzman avukatlarımız 24 saat içinde durumunuzu inceleyip başarı oranınızı ve gerekli evrak listesini size iletir.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        
        {/* Subtle Decorative Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline & Call to Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>🇵🇱 Polonya Barosu Kayıtlı Uzman Hukuk Bürosu</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {t.hero_title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                {t.hero_subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('new_application')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base shadow-lg shadow-red-200 hover:shadow-red-300 transition flex items-center justify-center space-x-2 group"
                >
                  <span>{t.hero_cta}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('case_timeline')}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 hover:border-slate-400 shadow-sm transition flex items-center justify-center space-x-2"
                >
                  <FileText className="w-5 h-5 text-slate-700" />
                  <span>{t.hero_secondary_cta}</span>
                </button>
              </div>

              {/* Quick Trust Checks */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Gizli Ücret Yok</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>%100 Türkçe Danışmanlık</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resmi Baro Sicili</span>
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                
                {/* Polish Flag Corner Stripe */}
                <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                  <div className="bg-red-600 text-white text-[10px] font-bold py-1 px-8 transform rotate-45 translate-x-4 translate-y-3 shadow">
                    POLAND
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Hızlı Hukuki Ön İnceleme</h3>
                    <p className="text-xs text-slate-500">Dosyanızı hemen değerlendirelim</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">En Çok İstenen Hizmet:</span>
                      <span className="text-red-600 font-bold">Karta Pobytu (Oturum İzni)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Ortalama Süreç:</span>
                      <span className="text-slate-800 font-semibold">Varşova / Krakow Valiliği</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Türkçe Danışmanlık:</span>
                      <span className="text-emerald-700 font-semibold">Tam Desteğe Dahil</span>
                    </div>
                  </div>

                  <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700 flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      2026 Polonya Göç Yasası güncellemelerine uygun olarak evraklarınız valilik tesliminden önce avukatlarımızca sıfır hata ile denetlenir.
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('new_application')}
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow transition text-center"
                  >
                    Başvuruyu 2 Dakikada Başlat
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST METRICS SECTION */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-red-600">14+</div>
              <div className="text-xs font-bold text-slate-800">{t.trust_lawyers}</div>
              <div className="text-[11px] text-slate-500">Polonya & Türk Baroları</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">3.500+</div>
              <div className="text-xs font-bold text-slate-800">{t.trust_cases}</div>
              <div className="text-[11px] text-slate-500">Oturum, Şirket & Vize</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">%98</div>
              <div className="text-xs font-bold text-slate-800">{t.trust_success}</div>
              <div className="text-[11px] text-slate-500">Olumlu Sonuçlanan Dosyalar</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-sm">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600">12 Yıl</div>
              <div className="text-xs font-bold text-slate-800">{t.trust_years}</div>
              <div className="text-[11px] text-slate-500">Varşova Tebliğ Tecrübesi</div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SERVICE CATEGORIES GRID */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-600">Hukuki Uzmanlık Alanlarımız</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Polonya'da İhtiyacınız Olan Tüm Hukuki Çözümler</h3>
            <p className="text-slate-600 text-sm">
              Uzman avukatlarımız dosyanızı Polonya Yabancılar Kanunu (Ustawa o cudzoziemcach) çerçevesinde eksiksiz hazırlar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_CATEGORIES.map(service => {
              const title = t[service.titleKey] || service.badge;
              const desc = t[service.descKey] || '';

              return (
                <div
                  key={service.id}
                  onClick={() => onNavigate('new_application')}
                  className="bg-white border border-slate-200 hover:border-red-600 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 cursor-pointer group space-y-4 shadow-sm relative overflow-hidden"
                >
                  {service.popular && (
                    <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                      Popüler
                    </div>
                  )}

                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getServiceIcon(service.icon)}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">{service.badge}</span>
                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-red-600 transition">{title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                  </div>

                  <div className="pt-2 flex items-center space-x-1 text-xs font-bold text-slate-800 group-hover:text-red-600 transition">
                    <span>Başvuru Yap</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. LAWYER TEAM & EXPERTISE */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-600">Avukat Kadromuz</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Polonya Barolarına Kayıtlı Hukukçularımız</h3>
            <p className="text-slate-600 text-sm">
              Varşova, Krakow ve Wrocław valilikleri nezdinde dosya takibi yapan deneyimli avukat ekibimiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_LAWYERS.map((lawyer, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden space-y-4 p-6 text-center hover:border-slate-300 transition shadow-sm">
                <img
                  src={lawyer.avatar}
                  alt={lawyer.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-red-600 shadow-md"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-lg text-slate-900">{lawyer.name}</h4>
                  <p className="text-xs text-red-600 font-bold">{lawyer.role}</p>
                  <p className="text-xs text-slate-600">{lawyer.specialty}</p>
                </div>
                <div className="pt-2 flex items-center justify-center space-x-1.5">
                  {lawyer.languages.map(l => (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. CLIENT REVIEWS / TESTIMONIALS */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-600">Müşteri Yorumları</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Polonya’daki Türklerin Deneyimleri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "Varşova Valiliği'nden eksik evrak uyarısı almıştım, panikle ne yapacağımı bilemedim. Av. Piotr Bey 3 günde noter onaylı kira kontratımı düzenleyip sundu. Karta Pobytu'mu aldım!"
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-slate-900 font-bold text-white flex items-center justify-center text-xs">
                  AY
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Ahmet Yılmaz</h5>
                  <p className="text-[10px] text-slate-500">Yazılım Mühendisi / Warszawa</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "Kraków'da Spółka z o.o. şirketimizi kurarken S24 sistemi ve PKD kodlarının seçiminde Av. Zeynep Hanım harika bir rehberlik sağladı. Kesinlikle tavsiye ederim."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-slate-900 font-bold text-white flex items-center justify-center text-xs">
                  EK
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Elif Kaya Demir</h5>
                  <p className="text-[10px] text-slate-500">Şirket Kurucusu / Kraków</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "Eşim ve çocuğum için aile birleşimi sürecini yönettiler. Başvuru takip sistemleri üzerinden her adımı gün gün görebilmek içimizi çok rahatlattı."
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-slate-900 font-bold text-white flex items-center justify-center text-xs">
                  MŞ
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Mehmet Şahin</h5>
                  <p className="text-[10px] text-slate-500">Wrocław</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-600">Sıkça Sorulan Sorular</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Polonya Hukuk Süreçleri Hakkında Merak Edilenler</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left p-4 font-semibold text-sm text-slate-800 flex justify-between items-center hover:text-red-600 transition"
                >
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <span className="text-xs text-slate-500 ml-2 font-bold">{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-200 leading-relaxed bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. BOTTOM PRE-EVALUATION CTA BAR */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Polonya'daki Hukuki Sürecinizi Risklere Bırakmayın
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            Eksik evrak veya hatalı başvurular aylarca zaman kaybına yol açar. Dosyanızı Polonya barosu üyesi avukatlarımıza hemen inceletin.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => onNavigate('new_application')}
              className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 font-extrabold text-white shadow-xl text-sm transition"
            >
              Ücretsiz Ön Değerlendirme Başlat
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="px-7 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-sm border border-slate-700 transition"
            >
              Müşteri Girişi Yap
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
