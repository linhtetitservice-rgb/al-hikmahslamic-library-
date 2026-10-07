import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Sun, 
  Sunset, 
  Moon, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Compass,
  Info,
  Globe,
  RefreshCw
} from 'lucide-react';
import { 
  calculatePrayerTimes, 
  MYANMAR_CITIES, 
  formatTime12Hour, 
  playIslamicAdhanChime,
  FullSolarPrayerSchedule 
} from '../utils/prayerTimes';
import { 
  getHijriDate, 
  toMyanmarDigits, 
  HijriDateInfo, 
  getMyanmarStandardTimeInfo, 
  MyanmarStandardTimeInfo 
} from '../utils/hijriCalendar';
import { fetchNetHanafiPrayerTimes } from '../services/networkPrayerService';
import { CityPrayerConfig } from '../types';

interface PrayerHeaderProps {
  onOpenFullSchedule: () => void;
  onOpenMonthlyTimetable?: () => void;
  selectedCity?: CityPrayerConfig;
  onSelectCity?: (city: CityPrayerConfig) => void;
}

export const PrayerHeader: React.FC<PrayerHeaderProps> = ({ 
  onOpenFullSchedule,
  onOpenMonthlyTimetable,
  selectedCity: propSelectedCity,
  onSelectCity: propOnSelectCity
}) => {
  const [internalCity, setInternalCity] = useState<CityPrayerConfig>(MYANMAR_CITIES[1]); // Default Yangon
  const selectedCity = propSelectedCity || internalCity;
  const handleCityChange = (city: CityPrayerConfig) => {
    if (propOnSelectCity) {
      propOnSelectCity(city);
    } else {
      setInternalCity(city);
    }
  };

  const [hijriOffset, setHijriOffset] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [showLunarAdjust, setShowLunarAdjust] = useState<boolean>(false);
  const [isSyncingNet, setIsSyncingNet] = useState<boolean>(false);
  const [isNetSynced, setIsNetSynced] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<FullSolarPrayerSchedule>(() => {
    return calculatePrayerTimes(selectedCity, new Date());
  });

  // Live ticking clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync prayer times from Net (AlAdhan API with Hanafi school=1)
  const syncPrayerTimes = async (cityToSync: CityPrayerConfig) => {
    setIsSyncingNet(true);
    try {
      const { schedule: netSched, isNetwork } = await fetchNetHanafiPrayerTimes(cityToSync, new Date());
      setSchedule(netSched);
      setIsNetSynced(isNetwork);
    } catch {
      setSchedule(calculatePrayerTimes(cityToSync, new Date()));
      setIsNetSynced(false);
    } finally {
      setIsSyncingNet(false);
    }
  };

  useEffect(() => {
    syncPrayerTimes(selectedCity);
  }, [selectedCity.id]);

  const hijri: HijriDateInfo = getHijriDate(currentTime, hijriOffset);
  const mmtInfo: MyanmarStandardTimeInfo = getMyanmarStandardTimeInfo(currentTime);

  const handlePlayChime = () => {
    if (!isAudioMuted) {
      playIslamicAdhanChime();
    }
  };

  return (
    <header className="bg-emerald-950 text-emerald-50 border-b border-emerald-800/80 shadow-md">
      {/* Top Banner: Islamic Hijri Date & City Location & Solar Context */}
      <div className="max-w-7xl mx-auto px-4 py-2 border-b border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Islamic Hijri Date (السلامي تاریخ) */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-arabic text-sm tracking-wide">{hijri.formattedAr}</span>
            <span className="text-emerald-500">|</span>
            <span className="font-myanmar text-stone-200">{hijri.formattedMm}</span>
          </span>

          {/* Lunar Sighting Offset Controls */}
          <button
            onClick={() => setShowLunarAdjust(!showLunarAdjust)}
            title="လခြမ်းတွေ့ရှိမှု ချိန်ညှိရန်"
            className="text-[11px] text-emerald-300/80 hover:text-amber-300 underline cursor-pointer ml-1"
          >
            {showLunarAdjust ? 'ပိတ်မည်' : 'လရက်စွဲပြင်ရန်'}
          </button>

          {showLunarAdjust && (
            <div className="inline-flex items-center gap-1 bg-emerald-900/90 px-2 py-0.5 rounded text-[11px] border border-emerald-700">
              <span>လရက် ±:</span>
              <button
                onClick={() => setHijriOffset((prev) => Math.max(-2, prev - 1))}
                className="px-1.5 py-0.2 bg-emerald-800 hover:bg-emerald-700 rounded text-amber-200"
              >
                -၁ ရက်
              </button>
              <span className="font-mono text-amber-300">{hijriOffset >= 0 ? `+${hijriOffset}` : hijriOffset}</span>
              <button
                onClick={() => setHijriOffset((prev) => Math.min(2, prev + 1))}
                className="px-1.5 py-0.2 bg-emerald-800 hover:bg-emerald-700 rounded text-amber-200"
              >
                +၁ ရက်
              </button>
            </div>
          )}
        </div>

        {/* Live Myanmar Standard Time (မြန်မာစံတော်ချိန်) */}
        <div className="flex items-center gap-2 bg-emerald-900/85 border border-emerald-700/80 px-3 py-1 rounded-full shadow-inner text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
          <span className="text-stone-300 font-medium hidden sm:inline">မြန်မာစံတော်ချိန်:</span>
          <span className="text-stone-300 font-medium sm:hidden">စံတော်ချိန်:</span>
          <span className="font-mono text-amber-300 font-bold tracking-wider text-xs sm:text-sm">
            {mmtInfo.digitsMm}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-800 text-amber-200 font-medium">
            {mmtInfo.periodMm} ({mmtInfo.periodEn})
          </span>
          <span className="text-[10px] text-emerald-400/90 hidden lg:inline">
            (UTC+6:30)
          </span>
        </div>

        {/* City Selector & Solar Guidance Note */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-stone-300 hidden sm:inline">ဒေသ/မြို့တော်:</span>
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const found = MYANMAR_CITIES.find((c) => c.id === e.target.value);
                if (found) handleCityChange(found);
              }}
              className="bg-emerald-900 border border-emerald-700/80 rounded px-2.5 py-1 text-xs text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[200px] sm:max-w-none truncate"
            >
              <optgroup label="⭐ ပြည်ထောင်စုနယ်မြေ" className="bg-emerald-950 font-bold text-amber-300">
                {MYANMAR_CITIES.filter((c) => c.regionType === 'union').map((c) => (
                  <option key={c.id} value={c.id} className="bg-emerald-950 text-white font-normal">
                    {c.nameMm} ({c.regionMm})
                  </option>
                ))}
              </optgroup>

              <optgroup label="🏛️ တိုင်းဒေသကြီးများ (၇ တိုင်း)" className="bg-emerald-950 font-bold text-amber-300">
                {MYANMAR_CITIES.filter((c) => c.regionType === 'region').map((c) => (
                  <option key={c.id} value={c.id} className="bg-emerald-950 text-white font-normal">
                    {c.nameMm} ({c.regionMm})
                  </option>
                ))}
              </optgroup>

              <optgroup label="🏔️ ပြည်နယ်များ (၇ ပြည်နယ်)" className="bg-emerald-950 font-bold text-amber-300">
                {MYANMAR_CITIES.filter((c) => c.regionType === 'state').map((c) => (
                  <option key={c.id} value={c.id} className="bg-emerald-950 text-white font-normal">
                    {c.nameMm} ({c.regionMm})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Net Live Sync Status & Hanafi Fiqh Badge */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-900 border border-emerald-700 text-amber-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>ဟနဖီ မဇ်ဟဗ် (Hanafi)</span>
            </span>

            <button
              onClick={() => syncPrayerTimes(selectedCity)}
              disabled={isSyncingNet}
              title="အင်တာနက် (Net) မှ တိုက်ရိုက်အချိန် အသစ်ရယူရန်"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 transition-colors cursor-pointer"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">
                {isSyncingNet ? 'Net ဆွဲယူနေ...' : isNetSynced ? 'Net အချိန် ချိတ်ဆက်ပြီး' : 'Net ပြန်ချိတ်မည်'}
              </span>
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncingNet ? 'animate-spin text-amber-400' : 'text-stone-300'}`} />
            </button>
          </div>

          {/* Adhan sound test */}
          <button
            onClick={handlePlayChime}
            title="အာဇာန် အချက်ပေးအသံ စမ်းသပ်ရန်"
            className="flex items-center gap-1 text-emerald-300 hover:text-amber-300 transition-colors cursor-pointer"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">အသံမြည်စမ်းသပ်</span>
          </button>
        </div>
      </div>

      {/* Main Bar: 5 Daily Prayers + Key Solar Islamic Times (Sunrise, Zawaal/Midday, Sunset/Iftar) */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Next Prayer Highlight & Live Status */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[11px] text-emerald-300 font-medium">
                    နောင်လာမည့် နမားဇ်: <strong className="text-amber-300">{schedule.nextPrayer?.nameMm}</strong>
                  </div>
                  <span className="text-[10px] bg-emerald-800/90 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-700/60 font-mono flex items-center gap-1">
                    <span>စံတော်ချိန်:</span>
                    <strong className="text-amber-200">{mmtInfo.digitsMm}</strong>
                    <span>{mmtInfo.periodEn}</span>
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mt-0.5">
                  {schedule.nextPrayerRemainingText} ({schedule.nextPrayer?.time || ''} · {schedule.nextPrayer?.time12Mm || ''})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenFullSchedule}
                className="text-xs text-amber-300/90 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer"
                title="ယနေ့အချိန်ဇယား အသေးစိတ်ကြည့်မည်"
              >
                <span>ယနေ့အသေးစိတ်</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {onOpenMonthlyTimetable && (
                <button
                  onClick={onOpenMonthlyTimetable}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  title="တစ်လစာ နမားဇ်အချိန်ဇယား တွက်ချက်၍ PDF / PNG ထုတ်ယူမည်"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-stone-950" />
                  <span>တစ်လစာ ဇယား (PDF/PNG)</span>
                </button>
              )}
            </div>
          </div>

          {/* Responsive Grid of Islamic Times: Fajr, Sunrise, Zawaal, Dhuhr, Asr, Maghrib/Sunset, Isha */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
            
            {/* 1. Fajr (ဖဂျရ်) */}
            <div className={`px-2.5 py-1.5 rounded border transition-colors ${
              schedule.nextPrayer?.name === 'Fajr' 
                ? 'bg-amber-500/20 border-amber-400/80 shadow-sm' 
                : 'bg-emerald-900/40 border-emerald-800/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-emerald-300">
                <span>ဖဂျရ်</span>
                <span className="font-arabic text-amber-300/80">الفجر</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {schedule.fajr.time}
              </div>
              <div className="text-[10px] text-emerald-400/80 truncate">
                စဟူရ် {schedule.sahoorEnd.time}
              </div>
            </div>

            {/* 2. Sunrise / Shurooq (နေထွက်ချိန်) */}
            <div className="px-2.5 py-1.5 rounded bg-emerald-950/60 border border-emerald-800/40 opacity-90">
              <div className="flex items-center justify-between text-[11px] text-stone-300">
                <span className="flex items-center gap-1">
                  <Sun className="w-2.5 h-2.5 text-amber-400" />
                  <span>နေထွက်</span>
                </span>
                <span className="font-arabic text-stone-400">الشروق</span>
              </div>
              <div className="text-sm font-bold text-amber-200 font-mono mt-0.5">
                {schedule.sunrise.time}
              </div>
              <div className="text-[10px] text-amber-400/70 truncate">
                အိရှ်ရားက် {schedule.ishraq.time}
              </div>
            </div>

            {/* 3. Zawaal (မွန်းတည့်ချိန် / နေမတ်တတ်) */}
            <div className="px-2.5 py-1.5 rounded bg-emerald-950/60 border border-emerald-800/40 opacity-90">
              <div className="flex items-center justify-between text-[11px] text-rose-300/90">
                <span>မွန်းတည့် (ဇဝါလ်)</span>
                <span className="font-arabic text-rose-300/70">الزوال</span>
              </div>
              <div className="text-sm font-bold text-rose-200 font-mono mt-0.5">
                {schedule.zawaal.time}
              </div>
              <div className="text-[10px] text-rose-300/70 truncate">
                နမားဇ် မဖတ်ရချိန်
              </div>
            </div>

            {/* 4. Dhuhr (ဇုဟိုရ်) */}
            <div className={`px-2.5 py-1.5 rounded border transition-colors ${
              schedule.nextPrayer?.name === 'Dhuhr' 
                ? 'bg-amber-500/20 border-amber-400/80 shadow-sm' 
                : 'bg-emerald-900/40 border-emerald-800/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-emerald-300">
                <span>ဇုဟိုရ်</span>
                <span className="font-arabic text-amber-300/80">الظهر</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {schedule.dhuhr.time}
              </div>
              <div className="text-[10px] text-emerald-400/80 truncate">
                မွန်းလွဲဝတ်ပြုချိန်
              </div>
            </div>

            {/* 5. Asr (အဆွရ် - ဟနဖီ) */}
            <div className={`px-2.5 py-1.5 rounded border transition-colors ${
              schedule.nextPrayer?.name === 'Asr' 
                ? 'bg-amber-500/20 border-amber-400/80 shadow-sm' 
                : 'bg-emerald-900/40 border-emerald-800/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-emerald-300">
                <span>အဆွရ် (ဟနဖီ)</span>
                <span className="font-arabic text-amber-300/80">العصر</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {schedule.asr.time}
              </div>
              <div className="text-[10px] text-amber-300/90 truncate">
                အရိပ် ၂ ဆ (မိစ်လိုင်းန်)
              </div>
            </div>

            {/* 6. Maghrib & Sunset (နေဝင်ချိန် / မဂ်ရစ်ဗ် / ဝါဖြေ) */}
            <div className={`px-2.5 py-1.5 rounded border transition-colors ${
              schedule.nextPrayer?.name === 'Maghrib' 
                ? 'bg-amber-500/20 border-amber-400/80 shadow-sm' 
                : 'bg-emerald-900/40 border-emerald-800/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-amber-300">
                <span className="flex items-center gap-1">
                  <Sunset className="w-2.5 h-2.5 text-amber-400" />
                  <span>မဂ်ရစ်ဗ်</span>
                </span>
                <span className="font-arabic text-amber-300/80">المغرب</span>
              </div>
              <div className="text-sm font-bold text-amber-200 font-mono mt-0.5">
                {schedule.maghrib.time}
              </div>
              <div className="text-[10px] text-amber-300/90 truncate font-semibold">
                ဝါဖြေ/နေဝင် {schedule.sunset.time}
              </div>
            </div>

            {/* 7. Isha (အီရှာအ်) */}
            <div className={`px-2.5 py-1.5 rounded border transition-colors ${
              schedule.nextPrayer?.name === 'Isha' 
                ? 'bg-amber-500/20 border-amber-400/80 shadow-sm' 
                : 'bg-emerald-900/40 border-emerald-800/60'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-emerald-300">
                <span>အီရှာအ်</span>
                <span className="font-arabic text-amber-300/80">العشاء</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {schedule.isha.time}
              </div>
              <div className="text-[10px] text-emerald-400/80 truncate">
                ညဦးဝတ်ပြုချိန်
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
