import React, { useMemo } from 'react';
import { Bos, Cizgi, Cubuklar, Gosterge, Halka, IsiMatrisi, Kart } from './charts';
import { BolgeHaritasi } from './BolgeHaritasi';
import {
  aktifSerisi,
  bildirimSaatleri,
  huniler,
  uyarilariUret,
  type UyariKaydi,
  bolgeAnalizi,
  EN_AZ_KISI,
  kaynakOzeti,
  KAYNAK_ETIKET,
  SAYFA_ETIKET,
  sayfaGorenler,
  dagilim,
  geriDonus,
  ilgiToplami,
  isiMatrisi,
  kisaGun,
  kohortlar,
  ozetle,
  pencereAktif,
  segmentSay,
  SEGMENT_ACIKLAMA,
  sonGunler,
  trGun,
  yeniSerisi,
  yuzde,
  type Kisi,
  type SegmentAdi,
} from './analiz';
import { useCanli, type PanelVeri } from './veri';
import { APP_VERSION } from '../version';
import { useBildirimRaporu } from '../services/bildirimIstatistikService';

export interface EkranProps {
  veri: PanelVeri;
  kisiler: Kisi[];
  aralik: number;
}

const ROL_ETIKET: Record<string, string> = {
  'mahalle-sakini': 'Mahalle sakini',
  esnaf: 'Esnaf',
  usta: 'Usta',
  editor: 'Editör',
  yonetici: 'Yönetici',
  muhtar: 'Muhtar',
};
const GIRIS_ETIKET: Record<string, string> = { google: 'Google', form: 'E-posta / şifre', phone: 'Telefon' };
const PLATFORM_ETIKET: Record<string, string> = { android: 'Android uygulaması', ios: 'iOS', web: 'Web' };
const GUN_AD = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const Uyari: React.FC<{ veri: PanelVeri }> = ({ veri }) => {
  const hatalar = Object.entries(veri.hatalar);
  if (!hatalar.length && veri.ziyaretciler.length > 0) return null;
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-[12px] text-amber-900 space-y-1">
      {hatalar.map(([k, v]) => (
        <p key={k}>
          <b>{k}:</b> {v}
        </p>
      ))}
      {!hatalar.length && veri.ziyaretciler.length === 0 && (
        <p>
          Henüz analitik kaydı yok. Yeni uygulama sürümü (analitik özellikli) kullanıcılarda açıldıkça veriler burada birikmeye başlar. Kayıt tarihi
          bundan öncesi için bilinmez.
        </p>
      )}
    </div>
  );
};

export const GenelBakis: React.FC<EkranProps> = ({ veri, kisiler, aralik }) => {
  const o = useMemo(() => ozetle(kisiler), [kisiler]);
  const gunler = useMemo(() => sonGunler(aralik), [aralik]);
  const aktif = useMemo(() => aktifSerisi(kisiler, gunler), [kisiler, gunler]);
  const yeni = useMemo(() => yeniSerisi(kisiler, gunler), [kisiler, gunler]);
  const seg = useMemo(() => segmentSay(kisiler), [kisiler]);
  const ilgi = useMemo(() => ilgiToplami(kisiler).slice(0, 6), [kisiler]);
  const platform = useMemo(
    () => dagilim(kisiler, (k) => PLATFORM_ETIKET[k.platform] || k.platform),
    [kisiler]
  );
  const bekleyen = Object.values(veri.onay).reduce<number>((a, b) => a + (b || 0), 0);
  const fark = o.bugun - o.dun;
  const canli = useCanli();
  const anasayfadaki = canli.liste.filter((k) => k.s === 'anasayfa').length;
  const bugunSayfa = useMemo(() => sayfaGorenler(veri.ziyaretciler, [trGun()]), [veri.ziyaretciler]);
  const bugunAnasayfa = bugunSayfa.find((x) => x.anahtar === 'anasayfa')?.deger ?? 0;
  return (
    <div className="space-y-4">
      <Uyari veri={veri} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Gosterge baslik="Şimdi online" deger={canli.hata ? '—' : canli.liste.length} alt={canli.hata ? 'Okunamadı (kuralları yayınlayın)' : 'Son 90 saniyede aktif'} renk="text-emerald-600" />
        <Gosterge baslik="Şimdi anasayfada" deger={canli.hata ? '—' : anasayfadaki} alt="Anasayfa ekranında olanlar" renk="text-emerald-600" />
        <Gosterge baslik="Bugün anasayfayı gören" deger={bugunAnasayfa} alt="Benzersiz cihaz/kişi (bugün)" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Gosterge baslik="Bugün aktif" deger={o.bugun} alt={`Dün ${o.dun} (${fark >= 0 ? '+' : ''}${fark})`} renk="text-rose-600" />
        <Gosterge baslik="7 günde aktif" deger={o.hafta} />
        <Gosterge baslik="30 günde aktif" deger={o.ay} />
        <Gosterge baslik="Yapışkanlık" deger={`%${o.yapiskanlik}`} alt="Günlük aktif ÷ aylık aktif (7 gün ort.)" />
        <Gosterge baslik="Toplam kişi" deger={o.toplam} alt={`${o.kayitli} giriş yapmış`} />
        <Gosterge baslik="Bekleyen onay" deger={bekleyen} alt="İlan, vefat, esnaf, ihbar, kesinti" renk={bekleyen ? 'text-amber-600' : 'text-neutral-900'} />
      </div>

      <Kart baslik="Günlük aktif ve yeni kişi" alt={`Son ${aralik} gün (Türkiye saati)`}>
        {kisiler.length ? (
          <Cizgi
            etiketler={gunler.map(kisaGun)}
            seriler={[
              { ad: 'Aktif kişi', renk: '#e11d48', veri: aktif },
              { ad: 'İlk kez gelen', renk: '#2563eb', veri: yeni },
            ]}
          />
        ) : (
          <Bos />
        )}
      </Kart>

      <div className="grid lg:grid-cols-3 gap-4">
        <Kart baslik="Katılımcı segmentleri">
          <Cubuklar veri={(Object.keys(seg) as SegmentAdi[]).map((a) => ({ ad: a, deger: seg[a] }))} yuzdeGoster />
        </Kart>
        <Kart baslik="Cihaz dağılımı">
          <Halka veri={platform} />
        </Kart>
        <Kart baslik="En çok ilgi gören bölümler">
          <Cubuklar veri={ilgi.map((i) => ({ ad: i.ad, deger: i.deger }))} renk="#2563eb" />
        </Kart>
      </div>
    </div>
  );
};

export const Katilimcilar: React.FC<EkranProps> = ({ veri, kisiler, aralik }) => {
  const seg = useMemo(() => segmentSay(kisiler), [kisiler]);
  const gd = useMemo(() => geriDonus(kisiler), [kisiler]);
  const kohort = useMemo(() => kohortlar(kisiler), [kisiler]);
  const roller = useMemo(() => dagilim(veri.kullanicilar, (u) => ROL_ETIKET[u.role] || u.role), [veri.kullanicilar]);
  const girisler = useMemo(() => dagilim(veri.kullanicilar, (u) => GIRIS_ETIKET[u.loginMethod || ''] || u.loginMethod), [veri.kullanicilar]);
  const gunler = useMemo(() => sonGunler(aralik), [aralik]);
  const kayit = useMemo(() => {
    // Kayıt günü: createdAtMs; yoksa bu hesabın analitikteki ilk görülmesi
    const ilkVeri = new Map(kisiler.filter((k) => k.uid && k.ilkGun).map((k) => [k.uid!, k.ilkGun!]));
    const say = new Map<string, number>();
    let tarihsiz = 0;
    veri.kullanicilar.forEach((u) => {
      const g = u.createdAtMs ? trGun(u.createdAtMs) : ilkVeri.get(u.uid);
      if (!g) tarihsiz += 1;
      else say.set(g, (say.get(g) || 0) + 1);
    });
    return { seri: gunler.map((g) => say.get(g) || 0), tarihsiz };
  }, [veri.kullanicilar, kisiler, gunler]);
  const surumler = useMemo(() => {
    const g30 = sonGunler(30);
    return dagilim(
      kisiler.filter((k) => g30.some((g) => k.gunSet.has(g))),
      (k) => k.surum || 'eski sürüm'
    ).slice(0, 8);
  }, [kisiler]);
  const renk = (v: number | null) =>
    v === null ? 'bg-neutral-50 text-neutral-300' : v === 0 ? 'bg-neutral-100 text-neutral-500' : 'text-white';
  const stil = (v: number | null) => (v === null || v === 0 ? undefined : { background: `rgba(5,150,105,${0.25 + 0.75 * Math.min(1, v / 60)})` });

  return (
    <div className="space-y-4">
      <Uyari veri={veri} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Kart baslik="Segmentler" alt="Davranışa göre kişi grupları">
          <ul className="space-y-3">
            {(Object.keys(seg) as SegmentAdi[]).map((a) => (
              <li key={a}>
                <div className="flex justify-between text-[13px] font-black text-neutral-800">
                  <span>{a}</span>
                  <span>
                    {seg[a]} <span className="text-neutral-400 font-bold">· %{Math.round(yuzde(seg[a], kisiler.length))}</span>
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500">{SEGMENT_ACIKLAMA[a]}</div>
              </li>
            ))}
          </ul>
        </Kart>
        <Kart baslik="Geri dönüş oranı" alt="İlk geldikten sonra tekrar gelenler (yalnız yeterince zaman geçenler sayılır)">
          <div className="grid grid-cols-3 gap-3">
            <Gosterge baslik="Ertesi gün" deger={`%${gd.d1.oran}`} alt={`${gd.d1.payda} kişi üzerinden`} />
            <Gosterge baslik="İlk 7 gün" deger={`%${gd.h1.oran}`} alt={`${gd.h1.payda} kişi`} />
            <Gosterge baslik="İlk 30 gün" deger={`%${gd.h4.oran}`} alt={`${gd.h4.payda} kişi`} />
          </div>
        </Kart>
      </div>

      <Kart baslik="Haftalık elde tutma (kohort)" alt="Satır: ilk geldiği hafta. Sütun: o haftadan N hafta sonra tekrar gelenlerin oranı.">
        {kohort.length ? (
          <div className="overflow-x-auto">
            <table className="text-[12px] w-full min-w-[520px]">
              <thead>
                <tr className="text-neutral-500">
                  <th className="text-left font-bold py-1">Hafta</th>
                  <th className="text-right font-bold px-2">Kişi</th>
                  {Array.from({ length: 8 }, (_, i) => (
                    <th key={i} className="font-bold px-1">
                      +{i + 1}h
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kohort.map((s) => (
                  <tr key={s.haftaBasi}>
                    <td className="py-0.5 font-bold text-neutral-700">{kisaGun(s.haftaBasi)}</td>
                    <td className="text-right px-2 text-neutral-600">{s.boyut}</td>
                    {s.hucreler.map((v, i) => (
                      <td key={i} className="p-0.5">
                        <div className={`rounded text-center py-1 font-bold ${renk(v)}`} style={stil(v)}>
                          {v === null ? '' : `%${Math.round(v)}`}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Bos />
        )}
      </Kart>

      <div className="grid lg:grid-cols-3 gap-4">
        <Kart baslik="Üye rolleri" alt={`${veri.kullanicilar.length} kayıtlı hesap`}>
          <Cubuklar veri={roller} renk="#059669" yuzdeGoster />
        </Kart>
        <Kart baslik="Giriş yöntemi">
          <Halka veri={girisler} />
        </Kart>
        <Kart baslik="Uygulama sürümü" alt="Son 30 günde aktif olanlar">
          <Cubuklar veri={surumler} renk="#7c3aed" />
        </Kart>
      </div>

      <Kart baslik="Yeni üye kaydı" alt={`Son ${aralik} gün${kayit.tarihsiz ? ` · ${kayit.tarihsiz} hesabın kayıt tarihi bilinmiyor (analitik öncesi)` : ''}`}>
        {veri.kullanicilar.length ? <Cizgi etiketler={gunler.map(kisaGun)} seriler={[{ ad: 'Yeni üye', renk: '#059669', veri: kayit.seri }]} yukseklik={160} /> : <Bos />}
      </Kart>
    </div>
  );
};

export const EtkinlikZamani: React.FC<EkranProps> = ({ kisiler }) => {
  const m = useMemo(() => isiMatrisi(kisiler), [kisiler]);
  const enler = useMemo(() => {
    const l: { gun: number; saat: number; v: number }[] = [];
    m.forEach((s, g) => s.forEach((v, h) => v > 0 && l.push({ gun: g, saat: h, v })));
    return l.sort((a, b) => b.v - a.v).slice(0, 5);
  }, [m]);
  const saatToplam = useMemo(() => Array.from({ length: 24 }, (_, h) => m.reduce((a, s) => a + s[h], 0)), [m]);
  const gunToplam = useMemo(() => m.map((s) => s.reduce((a, b) => a + b, 0)), [m]);
  return (
    <div className="space-y-4">
      <BildirimSaatiOnerisi kisiler={kisiler} />
      <Kart baslik="Etkinlik ısı haritası" alt="Gün ve saate göre uygulama etkinliği (Türkiye saati). Koyu = yoğun.">
        {enler.length ? <IsiMatrisi matris={m} /> : <Bos />}
      </Kart>
      <div className="grid lg:grid-cols-3 gap-4">
        <Kart baslik="En yoğun 5 zaman dilimi" alt="Bildirimi bu saatlerden hemen önce göndermek dokunma oranını artırır">
          {enler.length ? (
            <ol className="space-y-1.5 text-[13px]">
              {enler.map((e, i) => (
                <li key={i} className="flex justify-between font-bold text-neutral-700">
                  <span>
                    {GUN_AD[e.gun]} {String(e.saat).padStart(2, '0')}:00
                  </span>
                  <span className="text-neutral-400">{e.v}</span>
                </li>
              ))}
            </ol>
          ) : (
            <Bos />
          )}
        </Kart>
        <Kart baslik="Saate göre">
          <Cubuklar veri={saatToplam.map((v, h) => ({ ad: `${String(h).padStart(2, '0')}:00`, deger: v })).filter((x) => x.deger > 0)} renk="#0891b2" />
        </Kart>
        <Kart baslik="Güne göre">
          <Cubuklar veri={gunToplam.map((v, g) => ({ ad: GUN_AD[g], deger: v }))} renk="#d97706" />
        </Kart>
      </div>
    </div>
  );
};

export const IcerikIlgi: React.FC<EkranProps> = ({ veri, kisiler, aralik }) => {
  const gunler = useMemo(() => sonGunler(aralik), [aralik]);
  const ilgi = useMemo(() => ilgiToplami(kisiler), [kisiler]);
  const icerik = useMemo(
    () =>
      veri.icerik.map((i) => ({
        ...i,
        aralikSay: gunler.reduce((a, g) => a + (Number(i.gun?.[g]) || 0), 0),
      })),
    [veri.icerik, gunler]
  );
  const liste = (tip: string) =>
    icerik
      .filter((i) => i.tip === tip && i.aralikSay > 0)
      .sort((a, b) => b.aralikSay - a.aralikSay)
      .slice(0, 8)
      .map((i) => ({ ad: i.baslik || i.id, deger: i.aralikSay, ek: i.kategori }));
  const arama = veri.arama.slice(0, 12).map((a) => ({ ad: a.terim, deger: a.adet, ek: a.bos ? `${a.bos}× sonuçsuz` : undefined }));
  const sonucsuz = veri.arama
    .filter((a) => a.bos > 0)
    .sort((a, b) => b.bos - a.bos)
    .slice(0, 12)
    .map((a) => ({ ad: a.terim, deger: a.bos }));
  return (
    <div className="space-y-4">
      <Uyari veri={veri} />
      <div className="grid lg:grid-cols-3 gap-4">
        <Kart baslik="En çok okunan haberler" alt={`Son ${aralik} gün · kişi başı bir görüntüleme/oturum`}>
          <Cubuklar veri={liste('haber')} renk="#e11d48" />
        </Kart>
        <Kart baslik="En çok bakılan ilanlar">
          <Cubuklar veri={liste('ilan')} renk="#059669" />
        </Kart>
        <Kart baslik="En çok bakılan esnaf">
          <Cubuklar veri={liste('esnaf')} renk="#d97706" />
        </Kart>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Kart baslik="En çok aranan sözcükler" alt="Tüm zamanlar">
          <Cubuklar veri={arama} renk="#2563eb" />
        </Kart>
        <Kart baslik="Sonuç bulunamayan aramalar" alt="Eksik içerik fırsatı: kullanıcı bunu arıyor ama bulamıyor">
          <Cubuklar veri={sonucsuz} renk="#be123c" />
        </Kart>
      </div>
      <KategoriPerformansi veri={veri} kisiler={kisiler} aralik={aralik} />
      <Kart baslik="Bölüm ve işlem ilgisi" alt="Sekme açılışları, hızlı işlemler, modüller (tüm zamanlar, toplam dokunuş)">
        <Cubuklar veri={ilgi.slice(0, 16).map((i) => ({ ad: i.ad, deger: i.deger }))} renk="#7c3aed" />
      </Kart>
    </div>
  );
};

export const BolgeSayfasi: React.FC<EkranProps> = ({ kisiler }) => {
  const b = useMemo(() => bolgeAnalizi(kisiler), [kisiler]);
  const gorunen = b.hucreler.reduce((a, h) => a + h.kisi, 0);
  const dogrulukKotu = b.medyanDogruluk !== null && b.medyanDogruluk > 150;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Gosterge baslik="Konum veren kişi" deger={b.konumlu} alt={`%${kisiler.length ? Math.round(yuzde(b.konumlu, kisiler.length)) : 0} (konum izni veren)`} />
        <Gosterge baslik="Haritada gösterilen" deger={gorunen} alt={`${b.hucreler.length} hücre (~50 m)`} />
        <Gosterge baslik="Gizlenen" deger={b.gizlenenKisi} alt={`${b.gizlenenHucre} hücrenin çevresinde (~150 m) ${EN_AZ_KISI}'ten az kişi var`} />
        <Gosterge
          baslik="Konum doğruluğu (medyan)"
          deger={b.medyanDogruluk === null ? '—' : `${b.medyanDogruluk} m`}
          alt={dogrulukKotu ? 'Hücreden (50 m) büyük: harita yaklaşık sayılmalı' : 'Hücre boyutuna uygun'}
          renk={dogrulukKotu ? 'text-amber-600' : 'text-neutral-900'}
        />
      </div>
      <Kart
        baslik="Bölge yoğunluk haritası"
        alt={`Yaklaşık 50 m'lik hücreler yumuşatılarak çizilir. Gizlilik için çevresinde (~150 m) ${EN_AZ_KISI}'ten az kişi olan yerler gösterilmez; tek tek kişi veya adres görünmez.`}
      >
        {b.hucreler.length ? (
          <BolgeHaritasi hucreler={b.hucreler} />
        ) : (
          <Bos
            metin={
              b.konumlu
                ? `Konum veren ${b.konumlu} kişi var ama hiçbir yerde çevrede ${EN_AZ_KISI} kişi yok; kişi sayısı arttıkça görünür.`
                : 'Henüz konum verisi yok. Konum izni veren kullanıcılar yeni sürümü açtıkça burada görünür.'
            }
          />
        )}
      </Kart>
      {b.hucreler.length > 0 && (
        <Kart baslik="En yoğun yerler" alt="Değer: hücre + çevresindeki 8 hücrenin toplamı (~150 m)">
          <Cubuklar
            veri={b.hucreler.slice(0, 10).map((h) => ({ ad: `${h.la.toFixed(4)}, ${h.lo.toFixed(4)}`, deger: h.komsu, ek: `hücrede ${h.kisi}` }))}
            renk="#f97316"
          />
        </Kart>
      )}
    </div>
  );
};

const zamanMetni = (ms: number) =>
  new Date(ms).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const BildirimSayfasi: React.FC = () => {
  const { liste, hata, yenileniyor, yenile } = useBildirimRaporu(true);
  const sayili = liste.filter((r) => r.goren !== null && r.hedefKullanici > 0);
  const ortDokunma = sayili.length
    ? Math.round(sayili.reduce((a, r) => a + yuzde(r.dokunan || 0, r.hedefKullanici), 0) / sayili.length)
    : 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Gosterge baslik="Son bildirim sayısı" deger={liste.length} />
        <Gosterge baslik="Ort. dokunma oranı" deger={`%${ortDokunma}`} alt="Dokunan ÷ hedef kullanıcı" renk="text-rose-600" />
        <Gosterge baslik="Hatalı gönderim" deger={liste.filter((r) => r.durum === 'hata').length} />
        <Gosterge baslik="Gönderiliyor" deger={liste.filter((r) => r.durum === 'gonderiliyor').length} />
      </div>
      <Kart
        baslik="Bildirim raporu"
        alt="'Hedef' gönderilen cihaz/kullanıcı sayısıdır; Google konu bildirimlerinde cihaz bazlı teslim raporu yoktur."
        sag={
          <button onClick={yenile} className="text-[11px] font-bold text-rose-600 hover:underline">
            {yenileniyor ? 'Yenileniyor…' : 'Yenile'}
          </button>
        }
      >
        {hata ? (
          <Bos metin="Bildirim raporu okunamadı (yetki ya da bağlantı)." />
        ) : liste.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] min-w-[640px]">
              <thead>
                <tr className="text-left text-neutral-500">
                  <th className="py-1 font-bold">Bildirim</th>
                  <th className="font-bold">Tür</th>
                  <th className="font-bold">Zaman</th>
                  <th className="font-bold text-right">Hedef</th>
                  <th className="font-bold text-right">Gördü</th>
                  <th className="font-bold text-right">Dokundu</th>
                  <th className="font-bold text-right">Oran</th>
                </tr>
              </thead>
              <tbody>
                {liste.map((r) => (
                  <tr key={r.id} className="border-t border-neutral-100">
                    <td className="py-1.5 max-w-[260px] truncate font-bold text-neutral-800" title={r.message}>
                      {r.title}
                    </td>
                    <td className="text-neutral-500">{r.type}</td>
                    <td className="text-neutral-500">{zamanMetni(r.createdAtMs)}</td>
                    <td className="text-right">{r.hedefKullanici || r.hedefCihaz}</td>
                    <td className="text-right">{r.goren ?? '—'}</td>
                    <td className="text-right">{r.dokunan ?? '—'}</td>
                    <td className="text-right font-bold text-rose-600">
                      {r.hedefKullanici ? `%${Math.round(yuzde(r.dokunan || 0, r.hedefKullanici))}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Bos metin="Henüz gönderilmiş bildirim yok." />
        )}
      </Kart>
    </div>
  );
};

export const OnayKuyrugu: React.FC<EkranProps> = ({ veri }) => {
  const o = veri.onay;
  const satirlar: { ad: string; v: number | null; ipucu: string }[] = [
    { ad: 'Mahalle ilanları', v: o.ilan, ipucu: 'Alım-satım ilanı onay bekliyor' },
    { ad: 'Cenaze / vefat ilanları', v: o.vefat, ipucu: 'Hızlı onay gerektirir' },
    { ad: 'Esnaf başvuruları', v: o.esnaf, ipucu: 'İşletme kaydı onay bekliyor' },
    { ad: 'Haber ihbarları', v: o.ihbar, ipucu: 'Vatandaş ihbarı editör bekliyor' },
    { ad: 'Kesinti bildirimleri', v: o.kesinti, ipucu: 'Otomatik bulunan kesinti onay bekliyor' },
    { ad: 'Açık şikayetler', v: o.sikayet, ipucu: 'Kullanıcı şikayeti inceleme bekliyor' },
  ];
  const toplam = satirlar.reduce((a, s) => a + (s.v || 0), 0);
  return (
    <div className="space-y-4">
      <Gosterge baslik="Toplam bekleyen iş" deger={toplam} renk={toplam ? 'text-amber-600' : 'text-emerald-600'} alt={toplam ? 'Uygulamadaki Yönetim paneli → ilgili bölümden onaylanır' : 'Bekleyen yok'} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {satirlar.map((s) => (
          <div key={s.ad} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
            <div className="text-[12px] font-black text-neutral-700">{s.ad}</div>
            <div className={`text-3xl font-black mt-1 ${s.v ? 'text-amber-600' : 'text-neutral-900'}`}>{s.v === null ? '—' : s.v}</div>
            <div className="text-[11px] text-neutral-500 mt-1">{s.v === null ? 'Okunamadı (yetki ya da koleksiyon)' : s.ipucu}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VeriDurumu: React.FC<EkranProps> = ({ veri, kisiler }) => {
  const ilk = kisiler.reduce<number>((a, k) => (k.ilk && (!a || k.ilk < a) ? k.ilk : a), 0);
  return (
    <div className="space-y-4">
      <Uyari veri={veri} />
      <Kart baslik="Veri durumu">
        <ul className="text-[13px] space-y-1.5 text-neutral-700">
          <li>Cihaz kaydı: <b>{veri.ziyaretciler.length}</b> · benzersiz kişi: <b>{kisiler.length}</b></li>
          <li>Kayıtlı hesap (plus_users): <b>{veri.kullanicilar.length}</b></li>
          <li>İçerik sayacı: <b>{veri.icerik.length}</b> · arama sözcüğü: <b>{veri.arama.length}</b></li>
          <li>İlk analitik kaydı: <b>{ilk ? new Date(ilk).toLocaleDateString('tr-TR') : '—'}</b></li>
          <li>Son yükleme: <b>{new Date(veri.yuklendi).toLocaleTimeString('tr-TR')}</b></li>
        </ul>
      </Kart>
      <Kart baslik="Nasıl toplanıyor, nelere dikkat">
        <ul className="text-[12px] text-neutral-600 space-y-2 list-disc pl-4">
          <li>Her cihaz rastgele bir kimlikle tek belgede saklanır; ad, telefon, e-posta veya yazılan metin kaydedilmez. Giriş yapıldıysa hesap kimliği (uid) eklenir; aynı hesapla birden çok cihaz tek kişi sayılır.</li>
          <li>Konum: tam konum gönderilmez, yalnızca ≈50 m'lik hücre ve konum doğruluğu. Harita kişi değil yoğunluk gösterir; çevresinde 3'ten az kişi olan yerler gizlenir.</li>
          <li>Çevrimiçi sayısı için açık uygulama dakikada bir <code>plus_cevrimici</code> belgesine yazar (zaman, ekran, cihaz türü, geliş kaynağı; kişi bilgisi yok). Bu, kullanıcı başına günde birkaç yüz yazma demektir: günlük ücretsiz yazma kotası (20.000) kalabalıkta aşılabilir; kullanıcı sayısı artınca bu aralığı uzatın.</li>
          <li>Bu panel açılırken tüm ziyaretçi belgeleri okunur: okuma maliyeti kişi sayısı kadardır. Çok büyüyünce günlük özet belgelerine geçilmelidir.</li>
          <li>Hesap silindiğinde o cihazın analitik belgesi de silinir. Başka cihazlarda kalan kayıtlar için Worker'daki hesap silme akışına <code>plus_ziyaretciler</code> (uid eşleşmesi) eklenmelidir.</li>
          <li>Gizlilik politikası ve Play Console "Veri güvenliği" formu bu toplamayı (kullanım verisi, yaklaşık konum) belirtecek şekilde güncellenmelidir.</li>
        </ul>
      </Kart>
    </div>
  );
};

// ---- Canlı ------------------------------------------------------------------------
export const CanliSayfasi: React.FC<EkranProps> = ({ veri }) => {
  const { liste, hata, hazir } = useCanli();
  const sayfaDagilim = useMemo(() => dagilim(liste, (k) => SAYFA_ETIKET[k.s] || k.s), [liste]);
  const cihaz = useMemo(() => dagilim(liste, (k) => ({ android: 'Android uygulaması', ios: 'iOS', web: 'Web' } as Record<string, string>)[k.p] || k.p), [liste]);
  const kaynak = useMemo(() => dagilim(liste, (k) => KAYNAK_ETIKET[k.k] || k.k), [liste]);
  const bugun = useMemo(() => sayfaGorenler(veri.ziyaretciler, [trGun()]), [veri.ziyaretciler]);
  const anasayfa = liste.filter((k) => k.s === 'anasayfa').length;
  if (hata) return <Kart baslik="Canlı"><Bos metin={hata} /></Kart>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Gosterge baslik="Şimdi online" deger={hazir ? liste.length : '…'} alt="Son 90 saniyede aktif · canlı güncellenir" renk="text-emerald-600" />
        <Gosterge baslik="Anasayfada" deger={anasayfa} alt={liste.length ? `%${Math.round(yuzde(anasayfa, liste.length))} online kişi` : ''} renk="text-emerald-600" />
        <Gosterge baslik="Android uygulaması" deger={liste.filter((k) => k.p === 'android').length} />
        <Gosterge baslik="Web" deger={liste.filter((k) => k.p === 'web').length} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Kart baslik="Şu an hangi ekranda?" alt="Online olanların bulunduğu ekran">
          <Cubuklar veri={sayfaDagilim} renk="#059669" />
        </Kart>
        <Kart baslik="Cihaz">
          <Halka veri={cihaz} />
        </Kart>
        <Kart baslik="Hangi kaynaktan geldi?" alt="Online olanların bu açılıştaki geliş kaynağı">
          <Cubuklar veri={kaynak} renk="#2563eb" />
        </Kart>
      </div>
      <Kart baslik="Bugün sayfaları gören kişi" alt="Bugün her ekranı en az bir kez açan benzersiz cihaz/kişi sayısı">
        <Cubuklar veri={bugun.map((b) => ({ ad: b.ad, deger: b.deger }))} renk="#0891b2" />
      </Kart>
    </div>
  );
};

// ---- Trafik kaynakları -------------------------------------------------------------
export const TrafikKaynaklari: React.FC<EkranProps> = ({ veri, aralik }) => {
  const gunler = useMemo(() => sonGunler(aralik), [aralik]);
  const k = useMemo(() => kaynakOzeti(veri.ziyaretciler, gunler), [veri.ziyaretciler, gunler]);
  const sayfalar = useMemo(() => sayfaGorenler(veri.ziyaretciler, gunler), [veri.ziyaretciler, gunler]);
  return (
    <div className="space-y-4">
      <Uyari veri={veri} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Kart baslik="Oturumlar hangi kaynaktan?" alt={`Son ${aralik} gün · toplam ${k.toplamOturum} açılış`}>
          <Cubuklar veri={k.oturum} renk="#e11d48" yuzdeGoster />
        </Kart>
        <Kart baslik="Yeni gelenler ilk hangi kaynaktan geldi?" alt={`Son ${aralik} günde ilk kez gelenler`}>
          <Halka veri={k.yeni} />
        </Kart>
      </div>
      <Kart baslik="Sayfayı gören kişi" alt={`Son ${aralik} günde her ekranı açan benzersiz cihaz/kişi`}>
        <Cubuklar veri={sayfalar.map((s) => ({ ad: s.ad, deger: s.deger }))} renk="#0891b2" />
      </Kart>
      <Kart baslik="Kaynağı doğru ölçmek için">
        <ul className="text-[12px] text-neutral-600 space-y-2 list-disc pl-4">
          <li>
            Instagram, WhatsApp, Facebook gibi uygulamalar çoğu zaman kaynak bilgisini göndermez. Paylaştığın bağlantılara etiket ekle:{' '}
            <code className="bg-neutral-100 px-1 rounded">https://www.mutlularhaber.com/?kaynak=instagram</code>,{' '}
            <code className="bg-neutral-100 px-1 rounded">?kaynak=whatsapp</code>, <code className="bg-neutral-100 px-1 rounded">?kaynak=facebook</code>.
          </li>
          <li>Instagram ve Facebook'un kendi tarayıcısıyla gelenler etiketsiz de tanınır. Etiketsiz WhatsApp ve SMS tıklamaları "Doğrudan / bilinmiyor" görünür.</li>
          <li>Android uygulamasından girenler "Android uygulaması" olarak ayrı sayılır.</li>
          <li>Veriler bu özelliğin yayınlandığı günden itibaren birikir; geriye dönük kaynak bilgisi yoktur.</li>
        </ul>
      </Kart>
    </div>
  );
};

// ---- Uyarılar -------------------------------------------------------------------------------
export const uyarilar = (veri: PanelVeri, kisiler: Kisi[]): UyariKaydi[] =>
  uyarilariUret(kisiler, veri.onay, veri.hatalar, veri.hatalarGunlugu);

const SEVIYE_STIL: Record<string, string> = {
  kritik: 'border-rose-300 bg-rose-50 text-rose-900',
  uyari: 'border-amber-300 bg-amber-50 text-amber-900',
  bilgi: 'border-sky-200 bg-sky-50 text-sky-900',
};
const SEVIYE_AD: Record<string, string> = { kritik: 'Kritik', uyari: 'Uyarı', bilgi: 'Bilgi' };

export const UyarilarSayfasi: React.FC<EkranProps & { git: (b: string) => void }> = ({ veri, kisiler, git }) => {
  const liste = useMemo(() => uyarilar(veri, kisiler), [veri, kisiler]);
  return (
    <div className="space-y-4">
      <Kart
        baslik="Uyarılar"
        alt="Panel açıkken her 2 dakikada bir yenilenir. Panel kapalıyken bildirim göndermez (bunun için sunucu tarafı zamanlanmış görev gerekir)."
      >
        {liste.length === 0 ? (
          <p className="text-[13px] font-bold text-emerald-700 py-4">Her şey yolunda görünüyor: bekleyen kritik iş ya da anormal düşüş yok.</p>
        ) : (
          <div className="space-y-2">
            {liste.map((u, i) => (
              <div key={i} className={`rounded-xl border p-3 flex items-start justify-between gap-3 ${SEVIYE_STIL[u.seviye]}`}>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wide opacity-70">{SEVIYE_AD[u.seviye]}</div>
                  <div className="text-[13px] font-black">{u.baslik}</div>
                  <div className="text-[12px] opacity-80">{u.ayrinti}</div>
                </div>
                {u.bolum && (
                  <button onClick={() => git(u.bolum!)} className="shrink-0 text-[11px] font-black underline">
                    Git
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Kart>
    </div>
  );
};

// ---- Huniler --------------------------------------------------------------------------------
export const HunilerSayfasi: React.FC<EkranProps> = ({ kisiler }) => {
  const h = useMemo(() => huniler(kisiler), [kisiler]);
  const toplamAc = h.reduce((a, x) => a + x.ac, 0);
  return (
    <div className="space-y-4">
      <Kart baslik="Form tamamlama hunileri" alt="Formu açanların kaçı gönderdi? Düşük oran, formun zor ya da uzun olduğunu gösterebilir. Tüm zamanların toplamı; yeni sürümden itibaren birikir.">
        {toplamAc === 0 ? (
          <Bos metin="Henüz huni verisi yok. Yeni sürüm kullanıldıkça burada birikir." />
        ) : (
          <div className="space-y-4">
            {h.map((x) => (
              <div key={x.anahtar}>
                <div className="flex justify-between text-[12px] font-black text-neutral-800 mb-1">
                  <span>{x.ad}</span>
                  <span>{x.oran === null ? (x.ac ? `${x.ac} açılış` : '—') : x.ac ? `%${x.oran} tamamlandı` : '—'}</span>
                </div>
                <div className="h-5 rounded-lg bg-neutral-100 overflow-hidden relative">
                  <div className="h-full bg-neutral-300" style={{ width: x.ac ? '100%' : '0%' }} />
                  <div className="h-full bg-emerald-500 absolute left-0 top-0" style={{ width: x.ac ? `${Math.min(100, (x.gonder / x.ac) * 100)}%` : '0%' }} />
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  {x.ac} açılış ({x.kisiAc} cihaz){x.oran !== null ? ` → ${x.gonder} gönderim (${x.kisiGonder} cihaz)` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </Kart>
    </div>
  );
};

// ---- Esnaf performansı ---------------------------------------------------------------------
export const EsnafSayfasi: React.FC<EkranProps> = ({ veri, aralik }) => {
  const gunler = useMemo(() => sonGunler(aralik), [aralik]);
  const satirlar = useMemo(
    () =>
      veri.esnaf
        .map((e) => {
          const s = (k: string) => gunler.reduce((a, g) => a + (Number(e.gun?.[g]?.[k]) || 0), 0);
          const goruntule = s('goruntule');
          const ara = s('ara');
          const yol = s('yol');
          const wp = s('whatsapp');
          return { id: e.id, ad: e.ad, goruntule, ara, yol, wp, menu: s('menu'), paylas: s('paylas'), iletisim: ara + yol + wp };
        })
        .filter((x) => x.goruntule + x.iletisim > 0)
        .sort((a, b) => b.goruntule - a.goruntule),
    [veri.esnaf, gunler]
  );
  const t = (k: 'goruntule' | 'ara' | 'yol' | 'wp') => satirlar.reduce((a, x) => a + x[k], 0);
  return (
    <div className="space-y-4">
      <Uyari veri={veri} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Gosterge baslik="Profil görüntüleme" deger={t('goruntule')} alt={`Son ${aralik} gün`} />
        <Gosterge baslik="Arama" deger={t('ara')} renk="text-emerald-600" />
        <Gosterge baslik="Yol tarifi" deger={t('yol')} renk="text-blue-600" />
        <Gosterge baslik="WhatsApp" deger={t('wp')} renk="text-green-600" />
      </div>
      <Kart baslik="Esnaf performansı" alt={`Son ${aralik} gün · iletişim = arama + yol tarifi + WhatsApp`}>
        {satirlar.length === 0 ? (
          <Bos metin="Henüz esnaf etkileşimi yok." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="py-2 pr-3">İşletme</th>
                  <th className="px-2 text-right">Görüntüleme</th>
                  <th className="px-2 text-right">Arama</th>
                  <th className="px-2 text-right">Yol</th>
                  <th className="px-2 text-right">WhatsApp</th>
                  <th className="px-2 text-right">Menü</th>
                  <th className="px-2 text-right">İletişim oranı</th>
                </tr>
              </thead>
              <tbody>
                {satirlar.slice(0, 40).map((x) => (
                  <tr key={x.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-3 font-bold text-neutral-800">{x.ad}</td>
                    <td className="px-2 text-right">{x.goruntule}</td>
                    <td className="px-2 text-right">{x.ara}</td>
                    <td className="px-2 text-right">{x.yol}</td>
                    <td className="px-2 text-right">{x.wp}</td>
                    <td className="px-2 text-right">{x.menu}</td>
                    <td className="px-2 text-right font-black">{x.goruntule ? `%${Math.round((x.iletisim / x.goruntule) * 100)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Kart>
    </div>
  );
};

// ---- Hatalar -------------------------------------------------------------------------------
export const HatalarSayfasi: React.FC<EkranProps> = ({ veri, aralik }) => {
  const gunler = useMemo(() => sonGunler(aralik), [aralik]);
  const satirlar = useMemo(
    () =>
      veri.hatalarGunlugu
        .map((h) => ({ ...h, aralikAdet: gunler.reduce((a, g) => a + (Number(h.gun?.[g]) || 0), 0) }))
        .filter((h) => h.aralikAdet > 0)
        .sort((a, b) => b.aralikAdet - a.aralikAdet),
    [veri.hatalarGunlugu, gunler]
  );
  const gunluk = gunler.map((g) => veri.hatalarGunlugu.reduce((a, h) => a + (Number(h.gun?.[g]) || 0), 0));
  const surumler = dagilim(satirlar, (h) => h.surum).map((d) => d);
  return (
    <div className="space-y-4">
      <Uyari veri={veri} />
      <div className="grid sm:grid-cols-3 gap-3">
        <Gosterge baslik="Hata kaydı" deger={satirlar.reduce((a, h) => a + h.aralikAdet, 0)} alt={`Son ${aralik} gün`} renk="text-rose-600" />
        <Gosterge baslik="Farklı hata" deger={satirlar.length} />
        <Gosterge baslik="Çalışan sürüm (panel)" deger={APP_VERSION.split('-').pop() || ''} alt={APP_VERSION} />
      </div>
      <Kart baslik="Günlük hata sayısı">
        <Cizgi etiketler={gunler.map(kisaGun)} seriler={[{ ad: 'Hata', renk: '#e11d48', veri: gunluk }]} yukseklik={160} />
      </Kart>
      <Kart baslik="En sık görülen hatalar" alt="JavaScript hataları (ağ kopmaları ve gürültü elenir). Yerel Android çökmeleri burada görünmez; onlar için Firebase Crashlytics gerekir.">
        {satirlar.length === 0 ? (
          <Bos metin="Kayıtlı hata yok." />
        ) : (
          <div className="space-y-2">
            {satirlar.slice(0, 25).map((h) => (
              <div key={h.id} className="rounded-xl border border-neutral-200 p-3">
                <div className="flex justify-between gap-3">
                  <div className="text-[12px] font-bold text-neutral-800 break-words min-w-0">{h.mesaj}</div>
                  <div className="text-[13px] font-black text-rose-600 shrink-0">{h.aralikAdet}×</div>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  {[h.kaynak, h.platform, h.surum && `sürüm ${h.surum.split('-').pop()}`, h.son && `son: ${new Date(h.son).toLocaleString('tr-TR')}`].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        )}
        {surumler.length > 1 && <p className="text-[11px] text-neutral-500 mt-3">Sürümlere dağılım için hata satırlarındaki sürüm etiketine bakın.</p>}
      </Kart>
    </div>
  );
};

// ---- Akıllı bildirim saati kartı + içerik performansı (kategori) -----------------------------
const GUN_KISA = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export const BildirimSaatiOnerisi: React.FC<{ kisiler: Kisi[] }> = ({ kisiler }) => {
  const s = useMemo(() => bildirimSaatleri(kisiler), [kisiler]);
  const dk = (h: number) => `${String(h).padStart(2, '0')}:00`;
  return (
    <Kart baslik="Bildirim için en iyi saat" alt="Önümüzdeki 24 saatte, kullanıcıların uygulamayı en çok açtığı saat dilimi (23:00–07:00 hariç). Zamanlanmış gönderim bu panelden yapılamaz; saati not edip bildirimi o saatte gönderin.">
      {!s.en ? (
        <Bos metin="Öneri için yeterli etkinlik verisi yok (en az ~50 kayıtlı uygulama açılışı gerekir)." />
      ) : (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <div className="text-[10px] font-black uppercase text-emerald-700">Önerilen</div>
            <div className="text-xl font-black text-emerald-800">
              {GUN_KISA[s.en.gun]} {dk(s.en.saat)}
            </div>
            <div className="text-[11px] text-emerald-700">{new Date(s.en.ms).toLocaleString('tr-TR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} (cihaz saatiyle)</div>
          </div>
          {s.ilk3.slice(1).map((x) => (
            <div key={x.ms} className="rounded-2xl bg-neutral-50 border border-neutral-200 px-4 py-3">
              <div className="text-[10px] font-black uppercase text-neutral-500">Alternatif</div>
              <div className="text-base font-black text-neutral-800">
                {GUN_KISA[x.gun]} {dk(x.saat)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Kart>
  );
};

export const KategoriPerformansi: React.FC<EkranProps> = ({ veri, aralik }) => {
  const gunler = useMemo(() => sonGunler(aralik), [aralik]);
  const kategori = useMemo(() => {
    const m: Record<string, number> = {};
    veri.icerik.forEach((i) => {
      const t = gunler.reduce((a, g) => a + (Number(i.gun?.[g]) || 0), 0);
      if (t > 0) {
        const k = `${i.tip === 'haber' ? 'Haber' : i.tip === 'ilan' ? 'İlan' : 'Esnaf'}: ${i.kategori || 'Kategorisiz'}`;
        m[k] = (m[k] || 0) + t;
      }
    });
    return Object.entries(m)
      .map(([ad, deger]) => ({ ad, deger }))
      .sort((a, b) => b.deger - a.deger)
      .slice(0, 12);
  }, [veri.icerik, gunler]);
  return (
    <Kart baslik="Kategori performansı" alt={`Son ${aralik} gün · hangi konu türleri daha çok ilgi görüyor`}>
      <Cubuklar veri={kategori} renk="#0891b2" />
    </Kart>
  );
};
