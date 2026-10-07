import { CityPrayerConfig, PrayerTimeData } from '../types';
import { calculatePrayerTimes, formatTime12, FullSolarPrayerSchedule } from '../utils/prayerTimes';
import { cachePrayerSchedule, getOfflinePrayerSchedule } from './offlineStorageService';

export interface NetworkPrayerStatus {
  isOnline: boolean;
  lastSynced: string | null;
  source: 'network' | 'astronomical';
  fiqhSchool: 'hanafi';
}

// In-memory cache for network timings to avoid redundant rate-limited requests
const prayerCache = new Map<string, { data: FullSolarPrayerSchedule; timestamp: number }>();
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes cache

/**
 * Parses time string (e.g. "05:12" or "05:12 (BST)") from AlAdhan API
 * and converts to formatted 12-hour Myanmar time object.
 */
function parseApiTimeTo12(timeStr: string) {
  if (!timeStr) return formatTime12(0);
  const cleanTime = timeStr.split(' ')[0].trim();
  const [hStr, mStr] = cleanTime.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const decimalHours = h + m / 60;
  return formatTime12(decimalHours);
}

/**
 * Fetches real-time prayer times via Net (AlAdhan API) using Hanafi Fiqh:
 * method = 1 (University of Islamic Sciences, Karachi - 18° twilight standard for Hanafi)
 * school = 1 (Hanafi - Asr when shadow factor is 2x)
 */
export async function fetchNetHanafiPrayerTimes(
  city: CityPrayerConfig,
  date: Date = new Date()
): Promise<{ schedule: FullSolarPrayerSchedule; isNetwork: boolean }> {
  const dateKey = date.toISOString().split('T')[0];
  const cacheKey = `${city.id}_${dateKey}`;
  const cached = prayerCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return { schedule: cached.data, isNetwork: true };
  }

  // Fallback local Hanafi astronomical calculation
  const fallbackSchedule = calculatePrayerTimes(city, date);

  try {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Query AlAdhan API with school=1 (Hanafi) and method=1 (Karachi Hanafi standard)
    const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${city.lat}&longitude=${city.lng}&method=1&school=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API response status: ${response.status}`);
    }

    const json = await response.json();
    const timings = json?.data?.timings;

    if (!timings) {
      throw new Error('Invalid timings payload from network');
    }

    // Parse network prayer times
    const fajrObj = parseApiTimeTo12(timings.Fajr);
    const sunriseObj = parseApiTimeTo12(timings.Sunrise);
    const dhuhrObj = parseApiTimeTo12(timings.Dhuhr);
    const asrHanafiObj = parseApiTimeTo12(timings.Asr); // Calculated with school=1 (Hanafi)
    const sunsetObj = parseApiTimeTo12(timings.Sunset || timings.Maghrib);
    const maghribObj = parseApiTimeTo12(timings.Maghrib);
    const ishaObj = parseApiTimeTo12(timings.Isha);
    const sahoorObj = parseApiTimeTo12(timings.Imsak || timings.Fajr);

    // Derived timings
    const ishraqDecimal = (parseInt(timings.Sunrise.split(':')[0], 10) + parseInt(timings.Sunrise.split(':')[1], 10) / 60) + 18 / 60;
    const ishraqObj = formatTime12(ishraqDecimal);

    const dhuhrDecimal = parseInt(timings.Dhuhr.split(':')[0], 10) + parseInt(timings.Dhuhr.split(':')[1], 10) / 60;
    const zawaalObj = formatTime12(dhuhrDecimal - 7 / 60);

    const netSahoorEnd: PrayerTimeData = {
      name: 'Sahoor End',
      nameMm: 'စဟူရ် ပြီးချိန်',
      nameAr: 'نهاية السحور',
      time: sahoorObj.time12,
      time12: sahoorObj.time12,
      time12Mm: sahoorObj.time12Mm,
      time24: sahoorObj.time24,
      descriptionMm: 'ဥပုသ်သီလစတင်ရန် စဟူရ် စားသောက်မှု ရပ်ဆိုင်းချိန်',
    };

    const netFajr: PrayerTimeData = {
      name: 'Fajr',
      nameMm: 'ဖဂျရ် (အရုဏ်တက်)',
      nameAr: 'الفَجْر',
      time: fajrObj.time12,
      time12: fajrObj.time12,
      time12Mm: fajrObj.time12Mm,
      time24: fajrObj.time24,
      descriptionMm: 'နံနက် အရုဏ်တက်ချိန် နမားဇ် (ဝါစတင်ချိန်)',
    };

    const netSunrise: PrayerTimeData = {
      name: 'Sunrise',
      nameMm: 'နေထွက်ချိန် (ရှုရူက်)',
      nameAr: 'الشُّرُوق',
      time: sunriseObj.time12,
      time12: sunriseObj.time12,
      time12Mm: sunriseObj.time12Mm,
      time24: sunriseObj.time24,
      descriptionMm: 'နေစတင်ထွက်ပေါ်ချိန် (နမားဇ်ဖတ်ခွင့် မပြုသောအချိန်)',
    };

    const netIshraq: PrayerTimeData = {
      name: 'Ishraq',
      nameMm: 'အိရှ်ရားက်',
      nameAr: 'الإشْرَاق',
      time: ishraqObj.time12,
      time12: ishraqObj.time12,
      time12Mm: ishraqObj.time12Mm,
      time24: ishraqObj.time24,
      descriptionMm: 'နေထွက်ပြီး ၁၈ မိနစ်ခန့်အကြာ နဖိလ်နမားဇ် ဖတ်နိုင်ချိန်',
    };

    const netZawaal: PrayerTimeData = {
      name: 'Zawaal',
      nameMm: 'မွန်းတည့်ချိန် (ဇဝါလ်)',
      nameAr: 'الزَّوَال',
      time: zawaalObj.time12,
      time12: zawaalObj.time12,
      time12Mm: zawaalObj.time12Mm,
      time24: zawaalObj.time24,
      descriptionMm: 'နေမတ်တတ်အချိန် (နမားဇ်ဖတ်ခွင့် မပြုသောအချိန်)',
    };

    const netDhuhr: PrayerTimeData = {
      name: 'Dhuhr',
      nameMm: 'ဇုဟိုရ် (မွန်းလွဲ)',
      nameAr: 'الظُّهْر',
      time: dhuhrObj.time12,
      time12: dhuhrObj.time12,
      time12Mm: dhuhrObj.time12Mm,
      time24: dhuhrObj.time24,
      descriptionMm: 'မွန်းတိမ်းချိန် နေ့လယ် နမားဇ်',
    };

    // Primary Asr is Hanafi Fiqh (Asr Mithlayn)
    const netAsrHanafi: PrayerTimeData = {
      name: 'Asr (Hanafi)',
      nameMm: 'အဆွရ် (ဟနဖီ မဇ်ဟဗ်)',
      nameAr: 'العَصْر (حنفي)',
      time: asrHanafiObj.time12,
      time12: asrHanafiObj.time12,
      time12Mm: asrHanafiObj.time12Mm,
      time24: asrHanafiObj.time24,
      descriptionMm: 'အရိပ် နှစ်ဆ (မိစ်လိုင်းန်) ဖြစ်ချိန် ဟနဖီ ဓမ္မသတ် စံနှုန်း',
    };

    const netSunset: PrayerTimeData = {
      name: 'Sunset',
      nameMm: 'နေဝင်ချိန် / ဝါဖြေချိန်',
      nameAr: 'الغُرُوب',
      time: sunsetObj.time12,
      time12: sunsetObj.time12,
      time12Mm: sunsetObj.time12Mm,
      time24: sunsetObj.time24,
      descriptionMm: 'နေလုံးဝဝင်ချိန် နှင့် ဥပုသ်ဝါဖြေချိန်',
    };

    const netMaghrib: PrayerTimeData = {
      name: 'Maghrib',
      nameMm: 'မဂ်ရစ်ဗ် (နေဝင်စ)',
      nameAr: 'المَغْرِب',
      time: maghribObj.time12,
      time12: maghribObj.time12,
      time12Mm: maghribObj.time12Mm,
      time24: maghribObj.time24,
      descriptionMm: 'နေဝင်ပြီးစ နမားဇ်',
    };

    const netIsha: PrayerTimeData = {
      name: 'Isha',
      nameMm: 'အီရှာအ် (ညဉ့်ဦး)',
      nameAr: 'العِشَاء',
      time: ishaObj.time12,
      time12: ishaObj.time12,
      time12Mm: ishaObj.time12Mm,
      time24: ishaObj.time24,
      descriptionMm: 'အနောက်ဘက်ဆည်းဆာ ရောင်နီလုံးဝပျောက်ကွယ်ချိန် နမားဇ်',
    };

    const allPrayerItems: PrayerTimeData[] = [
      netSahoorEnd,
      netFajr,
      netSunrise,
      netIshraq,
      netZawaal,
      netDhuhr,
      netAsrHanafi,
      netSunset,
      netMaghrib,
      netIsha,
    ];

    // Compute current and next prayer
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let currentPrayer: PrayerTimeData | null = null;
    let nextPrayer: PrayerTimeData | null = null;
    let minutesToNext = 0;

    for (let i = 0; i < allPrayerItems.length; i++) {
      const item = allPrayerItems[i];
      const timeStr = item.time24 || '00:00';
      const [h, m] = timeStr.split(':').map(Number);
      const itemMins = h * 60 + m;

      if (currentMins >= itemMins) {
        currentPrayer = item;
      } else if (!nextPrayer) {
        nextPrayer = item;
        minutesToNext = itemMins - currentMins;
      }
    }

    if (!nextPrayer && allPrayerItems.length > 0) {
      nextPrayer = allPrayerItems[0];
      const nextTimeStr = nextPrayer.time24 || '00:00';
      const [h, m] = nextTimeStr.split(':').map(Number);
      minutesToNext = 24 * 60 - currentMins + (h * 60 + m);
    }

    const hoursRem = Math.floor(minutesToNext / 60);
    const minsRem = minutesToNext % 60;
    let nextPrayerRemainingText = '';
    if (hoursRem > 0) {
      nextPrayerRemainingText = `${hoursRem} နာရီ ${minsRem} မိနစ် အလို`;
    } else {
      nextPrayerRemainingText = `${minsRem} မိနစ် အလို`;
    }

    const netSchedule: FullSolarPrayerSchedule = {
      city,
      dateStr: date.toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' }),
      sahoorEnd: netSahoorEnd,
      fajr: netFajr,
      sunrise: netSunrise,
      ishraq: netIshraq,
      zawaal: netZawaal,
      dhuhr: netDhuhr,
      asr: netAsrHanafi,
      asrHanafi: netAsrHanafi,
      sunset: netSunset,
      maghrib: netMaghrib,
      isha: netIsha,
      allPrayerItems,
      currentPrayer,
      nextPrayer,
      nextPrayerRemainingText,
      minutesToNext,
    };

    prayerCache.set(cacheKey, { data: netSchedule, timestamp: Date.now() });
    cachePrayerSchedule(city.id, dateKey, netSchedule);
    return { schedule: netSchedule, isNetwork: true };

  } catch (err) {
    console.warn(`Net sync failed for ${city.nameMm}, falling back to offline cache or Hanafi calculation:`, err);
    const offlineCached = getOfflinePrayerSchedule(city.id, dateKey);
    if (offlineCached) {
      return { schedule: offlineCached, isNetwork: true };
    }
    return { schedule: fallbackSchedule, isNetwork: false };
  }
}
