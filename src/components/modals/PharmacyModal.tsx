import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Phone, MapPin, Navigation, RefreshCw, Clock, Copy, Check, AlertCircle, ExternalLink, Stethoscope, LocateFixed } from 'lucide-react';
import {
  Pharmacy,
  Coords,
  HOME_LOCATION,
  fetchNobetciEczaneler,
  sortByProximity,
  directionsUrl,
  titleTr,
} from '../../services/pharmacyService';

interface PharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSaglikOcagi?: () => void;
}

export const PharmacyModal: React.FC<PharmacyModalProps> = ({ isOpen, onClose, onOpenSaglikOcagi }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listDate, setListDate] = useState('');
  const [ilceFilter, setIlceFilter] = useState<string>('');
  const [from, setFrom] = useState<Coords>(HOME_LOCATION);
  const [locState, setLocState] = useState<'home' | 'asking' | 'gps' | 'denied'>('home');
  const [copied, setCopied] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchNobetciEczaneler();
    if (!res.success) {
      setError(res.error || 'Liste alınamadı.');
      setPharmacies([]);
    } else {
      setPharmacies(res.pharmacies);
      setListDate(res.date || '');
      setSources(res.sources || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const ilceler = useMemo(() => {
    const set = new Set(pharmacies.map((p) => p.ilce));
    return (Array.from(set) as string[]).sort((a, b) => (a === 'Osmangazi' ? -1 : b === 'Osmangazi' ? 1 : a.localeCompare(b, 'tr')));
  }, [pharmacies]);

  // Varsayılan ilçe: Osmangazi (yoksa tümü)
  useEffect(() => {
    if (!ilceFilter && ilceler.length > 0) setIlceFilter(ilceler.includes('Osmangazi') ? 'Osmangazi' : '__all');
  }, [ilceler, ilceFilter]);

  const visible = useMemo(() => {
    const base = ilceFilter && ilceFilter !== '__all' ? pharmacies.filter((p) => p.ilce === ilceFilter) : pharmacies;
    return sortByProximity(base, from);
  }, [pharmacies, ilceFilter, from]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocState('denied');
      return;
    }
    setLocState('asking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFrom({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocState('gps');
      },
      () => setLocState('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
    );
  };

  const copyPhone = (p: Pharmacy) => {
    navigator.clipboard?.writeText((p.phones?.[0] || p.phone).replace(/\s/g, '')).then(() => {
      setCopied(p.id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-neutral-50 flex flex-col">
      {/* Başlık */}
      <div className="bg-white border-b border-neutral-200 px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-[17px] font-black text-neutral-900">Nöbetçi Eczaneler</h2>
            <p className="text-[11px] text-neutral-500 font-medium">
              {listDate ? `${listDate} itibarıyla şu an nöbetçi olanlar` : 'Bursa'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={load} aria-label="Yenile" className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center">
              <RefreshCw className={`w-4 h-4 text-neutral-700 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} aria-label="Kapat" className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center">
              <X className="w-4 h-4 text-neutral-700" />
            </button>
          </div>
        </div>

        {/* İlçe seçimi */}
        {ilceler.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pt-2 pb-1 -mx-1 px-1">
            {[...ilceler, '__all'].map((i) => (
              <button
                key={i}
                onClick={() => setIlceFilter(i)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-black border transition ${
                  ilceFilter === i
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {i === '__all' ? 'Tüm Bursa' : i}
              </button>
            ))}
          </div>
        )}

        {/* Konum */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={useMyLocation}
            disabled={locState === 'asking'}
            className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full disabled:opacity-60"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            {locState === 'asking' ? 'Konum alınıyor…' : 'Konumuma göre sırala'}
          </button>
          <span className="text-[10.5px] text-neutral-500 font-medium">
            {locState === 'gps'
              ? 'Konumunuza yakınlığa göre sıralı'
              : locState === 'denied'
              ? 'Konum izni verilmedi, Mehmet Akif Mah. esas alındı'
              : 'Mehmet Akif Mah. esas alınarak sıralı'}
          </span>
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {loading && (
          <div className="py-16 text-center text-[12px] font-bold text-neutral-500">Liste yükleniyor…</div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-rose-200 p-5 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-[13px] font-black text-neutral-900">Liste alınamadı</p>
            <p className="text-[11.5px] text-neutral-600">{error}</p>
            <button onClick={load} className="mt-1 bg-neutral-900 text-white text-[12px] font-black rounded-xl px-4 py-2">
              Tekrar Dene
            </button>
            <a
              href="https://www.beo.org.tr/"
              target="_blank"
              rel="noreferrer"
              className="block text-[11px] font-bold text-emerald-700 underline"
            >
              Bursa Eczacı Odası resmi sayfası
            </a>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center text-[12px] font-bold text-neutral-600">
            Bu bölge için şu an nöbetçi eczane görünmüyor.
          </div>
        )}

        {!loading &&
          !error &&
          visible.map((p, idx) => (
            <div key={p.id} className="bg-white rounded-2xl border border-neutral-200 p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[14px] font-black text-neutral-900 leading-tight">{p.name}</h3>
                  <p className="text-[11px] font-semibold text-neutral-500 mt-0.5">
                    {p.ilce}
                    {p.bolge ? ` / ${p.bolge}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {idx === 0 && (
                    <span className="text-[9.5px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Size en yakın
                    </span>
                  )}
                  <span
                    className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                      p.status === 'nobette' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status === 'nobette' ? 'Şu an nöbetçi' : 'Yakında nöbette'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-[12px] text-neutral-700 font-medium">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-500" />
                <span>
                  {titleTr(p.address)}
                  {p.landmark && (
                    <span className="block text-[11px] text-neutral-500 font-semibold mt-0.5">
                      Tarif: {titleTr(p.landmark)}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-semibold">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Nöbet: {p.dutyLabel}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <a
                  href={`tel:${(p.phones?.[0] || p.phone).replace(/\s/g, '')}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-[12px] font-black flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ara</span>
                </a>
                <a
                  href={directionsUrl(p)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-[12px] font-black flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Yol Tarifi</span>
                </a>
                <button
                  onClick={() => copyPhone(p)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl py-2.5 text-[12px] font-black flex items-center justify-center gap-1.5"
                >
                  {copied === p.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{p.phones?.[0] || p.phone}</span>
                </button>
              </div>
              {p.phones && p.phones.length > 1 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-neutral-600">
                  <span className="text-neutral-400">Diğer numara:</span>
                  {p.phones.slice(1).map((n) => (
                    <a key={n} href={`tel:${n.replace(/\s/g, '')}`} className="text-emerald-700 underline">
                      {n}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

        {/* Kaynak ve uyarı */}
        {!loading && !error && (
          <div className="pt-1 pb-6 space-y-2 text-center">
            <p className="text-[10.5px] text-neutral-500 leading-snug px-2">
              Sıralama konuma yakınlığa göredir{visible.some((x) => x.approx !== 'tam') ? ' (bazı eczanelerde konum yaklaşıktır)' : ''}.
              Gitmeden önce telefonla teyit etmenizi öneririz. Veri kaynağı:{' '}
              {sources.includes('beo') ? 'Bursa Eczacı Odası' : 'eczaneleri.org'}. Resmi liste için{' '}
              <a href="https://www.beo.org.tr/" target="_blank" rel="noreferrer" className="font-bold text-emerald-700 underline inline-flex items-center gap-0.5">
                Bursa Eczacı Odası <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
            {onOpenSaglikOcagi && (
              <button
                onClick={onOpenSaglikOcagi}
                className="inline-flex items-center gap-1.5 text-[11px] font-black text-neutral-700 bg-white border border-neutral-300 rounded-full px-3 py-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Sağlık Ocağı Bilgileri
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
