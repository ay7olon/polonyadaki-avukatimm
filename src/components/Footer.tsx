import React from 'react';
import { Scale, MapPin, Phone, Mail, ShieldCheck, Globe, ExternalLink } from 'lucide-react';
import { Language, ScreenId } from '../types';
import { UI_TRANSLATIONS } from '../data/mockData';

interface FooterProps {
  currentLanguage: Language;
  onNavigate: (screen: ScreenId) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLanguage, onNavigate }) => {
  const t = UI_TRANSLATIONS[currentLanguage];

  return (
    <footer className="bg-white text-slate-600 text-xs border-t border-slate-200 font-sans">
      
      {/* Poland & Turkey Legal Bridge Banner */}
      <div className="bg-slate-50 border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Polonya Barosuna Kayıtlı Uzman Hukuk Kadrosu
              </h4>
              <p className="text-slate-500 text-xs font-medium">
                Krajowa Rada Radców Prawnych & Izba Adwokacka w Warszawie Sicil Kayıtlı
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('new_application')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-md text-xs"
            >
              Ücretsiz Ön Değerlendirme Al
            </button>
            <button
              onClick={() => onNavigate('case_timeline')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 transition text-xs shadow-xs"
            >
              Süreç Takip Et
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-red-600" />
            <span className="font-extrabold text-base text-slate-900 tracking-tight">POLONYADAKİ AVUKATIM</span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed font-medium">
            Polonya’da ikamet eden Türk vatandaşlarına Türkçe ve Lehçe dillerinde Karta Pobytu, şirket kurulumu, aile birleşimi ve idari dava hizmetleri sunan uzman hukuk bürosu.
          </p>
          <div className="flex items-center space-x-2 text-slate-700">
            <Globe className="w-4 h-4 text-red-600" />
            <span className="font-bold text-xs">Varşova & Kraków Ofisleri</span>
          </div>
        </div>

        {/* Col 2: Services */}
        <div className="space-y-3">
          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-red-600">
            Hizmet Alanlarımız
          </h5>
          <ul className="space-y-2 text-xs font-medium text-slate-600">
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-red-600 transition">Geçici & Sürekli Oturma İzni (Karta Pobytu)</button></li>
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-red-600 transition">Spółka z o.o. Şirket Kuruluşu & S24</button></li>
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-red-600 transition">Aile Birleşimi & Vize Süreçleri</button></li>
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-red-600 transition">İtiraz Dilekçeleri (Odwołanie do UdsC)</button></li>
            <li><button onClick={() => onNavigate('new_application')} className="hover:text-red-600 transition">Polonya Vatandaşlığı Başvurusu</button></li>
          </ul>
        </div>

        {/* Col 3: Contact & Locations */}
        <div className="space-y-3">
          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-red-600">
            İletişim & Ofisler
          </h5>
          <div className="space-y-2 text-xs text-slate-600 font-medium">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>ul. Marszałkowska 111/45, 00-102 Warszawa, Polska</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-red-600 shrink-0" />
              <span>+48 22 123 45 67 (Varşova Ofisi)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-red-600 shrink-0" />
              <span>info@polonyadakiavukatim.com</span>
            </div>
          </div>
        </div>

        {/* Col 4: Legal Disclaimer */}
        <div className="space-y-3">
          <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-red-600">
            Yasal Bilgilendirme
          </h5>
          <p className="text-[11px] text-slate-500 leading-normal font-medium">
            Bu web sitesinde yer alan hukuki metinler bilgilendirme amaçlıdır. Polonya mevzuatına tabi resmi vekaletname akdedilmeden hukuki danışman-müvekkil ilişkisi kurulmuş sayılmaz.
          </p>
          <div className="pt-2 text-[10px] text-slate-400 font-mono font-medium">
            KRS: 0000987654 | NIP: 5252899011 | REGON: 389123456
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 bg-slate-50 py-4 px-4 sm:px-6 lg:px-8 text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium">
            © 2026 Polonyadaki Avukatım - Kancelaria Prawna. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center space-x-4 font-medium">
            <a href="#" className="hover:text-slate-900 transition">Gizlilik Politikası (RODO)</a>
            <a href="#" className="hover:text-slate-900 transition">Kullanım Şartları</a>
            <a href="#" className="hover:text-slate-900 transition">Çerez Tercihleri</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
