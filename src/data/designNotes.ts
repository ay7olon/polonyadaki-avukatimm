import { ScreenDesignNote, ScreenId } from '../types';

export const SCREEN_DESIGN_NOTES: Record<ScreenId, ScreenDesignNote> = {
  landing: {
    screenId: 'landing',
    screenNumber: 1,
    screenName: '1. ANA SAYFA (Landing Page)',
    targetUser: 'Public',
    purpose: 'Polonya\'da yaşayan Türkler için güven veren, şeffaf, Türkçe ve Lehçe hukuk hizmetlerinin tanıtıldığı dönüşüm odaklı ana sayfa.',
    layoutStructure: 'Top Navigation Bar -> Hero Banner with dual CTA -> Trust Indicators Grid -> Service Cards Matrix (3x2 grid) -> Poland-Turkey Legal Bridge Highlights -> Client Reviews -> Footer.',
    colorPaletteNotes: 'Ana arka plan: #F8FAFC (slate-50 clean canvas). Birincil Marka Rengi: #0F172A (Koyu Lacivert / Slate 900) - hukuki otorite hissi. Vurgu Rengi: #DC2626 (Polonya Bayrağı Kırmızısı - abartısız, sadece rozetler ve kritik CTA kenarlıklarında). İkincil Vurgu: #2563EB (Güven Mavisi).',
    componentArchitecture: [
      'Header.tsx (Logo + Dil Seçici TR/PL/EN + Auth Butonları)',
      'HeroSection.tsx (Dinamik slogan + Ücretsiz Ön Değerlendirme Modal tetikleyicisi)',
      'TrustMetrics.tsx (Avukat sayısı, çözülen dosya, başarı oranı sayaçları)',
      'ServiceCard.tsx (Oturma izni, Şirket kuruluşu vb. ikonlu hover efektli kartlar)',
      'Testimonials.tsx (Gerçek müşteri yorumları ve yıldız değerlendirmeleri)',
      'Footer.tsx (Varşova Barosu sicil no, adres, acil whatsapp hattı, yasal bildirimler)',
    ],
    devNotesForCursor: `/**
 * CURSOR DEV NOTES - SCREEN 1: LANDING PAGE
 * - Goal: Maximize conversion for "Ücretsiz Ön Değerlendirme" while building immediate authority.
 * - UX Rationale:
 *   1. Placed Language Switcher (TR / PL / EN) in top header right next to Auth triggers so users immediately know language support exists.
 *   2. Hero headline explicitly uses "Polonya'da Türkçe Hukuki Destek" to match search intent of expatriates in Warsaw/Krakow.
 *   3. Service Cards emphasize Polish official terms alongside Turkish (e.g., "Karta Pobytu", "Spółka z o.o.") so clients identify their exact official need.
 *   4. Trust banner shows 14+ Lawyers and 3,500+ cases with subtle red accent line matching Polish national flag colors without looking noisy.
 */`,
  },
  auth: {
    screenId: 'auth',
    screenNumber: 2,
    screenName: '2. KAYIT / GİRİŞ EKRANI',
    targetUser: 'Public',
    purpose: 'Kullanıcıların e-posta veya telefon ile hızlıca giriş yapabildiği ya da yeni başvuru için hesap açabildiği sade, güvenli form ekranı.',
    layoutStructure: 'Ortalanmış 480px genişliğinde kart layout -> Üstte Dil seçici ve Hukuk Bürosu Logosu -> Segmented Control Tab (Giriş Yap / Kayıt Ol) -> Form Alanları -> KVKK / RODO (Polonya GDPR) onay kutusu -> SOS / Quick Demo Login butonları.',
    colorPaletteNotes: 'Kart: Arka plan beyaz (#FFFFFF) 1px slate-200 sınır ve yumuşak shadow-xl. Form input odaklanması: #2563EB ring-2. Hata ve zorunlu alan uyarıları: #DC2626.',
    componentArchitecture: [
      'AuthCard.tsx (Ortalanmış modüler form kartı)',
      'FormInput.tsx (İkonlu, floating label destekli text/password/phone girdileri)',
      'RODOCheckbox.tsx (Polonya RODO / GDPR mevzuatına uygun zorunlu onay)',
      'DemoAccountPresets.tsx (Geliştirici testi ve hızlı inceleme için tek tıkla müşteri / avukat girişi)',
    ],
    devNotesForCursor: `/**
 * CURSOR DEV NOTES - SCREEN 2: AUTH SCREEN
 * - Goal: Frictionless onboarding for clients needing urgent legal help in Poland.
 * - UX Rationale:
 *   1. Form includes Polish phone code (+48) prepended by default, with easy toggle for (+90) Turkey numbers.
 *   2. Includes mandatory RODO (Rozporządzenie o Ochronie Danych Osobowych) checkbox required by Polish privacy laws.
 *   3. Integrated Quick Demo Login triggers to switch seamlessly between Client Mode & Lawyer Mode in prototype.
 */`,
  },
  client_dashboard: {
    screenId: 'client_dashboard',
    screenNumber: 3,
    screenName: '3. MÜŞTERİ DASHBOARD',
    targetUser: 'Client',
    purpose: 'Müşterinin mevcut tüm hukuki süreçlerini, yaklaşan valilik/mahkeme tarihlerini ve avukat bildirimlerini tek ekranda takip etmesi.',
    layoutStructure: 'Sol Sabit Sidebar (Dosyalarım, Yeni Başvuru, Mesajlar, Belgelerim, Profil) -> Üst Header (Arama + Bildirim Çanı + Kullanıcı Avatarı) -> Ana Alan: Aktif Başvuru Kartları + Renkli Durum Badge\'leri + Hızlı Eylem Butonları + Acil Belgeler Uyarısı.',
    colorPaletteNotes: 'Sidebar: #0F172A (Koyu lacivert). Badge Renkleri: "İnceleniyor" -> Amber (#D97706), "Ek Belge Bekleniyor" -> Kırmızı (#DC2626), "Sonuçlandı" -> Yeşil (#16A34A), "Avukata Atandı" -> Mavi (#2563EB).',
    componentArchitecture: [
      'SidebarNav.tsx (Daraltılabilir sol navigasyon)',
      'ActiveCaseCard.tsx (İlerleme çubuğu % ve son işlem tarihi barındıran kart)',
      'StatusBadge.tsx (Renkli durum rozetleri)',
      'UrgentAlertBanner.tsx (Valilik eksik evrak süresi uyarı bandı)',
      'QuickActionCard.tsx ("Yeni Başvuru Başlat" / "Avukata Mesaj At")',
    ],
    devNotesForCursor: `/**
 * CURSOR DEV NOTES - SCREEN 3: CLIENT DASHBOARD
 * - Goal: Provide clarity and lower anxiety for clients waiting for Polish Voivodeship decisions.
 * - UX Rationale:
 *   1. Case cards clearly highlight the percentage progress bar (%) and next expected milestone.
 *   2. Status badges use standard color hierarchy: Amber for in-review, Red for action needed (pending docs), Green for complete.
 *   3. Urgent alert banner appears at the top if the Voivode (Urząd Wojewódzki) has set a deadline for missing docs.
 */`,
  },
  new_application: {
    screenId: 'new_application',
    screenNumber: 4,
    screenName: '4. YENİ BAŞVURU FORMU EKRANI',
    targetUser: 'Client',
    purpose: 'Adım adım (wizard) yapıda müşteri ihtiyaçlarını toplayan, açılır koşullu alanlar ve dosya yükleme içeren başvuru formu.',
    layoutStructure: 'Üst İlerleme Çubuğu (Step 1: Tür Seçimi -> Step 2: Detay Soruları -> Step 3: Aciliyet -> Step 4: Evrak Yükleme -> Step 5: Özet) -> Dinamik Form Adımı İçeriği -> Alt Navigasyon (Geri / Devam Et).',
    colorPaletteNotes: 'Aciliyet Seviyeleri: Normal -> Slate-100, Acil (15 Gün) -> Orange-100, Çok Acil (48 Saat) -> Red-600 (Beyaz Metin, Kırmızı Vurgu, Parlayan Efekt).',
    componentArchitecture: [
      'WizardProgressBar.tsx (Numaralı ve başlık adımlı yönlendirme)',
      'CategorySelectGrid.tsx (Oturum, Şirket, Aile kartları seçimi)',
      'ConditionalQuestions.tsx (Seçilen kategoriye göre değişen Polonya şehir, maaş, pasaport soruları)',
      'UrgencySelector.tsx (Normal / Acil / Çok Acil kart seçimi)',
      'DropzoneUploader.tsx (Sürükle-bırak PDF/JPEG dosya yükleme kutusu)',
    ],
    devNotesForCursor: `/**
 * CURSOR DEV NOTES - SCREEN 4: NEW APPLICATION WIZARD
 * - Goal: Streamline legal intake while capturing critical Polish administrative details.
 * - UX Rationale:
 *   1. Step 1 uses visual card selection rather than dropdowns to reduce cognitive load.
 *   2. Urgency selector explicitly tags cases as "Çok Acil (48 Saat - Kırmızı Kod)" which flags the file in the Lawyer Admin panel.
 *   3. Document upload box highlights acceptable file formats (PDF, JPG up to 10MB) and shows instant upload state.
 */`,
  },
  case_timeline: {
    screenId: 'case_timeline',
    screenNumber: 5,
    screenName: '5. SÜREÇ TAKİP EKRANI (Timeline)',
    targetUser: 'Client',
    purpose: 'Belirli bir dosyanın başvuru anından karar tebliğine kadarki kronolojik aşamalarını görselleştiren dikey stepper.',
    layoutStructure: 'Sol Taraf: Dikey Zaman Çizelgesi (Vertical Timeline Stepper with Status Icons) -> Sağ Taraf: Dosya Detay Kartı (Sorumlu Avukat Profili, Resmi Evrak İndirme Butonları, İtiraz Hakkı Bilgilendirmesi).',
    colorPaletteNotes: 'Tamamlanan Adımlar: #16A34A (Yeşil dikey çizgi ve check ikonu). Aktif Adım: #2563EB (Mavi pulse animasyonlu halka). Gelecek Adımlar: Slate-300 kesikli çizgi.',
    componentArchitecture: [
      'VerticalTimelineStepper.tsx (Tarih, başlık ve aktör etiketli dikey zaman çizelgesi)',
      'LawyerMiniProfile.tsx (Doğrudan avukatla iletişim kartı)',
      'OfficialDocViewer.tsx (Valilikten gelen resmi yazıların önizlenmesi ve indirilebilir linkleri)',
    ],
    devNotesForCursor: `/**
 * CURSOR DEV NOTES - SCREEN 5: CASE TIMELINE
 * - Goal: Transparency in long Polish administrative procedures (which often take months).
 * - UX Rationale:
 *   1. Visual vertical stepper clearly marks completed phases vs. current active stage vs. upcoming steps.
 *   2. Displays explicit timestamps and responsible actor (e.g. "Av. Piotr Kowalski" vs "Müşteri" vs "Urząd Mazowiecki").
 *   3. Includes an action trigger right next to "Pending Documents" stage so clients can immediately fulfill requirements.
 */`,
  },
  messaging: {
    screenId: 'messaging',
    screenNumber: 6,
    screenName: '6. MESAJLAŞMA EKRANI (Chat)',
    targetUser: 'Client & Lawyer',
    purpose: 'Müşteri ile atanan avukat arasında güvenli, dosya eklemeli Türkçe ve Lehçe doğrudan mesajlaşma arabirimi.',
    layoutStructure: 'Sol Panel (320px): Aktif Konuşmalar & Dosya Listesi -> Sağ Panel: Sohbet Başlığı (Avukat Unvanı, Çevrimiçi Durumu) + Mesaj Akışı (Client right-aligned, Lawyer left-aligned) + Alt Mesaj Yazma Alanı (Ataş ikonu + Gönder Butonu).',
    colorPaletteNotes: 'Müşteri Mesaj Balonu: #0F172A (Koyu Lacivert / Beyaz Metin). Avukat Mesaj Balonu: #F1F5F9 (Açık Gri / Slate-900 Metin). Sistem Uyarısı: #FEF3C7 (Amber arkaplan).',
    componentArchitecture: [
      'ChatSidebar.tsx (Konuşma listesi, son mesaj önizlemesi ve okunmadı rozeti)',
      'ChatWindow.tsx (Scrolly chat baloncukları)',
      'MessageBubble.tsx (Tarih, avatar, dosya eki barındıran balon)',
      'ChatInput.tsx (Dosya yüklemeli mesaj yazma çubuğu)',
    ],
    devNotesForCursor: `/**
 * CURSOR DEV NOTES - SCREEN 6: MESSAGING / CHAT
 * - Goal: Secure client-lawyer communications with instant document attachment.
 * - UX Rationale:
 *   1. Distinct visual styling between Client bubbles (Dark slate) and Attorney bubbles (Light slate) with verified lawyer badges.
 *   2. File attachment button allows sending updated ZUS, eviction notices, or work permits directly inside conversation.
 *   3. Preserves full audit log of all communications for legal record compliance.
 */`,
  },
  admin_case_list: {
    screenId: 'admin_case_list',
    screenNumber: 7,
    screenName: '7. ADMİN DOSYA LİSTESİ EKRANI',
    targetUser: 'Lawyer/Admin',
    purpose: 'Büro avukatlarının tüm derdest dosyaları filtreleyip, acil başvuruları kırmızı satır vurgusuyla tespit ettiği yönetim tablosu.',
    layoutStructure: 'Üst İstatistik İki Satır -> Filtre Barı (Durum, Kategori, Aciliyet, Atanan Avukat, Arama) -> Veri Tablosu (Müşteri Adı, Süreç Türü, Durum Badge, Aciliyet Etiketi, Son Güncelleme, Sorumlu Avukat, İşlemler) -> Acil Dosyalar Kırmızı Vurgulu Satır (#FEF2F2).',
    colorPaletteNotes: 'Çok Acil Satırlar: #FEF2F2 (Açık kırmızı arka plan + Kırmızı sol sınır). Tablo Header: #F8FAFC (Slate-100 font-semibold uppercase).',
    componentArchitecture: [
      'AdminMetricsOverview.tsx (Bekleyen, incelenen, acil dosya sayıları)',
      'FilterBar.tsx (Dropdown ve search girdisi)',
      'CaseDataTable.tsx (Sıralanabilir ve filtrelenebilir dosya tablosu)',
      'TableRow.tsx (Aciliyet durumuna göre kırmızı vurgulu satır)',
      'AssignLawyerModal.tsx (Dosyayı başka avukata atama modalı)',
    ],
    devNotesForCursor: `/**
 * CURSOR DEV NOTES - SCREEN 7: ADMIN CASE LIST TABLE
 * - Goal: Enables law firm team to prioritize incoming Polish residency & business cases efficiently.
 * - UX Rationale:
 *   1. "Çok Acil (48h)" cases receive a soft red background highlight (#FEF2F2) and pulsing red indicator so no legal deadline is missed.
 *   2. Filter bar allows instant multi-criteria search (e.g. show only "Pending Docs" cases in "Varşova").
 *   3. Row action button directly opens Screen 8 (Admin Case Detail).
 */`,
  },
  admin_case_detail: {
    screenId: 'admin_case_detail',
    screenNumber: 8,
    screenName: '8. ADMİN DOSYA DETAY EKRANI',
    targetUser: 'Lawyer/Admin',
    purpose: 'Avukatın müşteri yanıtlarını incelediği, yüklenen belgeleri onaylayıp/reddettiği, durum güncellediği ve gizli iç notlar düştüğü operasyon paneli.',
    layoutStructure: 'Sol / Orta (70%): Müşteri Özeti + Başvuru Formu Yanıtları + Belgeler (Onayla/Reddet Butonları) + Gizli İç Notlar Paneli (Amber Arka Plan) -> Sağ (30%): Durum Değiştirme Widget\'ı + Sorumlu Avukat Ataması + Müşteri Sohbet Penceresi.',
    colorPaletteNotes: 'Gizli İç Notlar: #FEF3C7 (Sarı / Amber 100 kart + Amber 800 sınır). Onaylı Belge: #DCFCE7 (Yeşil). Reddedilen Belge: #FEE2E2 (Kırmızı).',
    componentArchitecture: [
      'ClientSummaryHeader.tsx (Müşteri pasaport, telefon, şehir özet kartı)',
      'FormAnswersGrid.tsx (Müşterinin doldurduğu başvuru sorularının dökümü)',
      'DocumentApprovalGrid.tsx (Belge önizleme + Onayla/Red gerekçeli Reddet butonları)',
      'InternalNotesPanel.tsx (Sadece avukatların görebildiği gizli sarı not paneli ve yeni not ekleme)',
      'StatusUpdateWidget.tsx (Dosya aşamasını tek tıkla güncelleme dropdown\'ı)',
    ],
    devNotesForCursor: `/**
 * CURSOR DEV NOTES - SCREEN 8: ADMIN CASE DETAIL
 * - Goal: Command center for attorneys handling complex Polish administrative files.
 * - UX Rationale:
 *   1. Internal Notes section has a distinct Amber background (#FEF3C7) and "Sadece Avukat Görür" badge to prevent privacy leaks.
 *   2. Document verification grid provides explicit Approve (Green) and Reject (Red with custom reason prompt) options.
 *   3. Status change directly updates the client\'s timeline on Screen 5 in real-time.
 */`,
  },
};
