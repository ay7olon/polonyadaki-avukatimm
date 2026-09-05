import React, { useState } from 'react';
import {
  FileCheck,
  Building2,
  Users,
  Briefcase,
  Award,
  Scale,
  ArrowRight,
  CheckCircle2,
  Star,
  Sparkles,
  HelpCircle,
  FileText,
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
      case 'FileCheck': return <FileCheck className="w-6 h-6 text-navy" />;
      case 'Building2': return <Building2 className="w-6 h-6 text-navy" />;
      case 'Users': return <Users className="w-6 h-6 text-navy" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6 text-navy" />;
      case 'Award': return <Award className="w-6 h-6 text-navy" />;
      default: return <Scale className="w-6 h-6 text-navy" />;
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
    <div className="min-h-screen bg-canvas text-navy font-sans selection:bg-navy selection:text-white">

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy to-navy-2 text-white border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(900px_360px_at_80%_-10%,rgba(194,164,107,0.18),transparent_55%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-14 pb-16 lg:pt-20 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gold/35 bg-white/5 text-gold text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>Polonya Barosu · Güvenli Hukuki Takip</span>
              </div>

              <h1 className="font-display text-[1.85rem] leading-[1.12] sm:text-5xl sm:leading-[1.08] lg:text-[3.4rem] font-semibold tracking-tight text-white max-w-3xl mx-auto lg:mx-0">
                {t.hero_title}
              </h1>

              <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.hero_subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <button
                  onClick={() => onNavigate('new_application')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-sm transition flex items-center justify-center space-x-2 group"
                >
                  <span>{t.hero_cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('case_timeline')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-md bg-transparent hover:bg-white/5 text-white font-semibold text-sm border border-white/20 hover:border-white/35 transition flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-gold" />
                  <span>{t.hero_secondary_cta}</span>
                </button>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-white/55 font-medium">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gold" />
                  <span>Gizli Ücret Yok</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gold" />
                  <span>%100 Türkçe Danışmanlık</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gold" />
                  <span>Resmi Baro Sicili</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-white/12 bg-white/6 backdrop-blur-sm p-6 space-y-5">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center text-gold">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Hızlı Hukuki Ön İnceleme</h3>
                    <p className="text-xs text-white/50">Dosyanızı hemen değerlendirelim</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="text-white/50">En Çok İstenen Hizmet</span>
                    <span className="text-gold font-semibold">Karta Pobytu</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="text-white/50">Ortalama Süreç</span>
                    <span className="text-white/85 font-medium">Varşova / Kraków Valiliği</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="text-white/50">Türkçe Danışmanlık</span>
                    <span className="text-white/85 font-medium">Tam Destek</span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70 flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>
                    2026 Polonya Göç Yasası güncellemelerine uygun olarak evraklarınız valilik tesliminden önce avukatlarımızca denetlenir.
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('new_application')}
                  className="w-full py-3 rounded-md bg-gold hover:brightness-105 text-navy font-bold text-sm transition"
                >
                  Başvuruyu 2 Dakikada Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST METRICS */}
      <section className="py-10 bg-white border-b border-[#d7dee8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-lg bg-canvas border border-[#d7dee8] space-y-1">
              <div className="text-3xl font-display font-semibold text-navy">14+</div>
              <div className="text-xs font-bold text-navy">{t.trust_lawyers}</div>
              <div className="text-[11px] text-[#5b6b7c]">Polonya & Türk Baroları</div>
            </div>
            <div className="p-4 rounded-lg bg-canvas border border-[#d7dee8] space-y-1">
              <div className="text-3xl font-display font-semibold text-navy">3.500+</div>
              <div className="text-xs font-bold text-navy">{t.trust_cases}</div>
              <div className="text-[11px] text-[#5b6b7c]">Oturum, Şirket & Vize</div>
            </div>
            <div className="p-4 rounded-lg bg-canvas border border-[#d7dee8] space-y-1">
              <div className="text-3xl font-display font-semibold text-navy">%98</div>
              <div className="text-xs font-bold text-navy">{t.trust_success}</div>
              <div className="text-[11px] text-[#5b6b7c]">Olumlu Sonuçlanan Dosyalar</div>
            </div>
            <div className="p-4 rounded-lg bg-canvas border border-[#d7dee8] space-y-1">
              <div className="text-3xl font-display font-semibold text-navy">12 Yıl</div>
              <div className="text-xs font-bold text-navy">{t.trust_years}</div>
              <div className="text-[11px] text-[#5b6b7c]">Varşova Tebliğ Tecrübesi</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES */}
      <section className="py-16 bg-canvas border-b border-[#d7dee8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Hukuki Uzmanlık Alanlarımız</h2>
            <h3 className="font-display text-3xl font-semibold text-navy">Polonya'da İhtiyacınız Olan Tüm Hukuki Çözümler</h3>
            <p className="text-[#5b6b7c] text-sm">
              Uzman avukatlarımız dosyanızı Polonya Yabancılar Kanunu çerçevesinde eksiksiz hazırlar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_CATEGORIES.map(service => {
              const title = t[service.titleKey] || service.badge;
              const desc = t[service.descKey] || '';

              return (
                <div
                  key={service.id}
                  onClick={() => onNavigate('new_application')}
                  className="bg-white border border-[#d7dee8] hover:border-navy/40 rounded-lg p-6 transition cursor-pointer group space-y-4 relative border-l-[3px] border-l-navy"
                >
                  {service.popular && (
                    <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-navy-soft text-navy border border-[#d7dee8]">
                      Popüler
                    </div>
                  )}

                  <div className="w-11 h-11 rounded-lg bg-navy-soft border border-[#d7dee8] flex items-center justify-center">
                    {getServiceIcon(service.icon)}
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-gold uppercase tracking-wider">{service.badge}</span>
                    <h4 className="font-semibold text-lg text-navy group-hover:text-navy-2 transition">{title}</h4>
                    <p className="text-xs text-[#5b6b7c] leading-relaxed">{desc}</p>
                  </div>

                  <div className="pt-1 flex items-center space-x-1 text-xs font-bold text-navy">
                    <span>Başvuru Yap</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. LAWYERS */}
      <section className="py-16 bg-white border-b border-[#d7dee8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Avukat Kadromuz</h2>
            <h3 className="font-display text-3xl font-semibold text-navy">Polonya Barolarına Kayıtlı Hukukçularımız</h3>
            <p className="text-[#5b6b7c] text-sm">
              Varşova, Krakow ve Wrocław valilikleri nezdinde dosya takibi yapan deneyimli avukat ekibimiz.
            </p>
            <p className="inline-flex items-center px-2.5 py-1 rounded border border-[#d7dee8] bg-canvas text-[11px] font-semibold text-[#5b6b7c]">
              Örnek kadro — tanıtım amaçlı gösterim
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MOCK_LAWYERS.map((lawyer, i) => (
              <div key={i} className="bg-canvas border border-[#d7dee8] rounded-lg p-6 text-center space-y-4">
                <img
                  src={lawyer.avatar}
                  alt={lawyer.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-navy"
                />
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg text-navy">{lawyer.name}</h4>
                  <p className="text-xs text-gold font-bold">{lawyer.role}</p>
                  <p className="text-xs text-[#5b6b7c]">{lawyer.specialty}</p>
                </div>
                <div className="pt-1 flex items-center justify-center space-x-1.5">
                  {lawyer.languages.map(l => (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#d7dee8] text-navy font-semibold">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-16 bg-canvas border-b border-[#d7dee8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Müşteri Yorumları</h2>
            <h3 className="font-display text-3xl font-semibold text-navy">Polonya’daki Türklerin Deneyimleri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                text: '"Varşova Valiliği\'nden eksik evrak uyarısı almıştım, panikle ne yapacağımı bilemedim. Av. Piotr Bey 3 günde noter onaylı kira kontratımı düzenleyip sundu. Karta Pobytu\'mu aldım!"',
                initials: 'AY',
                name: 'Ahmet Yılmaz',
                role: 'Yazılım Mühendisi / Warszawa',
              },
              {
                text: '"Kraków\'da Spółka z o.o. şirketimizi kurarken S24 sistemi ve PKD kodlarının seçiminde Av. Zeynep Hanım harika bir rehberlik sağladı. Kesinlikle tavsiye ederim."',
                initials: 'EK',
                name: 'Elif Kaya Demir',
                role: 'Şirket Kurucusu / Kraków',
              },
              {
                text: '"Eşim ve çocuğum için aile birleşimi sürecini yönettiler. Başvuru takip sistemleri üzerinden her adımı gün gün görebilmek içimizi çok rahatlattı."',
                initials: 'MŞ',
                name: 'Mehmet Şahin',
                role: 'Wrocław',
              },
            ].map(item => (
              <div key={item.name} className="bg-white border border-[#d7dee8] p-6 rounded-lg space-y-4">
                <div className="flex items-center space-x-1 text-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold" />)}
                </div>
                <p className="text-xs text-[#5b6b7c] italic leading-relaxed">{item.text}</p>
                <div className="flex items-center space-x-3 pt-1">
                  <div className="w-9 h-9 rounded-full bg-navy font-bold text-white flex items-center justify-center text-xs">
                    {item.initials}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-navy">{item.name}</h5>
                    <p className="text-[10px] text-[#5b6b7c]">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-16 bg-white border-b border-[#d7dee8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Sıkça Sorulan Sorular</h2>
            <h3 className="font-display text-3xl font-semibold text-navy">Polonya Hukuk Süreçleri Hakkında</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-canvas border border-[#d7dee8] rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left p-4 font-semibold text-sm text-navy flex justify-between items-center hover:text-navy-2 transition"
                >
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-gold shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <span className="text-xs text-[#5b6b7c] ml-2 font-bold">{activeFaq === index ? '−' : '+'}</span>
                </button>
                {activeFaq === index && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#5b6b7c] border-t border-[#d7dee8] leading-relaxed bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="py-14 bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-5">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Polonya'daki Hukuki Sürecinizi Risklere Bırakmayın
          </h2>
          <p className="text-white/65 max-w-2xl mx-auto text-sm">
            Eksik evrak veya hatalı başvurular aylarca zaman kaybına yol açar. Dosyanızı Polonya barosu üyesi avukatlarımıza hemen inceletin.
          </p>
          <div className="pt-1 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => onNavigate('new_application')}
              className="px-7 py-3.5 rounded-md bg-gold hover:brightness-105 font-bold text-navy text-sm transition"
            >
              Ücretsiz Ön Değerlendirme Başlat
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="px-6 py-3.5 rounded-md bg-transparent hover:bg-white/5 font-semibold text-white text-sm border border-white/20 transition"
            >
              Müşteri Girişi Yap
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
