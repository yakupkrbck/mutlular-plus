import React, { useState } from 'react';
import {
  X,
  Star,
  Clock,
  Bike,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { RestaurantItem } from '../../types';

interface FoodDetailModalProps {
  restaurant: RestaurantItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  restaurant,
  onClose,
}) => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [ordered, setOrdered] = useState(false);

  if (!restaurant) return null;

  const menu = restaurant.menu || [
    { name: 'Spesiyal Menü', price: '210 ₺', desc: 'Günün en çok tercih edilen lezzeti' },
    { name: 'Klasik Porsiyon', price: '180 ₺', desc: 'Geleneksel tarif ile hazırlanmış' },
  ];

  const updateQuantity = (name: string, delta: number) => {
    setCart((prev) => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return { ...prev, [name]: next };
    });
  };

  const totalCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const calculateTotal = () => {
    let sum = 0;
    menu.forEach((item) => {
      const count = cart[item.name] || 0;
      const priceNum = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 0;
      sum += count * priceNum;
    });
    return sum;
  };

  const handleCheckout = () => {
    setOrdered(true);
    setTimeout(() => {
      setOrdered(false);
      setCart({});
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Restaurant Banner Image */}
        <div className="relative h-44 w-full bg-neutral-900 shrink-0">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[10px] font-bold bg-rose-600 px-2 py-0.5 rounded uppercase">
              {restaurant.tag}
            </span>
            <h2 className="text-[16px] font-black mt-1 leading-tight">
              {restaurant.name}
            </h2>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-white/90 mt-1">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                {restaurant.rating.toFixed(1)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {restaurant.time}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Bike className="w-3 h-3 text-emerald-400" />
                {restaurant.deliveryFee}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1">
          <h3 className="text-[13px] font-extrabold text-neutral-900 uppercase tracking-tight">
            Menü & Lezzetler
          </h3>

          {ordered ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-[16px] font-black text-neutral-900">
                Siparişiniz Alındı!
              </h4>
              <p className="text-[12px] text-neutral-500">
                Restoran siparişinizi hazırlamaya başladı. Mutlular Plus ile afiyet olsun!
              </p>
            </div>
          ) : (
            menu.map((item, idx) => {
              const qty = cart[item.name] || 0;
              return (
                <div
                  key={idx}
                  className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-3 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex-1">
                    <h4 className="text-[13px] font-bold text-neutral-900">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                    <span className="text-[13px] font-black text-rose-600 mt-1 inline-block">
                      {item.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {qty > 0 && (
                      <>
                        <button
                          onClick={() => updateQuantity(item.name, -1)}
                          className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[12px] font-black text-neutral-900 w-4 text-center">
                          {qty}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => updateQuantity(item.name, 1)}
                      className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center active:scale-95 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Cart Checkout Bar */}
        {!ordered && totalCount > 0 && (
          <div className="p-3 bg-white border-t border-neutral-200 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-neutral-400 font-bold uppercase">
                Toplam ({totalCount} Ürün)
              </div>
              <div className="text-[16px] font-black text-neutral-900">
                {calculateTotal()} ₺
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="flex-1 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black text-[13px] py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Siparişi Tamamla</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
