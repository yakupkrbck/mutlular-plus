import React, { useState } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';

interface HomepageSearchBarProps {
  onSearch: (query: string) => void;
}

export const HomepageSearchBar: React.FC<HomepageSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="px-3">
      {/* Main Search Box (Play Store & App Store yerine taşındı, sade ve düzenli) */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-1.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition-all"
      >
        <div className="pl-2.5 text-rose-600">
          <Search className="w-4 h-4 stroke-[2.3]" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Şehrin dijital merkezinde ara... (Esnaf, usta, ürün)"
          className="w-full bg-transparent text-[13px] text-neutral-800 placeholder-neutral-400 py-1.5 font-medium outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Temizle"
            className="w-5 h-5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Submit Button in Mutlular Plus Colors */}
        <button
          type="submit"
          aria-label="Ara"
          className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-[12px] px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1 shrink-0"
        >
          <span>Ara</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
