// Hizmet alanları ustaların seçimiyle açılır. Aşağıdaki liste yalnızca ustaların kayıtta
// önerilen seçenekleridir; bir alan, en az bir usta seçene kadar uygulamada GÖRÜNMEZ.
export const STANDARD_HIZMET_ALANLARI: string[] = [
  'Sıhhi Tesisat & Su Sistemleri',
  'Elektrik, Aydınlatma & Otomasyon',
  'Kombi, Klima & Isıtma Sistemleri',
  'Boya, Badana & Dekorasyon',
  'Mobilya, Marangoz & İç Kapı',
  'Nakliyat, Taşıma & Depolama',
  'Çilingir, Kilit & Demir Doğrama',
  'Temizlik, İlaçlama & Halı/Koltuk Yıkama',
  'Cam Balkon, Sineklik & PVC Doğrama',
  'Bahçe Bakımı, Peyzaj & Tarım İşleri',
];

/** Alan adından kararlı belge kimliği üretir (Türkçe karakter güvenli). */
export const hizmetAlaniId = (name: string): string =>
  (name || '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

export interface HizmetAlani {
  id: string;
  name: string;
  /** Bu alanda hizmet veren ustaların UID'leri; boşsa alan görünmez */
  ustalar: string[];
}
