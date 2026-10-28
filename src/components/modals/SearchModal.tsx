import React, { useState } from 'react';
import { Search, X, ChevronRight, Store, Briefcase, Car, UtensilsCrossed } from 'lucide-react';
import {
  POPULAR_SERVICES,
  CLASSIFIED_ADS,
  JOB_ADS,
  RESTAURANTS_DATA,
} from '../../data/mockData';
import { RestaurantItem, ClassifiedItem, JobItem } from '../../types';
import { checkIsFoodStore } from '../FoodSection';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectResult: (type: string, item: any) => void;
  restaurants?: RestaurantItem[];
  classifieds?: ClassifiedItem[];
  jobs?: JobItem[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onSelectResult,
  restaurants = RESTAURANTS_DATA,
  classifieds = CLASSIFIED_ADS,
  jobs = JOB_ADS,
}) => {
  const [query, setQuery] = useState(initialQuery);

  if (!isOpen) return null;

  const normalized = query.toLowerCase().trim();

  const filteredServices = POPULAR_SERVICES.filter((s) => {
    const t = s.title.toLowerCase();
    if (t.includes(normalized)) return true;
    if (
      s.id === 'kesinti' &&
      ('kesinti'.includes(normalized) ||
        'buski'.includes(normalized) ||
        'uedaş'.includes(normalized) ||
        'uedas'.includes(normalized) ||
        'elektrik'.includes(normalized) ||
        'su'.includes(normalized) ||
        'arıza'.includes(normalized) ||
        'ariza'.includes(normalized))
    ) {
      return true;
    }
    return false;
  });
  const filteredAds = classifieds.filter(
    (a) =>
      a.title.toLowerCase().includes(normalized) ||
      a.location.toLowerCase().includes(normalized)
  );
  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(normalized) ||
      j.company.toLowerCase().includes(normalized)
  );
  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(normalized) ||
      r.tag.toLowerCase().includes(normalized)
  );

  const quickTags = ['Kesintiler', 'Döner', 'Taksi', 'Nöbetçi Eczane', 'Kiralık Daire', 'Oto Çekici', 'İş İlanları'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden mt-6 flex flex-col max-h-[85vh]">
        {/* Search Header */}
        <div className="p-3.5 border-b border-neutral-100 flex items-center gap-2">
          <div className="relative flex-1 flex items-center bg-neutral-100 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mutlular Plus'ta ne aramıştınız?"
              className="w-full bg-transparent text-[13px] font-semibold text-neutral-800 placeholder-neutral-400 pl-2 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Tags */}
        <div className="p-3 bg-neutral-50 border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-neutral-400 shrink-0">Popüler:</span>
          {quickTags.map((t) => (
            <button
              key={t}
              onClick={() => setQuery(t)}
              className="text-[11px] font-semibold bg-white border border-neutral-200/80 px-2.5 py-1 rounded-full text-neutral-700 hover:bg-rose-50 hover:text-rose-600 transition shrink-0"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="p-3 overflow-y-auto space-y-4 flex-1">
          {/* Services */}
          {filteredServices.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2">
                Hizmetler
              </div>
              <div className="space-y-1.5">
                {filteredServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectResult('service', s);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition border border-transparent hover:border-neutral-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <span className="text-[13px] font-bold text-neutral-800">
                        {s.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stores & Esnaf */}
          {filteredRestaurants.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2">
                Esnaf & Mağazalar
              </div>
              <div className="space-y-1.5">
                {filteredRestaurants.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectResult('restaurant', r);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition border border-transparent hover:border-neutral-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-neutral-800">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                          <span>{r.tag}</span>
                          <span>•</span>
                          <span>{r.rating ? `★ ${r.rating}` : 'Yeni'}</span>
                          <span>•</span>
                          <span className={checkIsFoodStore(r) ? 'text-amber-700 font-bold' : 'text-blue-700 font-bold'}>
                            {checkIsFoodStore(r) ? 'Menüyü Gör' : 'Mağazayı Gör'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classifieds */}
          {filteredAds.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2">
                Alım & Satım (Kiralık, Satılık, 2. El)
              </div>
              <div className="space-y-1.5">
                {filteredAds.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onSelectResult('classified', a);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition border border-transparent hover:border-neutral-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                          a.mainCategory === 'kiralik'
                            ? 'bg-emerald-50 text-emerald-600'
                            : a.mainCategory === 'ikinci-el'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {a.tag || 'İLAN'}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-neutral-800 line-clamp-1">
                          {a.title}
                        </div>
                        <div className="text-[11px] font-extrabold text-neutral-600 flex items-center gap-1.5">
                          <span
                            className={
                              a.mainCategory === 'kiralik'
                                ? 'text-emerald-600'
                                : a.mainCategory === 'ikinci-el'
                                ? 'text-amber-700'
                                : 'text-rose-600'
                            }
                          >
                            {a.price}
                          </span>
                          <span>•</span>
                          <span className="text-neutral-400 font-medium">{a.location}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jobs */}
          {filteredJobs.length > 0 && (
            <div>
              <div className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2">
                İş İlanları
              </div>
              <div className="space-y-1.5">
                {filteredJobs.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => {
                      onSelectResult('job', j);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition border border-transparent hover:border-neutral-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-neutral-800">
                          {j.title}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {j.company} • {j.type}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredServices.length === 0 &&
            filteredRestaurants.length === 0 &&
            filteredAds.length === 0 &&
            filteredJobs.length === 0 && (
              <div className="text-center py-10 text-neutral-400">
                <Search className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                <p className="text-[13px] font-bold text-neutral-600">
                  Sonuç bulunamadı
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Farklı bir kelime ile aramayı deneyebilirsiniz.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
