// Islamic Prayer Times & Solar Astronomical Calculation for Myanmar
import { CityPrayerConfig, PrayerTimeData } from '../types';

export const MYANMAR_CITIES: CityPrayerConfig[] = [
  // ပြည်ထောင်စုနယ်မြေ
  { id: 'naypyidaw', nameMm: 'နေပြည်တော်', nameEn: 'Naypyidaw', regionMm: 'ပြည်ထောင်စုနယ်မြေ', regionType: 'union', lat: 19.7633, lng: 96.0785, timezone: 6.5 },

  // တိုင်းဒေသကြီး (၇) ခု
  { id: 'yangon', nameMm: 'ရန်ကုန်', nameEn: 'Yangon', regionMm: 'ရန်ကုန်တိုင်းဒေသကြီး', regionType: 'region', lat: 16.8661, lng: 96.1951, timezone: 6.5 },
  { id: 'mandalay', nameMm: 'မန္တလေး', nameEn: 'Mandalay', regionMm: 'မန္တလေးတိုင်းဒေသကြီး', regionType: 'region', lat: 21.9588, lng: 96.0891, timezone: 6.5 },
  { id: 'meiktila', nameMm: 'မိတ္ထီလာ', nameEn: 'Meiktila', regionMm: 'မန္တလေးတိုင်းဒေသကြီး', regionType: 'region', lat: 20.8797, lng: 95.8642, timezone: 6.5 },
  { id: 'pathein', nameMm: 'ပုသိမ်', nameEn: 'Pathein', regionMm: 'ဧရာဝတီတိုင်းဒေသကြီး', regionType: 'region', lat: 16.7833, lng: 94.7333, timezone: 6.5 },
  { id: 'hinthada', nameMm: 'ဟင်္သာတ', nameEn: 'Hinthada', regionMm: 'ဧရာဝတီတိုင်းဒေသကြီး', regionType: 'region', lat: 17.6500, lng: 95.4667, timezone: 6.5 },
  { id: 'maubin', nameMm: 'မအူပင်', nameEn: 'Maubin', regionMm: 'ဧရာဝတီတိုင်းဒေသကြီး', regionType: 'region', lat: 16.7333, lng: 95.6500, timezone: 6.5 },
  { id: 'bago', nameMm: 'ပဲခူး', nameEn: 'Bago', regionMm: 'ပဲခူးတိုင်းဒေသကြီး', regionType: 'region', lat: 17.3221, lng: 96.4800, timezone: 6.5 },
  { id: 'pyay', nameMm: 'ပြည်', nameEn: 'Pyay', regionMm: 'ပဲခူးတိုင်းဒေသကြီး', regionType: 'region', lat: 18.8239, lng: 95.2195, timezone: 6.5 },
  { id: 'taungoo', nameMm: 'တောင်ငူ', nameEn: 'Taungoo', regionMm: 'ပဲခူးတိုင်းဒေသကြီး', regionType: 'region', lat: 18.9400, lng: 96.4300, timezone: 6.5 },
  { id: 'magway', nameMm: 'မကွေး', nameEn: 'Magway', regionMm: 'မကွေးတိုင်းဒေသကြီး', regionType: 'region', lat: 20.1444, lng: 94.9417, timezone: 6.5 },
  { id: 'pakokku', nameMm: 'ပခုက္ကူ', nameEn: 'Pakokku', regionMm: 'မကွေးတိုင်းဒေသကြီး', regionType: 'region', lat: 21.3333, lng: 95.0833, timezone: 6.5 },
  { id: 'monywa', nameMm: 'မုံရွာ', nameEn: 'Monywa', regionMm: 'စစ်ကိုင်းတိုင်းဒေသကြီး', regionType: 'region', lat: 22.1086, lng: 95.1356, timezone: 6.5 },
  { id: 'sagaing', nameMm: 'စစ်ကိုင်း', nameEn: 'Sagaing', regionMm: 'စစ်ကိုင်းတိုင်းဒေသကြီး', regionType: 'region', lat: 21.8787, lng: 95.9797, timezone: 6.5 },
  { id: 'shwebo', nameMm: 'ရွှေဘို', nameEn: 'Shwebo', regionMm: 'စစ်ကိုင်းတိုင်းဒေသကြီး', regionType: 'region', lat: 22.5694, lng: 95.6981, timezone: 6.5 },
  { id: 'kalay', nameMm: 'ကလေး', nameEn: 'Kalay', regionMm: 'စစ်ကိုင်းတိုင်းဒေသကြီး', regionType: 'region', lat: 23.1944, lng: 94.0583, timezone: 6.5 },
  { id: 'dawei', nameMm: 'ထားဝယ်', nameEn: 'Dawei', regionMm: 'တနင်္သာရီတိုင်းဒေသကြီး', regionType: 'region', lat: 14.0828, lng: 98.1942, timezone: 6.5 },
  { id: 'myeik', nameMm: 'မြိတ်', nameEn: 'Myeik', regionMm: 'တနင်္သာရီတိုင်းဒေသကြီး', regionType: 'region', lat: 12.4382, lng: 98.6006, timezone: 6.5 },
  { id: 'kawthaung', nameMm: 'ကော့သောင်း', nameEn: 'Kawthaung', regionMm: 'တနင်္သာရီတိုင်းဒေသကြီး', regionType: 'region', lat: 9.9797, lng: 98.5492, timezone: 6.5 },

  // ပြည်နယ် (၇) ခု
  { id: 'myitkyina', nameMm: 'မြစ်ကြီးနား', nameEn: 'Myitkyina', regionMm: 'ကချင်ပြည်နယ်', regionType: 'state', lat: 25.3833, lng: 97.4000, timezone: 6.5 },
  { id: 'bhamo', nameMm: 'ဗန်းမော်', nameEn: 'Bhamo', regionMm: 'ကချင်ပြည်နယ်', regionType: 'state', lat: 24.2667, lng: 97.2333, timezone: 6.5 },
  { id: 'loikaw', nameMm: 'လွိုင်ကော်', nameEn: 'Loikaw', regionMm: 'ကယားပြည်နယ်', regionType: 'state', lat: 19.6742, lng: 97.2093, timezone: 6.5 },
  { id: 'hpaan', nameMm: 'ဘားအံ', nameEn: 'Hpa-An', regionMm: 'ကရင်ပြည်နယ်', regionType: 'state', lat: 16.8906, lng: 97.6333, timezone: 6.5 },
  { id: 'myawaddy', nameMm: 'မြဝတီ', nameEn: 'Myawaddy', regionMm: 'ကရင်ပြည်နယ်', regionType: 'state', lat: 16.6894, lng: 98.5133, timezone: 6.5 },
  { id: 'hakha', nameMm: 'ဟားခါး', nameEn: 'Hakha', regionMm: 'ချင်းပြည်နယ်', regionType: 'state', lat: 22.6425, lng: 93.6067, timezone: 6.5 },
  { id: 'mawlamyine', nameMm: 'မော်လမြိုင်', nameEn: 'Mawlamyine', regionMm: 'မွန်ပြည်နယ်', regionType: 'state', lat: 16.4905, lng: 97.6282, timezone: 6.5 },
  { id: 'thaton', nameMm: 'သထုံ', nameEn: 'Thaton', regionMm: 'မွန်ပြည်နယ်', regionType: 'state', lat: 16.9206, lng: 97.3719, timezone: 6.5 },
  { id: 'sittwe', nameMm: 'စစ်တွေ', nameEn: 'Sittwe', regionMm: 'ရခိုင်ပြည်နယ်', regionType: 'state', lat: 20.1500, lng: 92.9000, timezone: 6.5 },
  { id: 'kyaukpyu', nameMm: 'ကျောက်ဖြူ', nameEn: 'Kyaukpyu', regionMm: 'ရခိုင်ပြည်နယ်', regionType: 'state', lat: 19.4267, lng: 93.5519, timezone: 6.5 },
  { id: 'thandwe', nameMm: 'သံတွဲ', nameEn: 'Thandwe', regionMm: 'ရခိုင်ပြည်နယ်', regionType: 'state', lat: 18.4628, lng: 94.3608, timezone: 6.5 },
  { id: 'taunggyi', nameMm: 'တောင်ကြီး', nameEn: 'Taunggyi', regionMm: 'ရှမ်းပြည်နယ် (တောင်ပိုင်း)', regionType: 'state', lat: 20.7833, lng: 97.0333, timezone: 6.5 },
  { id: 'lashio', nameMm: 'လားရှိုး', nameEn: 'Lashio', regionMm: 'ရှမ်းပြည်နယ် (မြောက်ပိုင်း)', regionType: 'state', lat: 22.9333, lng: 97.7500, timezone: 6.5 },
  { id: 'kengtung', nameMm: 'ကျိုင်းတုံ', nameEn: 'Kengtung', regionMm: 'ရှမ်းပြည်နယ် (အရှေ့ပိုင်း)', regionType: 'state', lat: 21.2917, lng: 99.6056, timezone: 6.5 },
  { id: 'muse', nameMm: 'မူဆယ်', nameEn: 'Muse', regionMm: 'ရှမ်းပြည်နယ်', regionType: 'state', lat: 23.9944, lng: 97.9042, timezone: 6.5 },
];

export interface FullSolarPrayerSchedule {
  city: CityPrayerConfig;
  dateStr: string;
  sahoorEnd: PrayerTimeData;
  fajr: PrayerTimeData;
  sunrise: PrayerTimeData;
  ishraq: PrayerTimeData;
  zawaal: PrayerTimeData;
  dhuhr: PrayerTimeData;
  asr: PrayerTimeData;
  asrHanafi: PrayerTimeData;
  sunset: PrayerTimeData; // Maghrib / Iftar
  maghrib: PrayerTimeData;
  isha: PrayerTimeData;
  allPrayerItems: PrayerTimeData[];
  currentPrayer: PrayerTimeData | null;
  nextPrayer: PrayerTimeData | null;
  nextPrayerRemainingText: string;
  minutesToNext: number;
}

// Convert degrees to radians
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function formatTime12(hours: number): { time12: string; time12Mm: string; time24: string } {
  let h = Math.floor(hours) % 24;
  let m = Math.floor((hours - Math.floor(hours)) * 60);
  if (h < 0) h += 24;

  const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const period = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  let periodMm = 'နံနက်';
  if (h >= 12 && h < 16) {
    periodMm = 'နေ့လယ်';
  } else if (h >= 16 && h < 19) {
    periodMm = 'ညနေ';
  } else if (h >= 19) {
    periodMm = 'ည';
  } else if (h < 4) {
    periodMm = 'သန်းခေါင်';
  } else {
    periodMm = 'နံနက်';
  }

  const mmDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  const toMm = (num: number | string) => String(num).replace(/[0-9]/g, (d) => mmDigits[Number(d)]);

  const time12 = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  const time12Mm = `${periodMm} ${toMm(h12)}:${toMm(String(m).padStart(2, '0'))}`;

  return { time12, time12Mm, time24 };
}

function formatTime(hours: number): string {
  return formatTime12(hours).time12;
}

export function formatTime12Hour(time: string): string {
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  let periodMm = 'နံနက်';
  if (h >= 12 && h < 16) periodMm = 'နေ့လယ်';
  else if (h >= 16 && h < 19) periodMm = 'ညနေ';
  else if (h >= 19) periodMm = 'ည';
  
  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  const mmDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  const toMm = (num: number | string) => String(num).replace(/[0-9]/g, (d) => mmDigits[Number(d)]);

  return `${String(h).padStart(2, '0')}:${m} ${period} (${periodMm} ${toMm(h)}:${toMm(m)})`;
}

/**
 * Islamic Astronomical Equation of Time calculation
 * Karachi / Muslim World League standard (Fajr angle 18°, Isha angle 18°)
 */
export function calculatePrayerTimes(city: CityPrayerConfig, date: Date = new Date()): FullSolarPrayerSchedule {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Day of year calculation
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  // Solar declination & Equation of Time approximations
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const declination = 23.45 * Math.sin(toRad((360 / 365) * (dayOfYear - 81))); // degrees

  // Solar Noon (Zawaal) in standard local time
  const timeOffsetHours = city.timezone;
  const lngDifferenceMinutes = (city.lng - timeOffsetHours * 15) * 4; // minutes
  const solarNoonHours = 12 - (lngDifferenceMinutes + eot) / 60;

  // Calculate hour angle for a given solar altitude angle
  function getHourAngle(altitudeDeg: number): number {
    const latRad = toRad(city.lat);
    const decRad = toRad(declination);
    const altRad = toRad(altitudeDeg);
    const cosHA = (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1 || cosHA < -1) return 0; // extreme latitudes
    return toDeg(Math.acos(cosHA)) / 15; // hours
  }

  // Fajr: Sun is 18° below horizon
  const fajrHA = getHourAngle(-18);
  const fajrTime = solarNoonHours - fajrHA;
  const sahoorTime = fajrTime - 10 / 60; // 10 minutes precaution before Fajr

  // Sunrise: Sun is 0.833° below horizon (accounting for refraction and solar radius)
  const sunriseHA = getHourAngle(-0.833);
  const sunriseTime = solarNoonHours - sunriseHA;
  const ishraqTime = sunriseTime + 18 / 60; // ~18-20 mins after sunrise

  // Zawaal (Midday / Istiwa): ~7 mins before Dhuhr peak
  const zawaalTime = solarNoonHours - 7 / 60;
  const dhuhrTime = solarNoonHours + 2 / 60; // 2 mins after zenith for safety

  // Asr: Shafi'i (shadow = length + noon shadow) and Hanafi (shadow = 2 * length + noon shadow)
  function getAsrHourAngle(factor: number): number {
    const noonAlt = 90 - city.lat + declination;
    const noonAltRad = toRad(Math.abs(noonAlt));
    const noonShadow = 1 / Math.tan(noonAltRad);
    const asrAlt = toDeg(Math.atan(1 / (factor + noonShadow)));
    return getHourAngle(asrAlt);
  }

  const asrShafiiHA = getAsrHourAngle(1);
  const asrHanafiHA = getAsrHourAngle(2);
  const asrShafiiTime = solarNoonHours + asrShafiiHA;
  const asrHanafiTime = solarNoonHours + asrHanafiHA;

  // Sunset & Maghrib: Sun is 0.833° below horizon
  const sunsetHA = sunriseHA;
  const sunsetTime = solarNoonHours + sunsetHA;
  const maghribTime = sunsetTime + 2 / 60; // Sunset / Iftar

  // Isha: Sun is 18° below horizon
  const ishaHA = fajrHA;
  const ishaTime = solarNoonHours + ishaHA;

  // Format times into 12-hour format
  const sahoorObj = formatTime12(sahoorTime);
  const fajrObj = formatTime12(fajrTime);
  const sunriseObj = formatTime12(sunriseTime);
  const ishraqObj = formatTime12(ishraqTime);
  const zawaalObj = formatTime12(zawaalTime);
  const dhuhrObj = formatTime12(dhuhrTime);
  const asrObj = formatTime12(asrShafiiTime);
  const asrHanafiObj = formatTime12(asrHanafiTime);
  const sunsetObj = formatTime12(sunsetTime);
  const maghribObj = formatTime12(maghribTime);
  const ishaObj = formatTime12(ishaTime);

  const sahoorEnd: PrayerTimeData = {
    name: 'Sahoor End',
    nameMm: 'စဟူရ် ပြီးချိန်',
    nameAr: 'نهاية السحور',
    time: sahoorObj.time12,
    time12: sahoorObj.time12,
    time12Mm: sahoorObj.time12Mm,
    time24: sahoorObj.time24,
    descriptionMm: 'ဥပုသ်သီလစတင်ရန် စဟူရ် စားသောက်မှု ရပ်ဆိုင်းချိန်',
  };

  const fajr: PrayerTimeData = {
    name: 'Fajr',
    nameMm: 'ဖဂျရ် (အရုဏ်တက်)',
    nameAr: 'الفَجْر',
    time: fajrObj.time12,
    time12: fajrObj.time12,
    time12Mm: fajrObj.time12Mm,
    time24: fajrObj.time24,
    descriptionMm: 'နံနက် အရုဏ်တက်ချိန် နမားဇ် (ဝါစတင်ချိန်)',
  };

  const sunrise: PrayerTimeData = {
    name: 'Sunrise',
    nameMm: 'နေထွက်ချိန် (ရှုရူက်)',
    nameAr: 'الشُّرُوق',
    time: sunriseObj.time12,
    time12: sunriseObj.time12,
    time12Mm: sunriseObj.time12Mm,
    time24: sunriseObj.time24,
    descriptionMm: 'နေစတင်ထွက်ပေါ်ချိန် (နမားဇ်ဖတ်ခွင့် မပြုသောအချိန်)',
  };

  const ishraq: PrayerTimeData = {
    name: 'Ishraq',
    nameMm: 'အိရှ်ရားက်',
    nameAr: 'الإشْرَاق',
    time: ishraqObj.time12,
    time12: ishraqObj.time12,
    time12Mm: ishraqObj.time12Mm,
    time24: ishraqObj.time24,
    descriptionMm: 'နေထွက်ပြီး ၁၈ မိနစ်ခန့်အကြာ နဖိလ်နမားဇ် ဖတ်နိုင်ချိန်',
  };

  const zawaal: PrayerTimeData = {
    name: 'Zawaal',
    nameMm: 'မွန်းတည့်ချိန် (ဇဝါလ်)',
    nameAr: 'الزَّوَال',
    time: zawaalObj.time12,
    time12: zawaalObj.time12,
    time12Mm: zawaalObj.time12Mm,
    time24: zawaalObj.time24,
    descriptionMm: 'နေမတ်တတ်အချိန် (နမားဇ်ဖတ်ခွင့် မပြုသောအချိန်)',
  };

  const dhuhr: PrayerTimeData = {
    name: 'Dhuhr',
    nameMm: 'ဇုဟိုရ် (မွန်းလွဲ)',
    nameAr: 'الظُّهْر',
    time: dhuhrObj.time12,
    time12: dhuhrObj.time12,
    time12Mm: dhuhrObj.time12Mm,
    time24: dhuhrObj.time24,
    descriptionMm: 'မွန်းတိမ်းချိန် နေ့လယ် နမားဇ်',
  };

  // In Hanafi Fiqh, Asr starts when shadow = 2x length + noon shadow (Mithlayn)
  const asr: PrayerTimeData = {
    name: 'Asr',
    nameMm: 'အဆွရ် (ဟနဖီ မဇ်ဟဗ်)',
    nameAr: 'العَصْر (حنفي)',
    time: asrHanafiObj.time12,
    time12: asrHanafiObj.time12,
    time12Mm: asrHanafiObj.time12Mm,
    time24: asrHanafiObj.time24,
    descriptionMm: 'အရိပ် နှစ်ဆဖြစ်ချိန် (ဟနဖီ မဇ်ဟဗ် စံနှုန်း)',
  };

  const asrHanafi: PrayerTimeData = {
    name: 'Asr (Hanafi)',
    nameMm: 'အဆွရ် (ဟနဖီ)',
    nameAr: 'العَصْر (حنفي)',
    time: asrHanafiObj.time12,
    time12: asrHanafiObj.time12,
    time12Mm: asrHanafiObj.time12Mm,
    time24: asrHanafiObj.time24,
    descriptionMm: 'အရိပ် နှစ်ဆ (မိစ်လိုင်းန်) ဖြစ်ချိန် ဟနဖီ စံနှုန်း',
  };

  const sunset: PrayerTimeData = {
    name: 'Sunset',
    nameMm: 'နေဝင်ချိန် / ဝါဖြေချိန်',
    nameAr: 'الغُرُوب',
    time: sunsetObj.time12,
    time12: sunsetObj.time12,
    time12Mm: sunsetObj.time12Mm,
    time24: sunsetObj.time24,
    descriptionMm: 'နေလုံးဝဝင်ချိန် နှင့် ဥပုသ်ဝါဖြေချိန်',
  };

  const maghrib: PrayerTimeData = {
    name: 'Maghrib',
    nameMm: 'မဂ်ရစ်ဗ် (နေဝင်စ)',
    nameAr: 'المَغْرِب',
    time: maghribObj.time12,
    time12: maghribObj.time12,
    time12Mm: maghribObj.time12Mm,
    time24: maghribObj.time24,
    descriptionMm: 'နေဝင်ပြီးစ နမားဇ်',
  };

  const isha: PrayerTimeData = {
    name: 'Isha',
    nameMm: 'အီရှာအ် (ညဦး)',
    nameAr: 'العِشَاء',
    time: ishaObj.time12,
    time12: ishaObj.time12,
    time12Mm: ishaObj.time12Mm,
    time24: ishaObj.time24,
    descriptionMm: 'ညဦးယံ နမားဇ် နှင့် တရာဝီဟ် နမားဇ်',
  };

  // 5 Main prayers + Solar key events for top bar
  const allPrayerItems = [fajr, sunrise, zawaal, dhuhr, asr, maghrib, isha];

  // Determine current & next prayer
  const nowHours = date.getHours() + date.getMinutes() / 60;
  const timeEntries = [
    { item: fajr, hours: fajrTime },
    { item: sunrise, hours: sunriseTime },
    { item: zawaal, hours: zawaalTime },
    { item: dhuhr, hours: dhuhrTime },
    { item: asr, hours: asrShafiiTime },
    { item: maghrib, hours: maghribTime },
    { item: isha, hours: ishaTime },
  ];

  let currentPrayer: PrayerTimeData | null = null;
  let nextPrayer: PrayerTimeData | null = null;
  let minutesToNext = 0;

  for (let i = 0; i < timeEntries.length; i++) {
    if (nowHours >= timeEntries[i].hours) {
      currentPrayer = timeEntries[i].item;
    }
  }

  // If before Fajr
  if (!currentPrayer) {
    currentPrayer = isha; // Isha from yesterday night
  }

  // Find next prayer
  for (let i = 0; i < timeEntries.length; i++) {
    if (timeEntries[i].hours > nowHours) {
      nextPrayer = timeEntries[i].item;
      const diffHours = timeEntries[i].hours - nowHours;
      minutesToNext = Math.round(diffHours * 60);
      break;
    }
  }

  // If after Isha, next prayer is tomorrow's Fajr
  if (!nextPrayer) {
    nextPrayer = fajr;
    const diffHours = 24 - nowHours + fajrTime;
    minutesToNext = Math.round(diffHours * 60);
  }

  // Mark flags
  allPrayerItems.forEach((p) => {
    if (currentPrayer && p.name === currentPrayer.name) p.isCurrent = true;
    if (nextPrayer && p.name === nextPrayer.name) p.isNext = true;
  });

  const hoursRemaining = Math.floor(minutesToNext / 60);
  const minsRemaining = minutesToNext % 60;
  let nextPrayerRemainingText = '';
  if (hoursRemaining > 0) {
    nextPrayerRemainingText = `${hoursRemaining} နာရီ ${minsRemaining} မိနစ် အလို`;
  } else {
    nextPrayerRemainingText = `${minsRemaining} မိနစ် အလို`;
  }

  return {
    city,
    dateStr: date.toLocaleDateString('my-MM'),
    sahoorEnd,
    fajr,
    sunrise,
    ishraq,
    zawaal,
    dhuhr,
    asr,
    asrHanafi,
    sunset,
    maghrib,
    isha,
    allPrayerItems,
    currentPrayer,
    nextPrayer,
    nextPrayerRemainingText,
    minutesToNext,
  };
}

/**
 * Play a respectful synthesizer adhan chime using Web Audio API
 */
export function playIslamicAdhanChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Soothing gentle resonant harmonic sequence
    const notes = [440, 528, 660, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.4);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.4 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.4 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.4);
      osc.stop(ctx.currentTime + idx * 0.4 + 1.3);
    });
  } catch {
    // Audio autoplay restrictions gracefully handled
  }
}
