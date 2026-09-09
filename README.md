# Polonyadaki Avukatım

Polonya'da yaşayan Türk vatandaşları için hukuki danışmanlık ve dosya takip portalı. Müşteriler oturma izni / şirket kuruluşu / aile birleşimi gibi başvurularını oluşturup takip edebilir, avukatlar ise dosyaları inceleyip müşterilerle mesajlaşabilir.

## Teknoloji Yığını

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, TypeScript
- **Backend:** [Supabase](https://supabase.com) (Postgres, Auth, Storage, Realtime)
- **Test:** Vitest

## Canlı site

https://polonyadaki-avukatimm-ten.vercel.app

Pilot kapanış listesi: [PILOT_CHECKLIST.md](PILOT_CHECKLIST.md)

## Güvenlik (public repo)

- `.env` gitignore’dadır — gerçek anahtar / şifre **asla** commit edilmez.
- `SUPABASE_SERVICE_ROLE_KEY` ve `DEMO_PASSWORD` yalnızca lokal / CI secret; `VITE_` öneki kullanmayın.
- Demo giriş butonları yalnızca `npm run dev` + `.env` içindeki `VITE_DEMO_*` ile görünür; production’da yoktur.
- Hesap şifrelerini README / issue / PR’da paylaşmayın.

## Kurulum

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini doldurun
npm run dev
```

Uygulama `http://localhost:3000` üzerinde açılır. İsteğe bağlı: `.env` içine `VITE_DEMO_*` ekleyerek yerel demo giriş butonlarını açabilirsiniz.

### Ortam Değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase proje URL'i |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonim (public) API anahtarı |

Bu iki değer istemci bundle’a girer; erişim RLS ile sınırlanır. Yine de production anahtarlarını public issue/PR’lara yapıştırmayın. Servis rol anahtarı (`SUPABASE_SERVICE_ROLE_KEY`) sadece `npm run seed` için gereklidir ve asla istemci koduna / `VITE_` değişkenine girmemelidir.

### Veritabanı ve Test Verisi

Şema ve RLS politikaları `supabase/migrations/` altında, Supabase MCP/CLI ile proje üzerine uygulanır. Test verisi oluşturmak için:

```bash
DEMO_PASSWORD=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Production build'i `dist/` altına üretir |
| `npm run preview` | Production build'ini yerelde önizler |
| `npm run lint` | TypeScript tip kontrolü (`tsc --noEmit`) |
| `npm test` | Vitest ile birim testlerini tek seferlik çalıştırır |
| `npm run test:watch` | Vitest'i izleme modunda çalıştırır |
| `npm run seed` | Supabase'e demo kullanıcı/dosya verisi ekler |

## Deployment

Uygulama tamamen statik bir SPA'dır (backend Supabase üzerinden sağlanır), bu yüzden aşağıdaki hedeflerden herhangi birine deploy edilebilir.

### Vercel / Netlify

Repo kökünde `vercel.json` ve `netlify.toml` hazır haldedir (SPA fallback + asset cache header'ları içerir). Yapmanız gereken tek şey proje ayarlarında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` ortam değişkenlerini tanımlamak; build komutu otomatik olarak `npm run build` olacaktır.

### Pilot checklist (deploy sonrası)

Canlı örnek: https://polonyadaki-avukatimm-ten.vercel.app — ayrıntılı kapanış listesi: [PILOT_CHECKLIST.md](PILOT_CHECKLIST.md)

1. Hosting’e `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` ekleyin (**Config**, Secret değil) ve production build / redeploy alın.
2. Supabase Dashboard → **Authentication → URL Configuration**:
   - **Site URL** = `https://polonyadaki-avukatimm-ten.vercel.app`
   - **Redirect URLs** içine aynı origin’i ekleyin (şifre sıfırlama / e-posta doğrulama için şart)
3. Production build’de demo giriş butonları görünmez (`import.meta.env.DEV`).
4. Auth smoke: kayıt, giriş, “Şifremi unuttum”, e-posta linkinden yeni şifre.
5. Mümkünse iOS Safari’de mesajlaşma klavye / input smoke.

### Google Cloud Run (Docker)

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://xxxx.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=xxxx \
  -t polonyadaki-avukatim .

docker run -p 8080:8080 polonyadaki-avukatim
# http://localhost:8080

gcloud run deploy polonyadaki-avukatim \
  --source . \
  --set-build-env-vars VITE_SUPABASE_URL=https://xxxx.supabase.co,VITE_SUPABASE_ANON_KEY=xxxx \
  --region europe-west1 \
  --allow-unauthenticated
```

`Dockerfile`, Vite build'ini alıp statik dosyaları `nginx` (SPA fallback + gzip + cache header'ları ile, bkz. `nginx.conf`) üzerinden 8080 portundan sunar.

### CI

CI henüz `main` üzerinde zorunlu değildir. İsteğe bağlı olarak tip kontrolü (`npm run lint`), birim testleri (`npm test`) ve production build (`npm run build`) lokalde veya kendi workflow’unuzda çalıştırılabilir.

## Proje Yapısı

```
src/
  components/     Paylaşılan UI bileşenleri (Header, Footer, ...)
  hooks/          useAuth, useCases, useLawyers, useCaseMessages, useToast, ...
  lib/            supabaseClient, caseMappers, storage, validation
  views/          Ekranlar (Landing, Auth, ClientDashboard, AdminCaseList, ...)
  data/           Statik metinler (UI çevirileri vb.)
supabase/
  migrations/     Şema ve RLS politikaları (SQL)
  seed/           Demo kullanıcı/dosya verisi oluşturan script
```
