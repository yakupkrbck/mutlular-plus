import React, { useState } from 'react';
import {
  ChevronRight,
  Briefcase,
  Star,
  Building,
  PlusCircle,
  Wrench,
  Store,
  Zap,
  MapPin,
} from 'lucide-react';
import { JobItem } from '../types';

interface JobsSectionProps {
  jobs: JobItem[];
  onApplyJob: (job: JobItem) => void;
  onViewAll?: () => void;
  onOpenCreateJob?: () => void;
}

export const JobsSection: React.FC<JobsSectionProps> = ({
  jobs,
  onApplyJob,
  onViewAll,
  onOpenCreateJob,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'usta' | 'esnaf'>('all');

  const filtered = jobs.filter((j) => {
    if (activeFilter === 'usta') return j.posterType === 'usta';
    if (activeFilter === 'esnaf') return j.posterType === 'esnaf';
    return true;
  });

  return (
    <div className="px-3 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900">
            İş Dünyası & Eleman Aranıyor
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCreateJob && (
            <button
              onClick={onOpenCreateJob}
              className="text-[11px] font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>İlan Ver</span>
            </button>
          )}

          <button
            onClick={onViewAll}
            className="text-[12px] font-bold text-neutral-500 hover:text-neutral-800 flex items-center gap-0.5 transition cursor-pointer"
          >
            <span>Tümünü Gör</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Filter Chips Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-2.5 py-0.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
            activeFilter === 'all'
              ? 'border border-neutral-900 text-white bg-neutral-900 shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600'
          }`}
        >
          <Briefcase className="w-3 h-3" />
          <span>Tümü ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('usta')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
            activeFilter === 'usta'
              ? 'border border-amber-600 text-white bg-amber-600 shadow-xs'
              : 'bg-amber-50/70 border border-amber-200 text-amber-800'
          }`}
        >
          <Wrench className="w-3 h-3" />
          <span>Usta İlanları ({jobs.filter((j) => j.posterType === 'usta').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('esnaf')}
          className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
            activeFilter === 'esnaf'
              ? 'border border-purple-600 text-white bg-purple-600 shadow-xs'
              : 'bg-purple-50/70 border border-purple-200 text-purple-800'
          }`}
        >
          <Store className="w-3 h-3" />
          <span>Esnaf & Mağaza ({jobs.filter((j) => j.posterType === 'esnaf').length})</span>
        </button>
      </div>

      {/* Job Cards */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-6 text-center space-y-2.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-neutral-900">
                Henüz yayınlanmış iş ilanı bulunmuyor
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5 max-w-xs mx-auto">
                Mehmet Akif Mahallesinde dükkanınız veya işletmeniz için çırak, usta veya personel arıyorsanız hemen ilan verin.
              </p>
            </div>
            {onOpenCreateJob && (
              <button
                onClick={onOpenCreateJob}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>İlk İlanı Siz Verin</span>
              </button>
            )}
          </div>
        ) : (
          filtered.slice(0, 3).map((job) => (
            <div
              key={job.id}
              onClick={() => onApplyJob(job)}
              className="bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-300 p-3 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              {/* Logo and Titles */}
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Type Badge icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    job.posterType === 'usta'
                      ? 'bg-amber-500 text-white'
                      : job.posterType === 'esnaf'
                      ? 'bg-purple-600 text-white'
                      : 'bg-neutral-900 text-white'
                  }`}
                >
                  {job.posterType === 'usta' ? (
                    <Wrench className="w-5 h-5" />
                  ) : job.posterType === 'esnaf' ? (
                    <Store className="w-5 h-5" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <h3 className="text-[12.5px] font-extrabold text-neutral-900 leading-tight truncate group-hover:text-rose-600 transition-colors">
                      {job.title}
                    </h3>
                    {job.isUrgent && (
                      <span className="bg-red-600 text-white text-[8px] font-black px-1 py-0.2 rounded shrink-0 animate-pulse">
                        ACİL
                      </span>
                    )}
                  </div>

                  <p className="text-[10.5px] text-neutral-500 font-semibold truncate">
                    {job.company} • {job.location}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="bg-neutral-100 text-neutral-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-neutral-200">
                      {job.type}
                    </span>
                    {job.salary && (
                      <span className="bg-emerald-50 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200">
                        {job.salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Apply button */}
              <div className="flex flex-col items-end justify-between shrink-0 h-full py-0.5">
                <span className="text-[9px] text-neutral-400 font-medium">
                  {job.date}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyJob(job);
                  }}
                  className="mt-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-[10.5px] font-black px-3.5 py-1.5 rounded-full transition shadow-xs cursor-pointer"
                >
                  Başvur
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
