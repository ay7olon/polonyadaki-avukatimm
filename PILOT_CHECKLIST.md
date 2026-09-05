# Pilot kapanış checklist

Canlı site: https://polonyadaki-avukatimm-ten.vercel.app

> Hesap e-posta / şifreleri bu dosyada tutulmaz (public repo). Pilot hesaplar lokal not / password manager’da kalsın.

## Tamamlananlar
- [x] PR #1 merge → `main`
- [x] Vercel Production deploy (Vite + Config env)
- [x] `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (Config, not Secret)
- [x] Landing canlı açılıyor
- [x] Production giriş (demo buton yok) — müşteri paneli smoke
- [x] Belgelerim boş state görünüyor
- [x] Supabase Auth Site URL + Redirect URLs = production domain

## Auth URL (tamam)
Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL:** `https://polonyadaki-avukatimm-ten.vercel.app`
- **Redirect URLs:** `https://polonyadaki-avukatimm-ten.vercel.app`

## Smoke (production)
- [x] Ana sayfa / Legal Navy
- [x] Müşteri girişi → Müşteri Paneli
- [x] Demo giriş butonları production’da yok
- [x] Belgelerim sekmesi (empty state)
- [x] Profil formu görünüyor
- [x] Avukat girişi → admin liste + aciliyet uyarıları
- [~] Şifremi unuttum: UI OK; bazı seed domain’leri Supabase e-posta validasyonunda reddedilebilir
- [x] Mobil ~390: hamburger menü, giriş, müşteri paneli, mesajlar empty state (gerçek iOS Safari ayrı doğrulama)

## Sonraki (Faz C — ayrı sprint)
- React Router
- E-posta bildirimleri
- i18n paneli
- Deadline otomasyonu
- CI workflow (`workflow` GitHub scope)
- Seed hesapları gerçek/geçerli e-posta domain’ine taşı (şifre sıfırlama smoke için)
