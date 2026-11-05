import type { NewsItem } from '../types';

export const DEFAULT_NEWS_CATEGORIES = [
  'Şehir & Yaşam',
  'Eğitim & Kampüs',
  'Esnaf & Ekonomi',
  'Kültür & Turizm',
  'Spor',
  'Belediye Duyurusu',
];

const norm = (s: string) => s.trim().toLocaleLowerCase('tr-TR');

/** Hazır kategoriler + haberlerde kullanılan (yöneticinin eklediği) tüm kategoriler, tekrarsız. */
export const mergeNewsCategories = (newsList: NewsItem[] = []): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  [...DEFAULT_NEWS_CATEGORIES, ...newsList.map((n) => n.category || '')].forEach((c) => {
    const name = c.trim();
    if (!name || seen.has(norm(name))) return;
    seen.add(norm(name));
    out.push(name);
  });
  return out;
};
