# Polonyadaki Avukatım

Polonya'da yaşayan Türk vatandaşları için hukuki danışmanlık ve dosya takip portalı. Müşteriler oturma izni / şirket kuruluşu / aile birleşimi gibi başvurularını oluşturup takip edebilir, avukatlar ise dosyaları inceleyip müşterilerle mesajlaşabilir.

## Teknoloji Yığını

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, TypeScript
- **Backend:** [Supabase](https://supabase.com) (Postgres, Auth, Storage, Realtime)
- **Test:** Vitest

## Kurulum

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini doldurun
npm run dev
```

Uygulama `http://localhost:3000` üzerinde açılır.

### Ortam Değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase proje URL'i |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonim (public) API anahtarı |

Bu iki değer **gizli değildir** — Row Level Security (RLS) ile korunduğu için istemci tarafı bundle'a gömülmeleri güvenlidir. Servis rol anahtarı (`SUPABASE_SERVICE_ROLE_KEY`) sadece `npm run seed` script'i için gereklidir ve asla istemci koduna girmemelidir.

### Veritabanı ve Test Verisi

Şema ve RLS politikaları `supabase/migrations/` altında, Supabase MCP/CLI ile proje üzerine uygulanır. Test verisi oluşturmak için:

```bash
SUPABASE_SERVICE_ROLE_KEY=... npm run seed
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

1. Hosting’e `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` ekleyin ve production build alın.
2. Supabase Dashboard → **Authentication → URL Configuration**:
   - **Site URL** = production domain (örn. `https://your-app.vercel.app`)
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

`.github/workflows/ci.yml`, her push/PR'da tip kontrolü, birim testleri ve production build'ini otomatik çalıştırır. Gerçek Supabase proje bilgilerini repo secrets olarak (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) eklemeniz önerilir; eklenmezse CI, build'in başarılı olduğunu doğrulamak için placeholder değerlerle devam eder.

## Proje Yapısı

```
src/
  components/     Paylaşılan UI bileşenleri (Header, Footer, DeadlineBadge, ...)
  hooks/          useAuth, useCases, useLawyers, useCaseMessages, useToast, ...
  lib/            supabaseClient, caseMappers, storage, deadline, validation
  views/          Ekranlar (Landing, Auth, ClientDashboard, AdminCaseList, ...)
  data/           Statik metinler ve tasarım notları
supabase/
  migrations/     Şema ve RLS politikaları (SQL)
  seed/           Demo kullanıcı/dosya verisi oluşturan script
```
