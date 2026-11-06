# Mutlular Haber – Google Play yayın rehberi

Paket adı: `com.mutlularhaber.app` • Teknoloji: Capacitor 8 (web uygulaması Android kabuğunda) • Hedef SDK: 36 (Capacitor 8 varsayılanı)

## 1) Bu pakette hazır olanlar
- `android/` – Android projesi (izinler, bildirim simgesi/kanalı, imzalama ve sürüm numarası ayarı, ikon ve açılış ekranı).
- `.github/workflows/android-release.yml` – GitHub'da imzalı **AAB** (Play'e yüklenecek dosya) ve **APK** (telefona deneme) üretir.
- `public/gizlilik.html`, `public/hesap-silme.html` – Play'in istediği gizlilik politikası ve hesap silme sayfaları.
- Uygulama içinde **Profil → Hesabımı Sil** (Play şartı) ve Worker'da `/api/account/delete`.
- `store/tr-TR/` – başlık, kısa/uzun açıklama. `store/graphics/` – 512×512 simge ve 1024×500 öne çıkan görsel.

## 2) Senin yapacakların (sırayla)

### A. Bilgileri doldur
`public/gizlilik.html` ve `public/hesap-silme.html` içinde **EPOSTA_BURAYA** ve **VERI_SORUMLUSU_BURAYA** yazan yerleri gerçek e-posta ve ad/unvanla değiştir. (Doldurmazsan derleme bilerek durur.)

### B. Worker, Firebase kuralları, siteyi güncelle
1. `1-mutlular-plus-api` içindeki iki dosyayı Worker deposuna koy, deploy et. `https://<worker>/api/version` → `"build":"2026-11-06-android"` görmelisin.
2. Uygulama dosyalarını depoya koy (siteyi de GitHub Pages yayınlar; `https://www.mutlularhaber.com/gizlilik.html` açılmalı).

### C. Firebase'e Android uygulamasını ekle
1. Firebase Console → Proje ayarları → **Uygulama ekle → Android** → paket adı `com.mutlularhaber.app`.
2. `google-services.json` dosyasını indir (depoya **koyma**, aşağıda secret olacak).
3. Authentication → Sign-in method → **Google** açık olmalı.
4. Aşağıdaki SHA parmak izlerini uygulamaya ekle (Google girişi bunlar olmadan Android'de çalışmaz):
   - **Yükleme anahtarının** SHA-1 ve SHA-256 değeri (adım D),
   - Play Console'da uygulama yüklendikten sonra **Play uygulama imzalama anahtarının** SHA-1 ve SHA-256 değeri (Play Console → Uygulama bütünlüğü → Uygulama imzalama).
5. Ekledikten sonra `google-services.json` dosyasını yeniden indir ve secret'ı güncelle.

### D. Yükleme anahtarı (keystore) oluştur
Java kurulu bir bilgisayarda:
```
keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```
Şifreleri **güvenli bir yere yaz**; dosyayı kaybetme. SHA değerleri için:
```
keytool -list -v -keystore upload.jks -alias upload
```
Base64'e çevir (Windows PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload.jks"))`  •  (Mac/Linux): `base64 -w0 upload.jks`

### E. GitHub Secrets
Depo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Değer |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | upload.jks'in base64 hâli |
| `ANDROID_KEYSTORE_PASSWORD` | keystore şifresi |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | anahtar şifresi |
| `GOOGLE_SERVICES_JSON_BASE64` | google-services.json'un base64 hâli |
| `PLAY_SERVICE_ACCOUNT_JSON` | (isteğe bağlı) Play otomatik yükleme için |

### F. Derle
Actions → **Android Yayın (AAB)** → Run workflow. Bitince "Artifacts" bölümünden `app-release.aab` (Play'e) ve `app-release.apk` (telefona deneme) iner. Her çalıştırma sürüm numarasını kendiliğinden artırır.
İlk derlemede hata çıkarsa **log'u bana gönder**; Gradle'ı benim ortamımda çalıştıramadığım için ilk gerçek derleme burada olacak.

### G. Play Console
1. Geliştirici hesabı aç, **Uygulama oluştur** (Türkçe, uygulama, ücretsiz).
2. **Dahili test** kanalına AAB'yi yükle, kendini test kullanıcısı yap, telefonda dene (Google girişi, bildirim, hesap silme dahil).
3. Play uygulama imzalama SHA'larını Firebase'e ekle (adım C-4).
4. Mağaza girişi: `store/tr-TR` metinleri, `store/graphics` görselleri, **en az 2 telefon ekran görüntüsü** (kendin al), kategori "Haberler ve dergiler" ya da "Yaşam tarzı", iletişim e-postası.
5. Politika bölümü:
   - Gizlilik politikası URL: `https://www.mutlularhaber.com/gizlilik.html`
   - Hesap silme URL: `https://www.mutlularhaber.com/hesap-silme.html` (uygulama içi silme de var)
   - Reklam: **yok**. Hedef kitle: çocuklara yönelik **değil** (18+ veya 13+ seç).
   - İçerik derecelendirme anketi: kullanıcı içeriği (ilan, yorum, ihbar) olduğunu dürüstçe işaretle.
   - Uygulama erişimi: giriş gerektirdiği için incelemeciye **test hesabı** ver (e-posta + şifre ile açılmış, yönetici olmayan bir hesap).
   - İzinler: konum (isteğe bağlı, yalnızca ön planda), bildirim.
6. **Veri güvenliği** (öneri, kendi uygulamanla karşılaştırıp doğrula):
   - Toplanan: ad, e-posta, telefon (isteğe bağlı), kullanıcı kimliği, fotoğraf/video, kullanıcı içerikleri (ilan, yorum, ihbar), cihaz bildirim kimliği.
   - Konum: uygulama konumu yalnızca cihazda işliyor ve sunucuya göndermiyor; bu durumda "toplanan" sayılmaz. Bunu kodda tekrar doğrula.
   - Aktarım sırasında şifreleme: evet. Silme talebi: evet (uygulama içi + web).
   - Reklam / analiz: yok.
7. Test sürecinden sonra **Üretim** kanalına çık. (Yeni kişisel geliştirici hesaplarında Google üretimden önce belirli sayıda test kullanıcısıyla kapalı test şartı isteyebilir; Play Console'daki güncel şartı kontrol et.)

## 3) Bilinen eksikler / ikinci aşama
- **Kullanıcı içeriği moderasyonu:** Yorumlarda şikayet mekanizması var; ilan / ihbar / hikayeler için uygulama içi "Şikayet et" ve kullanıcı engelleme yok. Play'in kullanıcı içeriği politikası bunu bekler, incelemede takılabilir. İstersen bir sonraki adımda eklerim.
- **Uygulama bağlantıları** (mutlularhaber.com linkine dokununca uygulamada açılma) eklenmedi.
- R8 küçültme kapalı (güvenli varsayılan). Boyutu azaltmak istenirse sonra açılır.
- Ekran görüntüleri sana ait; ben gerçek cihazdan alamam.
