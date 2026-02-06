# Deployment Guide

## Netlify Deployment

### 1. Hazırlık

```bash
# Gerekli dosyaları kontrol et
ls -la .env
ls -la netlify.toml
```

### 2. Netlify'da Proje Oluştur

1. [Netlify](https://netlify.com) hesabınıza giriş yapın
2. "New site from Git" tıklayın
3. GitHub/GitLab repository'nizi seçin
4. Build ayarlarını yapın:
   - **Build command:** Boş bırakın (statik site)
   - **Publish directory:** `.` (root)

### 3. Environment Variables Ekle

Netlify Dashboard > Site settings > Environment variables:

```
SUPABASE_URL = https://xvgqgtlknmirwhgzxpxp.supabase.co
SUPABASE_ANON_KEY = your_anon_key_here
```

### 4. Deploy

```bash
# Manuel deploy
netlify deploy --prod

# Veya Git push ile otomatik deploy
git push origin main
```

---

## Render Deployment

### 1. Render'da Static Site Oluştur

1. [Render](https://render.com) hesabınıza giriş yapın
2. "New +" > "Static Site" seçin
3. Repository'nizi bağlayın

### 2. Ayarlar

- **Build Command:** Boş
- **Publish Directory:** `.`

### 3. Environment Variables

```
SUPABASE_URL = https://xvgqgtlknmirwhgzxpxp.supabase.co
SUPABASE_ANON_KEY = your_anon_key_here
```

---

## Vercel Deployment

### 1. Vercel CLI Kur

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel --prod
```

### 3. Environment Variables

Vercel Dashboard'dan ekleyin.

---

## GitHub Pages Deployment

### 1. Repository Ayarları

Settings > Pages > Source: `main` branch

### 2. CNAME (Özel Domain için)

```
sigarabirak.com
```

### 3. Environment Variables

GitHub Pages environment variables desteklemez. 
Build-time'da inject etmeniz gerekir.

---

## Pre-Deployment Checklist

- [ ] `.env` dosyası Git'e commit edilmemiş
- [ ] PWA ikonları oluşturulmuş
- [ ] Screenshot'lar eklenmiş
- [ ] Supabase migration'ları çalıştırılmış
- [ ] Lighthouse score kontrol edilmiş (>90)
- [ ] Tüm sayfalar test edilmiş
- [ ] Mobile responsive kontrol edilmiş
- [ ] SEO meta tags eklenmiş

---

## Post-Deployment

### 1. PWA Test

```bash
lighthouse https://your-site.com --view
```

### 2. SSL Kontrol

HTTPS aktif olmalı (Netlify/Render otomatik sağlar)

### 3. Custom Domain (Opsiyonel)

Netlify/Render dashboard'dan domain ekleyin.

### 4. Analytics (Opsiyonel)

- Google Analytics
- Plausible
- Umami

---

## Troubleshooting

### Service Worker Çalışmıyor

```javascript
// sw.js'de cache name'i değiştirin
const CACHE_NAME = 'sigara-birak-v4';
```

### Environment Variables Yüklenmiyor

Build log'larını kontrol edin. Netlify/Render'da doğru set edildiğinden emin olun.

### 404 Hatası

SPA routing için redirect rules gerekli (`netlify.toml` zaten var).
