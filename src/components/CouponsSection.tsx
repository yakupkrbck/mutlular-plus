import React from 'react';
import { ArrowRight, ChevronRight, Tag } from 'lucide-react';

interface CouponsSectionProps {
  onOpenCoupons: () => void;
}

export const CouponsSection: React.FC<CouponsSectionProps> = ({ onOpenCoupons }) => {
  return (
    <div className="px-3 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-rose-600 rounded-full" />
          <h2 className="text-[15px] font-black tracking-tight text-neutral-900">
            KUPONLAR
          </h2>
        </div>
        <button
          onClick={onOpenCoupons}
          className="text-[12px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 transition"
        >
          <span>Tümünü Gör</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Coupon Banner */}
      <div
        onClick={onOpenCoupons}
        className="relative bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200/70 border border-amber-300/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs cursor-pointer group active:scale-98 transition"
      >
        <div className="flex items-center gap-3">
          {/* Logo badge in circle */}
          <div className="w-11 h-11 rounded-full bg-white shadow-xs border border-amber-200 flex items-center justify-center shrink-0 p-1 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-neutral-900 flex flex-col items-center justify-center text-white text-[8px] font-black leading-none text-center">
              <span className="text-amber-400">YAPI</span>
              <span>MARKET</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-extrabold text-neutral-900">
                Uygulamaya özel %20 indirim
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 font-semibold mt-0.5">
              MUTLULAR YAPI MARKET • %20 İndirim
            </p>
          </div>
        </div>

        {/* Circular Action Button */}
        <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-amber-300/60 flex items-center justify-center text-amber-700 shrink-0 group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
