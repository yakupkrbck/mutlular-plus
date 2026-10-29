import React, { useState } from 'react';

interface Props {
  existing: string[];
  onAdd: (name: string) => void;
}

/** "Diğer": usta kendi hizmet alanını yazar; kaydedilince o alan uygulamada açılır. */
export const CustomActivityInput: React.FC<Props> = ({ existing, onAdd }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const name = value.trim().replace(/\s+/g, ' ');
    if (name.length < 3) {
      setError('En az 3 karakter yazın.');
      return;
    }
    if (name.length > 50) {
      setError('En fazla 50 karakter.');
      return;
    }
    if (existing.some((e) => e.toLocaleLowerCase('tr-TR') === name.toLocaleLowerCase('tr-TR'))) {
      setError('Bu alan zaten ekli.');
      return;
    }
    setError(null);
    onAdd(name);
    setValue('');
  };

  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-neutral-600 block">Listede yok mu? Kendi alanınızı yazın (Diğer):</span>
      <div className="flex gap-1.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          maxLength={50}
          placeholder="Örn: Kapı Zili & Diafon Montajı"
          className="flex-1 min-w-0 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 bg-white"
        />
        <button type="button" onClick={add} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl px-3">
          Ekle
        </button>
      </div>
      {error && <p className="text-[10px] font-bold text-rose-600">{error}</p>}
    </div>
  );
};
