import React, { useState } from 'react';
import { X, Gift, Sparkles, Plus, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({ isOpen, onClose }) => {
  const [balance, setBalance] = useState(45.0);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const handleAddBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-4 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-neutral-900 leading-tight">
                Para Puan & Kredim
              </h3>
              <p className="text-[10px] text-neutral-500 font-semibold">
                Mutlular Plus Sadakat Hesabı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="my-3 p-4 bg-gradient-to-tr from-neutral-900 to-rose-900 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
            Kullanılabilir Bakiye
          </div>
          <div className="text-3xl font-black mt-1 flex items-baseline gap-1">
            <span>{balance.toFixed(2)}</span>
            <span className="text-base font-bold text-amber-400">₺</span>
          </div>
          <p className="text-[10px] text-white/70 mt-2">
            Yemek siparişlerinizde ve anlaşmalı esnaflarda harcayabilirsiniz.
          </p>
        </div>

        {added && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Puan başarıyla yüklendi!</span>
          </div>
        )}

        {/* Quick Top-Up */}
        <div className="py-2">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
            Hızlı Puan Yükle
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[50, 100, 200].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAddBalance(amt)}
                className="bg-neutral-50 hover:bg-rose-50 border border-neutral-200 hover:border-rose-300 rounded-xl py-2 font-black text-[13px] text-neutral-800 hover:text-rose-600 transition active:scale-95 shadow-2xs"
              >
                +{amt} ₺
              </button>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Son Hareketler
          </div>
          <div className="p-2 bg-neutral-50 rounded-xl flex items-center justify-between text-[11px] border border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-neutral-800">Yemek Siparişi İadesi</div>
                <div className="text-[9px] text-neutral-400">Maydonoz Döner</div>
              </div>
            </div>
            <span className="font-black text-emerald-600">+15.00 ₺</span>
          </div>

          <div className="p-2 bg-neutral-50 rounded-xl flex items-center justify-between text-[11px] border border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-neutral-800">Hoş Geldin Hediyesi</div>
                <div className="text-[9px] text-neutral-400">Mutlular Plus</div>
              </div>
            </div>
            <span className="font-black text-emerald-600">+30.00 ₺</span>
          </div>
        </div>
      </div>
    </div>
  );
};
