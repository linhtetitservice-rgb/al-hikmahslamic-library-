// Hijri Calendar calculation with lunar day adjustment

export interface HijriDateInfo {
  day: number;
  monthIndex: number;
  monthNameAr: string;
  monthNameMm: string;
  year: number;
  weekdayAr: string;
  weekdayMm: string;
  formattedMm: string;
  formattedAr: string;
}

const HIJRI_MONTHS_AR = [
  'المُحَرَّم',
  'صَفَر',
  'رَبِيع الأَوَّل',
  'رَبِيع الثَّانِي',
  'جُمَادَى الأُولَى',
  'جُمَادَى الآخِرَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو القَعْدَة',
  'ذُو الحِجَّة',
];

export const HIJRI_MONTHS_MM = [
  'မုဟရ်ရမ်',
  'ဆွဖရ်',
  'ရဗီအုလ်အောင်ဝလ်',
  'ရဗီအုဆ်ဆာနီ',
  'ဂျုမာဒလ်ဥလာ',
  'ဂျုမာဒလ်အာခိရ်',
  'ရဂျဗ်',
  'ရှာအ်ဗာန်',
  'ရမ်ဇာန်',
  'ရှောင်ဝါလ်',
  'ဇုလ်ကအ်ဒဟ်',
  'ဇုလ်ဟိဂျ်ဂျဟ်',
];

export const WEEKDAYS_MM = [
  'တနင်္ဂနွေ',
  'တနင်္လာ',
  'အင်္ဂါ',
  'ဗုဒ္ဓဟူး',
  'ကြာသပတေး',
  'သောကြာ (ဂျုမုအဟ်)',
  'စနေ',
];

const WEEKDAYS_AR = [
  'الأَحَد',
  'الإثْنَيْن',
  'الثُّلاثَاء',
  'الأَرْبِعَاء',
  'الخَمِيس',
  'الجُمُعَة',
  'السَّبْت',
];

// Convert Myanmar digits
export function toMyanmarDigits(num: number | string): string {
  const mmDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  return String(num).replace(/[0-9]/g, (d) => mmDigits[Number(d)]);
}

/**
 * Calculates Kuwaiti algorithm / Umm al-Qura standard Islamic date
 * Allows adjustment offset in days (-2 to +2) to match local moon sighting.
 */
export function getHijriDate(date: Date = new Date(), dayOffset: number = 0): HijriDateInfo {
  // Apply day offset
  const adjustedDate = new Date(date.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  
  const day = adjustedDate.getDate();
  const month = adjustedDate.getMonth();
  const year = adjustedDate.getFullYear();
  const weekday = adjustedDate.getDay();

  // Julian day number calculation
  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  // Julian Day to Hijri
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const lPrime = l - 10631 * n + 354;
  const j = (Math.floor((10985 - lPrime) / 5316)) * (Math.floor((50 * lPrime) / 17719)) + (Math.floor(lPrime / 5670)) * (Math.floor((43 * lPrime) / 15238));
  const lDoublePrime = lPrime - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  const hMonth = Math.floor((24 * lDoublePrime) / 709);
  const hDay = lDoublePrime - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  const validMonthIndex = Math.min(11, Math.max(0, hMonth - 1));
  const validDay = Math.max(1, Math.min(30, hDay));

  const monthNameAr = HIJRI_MONTHS_AR[validMonthIndex];
  const monthNameMm = HIJRI_MONTHS_MM[validMonthIndex];
  const weekdayMm = WEEKDAYS_MM[weekday];
  const weekdayAr = WEEKDAYS_AR[weekday];

  const formattedMm = `${toMyanmarDigits(validDay)} ${monthNameMm} ${toMyanmarDigits(hYear)} ဟိဂျ်ရီ`;
  const formattedAr = `${validDay} ${monthNameAr} ${hYear} هـ`;

  return {
    day: validDay,
    monthIndex: validMonthIndex,
    monthNameAr,
    monthNameMm,
    year: hYear,
    weekdayAr,
    weekdayMm,
    formattedMm,
    formattedAr,
  };
}

export interface MyanmarStandardTimeInfo {
  date: Date;
  time24: string; // "14:35:08"
  time12: string; // "02:35:08 PM"
  time12Mm: string; // "မွန်းလွဲ ၀၂:၃၅:၀၈"
  digitsMm: string; // "၀၂:၃၅:၀၈"
  digits24Mm: string; // "၁၄:၃၅:၀၈"
  hour12: number;
  hour24: number;
  minutes: string;
  seconds: string;
  periodMm: string; // "နံနက်", "မွန်းလွဲ", "ညနေ", "ည"
  periodEn: string; // "AM", "PM"
  gregorianDateMm: string; // "၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ ၃၀ ရက်"
  gregorianWeekdayMm: string; // "ဗုဒ္ဓဟူးနေ့"
  timeZoneLabel: string; // "မြန်မာစံတော်ချိန် (MMT, UTC+06:30)"
}

/**
 * Calculates current Myanmar Standard Time (MMT, UTC+06:30) accurately
 * regardless of the user's device local timezone.
 */
export function getMyanmarStandardTimeInfo(date: Date = new Date()): MyanmarStandardTimeInfo {
  // Convert date to Myanmar Standard Time (UTC + 6 hours 30 minutes)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const mmtTime = new Date(utc + 6.5 * 3600000);

  const hours24 = mmtTime.getHours();
  const minutesNum = mmtTime.getMinutes();
  const secondsNum = mmtTime.getSeconds();

  const hours12 = hours24 % 12 || 12;
  const periodEn = hours24 >= 12 ? 'PM' : 'AM';
  
  let periodMm = 'နံနက်';
  if (hours24 >= 12 && hours24 < 16) {
    periodMm = 'မွန်းလွဲ';
  } else if (hours24 >= 16 && hours24 < 19) {
    periodMm = 'ညနေ';
  } else if (hours24 >= 19 || hours24 < 4) {
    periodMm = 'ည';
  } else {
    periodMm = 'နံနက်';
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const hh24 = pad(hours24);
  const hh12 = pad(hours12);
  const mm = pad(minutesNum);
  const ss = pad(secondsNum);

  const time24 = `${hh24}:${mm}:${ss}`;
  const time12 = `${hh12}:${mm}:${ss} ${periodEn}`;
  const digitsMm = toMyanmarDigits(`${hh12}:${mm}:${ss}`);
  const digits24Mm = toMyanmarDigits(`${hh24}:${mm}:${ss}`);
  const time12Mm = `${periodMm} ${digitsMm}`;

  const monthsMm = [
    'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
    'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
  ];
  const daysMm = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];

  const gregorianDateMm = `${toMyanmarDigits(mmtTime.getFullYear())} ခုနှစ်၊ ${monthsMm[mmtTime.getMonth()]} ${toMyanmarDigits(mmtTime.getDate())} ရက်`;
  const gregorianWeekdayMm = `${daysMm[mmtTime.getDay()]}နေ့`;

  return {
    date: mmtTime,
    time24,
    time12,
    time12Mm,
    digitsMm,
    digits24Mm,
    hour12: hours12,
    hour24: hours24,
    minutes: mm,
    seconds: ss,
    periodMm,
    periodEn,
    gregorianDateMm,
    gregorianWeekdayMm,
    timeZoneLabel: 'မြန်မာစံတော်ချိန် (MMT, UTC+06:30)',
  };
}
