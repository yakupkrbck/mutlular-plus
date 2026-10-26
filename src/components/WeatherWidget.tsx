import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  Eye,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { getLiveBursaWeather, LiveWeatherData } from '../services/liveApis';

interface WeatherWidgetProps {
  onShowFullForecast?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ onShowFullForecast }) => {
  const [activeTab, setActiveTab] = useState<'hafta-ici' | 'hafta-sonu'>('hafta-ici');
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);

  useEffect(() => {
    let mounted = true;
    getLiveBursaWeather().then((data) => {
      if (mounted) setWeatherData(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const weekdayForecast = weatherData?.dailyForecast.slice(0, 5) || [
    { day: 'Bugün', icon: Sun, high: '22°', low: '12°', color: 'text-amber-500' },
    { day: 'Yarın', icon: CloudSun, high: '23°', low: '13°', color: 'text-amber-500' },
    { day: 'Pzt', icon: CloudSun, high: '21°', low: '11°', color: 'text-amber-500' },
    { day: 'Sal', icon: CloudRain, high: '19°', low: '10°', color: 'text-blue-500' },
    { day: 'Çar', icon: CloudRain, high: '20°', low: '11°', color: 'text-blue-500' },
  ];

  const weekendForecast = weatherData?.dailyForecast.slice(5, 7) || [
    { day: 'Cmt', icon: Sun, high: '23°', low: '12°', color: 'text-amber-500' },
    { day: 'Paz', icon: CloudSun, high: '22°', low: '11°', color: 'text-amber-500' },
  ];

  const currentForecast = activeTab === 'hafta-ici' ? weekdayForecast : weekendForecast;

  // Icon selector based on code
  const getWeatherIcon = (code?: number) => {
    if (code === undefined || code === 0 || code === 1) return Sun;
    if (code === 2 || code === 3) return CloudSun;
    if (code >= 95) return CloudLightning;
    return CloudRain;
  };

  const MainIcon = getWeatherIcon(weatherData?.weatherCode);

  return (
    <div className="px-3 py-2">
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-3.5 shadow-sm">
        {/* Weather Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[16px] font-black text-neutral-900 leading-tight">
                Hava Durumu
              </h2>
              {weatherData?.source === 'api' && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
                  Canlı API
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-neutral-400 mt-0.5">
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-full text-neutral-700 text-[11px] font-bold shadow-2xs">
            <MapPin className="w-3 h-3 text-rose-600" />
            <span>Mutlular / Osmangazi</span>
          </div>
        </div>

        {/* Temperature & Condition */}
        <div className="flex items-center gap-3 my-3">
          <div className="w-12 h-12 flex items-center justify-center text-amber-500 animate-pulse">
            <MainIcon className="w-11 h-11 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-black text-neutral-900 leading-none">
              {weatherData ? `${weatherData.temperature}°C` : '19°C'}
            </span>
            <span className="text-[14px] font-extrabold text-neutral-600">
              {weatherData?.weatherText || 'Açık'}
            </span>
          </div>
        </div>

        {/* 4 Details Grid */}
        <div className="grid grid-cols-2 gap-2 my-3">
          {/* Nem */}
          <div className="bg-neutral-50/80 rounded-xl p-2 flex items-center gap-2 border border-neutral-100">
            <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <div className="text-[9px] font-semibold text-neutral-400 uppercase leading-none">
                Nem
              </div>
              <div className="text-[12px] font-black text-neutral-800 mt-0.5">
                %{weatherData?.humidity ?? 58}
              </div>
            </div>
          </div>

          {/* Rüzgar */}
          <div className="bg-neutral-50/80 rounded-xl p-2 flex items-center gap-2 border border-neutral-100">
            <Wind className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <div className="text-[9px] font-semibold text-neutral-400 uppercase leading-none">
                Rüzgar
              </div>
              <div className="text-[12px] font-black text-neutral-800 mt-0.5">
                {weatherData?.windSpeed ?? 8} km/sa
              </div>
            </div>
          </div>

          {/* Hissedilen */}
          <div className="bg-neutral-50/80 rounded-xl p-2 flex items-center gap-2 border border-neutral-100">
            <Thermometer className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <div className="text-[9px] font-semibold text-neutral-400 uppercase leading-none">
                Hissedilen
              </div>
              <div className="text-[12px] font-black text-neutral-800 mt-0.5">
                {weatherData ? `${weatherData.apparentTemperature}°C` : '18°C'}
              </div>
            </div>
          </div>

          {/* Görüş */}
          <div className="bg-neutral-50/80 rounded-xl p-2 flex items-center gap-2 border border-neutral-100">
            <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <div className="text-[9px] font-semibold text-neutral-400 uppercase leading-none">
                Kaynak
              </div>
              <div className="text-[12px] font-black text-neutral-800 mt-0.5">
                Open-Meteo
              </div>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 mb-3">
          <button
            onClick={() => setActiveTab('hafta-ici')}
            className={`flex-1 py-1.5 text-center text-[12px] font-bold rounded-lg transition ${
              activeTab === 'hafta-ici'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Hafta İçi
          </button>
          <button
            onClick={() => setActiveTab('hafta-sonu')}
            className={`flex-1 py-1.5 text-center text-[12px] font-bold rounded-lg transition ${
              activeTab === 'hafta-sonu'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Hafta Sonu
          </button>
        </div>

        {/* Forecast Days Pills */}
        <div className={`grid ${activeTab === 'hafta-ici' ? 'grid-cols-5' : 'grid-cols-2'} gap-1.5 mb-3`}>
          {currentForecast.map((fc: any, idx: number) => {
            const Icon = fc.icon || getWeatherIcon(fc.code);
            return (
              <div
                key={idx}
                className="bg-neutral-50 border border-neutral-100 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-2xs"
              >
                <span className="text-[10px] font-bold text-rose-600">
                  {fc.day}
                </span>
                <Icon className="w-4 h-4 my-1.5 text-amber-500" />
                <span className="text-[9px] font-extrabold text-neutral-800">
                  {fc.high} / <span className="text-neutral-400">{fc.low}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="text-center pt-1 border-t border-neutral-100">
          <button
            onClick={onShowFullForecast}
            className="inline-flex items-center gap-1 text-[12px] font-bold text-neutral-700 hover:text-rose-600 transition"
          >
            <span>Haftalık tahmini göster</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
