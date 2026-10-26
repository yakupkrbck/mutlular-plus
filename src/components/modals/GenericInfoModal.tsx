import React from 'react';
import { X, CheckCircle, Info } from 'lucide-react';

interface GenericInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

export const GenericInfoModal: React.FC<GenericInfoModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  content,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-3 overflow-y-auto text-[12px] text-neutral-700 leading-relaxed space-y-2">
          {content}
        </div>
      </div>
    </div>
  );
};
