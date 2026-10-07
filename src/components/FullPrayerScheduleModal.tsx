import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, AlertCircle, Printer, MapPin, Clock, Calendar } from 'lucide-react';
import { CityPrayerConfig } from '../types';
import { calculatePrayerTimes, formatTime12Hour, FullSolarPrayerSchedule, MYANMAR_CITIES } from '../utils/prayerTimes';
import { getMyanmarStandardTimeInfo } from '../utils/hijriCalendar';

interface FullPrayerScheduleModalProps {
  city: CityPrayerConfig;
  isOpen: boolean;
  onClose: () => void;
  onSelectCity?: (city: CityPrayerConfig) => void;
  onOpenMonthlyTimetable?: () => void;
}

export const FullPrayerScheduleModal: React.FC<FullPrayerScheduleModalProps> = ({
  city,
  isOpen,
  onClose,
  onSelectCity,
  onOpenMonthlyTimetable,
}) => {
  if (!isOpen) return null;

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mmtInfo = getMyanmarStandardTimeInfo(currentTime);
  const schedule: FullSolarPrayerSchedule = calculatePrayerTimes(city, currentTime);

  const solarBreakdowns = [
    {
      title: 'စဟူရ် ကုန်ဆုံးချိန် (Imsak)',
      arabic: 'إمساك',
      time: schedule.sahoorEnd.time,
      time12Mm: schedule.sahoorEnd.time12Mm,
      status: 'သတိပြုရန်',
      statusColor: 'text-rose-600 bg-rose-50',
      description: 'ရမ်ဇာန် သို့မဟုတ် နဖိလ် ဥပုသ်သီလ ဆောက်တည်ရာတွင် အစားအသောက် ရပ်နားရမည့် နောက်ဆုံးအချိန်။ (အရုဏ်မတက်မီ ၁၀ မိနစ်အလို ကြိုတင်သတ်မှတ်ထားခြင်းဖြစ်သည်)',
    },
    {
      title: 'ဖဂျရ် (နံနက် အရုဏ်တက်ချိန်)',
      arabic: 'الفجر',
      time: schedule.fajr.time,
      time12Mm: schedule.fajr.time12Mm,
      status: 'ဖရဇ် နမားဇ်',
      statusColor: 'text-emerald-700 bg-emerald-50',
      description: 'အရှေ့မျက်နှာပြင်တွင် အလင်းရောင်စတင်ဖြာထွက်ချိန် (ဆွုဗ်ဟိ ဆွာဒိက်)။ ဖဂျရ်နမားဇ် အချိန်စတင်ပြီး နေထွက်ချိန်အထိ ဝတ်ပြုနိုင်ပါသည်။',
    },
    {
      title: 'နေထွက်ချိန် (ရှုရူက်)',
      arabic: 'الشروق',
      time: schedule.sunrise.time,
      time12Mm: schedule.sunrise.time12Mm,
      status: 'တားမြစ်ချိန် (မက္ကရူးဟ်)',
      statusColor: 'text-amber-700 bg-amber-50',
      description: 'နေအဝန်း စတင်ထွက်ပေါ်လာချိန်။ နေလုံးဝထွက်ပြီး လှံတစ်ကမ်းခန့် မြင့်တက်လာချိန်အထိ (၁၈-၂၀ မိနစ်ခန့်) မည်သည့် နမားဇ်မျှ ဖတ်ခွင့်မရှိပါ။',
    },
    {
      title: 'အိရှ်ရားက် နမားဇ်ချိန်',
      arabic: 'الإشراق',
      time: schedule.ishraq.time,
      time12Mm: schedule.ishraq.time12Mm,
      status: 'နဖိလ် ဝတ်ပြုချိန်',
      statusColor: 'text-blue-700 bg-blue-50',
      description: 'နေထွက်ပြီး ၁၈ မိနစ်ခန့်အကြာတွင် အိရှ်ရားက် (နဖိလ် ၂ ရကသ် သို့မဟုတ် ၄ ရကသ်) စတင်ဖတ်နိုင်ပါသည်။',
    },
    {
      title: 'မွန်းတည့်ချိန် (ဇဝါလ် / နေမတ်တတ်)',
      arabic: 'الزوال / نصف النهار',
      time: schedule.zawaal.time,
      time12Mm: schedule.zawaal.time12Mm,
      status: 'တားမြစ်ချိန် (မက္ကရူးဟ်)',
      statusColor: 'text-rose-700 bg-rose-50',
      description: 'နေမင်းသည် ကောင်းကင်အလယ်ဗဟိုသို့ တည့်တည့်ရောက်ရှိချိန်။ ဇုဟိုရ်အချိန် မရောက်မီ ၇ မိနစ်ခန့်အလိုတွင် နမားဇ်ဖတ်ခွင့် မရှိပါ။',
    },
    {
      title: 'ဇုဟိုရ် နမားဇ် (မွန်းလွဲ)',
      arabic: 'الظهر',
      time: schedule.dhuhr.time,
      time12Mm: schedule.dhuhr.time12Mm,
      status: 'ဖရဇ် နမားဇ်',
      statusColor: 'text-emerald-700 bg-emerald-50',
      description: 'နေမင်းသည် အလယ်ဗဟိုမှ အနောက်ဘက်သို့ စတင်တိမ်းစောင်းချိန်တွင် ဇုဟိုရ်အချိန် စတင်ပါသည်။ သောကြာနေ့တွင် ဂျုမုအဟ် နမားဇ် ဝတ်ပြုရမည့်အချိန် ဖြစ်သည်။',
    },
    {
      title: 'အဆွရ် နမားဇ် (ဟနဖီ မဇ်ဟဗ် - အရိပ် ၂ ဆ)',
      arabic: 'العصر (حنفي)',
      time: schedule.asr.time,
      time12Mm: schedule.asr.time12Mm,
      status: 'ဖရဇ် နမားဇ်',
      statusColor: 'text-emerald-700 bg-emerald-50',
      description: 'ဟနဖီ ဓမ္မသတ်အရ အရာဝတ္ထုတစ်ခု၏ အရိပ်သည် မူလအရိပ်အပြင် ၎င်းအရာဝတ္ထု၏ (၂) ဆ (မိစ်လိုင်းန်) ရှည်လျားသွားချိန်တွင် အဆွရ်နမားဇ် စတင်ဝတ်ပြုနိုင်ပါသည်။ နေမဝင်မီအထိ ဖတ်နိုင်ပါသည်။',
    },
    {
      title: 'နေဝင်ချိန် နှင့် ဝါဖြေချိန် (မဂ်ရစ်ဗ်)',
      arabic: 'المغرب / الغروب',
      time: schedule.sunset.time,
      time12Mm: schedule.sunset.time12Mm,
      status: 'ဖရဇ် နမားဇ် & ဝါဖြေ',
      statusColor: 'text-amber-700 bg-amber-50',
      description: 'နေမင်း၏ အဝန်းတစ်ခုလုံး အနောက်မိုးကုတ်စက်ဝိုင်းအောက်သို့ လုံးဝငုပ်လျှိုးသွားချိန်။ ဥပုသ်ဝါဖြေခြင်းနှင့် မဂ်ရစ်ဗ်နမားဇ် အချိန်စတင်ပါသည်။',
    },
    {
      title: 'အီရှာအ် နမားဇ် (ညဦးယံ)',
      arabic: 'العشاء',
      time: schedule.isha.time,
      time12Mm: schedule.isha.time12Mm,
      status: 'ဖရဇ် နမားဇ် & တရာဝီဟ်',
      statusColor: 'text-emerald-700 bg-emerald-50',
      description: 'အနောက်ကောင်းကင်ရှိ နီမြန်းသောအလင်းရောင်နှင့် ဖြူသောအလင်းရောင်များ ပျောက်ကွယ်သွားချိန်။ အီရှာအ်၊ ဝိသရ်နှင့် ရမ်ဇာန်လတွင် တရာဝီဟ်နမားဇ် ဝတ်ပြုချိန်ဖြစ်ပါသည်။',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors">
        
        {/* Header */}
        <div className="bg-emerald-900 dark:bg-emerald-950 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800 dark:border-stone-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-emerald-300 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{city.nameMm}မြို့</span>
              </span>
              <span>·</span>
              <span className="text-amber-300">{city.regionMm}</span>
              <span>·</span>
              <span className="bg-emerald-950 px-2 py-0.5 rounded text-amber-300 border border-emerald-700">
                ဟနဖီ မဇ်ဟဗ် (Hanafi Fiqh)
              </span>
              <span>·</span>
              <span className="bg-emerald-950/90 text-amber-200 px-2.5 py-0.5 rounded-full border border-emerald-700/80 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>မြန်မာစံတော်ချိန်: <strong className="text-white">{mmtInfo.digitsMm}</strong> {mmtInfo.periodEn}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 text-white">
              နမားဇ်ငါးကြိမ်နှင့် နေထွက်၊ နေဝင်၊ မွန်းတည့်အချိန်များ
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {onSelectCity && (
              <select
                value={city.id}
                onChange={(e) => {
                  const found = MYANMAR_CITIES.find((c) => c.id === e.target.value);
                  if (found) onSelectCity(found);
                }}
                className="bg-emerald-950 border border-emerald-700 rounded px-2.5 py-1 text-xs text-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
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
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          
          {/* Note on Islamic solar rulings */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">အစ္စလာမ်သာသနာ၏ နမားဇ်ဖတ်ခွင့်မပြုသော အချိန် (၃) ချိန်-</strong>
              <span>
                (၁) နေစတင်ထွက်ပေါ်ချိန်မှ ၁၈ မိနစ်ခန့်အထိ၊ (၂) မွန်းတည့်တည့် နေမတ်တတ်အချိန် (ဇဝါလ်)၊ (၃) နေဝင်ခါနီး နေနီရဲနေချိန်တို့တွင် မည်သည့် နမားဇ်မျှ ဖတ်ခွင့်မပြုပါ။ ဤဇယားသည် ဓမ္မသတ်ပညာရှင်များ လက်ခံထားသော နည်းလမ်းအရ တွက်ချက်ထားခြင်း ဖြစ်ပါသည်။
              </span>
            </div>
          </div>

          {/* Detailed Timetable Table */}
          <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
            {solarBreakdowns.map((item, idx) => (
              <div key={idx} className="p-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{item.title}</span>
                    <span className="font-arabic text-stone-400 dark:text-stone-500 text-xs">{item.arabic}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${item.statusColor} dark:bg-stone-800`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-bold font-mono text-emerald-800 dark:text-emerald-400">
                    {item.time}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    {item.time12Mm}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-50 dark:bg-stone-900 px-6 py-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            စံတော်ချိန်: မြန်မာစံတော်ချိန် (UTC +6:30)
          </span>
          <div className="flex items-center gap-2">
            {onOpenMonthlyTimetable && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMonthlyTimetable();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 dark:from-emerald-700 dark:to-teal-700 text-amber-300 font-bold rounded-md text-xs cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>တစ်လစာ အချိန်ဇယား (PDF / PNG) ထုတ်ယူမည်</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-md text-xs font-medium cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ဇယား ပရင့်ထုတ်ရန်</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
