# Reji (canlı yayın grafik) sistemi – kullanım rehberi

## Ne işe yarar?
Yayın programına (PRISM Live Studio / OBS) **şeffaf bir grafik katmanı** ekler: alt bant (KJ), kayan yazı, kanal logosu, son dakika bandı, konuşmacı isimliği, CANLI etiketi + konum, tarih/saat, haber başlığı bandı, tam ekran haber grafiği, görüntü içinde görüntü (PiP) ve bölünmüş ekran. Başlığı ve bantları **ikinci bir telefondan** (veya bilgisayardan) anlık değiştirirsin. Kamera ve çoklu yayın (YouTube/Facebook/Instagram) PRISM'de kalır; uygulama kamera yayını yapmaz.

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

## Reji paneli v2 (sekmeler)
- **Yayın:** Son dakika, her katmanı aç/kapat, "Temiz görüntü".
- **Başlık:** alt bant içeriği, hazır başlık listesi, kayan yazı satırları.
- **Katmanlar:** alt bant, kayan yazı, logo, son dakika, konuşmacı (kayıtlı kişi listesi), CANLI+konum, tarih/saat, başlık bandı. Her birinin 2–5 hazır görünümü ve ayrıntı ayarları vardır.
- **Ekran:** tam ekran haber grafiği (3 görünüm), görüntü içinde görüntü (görsel/video/YouTube/web sayfası), bölünmüş ekran (sol/sağ/üst/alt panel).
- **Görünüm:** 6 hazır paket (Klasik Haber, Modern Cam, Ana Haber, Spor, Altın, Minimal), renkler, yazı tipi, köşe yuvarlaklığı, genel boyut, animasyon.
- **Bağlantı:** katman adresi, yeni anahtar, yedek.

## Anlık güncelleme (PRISM'de değişmiyorsa)
Katman sayfası iki yoldan veri alır: Firestore canlı dinleyici (zorunlu uzun-yoklama) ve **4 sn'de bir REST yoklaması** (yedek). Dinleyici gömülü tarayıcıda takılsa bile en geç ~4 sn'de güncellenir. Teşhis için bağlantıya `&debug=1` ekle: sağ kenarda "canlı 14:32:10" ya da "yoklama 14:32:10" yazar. Yoklama maliyeti: açık katman başına günde ≈ 21 bin okuma (Firebase ücretsiz kota 50 bin/gün); yayın dışında PRISM'de katmanı açık bırakma.

## Deneme adresleri
`katman.html?demo=1` + isteğe bağlı: `&breaking=1`, `&full=1`, `&pip=1`, `&split=sol`, `&baslik=1`, `&v_kj=cizgi`, `&v_ticker=cam`, `&v_sd=bant` …
