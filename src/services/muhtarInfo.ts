import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Muhtarlık iletişim bilgileri: Firestore `plus_ayarlar/muhtarlik` belgesinden canlı okunur.
// Yönetici / muhtar uygulama içinden düzenleyebilir. Belge yokken aşağıdaki varsayılanlar gösterilir.
export interface MuhtarInfo {
  ad: string;
  unvan: string;
  telefon: string;
  whatsapp: string; // boşsa telefon kullanılır
  eposta: string;
  adres: string;
  mesai: string; // boşsa gösterilmez
}

export const DEFAULT_MUHTAR_INFO: MuhtarInfo = {
  ad: 'Osman Sakin',
  unvan: 'Mehmet Akif Mahallesi Muhtarı',
  telefon: '0535 464 56 12',
  whatsapp: '',
  eposta: '',
  adres: 'Mehmet Akif Mahallesi Çukurca Yolu Caddesi No. 1 Osmangazi / Bursa',
  mesai: '',
};

export function useMuhtarInfo(): MuhtarInfo {
  const [info, setInfo] = useState<MuhtarInfo>(DEFAULT_MUHTAR_INFO);
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'plus_ayarlar', 'muhtarlik'),
      (snap) => {
        if (snap.exists()) setInfo({ ...DEFAULT_MUHTAR_INFO, ...(snap.data() as Partial<MuhtarInfo>) });
        else setInfo(DEFAULT_MUHTAR_INFO);
      },
      () => setInfo(DEFAULT_MUHTAR_INFO)
    );
    return () => unsub();
  }, []);
  return info;
}

export async function saveMuhtarInfo(info: MuhtarInfo): Promise<void> {
  await setDoc(doc(db, 'plus_ayarlar', 'muhtarlik'), { ...info, updatedAt: serverTimestamp() });
}

export const telDigits = (v: string) => (v || '').replace(/\D/g, '');
export const telHref = (v: string) => `tel:${telDigits(v)}`;
export const waHref = (v: string, text?: string) => {
  const d = telDigits(v);
  const full = d.startsWith('90') ? d : `90${d.startsWith('0') ? d.slice(1) : d}`;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};
export const mapsHref = (adres: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adres)}`;
