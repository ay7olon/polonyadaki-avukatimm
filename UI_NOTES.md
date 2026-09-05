# UI / UX Notları

## Onaylanan tema
- **Legal Navy (Tema C)** seçildi
- Uygulama sırası: Header/Landing → Auth/Panel → Admin
- İşlevselliğe dokunulmadan sadece stil değişecek

## İlerleme
- [x] Header + Footer + Landing
- [x] Auth + Client dashboard / timeline / messaging
- [x] Admin list + detail + New Application wizard
- [x] Çözünürlük / mobil QA (ilk tur)
- [x] Faz A — boş UI yüzeyleri (Belgelerim, Profil, mesaj arama)
- [x] Faz B — pilot paket (DEV demo, şifre sıfırlama, deploy checklist)
- [x] Pilot canlı — Vercel production + smoke (bkz. PILOT_CHECKLIST.md)

## Faz A — Boş yüzeyler (2026-09-05)
- Belgelerim: tüm case belgelerini listeler; signed URL görüntüleme + dosyaya git
- Profilim: ad / telefon / dil tercihi `profiles` tablosuna kaydedilir (`useAuth.updateProfile`)
- Mesajlaşma: dosya no / avukat / tür araması + boş state
- Landing avukat bölümü: “Örnek kadro — tanıtım amaçlı gösterim” etiketi

## Faz B — Pilot paket (2026-09-05)
- Demo giriş butonları yalnızca `import.meta.env.DEV` altında
- Şifremi unuttum + e-posta linkinden yeni şifre belirleme (`PASSWORD_RECOVERY`)
- Kayıt: `emailRedirectTo` site origin’e ayarlandı
- Deploy için checklist: README “Pilot checklist” bölümü

## Pilot canlı (2026-09-06)
- Canlı URL: https://polonyadaki-avukatimm-ten.vercel.app
- Env: Config tipi `VITE_SUPABASE_*` + başarılı redeploy
- Smoke: landing, production giriş (demo yok), müşteri paneli, Belgelerim empty, Profil formu (~390 mobil header)
- **Auth URL ayarlandı:** Site URL + Redirect = `https://polonyadaki-avukatimm-ten.vercel.app`

Smoke (tamamlanan / kalan):
- [x] Avukat girişi → admin liste
- [x] Mobil ~390: hamburger, giriş, panel, mesajlar empty state
- [~] Şifre sıfırlama UI OK; bazı seed domain’leri invalid olabilir
- [ ] Gerçek iPhone Safari: mesaj input + klavye

Sonraki (Faz C):
- React Router, e-posta bildirimleri, i18n derinliği, deadline otomasyonu
- CI workflow (`workflow` GitHub scope)

## Mobil / çözünürlük QA (2026-09-05)
Yapılan düzeltmeler:
- Header: `sm–lg` aralığında çift dil seçici / sıkışma giderildi (`lg` breakpoint hizası)
- Header marka metni dar ekranda truncate
- Footer CTA ve yasal linkler mobilde yığılır / wrap olur
- Landing hero başlık boyutu küçük telefonda yumuşatıldı
- Mesajlaşma: mobil master–detail (liste ↔ sohbet), `100dvh` yükseklik
- Admin detay: select widget’ları ve form özeti dar ekranda tek kolon
- Wizard özet grid: `sm:grid-cols-2`
- EmptyCaseState: Legal Navy’ye alındı

Kontrol edilen breakpoint’ler (smoke):
- [x] ~390 (iPhone)
- [x] ~768 (tablet)
- [x] ≥1024 (desktop nav)

Hâlâ izlenmesi iyi olanlar:
- Admin tablo yatay scroll (bilinçli; dar ekranda kaydırılır)
- Gerçek cihazlarda iOS Safari klavye + mesaj input
- 1366 laptop orta yoğunluk (özellikle admin tablo kolonları)

## Not
İlk QA turu tamamlandı; gerçek cihaz / Safari smoke ayrı bir turda derinleştirilebilir.
