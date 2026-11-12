# Reji (canlı yayın grafik) sistemi – kullanım rehberi

## Ne işe yarar?
Yayın programına (PRISM Live Studio / OBS) **şeffaf bir grafik katmanı** ekler: CANLI + konum, logo, ana bant (KJ), kayan yazı + saat. Başlığı ve bantları **ikinci bir telefondan** (veya bilgisayardan) anlık değiştirirsin. Kamera ve çoklu yayın (YouTube/Facebook/Instagram) PRISM'de kalır; uygulama kamera yayını yapmaz.

## Bileşenler
| Parça | Nerede |
|---|---|
| Katman sayfası (şeffaf) | `https://www.mutlularhaber.com/reji/katman.html?t=<ANAHTAR>` |
| Reji paneli – uygulama içi | Yönetim paneli veya Editör paneli → **Reji** sekmesi |
| Reji paneli – ayrı sayfa | `https://www.mutlularhaber.com/reji` (yönetici/editör girişi ister) |

## Kurulum (bir kez)
1. **Firebase kuralları:** `firestore.rules` içindeki `plus_reji_yayin` ve `plus_reji_ayar` bloklarını kurallarına ekleyip **Yayınla**.
2. Siteyi güncelle (GitHub'a yükle, Pages derlesin).
3. Yönetim/Editör paneli → **Reji** sekmesini aç. İlk açılışta anahtar kendiliğinden üretilir. "Yayın programına bağlama" bölümündeki bağlantıyı kopyala.

## İki cihazla çalışma
- **Cihaz 1 (yayın):** Kamera + PRISM. Katman bağlantısını PRISM'e **Web/Browser kaynağı** olarak ekle (yatay: 1920×1080, dikey: 1080×1920).
- **Cihaz 2 (reji):** Uygulamadan Reji sekmesi veya `/reji` sayfası. Değişiklikler mobil internetten 1 saniyenin altında yansır (tipik 0,1–0,5 sn; garanti değildir). İki cihazın aynı ağda olması gerekmez.

## Yayın öncesi kontrol
1. Bağlantının sonuna `&demo=1` ekleyip PRISM'de örnek grafiği gör (anahtar/ağ gerekmez). Şeffaflık ve boyut doğruysa gerçek bağlantıyı koy.
2. Gerçek bağlantıya `&debug=1` ekleyince sağ kenarda bağlantı durumu yazar ("bağlı 14:32:10"). Yayında kaldır.
3. Hazır başlıkları listeye ekle. Haberleri "Haberlerden doldur" ile alabilirsin.

## Yayın sırasında
- **SON DAKİKA MODU:** tek dokunuşla tema kırmızıya döner, kategori "SON DAKİKA" olur.
- **Üst bant / Ana bant / Kayan yazı** düğmeleri ayrı ayrı gizler; **Hepsini gizle** tam ekran görüntü verir.
- **Hazır başlıklar:** "Yayına al" ile tek dokunuşta bant değişir; Önceki/Sonraki ile gezinirsin.
- **Kayan yazı:** elle (her satıra bir haber) veya **Son haberlerden otomatik doldur** (son dakika haberler öne alınır). Otomatik mod, panel açıkken çalışır.

## Bilmen gerekenler
- **Anahtar gizli tutulmalı.** Bağlantıyı bilen katmanı izleyebilir (yazamaz). Paylaşıldıysa panelden **Yeni anahtar** üret ve PRISM'deki adresi güncelle.
- Anahtar hatalıysa veya belge silindiyse katman **hiçbir şey göstermez** (yanlış grafik yayına girmesin diye).
- Yazmak için yönetici veya editör girişi şart; sıradan üye ve muhtar giremez.
- Dikey yayında Instagram'ın alt yorum alanı için bant yukarıda tutulur; arayüz sürümüne göre ince ayar gerekebilir.

## Sınırlar (doğrulanamayanlar)
- **Instagram'a RTMP ile ücretsiz yayın** her hesapta açık değildir (hesabın uygun olması/anahtar alabilmesi gerekir). PRISM tarafında kontrol et.
- **3 platforma tek telefondan yayın** 3 kat yükleme hızı ister (kabaca 10–15 Mbps). Mobil hatta zor olabilir; 720p veya bilgisayar/kablo öner.
- **PRISM mobil sürümlerinde Web/Browser kaynağı** desteği sürüme bağlıdır. Bilgisayarda PRISM/OBS'de vardır. İlk iş `&demo=1` denemesi.
- Okuma/yazma sayısı: her bant değişikliği 1 yazma sayılır; normal yayında Firebase ücretsiz kotası içinde kalır.
