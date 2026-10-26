import React from 'react';
import { ChevronRight } from 'lucide-react';

export const AppStoreBar: React.FC = () => {
  return (
    <div className="px-3 py-1">
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs py-2 px-3 flex items-center justify-between divide-x divide-neutral-200">
        {/* Play Store */}
        <button
          onClick={() => alert('Google Play Store indirme bağlantısı: Mutlular Plus yakında Google Play’de!')}
          className="flex-1 flex items-center justify-center gap-2 hover:bg-neutral-50 py-0.5 rounded transition text-neutral-800 active:scale-98"
        >
          {/* Play Store triangle icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M4 3.5C4 2.8 4.7 2.3 5.3 2.7L20.3 11.2C21 11.6 21 12.4 20.3 12.8L5.3 21.3C4.7 21.7 4 21.2 4 20.5V3.5Z" fill="#10B981" />
              <path d="M4 3.5L14 13.5L4 18.5V3.5Z" fill="#3B82F6" opacity="0.6" />
              <path d="M14 13.5L18 9.5L5.3 2.7" stroke="#F59E0B" strokeWidth="0.5" />
            </svg>
          </div>
          <span className="text-[12px] font-bold text-neutral-800">Play Store</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {/* App Store */}
        <button
          onClick={() => alert('Apple App Store indirme bağlantısı: Mutlular Plus yakında iOS App Store’da!')}
          className="flex-1 flex items-center justify-center gap-2 hover:bg-neutral-50 py-0.5 rounded transition text-neutral-800 active:scale-98"
        >
          {/* Apple icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-neutral-900">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.05-.51 2.67-1.26z" />
            </svg>
          </div>
          <span className="text-[12px] font-bold text-neutral-800">App Store</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>
    </div>
  );
};
