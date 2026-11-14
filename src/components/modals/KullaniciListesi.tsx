import React, { useEffect, useMemo, useState } from 'react';
import { collection, limit, onSnapshot, query } from 'firebase/firestore';
import { Download, Phone, Search, Users } from 'lucide-react';
import { db } from '../../firebase';

// Kayıtlı kullanıcılar (plus_users). Kurallar gereği yalnızca personel (admins kaydı olanlar) okuyabilir.
interface Kayit {
  uid: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  loginMethod: string;
  businessName: string;
  businessCategory: string;
  businessAddress: string;
  businessApproved?: boolean;
  activities: string[];
  experienceYears: string;
  guncelMs: number;
}

const ROL_AD: Record<string, string> = {
  'mahalle-sakini': 'Mahalle sakini',
  esnaf: 'Esnaf',
  usta: 'Usta',
  editor: 'Editör',
  yonetici: 'Yönetici',
  muhtar: 'Muhtar',
};
const FILTRELER: { id: string; ad: string }[] = [
  { id: 'hepsi', ad: 'Tümü' },
  { id: 'esnaf', ad: 'Esnaf' },
  { id: 'usta', ad: 'Usta' },
  { id: 'mahalle-sakini', ad: 'Mahalle sakini' },
];
const ESNAF_DURUM = [
  { id: 'hepsi', ad: 'Hepsi' },
  { id: 'onayli', ad: 'Onaylı' },
  { id: 'bekleyen', ad: 'Onay bekleyen' },
];
const LIMIT = 1000;
const s = (v: unknown) => (typeof v === 'string' ? v : '');

export const KullaniciListesi: React.FC = () => {
  const [liste, setListe] = useState<Kayit[]>([]);
  const [durum, setDurum] = useState<'yukleniyor' | 'hazir' | 'hata'>('yukleniyor');
  const [rol, setRol] = useState('hepsi');
  const [esnafDurum, setEsnafDurum] = useState('hepsi');
  const [ara, setAra] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'plus_users'), limit(LIMIT)),
      (snap) => {
        setListe(
          snap.docs.map((d) => {
            const x = d.data() as Record<string, any>;
            return {
              uid: d.id,
              name: s(x.name),
              role: s(x.role) || 'mahalle-sakini',
              phone: s(x.phone),
              email: s(x.email),
              loginMethod: s(x.loginMethod),
              businessName: s(x.businessName),
              businessCategory: s(x.businessCategory),
              businessAddress: s(x.businessAddress),
              businessApproved: typeof x.businessApproved === 'boolean' ? x.businessApproved : undefined,
              activities: Array.isArray(x.activities) ? x.activities.map(String) : [],
              experienceYears: s(x.experienceYears),
              guncelMs: typeof x.updatedAt?.toMillis === 'function' ? x.updatedAt.toMillis() : 0,
            };
          })
        );
        setDurum('hazir');
      },
      () => setDurum('hata')
    );
    return () => unsub();
  }, []);

  const sayim = useMemo(() => {
    const o: Record<string, number> = { hepsi: liste.length };
    for (const k of liste) o[k.role] = (o[k.role] || 0) + 1;
    return o;
  }, [liste]);

  const gorunen = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase('tr-TR');
    return liste
      .filter((k) => rol === 'hepsi' || k.role === rol)
      .filter((k) => rol !== 'esnaf' || esnafDurum === 'hepsi' || (esnafDurum === 'onayli' ? k.businessApproved === true : k.businessApproved !== true))
      .filter(
        (k) =>
          !q ||
          [k.name, k.phone, k.email, k.businessName, k.businessCategory, k.businessAddress, k.activities.join(' ')]
            .join(' ')
            .toLocaleLowerCase('tr-TR')
            .includes(q)
      )
      .sort((a, b) => (b.guncelMs - a.guncelMs) || a.name.localeCompare(b.name, 'tr'));
  }, [liste, rol, esnafDurum, ara]);

  const csvIndir = () => {
    const kol = ['Ad', 'Rol', 'Telefon', 'E-posta', 'İşletme', 'Kategori', 'Adres', 'Onay', 'Uzmanlık', 'Tecrübe'];
    const satir = gorunen.map((k) => [k.name, ROL_AD[k.role] || k.role, k.phone, k.email, k.businessName, k.businessCategory, k.businessAddress, k.role === 'esnaf' ? (k.businessApproved ? 'Onaylı' : 'Bekliyor') : '', k.activities.join('; '), k.experienceYears]);
    const hucre = (v: string) => `"${String(v).replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
    const metin = '﻿' + [kol, ...satir].map((r) => r.map(hucre).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([metin], { type: 'text/csv;charset=utf-8' }));
    a.download = `mutlular-kullanicilar-${rol}.csv`;
    a.click();
  };

  const chip = (aktif: boolean) =>
    `px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap border transition ${aktif ? 'bg-amber-500 text-black border-amber-400' : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'}`;

  return (
    <div className="space-y-3">
      <div className="p-3 bg-neutral-800/70 rounded-2xl border border-neutral-700/80 flex items-center justify-between gap-2">
        <div>
          <div className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-500" />
            <span>Kayıtlı Kullanıcılar</span>
          </div>
          <div className="text-[11px] text-neutral-400">Mutlular Plus'a kayıt olan esnaf, usta ve mahalle sakinleri (yalnızca personel görür).</div>
        </div>
        <button onClick={csvIndir} disabled={!gorunen.length} className="px-3 py-2 rounded-xl bg-neutral-700 text-white text-[11px] font-black flex items-center gap-1.5 disabled:opacity-40">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['esnaf', 'usta', 'mahalle-sakini'] as const).map((r) => (
          <button key={r} onClick={() => setRol(r)} className={`p-2.5 rounded-2xl border text-center ${rol === r ? 'border-amber-500 bg-amber-500/10' : 'border-neutral-700 bg-neutral-800/60'}`}>
            <div className="text-xl font-black text-white">{sayim[r] || 0}</div>
            <div className="text-[10.5px] text-neutral-400 font-bold">{ROL_AD[r]}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTRELER.map((f) => (
          <button key={f.id} onClick={() => setRol(f.id)} className={chip(rol === f.id)}>
            {f.ad} ({sayim[f.id] || 0})
          </button>
        ))}
        {rol === 'esnaf' && ESNAF_DURUM.map((f) => (
          <button key={f.id} onClick={() => setEsnafDurum(f.id)} className={chip(esnafDurum === f.id).replace('bg-amber-500 text-black border-amber-400', 'bg-emerald-600 text-white border-emerald-500')}>
            {f.ad}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={ara} onChange={(e) => setAra(e.target.value)} placeholder="Ad, telefon, e-posta, işletme ara…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-[12px] text-white placeholder:text-neutral-500 outline-none focus:border-amber-500" />
      </div>

      {durum === 'yukleniyor' && <div className="text-center text-[12px] text-neutral-400 py-8">Yükleniyor…</div>}
      {durum === 'hata' && <div className="text-center text-[12px] text-rose-400 py-8">Liste okunamadı. Yetkinizi ve bağlantınızı kontrol edin.</div>}
      {durum === 'hazir' && !gorunen.length && <div className="text-center text-[12px] text-neutral-400 py-8">Bu filtreye uyan kullanıcı yok.</div>}
      {liste.length >= LIMIT && <div className="text-[11px] text-amber-400">İlk {LIMIT} kayıt gösteriliyor.</div>}

      <div className="space-y-2">
        {gorunen.map((k) => (
          <div key={k.uid} className="p-3 rounded-2xl bg-neutral-800/70 border border-neutral-700/80 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[13px] font-extrabold text-white truncate">{k.name || '(adsız)'}</div>
                {k.role === 'esnaf' && k.businessName && <div className="text-[11.5px] text-amber-300 font-bold truncate">{k.businessName}{k.businessCategory ? ` · ${k.businessCategory}` : ''}</div>}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-700 text-neutral-100">{ROL_AD[k.role] || k.role}</span>
                {k.role === 'esnaf' && <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${k.businessApproved ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>{k.businessApproved ? 'Onaylı' : 'Onay bekliyor'}</span>}
              </div>
            </div>
            {k.role === 'esnaf' && k.businessAddress && <div className="text-[11px] text-neutral-400">{k.businessAddress}</div>}
            {k.role === 'usta' && (k.activities.length > 0 || k.experienceYears) && <div className="text-[11px] text-neutral-300">{k.activities.join(', ')}{k.experienceYears ? ` · ${k.experienceYears} tecrübe` : ''}</div>}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
              {k.phone && <a href={`tel:${k.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1 text-sky-300"><Phone className="w-3 h-3" />{k.phone}</a>}
              {k.email && <span className="truncate">{k.email}</span>}
              {k.guncelMs > 0 && <span>Son işlem: {new Date(k.guncelMs).toLocaleDateString('tr-TR')}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
