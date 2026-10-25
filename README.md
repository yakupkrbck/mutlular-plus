# Mutlular Plus - Bursa Osmangazi Mehmet Akif Mahallesi Dijital Platformu

Bu proje, Bursa Osmangazi Mehmet Akif Mahallesi sakinleri, yerel esnafları, mahalle ustaları ve muhtarlık birimi için geliştirilmiş eksiksiz, üretim standartlarında bir mahalle dijital platformu ve Progressive Web App (PWA) uygulamasıdır.

---

## 🚀 Hızlı Başlangıç (Kurulum ve Çalıştırma)

### 1. Gereksinimler
- Node.js 18+ veya Node.js 20+
- npm veya yarn veya bun

### 2. Bağımlılıkları Yükleme
```bash
npm install
```

### 3. Geliştirme Ortamında Başlatma (Development Server)
```bash
npm run dev
```
Uygulama yerel makinenizde `http://localhost:3000` adresinde çalışmaya başlayacaktır.

### 4. Üretim İçin Derleme (Production Build)
```bash
npm run build
```

### 5. Üretim Sunucusunu Başlatma
```bash
npm start
```

---

## 📁 Proje Dizin Yapısı

- **`/src`**: Uygulama istemci (frontend) kaynak kodları.
  - **`/src/components`**: Ana ekran bileşenleri, vitrinler, arama çubuğu ve alt navigasyon.
  - **`/src/components/modals`**: Modallar (Muhtarlık Masası, Yönetici Paneli, Esnaf Paneli, Usta Paneli, Vefat & Taziye Masası, E-Belediye, Giriş & Kayıt, Teklif Sihirbazı vb.).
  - **`/src/components/profile`**: Profil ve kullanıcı rol yönetim ekranı.
  - **`/src/components/transport`**: Burulaş canlı otobüs saatleri, hatlar ve durak ekranı.
  - **`/src/services`**:
    - `androidNotificationService.ts`: PWA Heads-up ve sistem bildirim motoru.
    - `burulasService.ts`: Burulaş BursaKart gerçek zamanlı hat/durak entegrasyonu.
    - `vefat_dogrulama_servisi.ts`: Resmi e-Devlet ve Bursa 188 ALO Cenaze doğrulama servisleri.
  - **`/src/data`**: Nöbetçi eczaneler, namaz vakitleri ve temel kamu verileri.
  - **`/src/types.ts`**: TypeScript tip tanımlamaları (Kullanıcı rolleri, ilanlar, dükkanlar, teklifler).
- **`/server.ts`**: Backend Express sunucusu ve API proxy rotaları.
- **`/public`**: PWA Manifest (`manifest.json`), Service Worker (`sw.js`), favicon ve uygulama ikonları.
- **`/vite.config.ts`**: Vite yapılandırması.
- **`/tsconfig.json`**: TypeScript yapılandırması.

---

## 🌟 Öne Çıkan Özellikler

1. **Mahalle Sakini Masası**:
   - İlan verme (konut, araç, 2. el eşya).
   - Canlı haber ve ihbar gönderme.
   - Usta teklif sihirbazı ile tesisat, elektrik, boya gibi ihtiyaçlara teklif toplama.

2. **Esnaf & Dükkan Vitrini**:
   - Dükkan kaydı ve dijital vitrin oluşturma.
   - Masada QR menü ve paket sipariş desteği.
   - Esnaf Hikayeleri (Instagram tarzı 24 saatlik indirim/kampanya hikaye paylaşımları).

3. **Usta Paneli**:
   - Mahalleden gelen açık iş ve arıza taleplerini anlık havuzda görme.
   - Müşterilere doğrudan fiyat ve süre teklifi iletme.

4. **Muhtarlık & Kamu Hizmetleri**:
   - Sokak aydınlatma, temizlik ve yardım talepleri bildirimi.
   - Bursa Osmangazi Belediyesi E-Belediye işlemleri.
   - Nöbetçi eczaneler ve namaz vakitleri.

5. **PWA & Android Entegrasyonu**:
   - Masaüstü ve mobil tarayıcılardan doğrudan telefona uygulama olarak yüklenebilir (Installable PWA).
   - Offline (çevrimdışı) önbellekleme desteği.
