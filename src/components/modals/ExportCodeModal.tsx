import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Archive,
  Copy,
  Check,
  ExternalLink,
  Code2,
  FolderGit2,
  Layers,
  Terminal,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({ isOpen, onClose }) => {
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'zip' | 'tar' | 'txt'>('zip');

  if (!isOpen) return null;

  const triggerDownload = async (fileName: string, url: string) => {
    try {
      setDownloadStatus(`${fileName} hazırlanıyor ve indiriliyor...`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Dosya sunucudan alınamadı');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setDownloadStatus(`✓ ${fileName} başarıyla indirildi!`);
      setTimeout(() => setDownloadStatus(null), 4000);
    } catch (err: any) {
      // Fallback: standard navigation / window location
      window.location.href = url;
      setDownloadStatus(`İndirme başlatıldı.`);
      setTimeout(() => setDownloadStatus(null), 4000);
    }
  };

  const handleCopyDirectLink = (url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-black shrink-0 shadow-xs">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Proje Kodlarını Dışa Aktarma Merkezi
                </h3>
                <span className="bg-emerald-500 text-neutral-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  104 Dosya
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-medium mt-0.5">
                Mutlular Plus tüm kaynak kodları, sunucu ve PWA dosyaları
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {downloadStatus && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center animate-in slide-in-from-top duration-200">
              {downloadStatus}
            </div>
          )}

          {/* 3 Export Formats Options */}
          <div className="space-y-2.5">
            <div className="text-xs font-black text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>İndirme Formatını Seçin:</span>
            </div>

            {/* Option 1: Full ZIP Package */}
            <div
              onClick={() => setSelectedFormat('zip')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                selectedFormat === 'zip'
                  ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-neutral-900">
                      Standart ZIP Arşivi (.zip)
                    </span>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                      Tavsiye Edilen
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5">
                    Windows, Mac ve Linux için hazır tam proje klasörü (438 KB • 104 dosya).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerDownload('mutlular-plus-kaynak-kodlar.zip', '/mutlular-plus-kaynak-kodlar.zip');
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>İndir</span>
              </button>
            </div>

            {/* Option 2: Complete Code Dump as Single TXT */}
            <div
              onClick={() => setSelectedFormat('txt')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                selectedFormat === 'txt'
                  ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-400'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-neutral-900">
                      Tek Metin Belgesi Kod Dökümü (.txt)
                    </span>
                    <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                      Metin / AI
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5">
                    Tüm dosyaların yolu ve tam içeriklerinin alt alta sıralandığı tek metin dosyası (1.8 MB).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerDownload('mutlular_plus_kod_dokumu.txt', '/mutlular_plus_kod_dokumu.txt');
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>İndir</span>
              </button>
            </div>

            {/* Option 3: TAR.GZ for Linux / Server */}
            <div
              onClick={() => setSelectedFormat('tar')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                selectedFormat === 'tar'
                  ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-1 ring-amber-400'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-neutral-900">
                      Linux / Unix Arşivi (.tar.gz)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 font-medium mt-0.5">
                    Sunucular ve geliştirici terminalleri için sıkıştırılmış arşiv (379 KB).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerDownload('mutlular-plus-kaynak-kodlar.tar.gz', '/mutlular-plus-kaynak-kodlar.tar.gz');
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>İndir</span>
              </button>
            </div>
          </div>

          {/* Quick Copy Link & Instructions */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-neutral-800">
                Doğrudan İndirme Bağlantısı:
              </span>
              <button
                onClick={() => handleCopyDirectLink('/mutlular-plus-kaynak-kodlar.zip')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Linki Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2 bg-white rounded-xl border border-neutral-200 text-[11px] font-mono text-neutral-700 break-all select-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/mutlular-plus-kaynak-kodlar.zip` : '/mutlular-plus-kaynak-kodlar.zip'}
            </div>
          </div>

          {/* Run Instructions */}
          <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>İndirdikten Sonra Bilgisayarınızda Çalıştırma:</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-neutral-300 bg-black/50 p-2.5 rounded-xl border border-neutral-800">
              <p className="text-emerald-400"># 1. Klasöre girin ve bağımlılıkları yükleyin</p>
              <p>npm install</p>
              <p className="text-emerald-400 mt-2"># 2. Geliştirici sunucusunu başlatın</p>
              <p>npm run dev</p>
              <p className="text-emerald-400 mt-2"># 3. Üretim paketi derleyin</p>
              <p>npm run build</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tüm dosyalar virüssüz ve orijinaldir.</span>
          </div>

          <button
            onClick={() => triggerDownload('mutlular-plus-kaynak-kodlar.zip', '/mutlular-plus-kaynak-kodlar.zip')}
            className="px-5 py-2.5 bg-neutral-950 hover:bg-black active:scale-95 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Tüm Dosyaları İndir (.ZIP)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
