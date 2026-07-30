import React, { useState } from 'react';
import { 
  FileCheck, 
  Building2, 
  Users, 
  Briefcase, 
  Award, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  AlertCircle, 
  Zap, 
  FileText, 
  Clock, 
  Sparkles,
  Check
} from 'lucide-react';
import { LegalCase, UrgencyLevel, ScreenId } from '../types';

interface NewApplicationWizardScreenProps {
  onAddCase: (newCase: LegalCase) => void;
  onNavigate: (screen: ScreenId, caseId?: string) => void;
}

export const NewApplicationWizardScreen: React.FC<NewApplicationWizardScreenProps> = ({
  onAddCase,
  onNavigate,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<'oturtma' | 'sirket' | 'aile' | 'calisma' | 'vatandasilik'>('oturtma');
  const [caseTypeTitle, setCaseTypeTitle] = useState('Geçici Oturma İzni (Karta Pobytu Czasowego)');
  const [city, setCity] = useState('Varşova (Mazowieckie)');
  const [fullName, setFullName] = useState('Ahmet Yılmaz');
  const [phone, setPhone] = useState('+48 570 123 456');
  const [email, setEmail] = useState('ahmet.yilmaz@gmail.com');
  const [salary, setSalary] = useState('8.500 PLN Net');
  const [entryDate, setEntryDate] = useState('2025-09-15');
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgent');
  const [urgencyNote, setUrgencyNote] = useState('Mevcut ikamet vizemin dolmasına 15 gün kaldı.');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string }>>([
    { name: 'Pasaport_Taramasi_2026.pdf', size: '3.2 MB' },
  ]);

  const categories = [
    {
      id: 'oturtma',
      title: 'Oturma İzni (Karta Pobytu)',
      subtitle: 'Czasowy / Stały / Resydent EU',
      icon: <FileCheck className="w-6 h-6 text-red-500" />,
    },
    {
      id: 'sirket',
      title: 'Şirket Kuruluşu (Spółka z o.o.)',
      subtitle: 'S24 & Noterlik Kuruluşlar',
      icon: <Building2 className="w-6 h-6 text-blue-500" />,
    },
    {
      id: 'aile',
      title: 'Aile Birleşimi',
      subtitle: 'Eş ve Çocuk İkamet İzinleri',
      icon: <Users className="w-6 h-6 text-emerald-500" />,
    },
    {
      id: 'calisma',
      title: 'Çalışma İzni (Zezwolenie)',
      subtitle: 'Typ A / Typ B İzin Takibi',
      icon: <Briefcase className="w-6 h-6 text-amber-500" />,
    },
    {
      id: 'vatandasilik',
      title: 'Polonya Vatandaşlığı',
      subtitle: 'Uznanie / Cumhurbaşkanı',
      icon: <Award className="w-6 h-6 text-purple-500" />,
    },
  ];

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles(prev => [...prev, { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` }]);
    }
  };

  const handleSubmitApplication = () => {
    const newCaseId = `case-${Date.now()}`;
    const newCaseNumber = `PL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCase: LegalCase = {
      id: newCaseId,
      caseNumber: newCaseNumber,
      clientName: fullName,
      clientEmail: email,
      clientPhone: phone,
      caseType: caseTypeTitle,
      caseCategory: selectedCategory,
      city: city,
      status: urgency === 'critical' ? 'pending_docs' : 'received',
      urgency: urgency,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      assignedLawyer: 'Av. Piotr Kowalski',
      lawyerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      progressPercent: 25,
      documents: uploadedFiles.map((f, i) => ({
        id: `doc-new-${i}`,
        name: f.name,
        size: f.size,
        type: 'pdf',
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'pending',
      })),
      timeline: [
        {
          id: 't-new-1',
          title: 'Başvuru Alındı ve Avukata İletildi',
          description: 'Sistem üzerinden yeni dosyanız oluşturuldu.',
          date: 'Bugün',
          status: 'completed',
        },
        {
          id: 't-new-2',
          title: 'Hukuki Ön İnceleme Yapılıyor',
          description: 'Sorumlu avukatınız dosyayı inceliyor.',
          status: 'current',
        },
      ],
      internalNotes: [],
      messages: [],
      formSummary: {
        'Şehir': city,
        'Başvuru Türü': caseTypeTitle,
        'Aylık Gelir': salary,
        'Polonya Giriş': entryDate,
        'Aciliyet Seviyesi': urgency === 'critical' ? 'Çok Acil (48h Kırmızı Kod)' : urgency === 'urgent' ? 'Acil (15 Gün)' : 'Normal',
        'Aciliyet Notu': urgencyNote,
      },
    };

    onAddCase(newCase);
    onNavigate('case_timeline', newCaseId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>4 Adımda Hızlı Ön Değerlendirme</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Polonya Hukuki Başvuru Formu</h1>
          <p className="text-xs text-slate-600 max-w-lg mx-auto font-normal">
            Hangi hukuki sürece ihtiyacınız olduğunu seçin, dosyanızı baro kayıtlı avukatlarımız 24 saatte incelesin.
          </p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            
            <div className={`space-y-1.5 ${step >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step > 1 ? 'bg-emerald-600 text-white' : step === 1 ? 'bg-red-600 text-white shadow' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
              </div>
              <span className="hidden sm:inline">1. Süreç Türü</span>
            </div>

            <div className={`space-y-1.5 ${step >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
              </div>
              <span className="hidden sm:inline">2. Detay Soruları</span>
            </div>

            <div className={`space-y-1.5 ${step >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step > 3 ? 'bg-emerald-600 text-white' : step === 3 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {step > 3 ? <Check className="w-4 h-4" /> : '3'}
                </div>
              </div>
              <span className="hidden sm:inline">3. Aciliyet</span>
            </div>

            <div className={`space-y-1.5 ${step >= 4 ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step === 4 ? 'bg-red-600 text-white shadow' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  4
                </div>
              </div>
              <span className="hidden sm:inline">4. Evrak & Tamamla</span>
            </div>

          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-extrabold text-lg text-slate-900">Adım 1: Hukuki Hizmet Türünü Seçin</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id as any);
                      setCaseTypeTitle(cat.title);
                    }}
                    className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start space-x-4 ${
                      selectedCategory === cat.id
                        ? 'bg-red-50 border-red-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shrink-0 shadow-sm">
                      {cat.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{cat.title}</h4>
                      <p className="text-xs text-slate-600">{cat.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CONDITIONAL QUESTIONS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-xs">
              <h3 className="font-extrabold text-lg text-slate-900">Adım 2: Başvuru ve Şehir Detayları</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Polonya'da Yaşadığınız Şehir / Valilik (Województwo)
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  >
                    <option value="Varşova (Mazowieckie)">Varşova (Mazowiecki Urząd Wojewódzki)</option>
                    <option value="Kraków (Małopolskie)">Kraków (Małopolski Urząd Wojewódzki)</option>
                    <option value="Wrocław (Dolnośląskie)">Wrocław (Dolnośląski Urząd Wojewódzki)</option>
                    <option value="Poznań (Wielkopolskie)">Poznań (Wielkopolski Urząd Wojewódzki)</option>
                    <option value="Gdańsk (Pomorskie)">Gdańsk (Pomorski Urząd Wojewódzki)</option>
                    <option value="Diğer / Türkiye">Diğer / Türkiye'den Başvuru</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Polonya'ya İlk Giriş Tarihi
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Aylık Net Gelir (PLN / EURO)
                  </label>
                  <input
                    type="text"
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    placeholder="Örn: 8.500 PLN Net"
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    İletişim Telefonu
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: URGENCY LEVEL SELECTION */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-xs">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Adım 3: Dosya Aciliyet Seviyesi</h3>
                <p className="text-slate-600">Valilik tebliğ sürenize göre avukat müdahale hızını belirleyin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Normal */}
                <div
                  onClick={() => setUrgency('normal')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                    urgency === 'normal'
                      ? 'bg-slate-50 border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">Normal</span>
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Standart başvuru takibi. Vize veya ikamet sürenizin bitmesine 30+ gün var.
                  </p>
                </div>

                {/* Urgent */}
                <div
                  onClick={() => setUrgency('urgent')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                    urgency === 'urgent'
                      ? 'bg-amber-50 border-amber-500 shadow-sm'
                      : 'bg-white border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-700 text-sm">Acil (15 Gün)</span>
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-[11px] text-amber-900">
                    Süre dolmak üzere. Avukatınız 48 saat içinde dilekçenizi hazırlar.
                  </p>
                </div>

                {/* Critical - Red Alert */}
                <div
                  onClick={() => setUrgency('critical')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 relative overflow-hidden ${
                    urgency === 'critical'
                      ? 'bg-red-50 border-red-600 shadow-md ring-2 ring-red-200'
                      : 'bg-white border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-red-700 text-sm flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span>Çok Acil (48h Kırmızı Kod)</span>
                    </span>
                    <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-red-800">
                    Polis veya Valilik 7 günlük tebliğ yazısı gönderdi! Nöbetçi avukat anında atansın.
                  </p>
                </div>

              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Aciliyet Nedeni veya Özel Notunuz
                </label>
                <textarea
                  rows={3}
                  value={urgencyNote}
                  onChange={e => setUrgencyNote(e.target.value)}
                  placeholder="Örn: Eski kartımın süresi 10 gün sonra bitiyor, işverenim yeni belge istiyor..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-600 font-medium"
                />
              </div>

            </div>
          )}

          {/* STEP 4: DOCUMENT UPLOAD & SUMMARY */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-xs">
              <h3 className="font-extrabold text-lg text-slate-900">Adım 4: Belgeleri Yükleyin ve Tamamlayın</h3>

              {/* Drag & Drop Upload Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-red-600 rounded-2xl p-8 text-center space-y-3 bg-slate-50 transition cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleSimulatedFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 text-red-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Pasaport veya Valilik Evrakınızı Sürükleyin</h4>
                  <p className="text-slate-500 text-[11px]">PDF, JPG veya PNG formatı (Maks. 15MB)</p>
                </div>
              </div>

              {/* Yüklü Belgeler Listesi */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-700">Forma Eklenen Evraklar ({uploadedFiles.length})</span>
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-slate-800">{f.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{f.size}</span>
                  </div>
                ))}
              </div>

              {/* Summary Review */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-red-700 text-xs">Başvuru Özeti</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-medium">
                  <div><span className="text-slate-500">Kategori:</span> {caseTypeTitle}</div>
                  <div><span className="text-slate-500">Şehir:</span> {city}</div>
                  <div><span className="text-slate-500">Müşteri:</span> {fullName}</div>
                  <div><span className="text-slate-500">Aciliyet:</span> {urgency === 'critical' ? 'Çok Acil' : urgency === 'urgent' ? 'Acil' : 'Normal'}</div>
                </div>
              </div>

            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1"
              >
                <span>Devam Et</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitApplication}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition flex items-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Başvuruyu Avukata Gönder</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
