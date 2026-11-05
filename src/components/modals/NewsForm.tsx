import React, { useMemo, useRef, useState } from 'react';
import { Check, Image as ImageIcon, Video, Plus, X, Link2, Upload, Loader2, Play, Trash2 } from 'lucide-react';
import { ImageCropField } from '../ImageCropField';
import { uploadVideoFile, MAX_VIDEO_MB } from '../../services/uploadService';
import { youtubeId, videoPoster, isVideoFileUrl } from '../../utils/newsVideo';

export interface NewsFormValues {
  title: string;
  summary: string;
  content: string;
  category: string;
  image: string;
  video: string;
  urgent: boolean;
  sendPush: boolean;
  date: string;
}

export const EMPTY_NEWS_FORM: NewsFormValues = {
  title: '',
  summary: '',
  content: '',
  category: 'Şehir & Yaşam',
  image: '',
  video: '',
  urgent: false,
  sendPush: false,
  date: '',
};

interface NewsFormProps {
  values: NewsFormValues;
  onChange: (patch: Partial<NewsFormValues>) => void;
  categories: string[];
  mode: 'create' | 'edit';
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
}

const inputCls =
  'w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-medium';

const SectionTitle: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <h5 className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-neutral-400">
    <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px]">{n}</span>
    {children}
  </h5>
);

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }> = ({
  checked,
  onChange,
  label,
  hint,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-3 text-left p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-700 hover:border-neutral-500 transition"
  >
    <span className="min-w-0">
      <span className="block text-xs font-bold text-neutral-100">{label}</span>
      {hint && <span className="block text-[10.5px] text-neutral-400 mt-0.5 leading-snug">{hint}</span>}
    </span>
    <span className={`relative w-10 h-6 rounded-full shrink-0 transition ${checked ? 'bg-rose-600' : 'bg-neutral-600'}`}>
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}
      />
    </span>
  </button>
);

export const NewsForm: React.FC<NewsFormProps> = ({ values, onChange, categories, mode, onSubmit, onCancel, submitLabel }) => {
  const [extraCats, setExtraCats] = useState<string[]>([]);
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [mediaMode, setMediaMode] = useState<'image' | 'video'>(values.video ? 'video' : 'image');
  const [linkInput, setLinkInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const norm = (s: string) => s.trim().toLocaleLowerCase('tr-TR');
  const allCats = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    [...categories, ...extraCats, values.category].forEach((c) => {
      const name = (c || '').trim();
      if (!name || seen.has(norm(name))) return;
      seen.add(norm(name));
      out.push(name);
    });
    return out;
  }, [categories, extraCats, values.category]);

  const addCategory = () => {
    const name = newCat.trim().replace(/\s+/g, ' ').slice(0, 30);
    if (!name) return;
    const existing = allCats.find((c) => norm(c) === norm(name));
    const final = existing || name;
    if (!existing) setExtraCats((p) => [...p, final]);
    onChange({ category: final });
    setNewCat('');
    setAddingCat(false);
  };

  const pickVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMediaError(null);
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadVideoFile(file, setProgress);
      onChange({ video: url, image: values.image || videoPoster(url) });
      setLinkInput('');
    } catch (err: any) {
      setMediaError(err?.message || 'Video yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const applyLink = () => {
    const u = linkInput.trim();
    if (!/^https?:\/\//i.test(u)) {
      setMediaError('Geçerli bir bağlantı girin (https://…).');
      return;
    }
    if (!youtubeId(u) && !isVideoFileUrl(u)) {
      setMediaError('YouTube bağlantısı ya da .mp4 / .webm video dosyası bağlantısı girin.');
      return;
    }
    setMediaError(null);
    onChange({ video: u, image: values.image || videoPoster(u) });
    setLinkInput('');
  };

  const switchMedia = (m: 'image' | 'video') => {
    if (m === mediaMode) return;
    if (m === 'image' && values.video) {
      if (!window.confirm('Haberdeki video kaldırılıp fotoğraf kullanılsın mı?')) return;
      onChange({ video: '' });
    }
    setMediaError(null);
    setMediaMode(m);
  };

  const ytThumb = values.video && youtubeId(values.video) ? videoPoster(values.video) : '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      {/* 1. Haber */}
      <section className="space-y-2">
        <SectionTitle n={1}>Haber</SectionTitle>
        <div>
          <input
            type="text"
            value={values.title}
            maxLength={140}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Haber başlığı *"
            className={inputCls}
            required
          />
          <div className="text-right text-[9.5px] text-neutral-500 mt-0.5">{values.title.length}/140</div>
        </div>
        <div>
          <textarea
            rows={2}
            value={values.summary}
            maxLength={220}
            onChange={(e) => onChange({ summary: e.target.value })}
            placeholder="Kısa özet * (listede ve bildirimde görünür)"
            className={inputCls}
            required
          />
          <div className="text-right text-[9.5px] text-neutral-500 mt-0.5">{values.summary.length}/220</div>
        </div>
        <textarea
          rows={8}
          value={values.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Haber metni (isteğe bağlı). Paragrafları boş satırla ayırın."
          className={inputCls}
        />
        {mode === 'edit' && (
          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Yayın tarihi (haberde görünen)</label>
            <input
              type="text"
              value={values.date}
              onChange={(e) => onChange({ date: e.target.value })}
              placeholder="05.11.2026 14:30"
              className={inputCls}
            />
          </div>
        )}
      </section>

      {/* 2. Kategori */}
      <section className="space-y-2">
        <SectionTitle n={2}>Kategori</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {allCats.map((c) => {
            const on = norm(c) === norm(values.category);
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ category: c })}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  on ? 'bg-rose-600 text-white' : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-neutral-500'
                }`}
              >
                {c}
              </button>
            );
          })}
          {!addingCat && (
            <button
              type="button"
              onClick={() => setAddingCat(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-dashed border-neutral-600 text-neutral-300 hover:text-white hover:border-neutral-400 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Yeni kategori
            </button>
          )}
        </div>
        {addingCat && (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              type="text"
              value={newCat}
              maxLength={30}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCategory();
                }
              }}
              placeholder="Kategori adı"
              className={inputCls}
            />
            <button type="button" onClick={addCategory} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0">
              Ekle
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingCat(false);
                setNewCat('');
              }}
              className="p-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-200 shrink-0"
              aria-label="Vazgeç"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <p className="text-[10.5px] text-neutral-500 leading-snug">
          Yeni kategori bu haberle birlikte kaydedilir ve Haberler sekmesindeki filtrelerde görünür.
        </p>
      </section>

      {/* 3. Medya */}
      <section className="space-y-2">
        <SectionTitle n={3}>Fotoğraf veya video</SectionTitle>
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-700">
          {([
            ['image', 'Fotoğraf', ImageIcon],
            ['video', 'Video', Video],
          ] as const).map(([m, label, Icon]) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMedia(m)}
              className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                mediaMode === m ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {mediaMode === 'image' ? (
          <div className="bg-white rounded-xl p-2">
            <ImageCropField
              value={values.image}
              onChange={(v) => onChange({ image: v })}
              aspect={16 / 9}
              outputWidth={1200}
              hint="Galeriden yükleyin, kadrajı ayarlayın."
            />
          </div>
        ) : (
          <div className="space-y-2">
            {values.video ? (
              <div className="rounded-xl overflow-hidden border border-neutral-700 bg-black">
                {ytThumb ? (
                  <div className="relative">
                    <img src={ytThumb} alt="Video kapağı" className="w-full max-h-48 object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-11 h-11 rounded-full bg-black/60 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </span>
                    </span>
                  </div>
                ) : (
                  <video src={values.video} poster={values.image || undefined} controls playsInline preload="metadata" className="w-full max-h-52 bg-black" />
                )}
                <div className="flex items-center justify-between gap-2 px-2.5 py-2 bg-neutral-900">
                  <span className="text-[10.5px] text-neutral-400 truncate">{values.video}</span>
                  <button
                    type="button"
                    onClick={() => onChange({ video: '' })}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-rose-300 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/*" onChange={pickVideo} className="hidden" />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-neutral-600 hover:border-rose-500 text-neutral-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? `Yükleniyor %${progress}` : `Galeriden video seç (en fazla ${MAX_VIDEO_MB} MB)`}
                </button>
                {uploading && (
                  <div className="h-1.5 rounded-full bg-neutral-700 overflow-hidden">
                    <div className="h-full bg-rose-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyLink();
                        }
                      }}
                      placeholder="veya YouTube / .mp4 bağlantısı yapıştırın"
                      className={inputCls + ' pl-8'}
                    />
                  </div>
                  <button type="button" onClick={applyLink} className="px-3 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold shrink-0">
                    Ekle
                  </button>
                </div>
              </>
            )}
            {mediaError && <p className="text-[11px] text-rose-300 font-semibold">{mediaError}</p>}
            <p className="text-[10.5px] text-neutral-500 leading-snug">
              Kısa videolar daha hızlı açılır. Kapak görseli videodan otomatik alınır.
            </p>
          </div>
        )}
      </section>

      {/* 4. Yayın seçenekleri */}
      <section className="space-y-2">
        <SectionTitle n={4}>Yayın seçenekleri</SectionTitle>
        <Switch
          checked={values.urgent}
          onChange={(v) => onChange({ urgent: v, sendPush: v ? values.sendPush : false })}
          label="Son dakika haberi"
          hint="Haberde ve vitrinde Son Dakika rozeti görünür."
        />
        {values.urgent && (
          <Switch
            checked={values.sendPush}
            onChange={(v) => onChange({ sendPush: v })}
            label={mode === 'edit' ? 'Kaydederken bildirim gönder' : 'Bildirim olarak gönder'}
            hint="Tüm cihazlara bildirim gider; bildirime dokunan haberi tam ekran açar."
          />
        )}
      </section>

      <div className="flex items-center gap-2 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-100 text-xs font-bold">
            İptal
          </button>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{uploading ? `Video yükleniyor %${progress}` : submitLabel}</span>
        </button>
      </div>
    </form>
  );
};
