# PWA İkonları ve Screenshot'lar

Bu klasörler PWA ikonlarını ve screenshot'ları içermelidir.

## İkonlar Oluşturma

Aşağıdaki boyutlarda ikonlar oluşturmanız gerekiyor:

### Gerekli İkon Boyutları:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

### İkon Oluşturma Araçları:
1. **Online:** https://realfavicongenerator.net/
2. **Online:** https://www.pwabuilder.com/imageGenerator
3. **CLI:** `npm install -g pwa-asset-generator`

### Kullanım:
```bash
# Tek bir kaynak görsel ile tüm boyutları oluştur
pwa-asset-generator logo.svg icons/ --icon-only
```

## Screenshot'lar

### Gerekli Screenshot'lar:
- `login-mobile.png` - 375x812px (iPhone boyutu)
- `login-desktop.png` - 1920x1080px (Desktop boyutu)

### Screenshot Alma:
1. Tarayıcıda sayfayı aç
2. DevTools > Device Toolbar (Ctrl+Shift+M)
3. Boyutu ayarla ve screenshot al
4. Veya browser extension kullan

## Geçici Çözüm

İkonlar hazır olana kadar, basit bir SVG ikon kullanabilirsiniz:

```html
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#667eea"/>
  <text x="256" y="300" font-size="200" text-anchor="middle" fill="white">✓</text>
</svg>
```
