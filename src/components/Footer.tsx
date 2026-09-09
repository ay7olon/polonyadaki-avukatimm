import React from 'react';
import { Scale, MapPin, Phone, Mail, ShieldCheck, Globe } from 'lucide-react';
import { Language, ScreenId } from '../types';

interface FooterProps {
  currentLanguage: Language;
  onNavigate: (screen: ScreenId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-navy text-white/70 text-xs border-t border-white/10 font-sans">
      <div className="bg-navy-2 border-b border-white/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                Polonya Barosuna Kayıtlı Uzman Hukuk Kadrosu
              </h4>
              <p className="text-white/50 text-xs font-medium">
                Krajowa Rada Radców Prawnych & Izba Adwokacka w Warszawie Sicil Kayıtlı
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onNavigate('new_application')}
              className="px-4 py-2.5 sm:py-2 rounded-md bg-gold hover:brightness-105 text-navy font-bold transition text-xs text-center"
            >
              Ücretsiz Ön Değerlendirme Al
            </button>
            <button
              onClick={() => onNavigate('case_timeline')}
              className="px-4 py-2.5 sm:py-2 rounded-md bg-transparent hover:bg-white/5 text-white font-bold border border-white/20 transition text-xs text-center"
            >
              Süreç Takip Et
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-gold" />
            <span className="font-display font-semibold text-base text-white tracking-tight">
              Polonyadaki Avukatım
            </span>
          </div>
          <p className="text-white/55 text-xs leading-relaxed font-medium">
            Polonya’da ikamet eden Türk vatandaşlarına Türkçe ve Lehçe dillerinde Karta Pobytu, şirket kurulumu, aile birleşimi ve idari dava hizmetleri sunan uzman hukuk bürosu.
          </p>
          <div className="flex items-center space-x-2 text-white/75">
            <Globe className="w-4 h-4 text-gold" />
            <span className="font-bold text-xs">Varşova & Kraków Ofisleri</span>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold text-gold text-xs uppercase tracking-wider">
            Hizmet Alanlarımız
          </h5>
          <ul className="space-y-2 text-xs font-medium text-white/60">
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-gold transition">Geçici & Sürekli Oturma İzni (Karta Pobytu)</button></li>
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-gold transition">Spółka z o.o. Şirket Kuruluşu & S24</button></li>
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-gold transition">Aile Birleşimi & Vize Süreçleri</button></li>
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-gold transition">İtiraz Dilekçeleri (Odwołanie do UdsC)</button></li>
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-gold transition">Polonya Vatandaşlığı Başvurusu</button></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold text-gold text-xs uppercase tracking-wider">
            İletişim & Ofisler
          </h5>
          <div className="space-y-2 text-xs text-white/60 font-medium">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span>ul. Marszałkowska 111/45, 00-102 Warszawa, Polska</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <span>+48 22 123 45 67 (Varşova Ofisi)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <span>info@polonyadakiavukatim.com</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold text-gold text-xs uppercase tracking-wider">
            Yasal Bilgilendirme
          </h5>
          <p className="text-[11px] text-white/45 leading-normal font-medium">
            Bu web sitesinde yer alan hukuki metinler bilgilendirme amaçlıdır. Polonya mevzuatına tabi resmi vekaletname akdedilmeden hukuki danışman-müvekkil ilişkisi kurulmuş sayılmaz.
          </p>
          <div className="pt-2 text-[10px] text-white/35 font-mono font-medium">
            KRS: 0000987654 | NIP: 5252899011 | REGON: 389123456
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-navy-2/60 py-4 px-4 sm:px-6 lg:px-8 text-white/40 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium">
            © 2026 Polonyadaki Avukatım - Kancelaria Prawna. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
};
