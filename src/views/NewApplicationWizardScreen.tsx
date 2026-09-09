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
  Check,
  Loader2
} from 'lucide-react';
import { BackLink } from '../components/BackLink';
import { UrgencyLevel, ScreenId, CaseStatus } from '../types';
import { supabase } from '../lib/supabaseClient';
import { formatFileSize, uploadCaseDocumentFile } from '../lib/storage';
import { isValidPhone, validateUploadFile } from '../lib/validation';
import { useToast } from '../hooks/useToast';

interface WizardCurrentUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

interface NewApplicationWizardScreenProps {
  currentUser: WizardCurrentUser;
  onSubmitted: (newCaseId: string) => void;
  onNavigate: (screen: ScreenId, caseId?: string) => void;
}

export const NewApplicationWizardScreen: React.FC<NewApplicationWizardScreenProps> = ({
  currentUser,
  onSubmitted,
  onNavigate,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<'oturtma' | 'sirket' | 'aile' | 'calisma' | 'vatandasilik'>('oturtma');
  const [caseTypeTitle, setCaseTypeTitle] = useState('Geçici Oturma İzni (Karta Pobytu Czasowego)');
  const [city, setCity] = useState('Varşova (Mazowieckie)');
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone || '+48 ');
  const [email] = useState(currentUser.email);
  const [salary, setSalary] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [urgencyNote, setUrgencyNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; name: string; size: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitProgress, setSubmitProgress] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const { showError, showSuccess } = useToast();

  const categories = [
    {
      id: 'oturtma',
      title: 'Oturma İzni (Karta Pobytu)',
      subtitle: 'Czasowy / Stały / Resydent EU',
      icon: <FileCheck className="w-6 h-6 text-navy" />,
    },
    {
      id: 'sirket',
      title: 'Şirket Kuruluşu (Spółka z o.o.)',
      subtitle: 'S24 & Noterlik Kuruluşlar',
      icon: <Building2 className="w-6 h-6 text-navy" />,
    },
    {
      id: 'aile',
      title: 'Aile Birleşimi',
      subtitle: 'Eş ve Çocuk İkamet İzinleri',
      icon: <Users className="w-6 h-6 text-navy" />,
    },
    {
      id: 'calisma',
      title: 'Çalışma İzni (Zezwolenie)',
      subtitle: 'Typ A / Typ B İzin Takibi',
      icon: <Briefcase className="w-6 h-6 text-gold" />,
    },
    {
      id: 'vatandasilik',
      title: 'Polonya Vatandaşlığı',
      subtitle: 'Uznanie / Cumhurbaşkanı',
      icon: <Award className="w-6 h-6 text-gold" />,
    },
  ];

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      showError(validation.error!);
      return;
    }
    setUploadedFiles(prev => [...prev, { file, name: file.name, size: formatFileSize(file.size) }]);
  };

  const handleNextStep = () => {
    setStepError(null);

    if (step === 2) {
      if (!entryDate) {
        setStepError('Lütfen Polonya\'ya ilk giriş tarihinizi seçin.');
        return;
      }
      if (!isValidPhone(phone)) {
        setStepError('Lütfen geçerli bir telefon numarası girin (örn. +48 570 123 456).');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleSubmitApplication = async () => {
    setSubmitError(null);
    setSubmitting(true);

    const initialStatus: CaseStatus = urgency === 'critical' ? 'pending_docs' : 'received';
    const formSummary: Record<string, string> = {
      'Şehir': city,
      'Başvuru Türü': caseTypeTitle,
      'Aylık Gelir': salary,
      'Polonya Giriş': entryDate,
      'Aciliyet Seviyesi': urgency === 'critical' ? 'Çok Acil (48h Kırmızı Kod)' : urgency === 'urgent' ? 'Acil (15 Gün)' : 'Normal',
      'Aciliyet Notu': urgencyNote,
    };

    let caseId: string | null = null;
    let lastError: string | null = null;

    // case_number has a unique constraint; retry a couple of times on the
    // (rare) chance of a random collision.
    for (let attempt = 0; attempt < 3 && !caseId; attempt++) {
      const caseNumber = `PL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error } = await supabase
        .from('legal_cases')
        .insert({
          case_number: caseNumber,
          client_id: currentUser.id,
          case_type: caseTypeTitle,
          case_category: selectedCategory,
          city,
          status: initialStatus,
          urgency,
          progress_percent: 10,
          form_summary: formSummary,
        })
        .select('id')
        .single();

      if (!error && data) {
        caseId = data.id as string;
      } else {
        lastError = error?.message ?? 'Bilinmeyen hata';
      }
    }

    if (!caseId) {
      const message = `Başvuru oluşturulamadı: ${lastError}`;
      setSubmitError(message);
      showError(message);
      setSubmitting(false);
      return;
    }

    // Initial timeline steps are created automatically by a DB trigger.
    const uploadFailures: string[] = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const f = uploadedFiles[i];
      setSubmitProgress(`Evrak yükleniyor (${i + 1}/${uploadedFiles.length}): ${f.name}`);

      const { path, error: uploadError } = await uploadCaseDocumentFile(caseId, f.file);
      if (uploadError || !path) {
        const reason = uploadError ?? 'Dosya yolu alınamadı';
        uploadFailures.push(f.name);
        showError(`Dosya yüklenemedi (${f.name}): ${reason}`);
        continue;
      }

      const { error: docsError } = await supabase.from('case_documents').insert({
        case_id: caseId,
        name: f.name,
        size: f.size,
        type: f.name.split('.').pop()?.toLowerCase() ?? 'dosya',
        status: 'pending' as const,
        storage_path: path,
      });
      if (docsError) {
        uploadFailures.push(f.name);
        showError(`Belge kaydı başarısız (${f.name}): ${docsError.message}`);
      }
    }

    setSubmitProgress(null);
    setSubmitting(false);

    if (uploadFailures.length > 0) {
      const message =
        uploadedFiles.length > 0 && uploadFailures.length === uploadedFiles.length
          ? `Başvuru oluşturuldu ancak evraklar yüklenemedi: ${uploadFailures.join(', ')}. Dosya detayından tekrar yükleyebilirsiniz.`
          : `Başvuru oluşturuldu; bazı evraklar yüklenemedi: ${uploadFailures.join(', ')}. Eksikleri dosya detayından tamamlayabilirsiniz.`;
      setSubmitError(message);
      showError(message);
      onSubmitted(caseId);
      return;
    }

    showSuccess('Başvurunuz alındı! Avukatlarımız en kısa sürede dosyanızı inceleyecek.');
    onSubmitted(caseId);
  };

  return (
    <div className="min-h-screen bg-canvas text-navy py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <BackLink fallbackTo="/app" label="Müşteri paneline dön" />
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-navy-soft border border-[#d7dee8] text-navy text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>4 Adımda Hızlı Ön Değerlendirme</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-navy">Polonya Hukuki Başvuru Formu</h1>
          <p className="text-xs text-[#5b6b7c] max-w-lg mx-auto font-normal">
            Hangi hukuki sürece ihtiyacınız olduğunu seçin, dosyanızı baro kayıtlı avukatlarımız 24 saatte incelesin.
          </p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-white border border-[#d7dee8] rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            
            <div className={`space-y-1.5 ${step >= 1 ? 'text-navy font-bold' : 'text-[#5b6b7c] font-medium'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step > 1 ? 'bg-emerald-600 text-white' : step === 1 ? 'bg-navy text-white shadow' : 'bg-navy-soft text-[#5b6b7c] border border-[#d7dee8]'
                }`}>
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
              </div>
              <span className="hidden sm:inline">1. Süreç Türü</span>
            </div>

            <div className={`space-y-1.5 ${step >= 2 ? 'text-navy font-bold' : 'text-[#5b6b7c] font-medium'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-navy text-white' : 'bg-navy-soft text-[#5b6b7c] border border-[#d7dee8]'
                }`}>
                  {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
              </div>
              <span className="hidden sm:inline">2. Detay Soruları</span>
            </div>

            <div className={`space-y-1.5 ${step >= 3 ? 'text-navy font-bold' : 'text-[#5b6b7c] font-medium'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step > 3 ? 'bg-emerald-600 text-white' : step === 3 ? 'bg-navy text-white' : 'bg-navy-soft text-[#5b6b7c] border border-[#d7dee8]'
                }`}>
                  {step > 3 ? <Check className="w-4 h-4" /> : '3'}
                </div>
              </div>
              <span className="hidden sm:inline">3. Aciliyet</span>
            </div>

            <div className={`space-y-1.5 ${step >= 4 ? 'text-navy font-bold' : 'text-[#5b6b7c] font-medium'}`}>
              <div className="flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step === 4 ? 'bg-navy text-white shadow' : 'bg-navy-soft text-[#5b6b7c] border border-[#d7dee8]'
                }`}>
                  4
                </div>
              </div>
              <span className="hidden sm:inline">4. Evrak & Tamamla</span>
            </div>

          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white border border-[#d7dee8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-extrabold text-lg font-display text-navy">Adım 1: Hukuki Hizmet Türünü Seçin</h3>
              
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
                        ? 'bg-navy-soft border-navy shadow-sm'
                        : 'bg-canvas border-[#d7dee8] hover:border-navy/30 hover:bg-navy-soft'
                    }`}
                  >
                    <div className="p-3 rounded-xl bg-white border border-[#d7dee8] shrink-0 shadow-sm">
                      {cat.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-navy text-sm">{cat.title}</h4>
                      <p className="text-xs text-[#5b6b7c]">{cat.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CONDITIONAL QUESTIONS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-xs">
              <h3 className="font-extrabold text-lg font-display text-navy">Adım 2: Başvuru ve Şehir Detayları</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-semibold text-navy mb-1">
                    Polonya'da Yaşadığınız Şehir / Valilik (Województwo)
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas border border-[#d7dee8] text-navy focus:outline-none focus:border-navy font-medium"
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
                  <label className="block font-semibold text-navy mb-1">
                    Polonya'ya İlk Giriş Tarihi
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas border border-[#d7dee8] text-navy focus:outline-none focus:border-navy font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy mb-1">
                    Aylık Net Gelir (PLN / EURO)
                  </label>
                  <input
                    type="text"
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    placeholder="Örn: 8.500 PLN Net"
                    className="w-full p-3 rounded-xl bg-canvas border border-[#d7dee8] text-navy focus:outline-none focus:border-navy font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-navy mb-1">
                    İletişim Telefonu
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas border border-[#d7dee8] text-navy focus:outline-none focus:border-navy font-medium"
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: URGENCY LEVEL SELECTION */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-xs">
              <div>
                <h3 className="font-extrabold text-lg font-display text-navy">Adım 3: Dosya Aciliyet Seviyesi</h3>
                <p className="text-[#5b6b7c]">Valilik tebliğ sürenize göre avukat müdahale hızını belirleyin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Normal */}
                <div
                  onClick={() => setUrgency('normal')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                    urgency === 'normal'
                      ? 'bg-navy-soft border-navy shadow-sm'
                      : 'bg-white border-[#d7dee8] opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-navy text-sm">Normal</span>
                    <Clock className="w-4 h-4 text-[#5b6b7c]" />
                  </div>
                  <p className="text-[11px] text-[#5b6b7c]">
                    Standart başvuru takibi. Vize veya ikamet sürenizin bitmesine 30+ gün var.
                  </p>
                </div>

                {/* Urgent */}
                <div
                  onClick={() => setUrgency('urgent')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-3 ${
                    urgency === 'urgent'
                      ? 'bg-amber-50 border-amber-500 shadow-sm'
                      : 'bg-white border-[#d7dee8] opacity-80'
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
                      : 'bg-white border-[#d7dee8] opacity-80'
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
                <label className="block font-semibold text-navy mb-1">
                  Aciliyet Nedeni veya Özel Notunuz
                </label>
                <textarea
                  rows={3}
                  value={urgencyNote}
                  onChange={e => setUrgencyNote(e.target.value)}
                  placeholder="Örn: Eski kartımın süresi 10 gün sonra bitiyor, işverenim yeni belge istiyor..."
                  className="w-full p-3 rounded-xl bg-canvas border border-[#d7dee8] text-navy focus:outline-none focus:border-navy font-medium"
                />
              </div>

            </div>
          )}

          {/* STEP 4: DOCUMENT UPLOAD & SUMMARY */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-xs">
              <h3 className="font-extrabold text-lg font-display text-navy">Adım 4: Belgeleri Yükleyin ve Tamamlayın</h3>

              {/* Drag & Drop Upload Zone */}
              <div className="border-2 border-dashed border-[#d7dee8] hover:border-navy rounded-2xl p-8 text-center space-y-3 bg-navy-soft transition cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleFileSelected}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 text-navy mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-navy text-sm">Pasaport veya Valilik Evrakınızı Sürükleyin</h4>
                  <p className="text-[#5b6b7c] text-[11px]">PDF, JPG veya PNG formatı (Maks. 15MB)</p>
                </div>
              </div>

              {/* Yüklü Belgeler Listesi */}
              <div className="space-y-2">
                <span className="font-semibold text-navy">Forma Eklenen Evraklar ({uploadedFiles.length})</span>
                {uploadedFiles.length === 0 && (
                  <p className="text-[11px] text-[#5b6b7c] italic">
                    Henüz evrak eklemediniz. Evrakları daha sonra dosya süreç sayfanızdan da yükleyebilirsiniz.
                  </p>
                )}
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-navy-soft border border-[#d7dee8] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-navy" />
                      <span className="font-semibold text-navy">{f.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-[#5b6b7c]">{f.size}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-600 hover:text-red-800 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Review */}
              <div className="p-4 rounded-xl bg-navy-soft border border-[#d7dee8] space-y-2">
                <h4 className="font-bold text-navy text-xs">Başvuru Özeti</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-navy font-medium">
                  <div><span className="text-[#5b6b7c]">Kategori:</span> {caseTypeTitle}</div>
                  <div><span className="text-[#5b6b7c]">Şehir:</span> {city}</div>
                  <div><span className="text-[#5b6b7c]">Müşteri:</span> {fullName}</div>
                  <div><span className="text-[#5b6b7c]">Aciliyet:</span> {urgency === 'critical' ? 'Çok Acil' : urgency === 'urgent' ? 'Acil' : 'Normal'}</div>
                </div>
              </div>

            </div>
          )}

          {/* NAV BUTTONS */}
          {stepError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {stepError}
            </div>
          )}
          {submitProgress && (
            <div className="p-3 rounded-xl bg-navy-soft border border-[#d7dee8] text-navy text-xs font-medium flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{submitProgress}</span>
            </div>
          )}
          {submitError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {submitError}
            </div>
          )}

          <div className="pt-4 border-t border-[#d7dee8] flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => { setStepError(null); setStep(step - 1); }}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl border border-[#d7dee8] bg-white hover:bg-navy-soft text-navy font-bold text-xs transition flex items-center space-x-1 disabled:opacity-60"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-navy hover:bg-navy-2 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>Devam Et</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-navy hover:bg-navy-2 disabled:opacity-60 text-white font-extrabold text-sm shadow-sm transition flex items-center space-x-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                <span>{submitting ? 'Gönderiliyor...' : 'Başvuruyu Avukata Gönder'}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
