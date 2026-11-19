import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Hucre } from './analiz';

/**
 * Kullanıcı yoğunluğu (ısı lekesi): konum ≈50 m hücrelere yuvarlanmıştır. Her hücre, çevresindeki (≈150 m) kişi sayısına göre
 * yumuşatılmış bir leke olarak çizilir; üst üste binen lekeler yoğun bölgeyi koyulaştırır. Tek tek kişi veya adres gösterilmez.
 */
export const BolgeHaritasi: React.FC<{ hucreler: Hucre[] }> = ({ hucreler }) => {
  const kap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = kap.current;
    if (!el) return;
    if ((el as any)._leaflet_id) delete (el as any)._leaflet_id;
    // Varsayılan merkez: Karacabey / Mutlular çevresi
    const map = L.map(el, { zoomControl: true, attributionControl: true }).setView([40.21, 28.36], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap katkıcıları',
      maxZoom: 19,
    }).addTo(map);

    const max = Math.max(1, ...hucreler.map((h) => h.komsu));
    const grup = L.featureGroup();
    hucreler.forEach((h) => {
      const f = h.komsu / max;
      const renk = f > 0.66 ? '#be123c' : f > 0.33 ? '#f97316' : '#facc15';
      L.circle([h.la, h.lo], {
        radius: 75,
        stroke: false,
        fillColor: renk,
        fillOpacity: 0.18 + 0.32 * f,
        className: 'isi-lekesi',
      })
        .bindTooltip(`Yakın çevrede (~150 m) ${h.komsu} kişi · bu hücrede ${h.kisi}`)
        .addTo(grup);
    });
    grup.addTo(map);
    if (hucreler.length) {
      const b = grup.getBounds();
      if (b.isValid()) map.fitBounds(b.pad(0.25), { maxZoom: 17 });
    }
    return () => {
      map.remove();
    };
  }, [hucreler]);

  return (
    <>
      <style>{`.isi-lekesi{filter:blur(9px)}`}</style>
      <div ref={kap} className="w-full h-[520px] rounded-xl overflow-hidden border border-neutral-200 z-0" />
    </>
  );
};
