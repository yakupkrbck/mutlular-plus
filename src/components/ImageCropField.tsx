import React, { useEffect, useRef, useState } from 'react';

interface ImageCropFieldProps {
  label?: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  /** genişlik / yükseklik. 1 = kare, 16/9 = geniş kapak */
  aspect?: number;
  /** çıktı genişliği (px) */
  outputWidth?: number;
  hint?: string;
}

/**
 * Gerçek dosya yükleme + kırpma. Kullanıcı galeriden/kameradan fotoğraf seçer,
 * kadrajı sürükleyip yakınlaştırır, "Kırp ve Kullan" ile JPEG olarak alınır.
 * Çıktı data: URL'dir; kayıt sırasında otomatik Cloudinary'ye yüklenip yerine bağlantı yazılır.
 */
export const ImageCropField: React.FC<ImageCropFieldProps> = ({
  label,
  value,
  onChange,
  aspect = 16 / 9,
  outputWidth = 1200,
  hint,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir fotoğraf dosyası seçin.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Fotoğraf 15 MB’tan küçük olmalı.');
      return;
    }
    setError(null);
    const r = new FileReader();
    r.onload = () => setSrc(String(r.result));
    r.onerror = () => setError('Fotoğraf okunamadı.');
    r.readAsDataURL(file);
  };

  return (
    <div>
      {label && <span className="text-[11px] font-bold text-neutral-700 block mb-1">{label}</span>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-neutral-300 hover:border-amber-500 bg-neutral-50 flex items-center justify-center text-neutral-400"
          style={{ width: 112, height: Math.round(112 / aspect) }}
        >
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold px-1 text-center leading-tight">Fotoğraf seç</span>
          )}
        </button>
        <div className="flex flex-col gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-[11px] font-black bg-neutral-900 text-white px-3 py-1.5 rounded-lg"
          >
            {value ? 'Fotoğrafı Değiştir' : 'Galeriden / Kameradan Yükle'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] font-bold text-rose-600 text-left"
            >
              Kaldır
            </button>
          )}
          {hint && <span className="text-[10px] text-neutral-500 leading-snug">{hint}</span>}
        </div>
      </div>
      {error && <p className="text-[11px] font-bold text-rose-600 mt-1">{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />

      {src && (
        <Cropper
          src={src}
          aspect={aspect}
          outputWidth={outputWidth}
          onCancel={() => setSrc(null)}
          onDone={(url) => {
            onChange(url);
            setSrc(null);
          }}
        />
      )}
    </div>
  );
};

interface CropperProps {
  src: string;
  aspect: number;
  outputWidth: number;
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
}

const Cropper: React.FC<CropperProps> = ({ src, aspect, outputWidth, onCancel, onDone }) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  // Kadraj (viewport) boyutu
  const vw = Math.min(typeof window !== 'undefined' ? window.innerWidth - 48 : 320, 360);
  const vh = Math.round(vw / aspect);

  useEffect(() => {
    const im = new Image();
    im.onload = () => {
      imgRef.current = im;
      setNat({ w: im.naturalWidth, h: im.naturalHeight });
    };
    im.src = src;
  }, [src]);

  const base = nat ? Math.max(vw / nat.w, vh / nat.h) : 1; // kadrajı kaplayan en küçük ölçek
  const scale = base * zoom;
  const iw = nat ? nat.w * scale : 0;
  const ih = nat ? nat.h * scale : 0;

  const clamp = (x: number, y: number, w = iw, h = ih) => ({
    x: Math.min(0, Math.max(vw - w, x)),
    y: Math.min(0, Math.max(vh - h, y)),
  });

  // İlk açılışta ortala
  useEffect(() => {
    if (!nat) return;
    setPos(clamp((vw - nat.w * base) / 2, (vh - nat.h * base) / 2, nat.w * base, nat.h * base));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nat]);

  const changeZoom = (z: number) => {
    if (!nat) return;
    const newScale = base * z;
    // kadrajın merkezi sabit kalsın
    const cx = (vw / 2 - pos.x) / scale;
    const cy = (vh / 2 - pos.y) / scale;
    const nx = vw / 2 - cx * newScale;
    const ny = vh / 2 - cy * newScale;
    setZoom(z);
    setPos(clamp(nx, ny, nat.w * newScale, nat.h * newScale));
  };

  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos(clamp(drag.current.px + (e.clientX - drag.current.sx), drag.current.py + (e.clientY - drag.current.sy)));
  };
  const onUp = () => {
    drag.current = null;
  };

  const confirm = () => {
    const im = imgRef.current;
    if (!im || !nat) return;
    // Kaynak çözünürlüğünden büyük çıktı üretme (bulanık büyütme olmasın)
    const visibleW = vw / scale;
    const outW = Math.max(200, Math.min(outputWidth, Math.round(visibleW)));
    const factor = outW / vw;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vw * factor);
    canvas.height = Math.round(vh * factor);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(im, pos.x * factor, pos.y * factor, iw * factor, ih * factor);
    onDone(canvas.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-4 w-full max-w-[400px] space-y-3">
        <h4 className="text-sm font-black text-neutral-900">Fotoğrafı Kırp</h4>
        <p className="text-[11px] text-neutral-500">Parmağınla sürükle, kaydırıcıyla yakınlaştır.</p>
        <div
          className="relative mx-auto overflow-hidden rounded-xl bg-neutral-200 touch-none select-none"
          style={{ width: vw, height: vh }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {nat && (
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: iw,
                height: ih,
                maxWidth: 'none',
                pointerEvents: 'none',
              }}
            />
          )}
          <div className="absolute inset-0 border-2 border-white/80 rounded-xl pointer-events-none" />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => changeZoom(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={confirm}
            disabled={!nat}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-xs rounded-xl py-2.5"
          >
            Kırp ve Kullan
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-black text-xs rounded-xl py-2.5"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
};
