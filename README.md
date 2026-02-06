# Sigara Bırak 🚭

**Profesyonel sigara bırakma destek platformu**

Modern, hızlı ve kullanıcı dostu bir PWA (Progressive Web App) uygulaması.

## Özellikler

- 🎨 **Modern Animasyonlu UI** - Göz alıcı geçişler ve etkileşimler
- 📱 **PWA Desteği** - Android, iOS ve masaüstüne kurulabilir
- ⚡ **Hızlı Performans** - Optimize edilmiş kod ve caching
- 🌙 **Karanlık Mod** - Otomatik tema desteği
- ♿ **Erişilebilirlik** - WCAG standartlarına uygun
- 📊 **Responsive Tasarım** - Tüm cihaz çözünürlükleri
- 🔐 **Supabase Backend** - Güvenli kullanıcı yönetimi ve veri saklama
- 📈 **İlerleme Takibi** - Gerçek zamanlı sağlık iyileşmesi takibi
- 💰 **Tasarruf Hesaplayıcı** - Para ve zaman tasarrufu hesaplama
- 👥 **Topluluk Desteği** - Kullanıcı forumu ve paylaşım özellikleri

## Dosya Yapısı

```
DontS/
├── index.html          # Ana landing sayfası
├── login.html          # Giriş/Kayıt sayfası
├── dashboard.html      # Kullanıcı dashboard'u
├── progress.html       # İlerleme takibi
├── savings.html        # Tasarruf hesaplayıcı
├── community.html      # Topluluk forumu
├── profile.html        # Kullanıcı profili
├── settings.html       # Ayarlar
├── css/
│   ├── style.css       # Ana stiller
│   ├── dashboard.css   # Dashboard stilleri
│   └── landing.css     # Landing sayfası stilleri
├── js/
│   ├── config.js       # Yapılandırma
│   ├── supabase.js     # Supabase entegrasyonu
│   ├── main.js         # Ana JavaScript
│   ├── storage.js      # LocalStorage yönetimi
│   ├── pwa.js          # PWA yönetimi
│   └── ...             # Diğer modüller
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
├── icons/             # Uygulama ikonları (oluşturulacak)
├── screenshots/       # PWA screenshot'ları (oluşturulacak)
└── supabase_*.sql    # Veritabanı şemaları
```

## Kurulum

### 1. Gereksinimler

- Modern web tarayıcı (Chrome 90+, Firefox 88+, Safari 14+)
- Supabase hesabı (backend için)
- Node.js (geliştirme için, opsiyonel)

### 2. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'de `supabase_complete.sql` dosyasını çalıştırın
4. API anahtarlarınızı kopyalayın

### 3. Environment Variables

`.env` dosyası oluşturun:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### 4. Geliştirme Sunucusu

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### 5. PWA Olarak Kurulum

1. Siteyi açın: `http://localhost:8000`
2. Tarayıcı menüsünden "Ana ekrana ekle" seçeneğini kullanın
3. Uygulama cihazınızın ana ekranına eklenecek

## Tarayıcı Desteği

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Samsung Internet 15+

## Deployment

### Netlify

```bash
# netlify.toml zaten yapılandırılmış
netlify deploy --prod
```

### Render

```bash
# render.yaml zaten yapılandırılmış
# Render dashboard'dan deploy edin
```

## Geliştirme

### İkonlar Oluşturma

```bash
# PWA ikonlarını oluşturmak için
npm install -g pwa-asset-generator
pwa-asset-generator logo.svg icons/ --icon-only
```

### Test

```bash
# Lighthouse ile PWA testi
lighthouse http://localhost:8000 --view
```

## Güvenlik

- ⚠️ **ÖNEMLİ:** `.env` dosyasını asla Git'e commit etmeyin
- 🔒 Supabase RLS (Row Level Security) politikaları aktif
- 🔐 Tüm API istekleri authenticated
- 🛡️ XSS ve CSRF koruması

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Not:** Bu proje aktif geliştirme aşamasındadır. Tüm özellikler henüz tamamlanmamıştır.

## Yapılacaklar

- [ ] PWA ikonlarını oluştur
- [ ] Screenshot'ları ekle
- [ ] Unit testler ekle
- [ ] E2E testler ekle
- [ ] TypeScript'e geçiş
- [ ] Build pipeline (Vite/Webpack)
- [ ] CI/CD pipeline
- [ ] Error tracking (Sentry)
- [ ] Analytics entegrasyonu

