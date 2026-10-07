import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Printer, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { CityPrayerConfig } from '../types';
import { 
  calculatePrayerTimes, 
  MYANMAR_CITIES, 
  FullSolarPrayerSchedule 
} from '../utils/prayerTimes';
import { 
  getHijriDate, 
  toMyanmarDigits, 
  HIJRI_MONTHS_MM, 
  WEEKDAYS_MM 
} from '../utils/hijriCalendar';

interface MonthlyPrayerTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCity?: CityPrayerConfig;
}

export interface DayPrayerRow {
  dayNumber: number;
  dateObj: Date;
  dateStr: string;
  weekdayMm: string;
  isJumuah: boolean;
  hijriDay: number;
  hijriMonthMm: string;
  sahoorEnd: string;
  fajr: string;
  sunrise: string;
  zawaal: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  isToday: boolean;
}

const MONTH_NAMES_MM = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'ဩဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];

export const MonthlyPrayerTimetableModal: React.FC<MonthlyPrayerTimetableModalProps> = ({
  isOpen,
  onClose,
  initialCity,
}) => {
  const [selectedCity, setSelectedCity] = useState<CityPrayerConfig>(initialCity || MYANMAR_CITIES[1]);
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()); // 0-indexed
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Synchronize initialCity if provided
  useEffect(() => {
    if (initialCity) {
      setSelectedCity(initialCity);
    }
  }, [initialCity]);

  if (!isOpen) return null;

  // Calculate days in selected month
  const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Generate timetable rows for the entire month
  const tableRows: DayPrayerRow[] = [];
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayDate = new Date(selectedYear, selectedMonth, d);
    const daySchedule: FullSolarPrayerSchedule = calculatePrayerTimes(selectedCity, dayDate);
    const hijriInfo = getHijriDate(dayDate, 0);
    const dayOfWeek = dayDate.getDay(); // 0 is Sunday, 5 is Friday
    const isJumuah = dayOfWeek === 5;
    const isToday = isCurrentMonth && today.getDate() === d;

    tableRows.push({
      dayNumber: d,
      dateObj: dayDate,
      dateStr: `${toMyanmarDigits(d)} ရက်`,
      weekdayMm: WEEKDAYS_MM[dayOfWeek],
      isJumuah,
      hijriDay: hijriInfo.day,
      hijriMonthMm: hijriInfo.monthNameMm,
      sahoorEnd: daySchedule.sahoorEnd.time24 || daySchedule.sahoorEnd.time,
      fajr: daySchedule.fajr.time24 || daySchedule.fajr.time,
      sunrise: daySchedule.sunrise.time24 || daySchedule.sunrise.time,
      zawaal: daySchedule.zawaal.time24 || daySchedule.zawaal.time,
      dhuhr: daySchedule.dhuhr.time24 || daySchedule.dhuhr.time,
      asr: daySchedule.asrHanafi.time24 || daySchedule.asrHanafi.time,
      maghrib: daySchedule.sunset.time24 || daySchedule.sunset.time,
      isha: daySchedule.isha.time24 || daySchedule.isha.time,
      isToday,
    });
  }

  // Get Hijri month names spanned in this month
  const startHijri = getHijriDate(new Date(selectedYear, selectedMonth, 1));
  const endHijri = getHijriDate(new Date(selectedYear, selectedMonth, totalDaysInMonth));
  const hijriSummaryMm = startHijri.monthNameMm === endHijri.monthNameMm
    ? `${toMyanmarDigits(startHijri.year)} ဟိဂျ်ရီ ${startHijri.monthNameMm}လ`
    : `${toMyanmarDigits(startHijri.year)} ဟိဂျ်ရီ ${startHijri.monthNameMm} / ${endHijri.monthNameMm}လ`;

  const monthLabelMm = `${MONTH_NAMES_MM[selectedMonth]} (${toMyanmarDigits(selectedYear)})`;

  // Navigate months
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    const current = new Date();
    setSelectedYear(current.getFullYear());
    setSelectedMonth(current.getMonth());
  };

  // Export to PNG format
  const handleExportPng = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPng(true);
    setExportSuccessMsg(null);

    try {
      const imgData = await toPng(printAreaRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      const filename = `${selectedCity.nameEn}_${MONTH_NAMES_MM[selectedMonth]}_${selectedYear}_Prayer_Timetable.png`;
      link.href = imgData;
      link.download = filename;
      link.click();

      setExportSuccessMsg(`PNG ဖိုင် (${filename}) ကို အောင်မြင်စွာ ဒေါင်းလုဒ်ရယူပြီးပါပြီ`);
      setTimeout(() => setExportSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to export PNG:', err);
      alert('PNG ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။');
    } finally {
      setIsExportingPng(false);
    }
  };

  // Export to PDF format
  const handleExportPdf = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPdf(true);
    setExportSuccessMsg(null);

    try {
      const imgData = await toPng(printAreaRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Measure dimensions
      const img = new window.Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const margin = 6;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (img.height * imgWidth) / (img.width || 1);

      if (imgHeight > pageHeight - margin * 2) {
        const scale = (pageHeight - margin * 2) / imgHeight;
        const finalW = imgWidth * scale;
        const finalH = imgHeight * scale;
        const posX = (pageWidth - finalW) / 2;
        pdf.addImage(imgData, 'PNG', posX, margin, finalW, finalH);
      } else {
        const posX = (pageWidth - imgWidth) / 2;
        pdf.addImage(imgData, 'PNG', posX, margin, imgWidth, imgHeight);
      }

      const filename = `${selectedCity.nameEn}_${MONTH_NAMES_MM[selectedMonth]}_${selectedYear}_Prayer_Timetable.pdf`;
      pdf.save(filename);

      setExportSuccessMsg(`PDF ဖိုင် (${filename}) ကို အောင်မြင်စွာ ဒေါင်းလုဒ်ရယူပြီးပါပြီ`);
      setTimeout(() => setExportSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('PDF ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl max-w-5xl w-full my-6 overflow-hidden border border-stone-300 dark:border-stone-800 flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>တစ်လစာ နမားဇ်အချိန်ဇယား ထုတ်ယူစနစ်</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold">
                  PDF & PNG
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90 font-myanmar">
                {selectedCity.nameMm}မြို့ • {monthLabelMm} • {hijriSummaryMm}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="ပိတ်မည်"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Export Toolbar */}
        <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* City & Month Selectors */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* City Selector */}
            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700 rounded-lg px-2.5 py-1.5 border border-stone-300 dark:border-stone-600">
              <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <select
                value={selectedCity.id}
                onChange={(e) => {
                  const found = MYANMAR_CITIES.find((c) => c.id === e.target.value);
                  if (found) setSelectedCity(found);
                }}
                className="bg-transparent text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer"
              >
                {MYANMAR_CITIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                    {c.nameMm} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-700 rounded-lg p-1 border border-stone-300 dark:border-stone-600">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-md hover:bg-white dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                title="ယခင်လ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 select-none">
                {MONTH_NAMES_MM[selectedMonth]} {toMyanmarDigits(selectedYear)}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-md hover:bg-white dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                title="နောက်လ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {(!isCurrentMonth) && (
              <button
                onClick={handleCurrentMonth}
                className="px-2.5 py-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                လက်ရှိလသို့
              </button>
            )}
          </div>

          {/* Export Action Buttons: PDF and PNG */}
          <div className="flex items-center gap-2">
            
            {/* PNG Export Button */}
            <button
              onClick={handleExportPng}
              disabled={isExportingPng || isExportingPdf}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="PNG ဓာတ်ပုံဖိုင်အဖြစ် ဒေါင်းလုဒ်ရယူမည်"
            >
              {isExportingPng ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ထုတ်ယူနေသည်...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-amber-300" />
                  <span>PNG ထုတ်ယူမည်</span>
                </>
              )}
            </button>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPng || isExportingPdf}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-800 hover:to-red-900 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="PDF စာရွက်စာတမ်းအဖြစ် ဒေါင်းလုဒ်ရယူမည်"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ထုတ်ယူနေသည်...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>PDF ထုတ်ယူမည်</span>
                </>
              )}
            </button>

            {/* Browser Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="ပရင်တာဖြင့် တိုက်ရိုက်ထုတ်မည်"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {exportSuccessMsg && (
          <div className="bg-emerald-100 border-b border-emerald-300 text-emerald-900 px-4 py-2 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{exportSuccessMsg}</span>
          </div>
        )}

        {/* Scrollable Printable Schedule Canvas Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-stone-100">
          
          {/* Printable Layout Target Card */}
          <div 
            ref={printAreaRef}
            className="bg-white rounded-xl shadow-xs border border-stone-300 p-4 sm:p-6 max-w-4xl mx-auto text-stone-900"
          >
            {/* Islamic Schedule Header */}
            <div className="text-center pb-4 border-b-2 border-emerald-800/20 space-y-1.5">
              <div className="font-arabic text-xl sm:text-2xl text-emerald-900 font-bold tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-emerald-950 tracking-tight">
                {selectedCity.nameMm}မြို့ တစ်လစာ နမားဇ်အချိန်ဇယား
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-stone-600">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                  📅 {monthLabelMm}
                </span>
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-900 rounded-md border border-amber-200">
                  🌙 {hijriSummaryMm}
                </span>
                <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-md border border-stone-300">
                  📍 {selectedCity.nameEn} (မြန်မာစံတော်ချိန် UTC+6:30)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-myanmar pt-1">
                ဟနဖီ မဇ်ဟဗ် စံနှုန်း (အရိပ် ၂ ဆ - မိစ်လိုင်းန်) • Al_HikMah အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်
              </p>
            </div>

            {/* Daily Schedule Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-900 text-white text-[11px] sm:text-xs">
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800 rounded-tl-md">
                      ရက်စွဲ
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800">
                      နေ့
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800">
                      ဟိဂျ်ရီ
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800 bg-rose-900/90 text-rose-100">
                      စဟူးရ်ကုန်
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800 bg-emerald-800">
                      ဖဂျရ်
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800 bg-amber-900/80 text-amber-100">
                      နေထွက်
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800">
                      ဇဝါလ်
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800 bg-emerald-800">
                      ဇုဟိုရ်
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800 bg-emerald-800">
                      အဆွရ်
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800 bg-amber-800 text-amber-100">
                      မဂ်ရစ်ဗ်/ဝါဖြေ
                    </th>
                    <th className="py-2.5 px-2 font-bold text-center border border-emerald-800 bg-emerald-800 rounded-tr-md">
                      အီရှာအ်
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {tableRows.map((row) => (
                    <tr
                      key={row.dayNumber}
                      className={`transition-colors font-mono sm:font-sans ${
                        row.isToday
                          ? 'bg-amber-100/80 font-bold ring-2 ring-amber-400 inset-0'
                          : row.isJumuah
                          ? 'bg-emerald-50/70 font-semibold'
                          : row.dayNumber % 2 === 0
                          ? 'bg-stone-50/60'
                          : 'bg-white'
                      } hover:bg-emerald-100/50`}
                    >
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-stone-900 font-bold">
                        {toMyanmarDigits(row.dayNumber)}
                      </td>
                      <td className={`py-1.5 px-2 text-center border border-stone-200 font-myanmar ${
                        row.isJumuah ? 'text-emerald-800 font-bold' : 'text-stone-700'
                      }`}>
                        {row.weekdayMm.replace(' (ဂျုမုအဟ်)', '')}
                        {row.isJumuah && <span className="block text-[9px] text-emerald-700 font-bold">ဂျုမုအဟ်</span>}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-stone-600 font-semibold">
                        {toMyanmarDigits(row.hijriDay)}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-rose-700 font-bold bg-rose-50/30">
                        {row.sahoorEnd}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-emerald-900 font-semibold">
                        {row.fajr}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-amber-800 font-medium bg-amber-50/20">
                        {row.sunrise}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-stone-600">
                        {row.zawaal}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-emerald-900 font-semibold">
                        {row.dhuhr}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-emerald-900 font-semibold">
                        {row.asr}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-amber-900 font-bold bg-amber-50/40">
                        {row.maghrib}
                      </td>
                      <td className="py-1.5 px-2 text-center border border-stone-200 text-emerald-900 font-semibold">
                        {row.isha}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Timetable Footer & Fiqh Note */}
            <div className="mt-4 pt-3 border-t border-stone-300 text-[10px] text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="font-myanmar space-y-0.5 text-center sm:text-left">
                <p className="font-semibold text-emerald-950">
                  «إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا»
                </p>
                <p>
                  “အမှန်စင်စစ် နမားဇ်ဝတ်ပြုခြင်းသည် မုအ်မင်န် သက်ဝင်ယုံကြည်သူများအပေါ် သတ်မှတ်ထားသော အချိန်များ၌ ပြဋ္ဌာန်းထားသော တာဝန်တစ်ရပ် ဖြစ်သည်။” (စူရဟ် အန်-နိစာအ်၊ ၁၀၃)
                </p>
              </div>
              <div className="text-right shrink-0 text-stone-500 font-medium">
                <div>Al_HikMah Digital Library</div>
                <div className="text-[9px]">Printed on {new Date().toLocaleDateString('en-GB')}</div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="bg-stone-200 dark:bg-stone-800 border-t border-stone-300 dark:border-stone-700 px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-600 dark:text-stone-300 gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-myanmar">
            <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              PNG သို့မဟုတ် PDF ခလုတ်ကို နှိပ်၍ ဖုန်းထဲသို့ ဒေါင်းလုဒ်ရယူနိုင်ပြီး မိမိဒေသ ဗလီ/နေအိမ်များတွင် ပရင့်ထုတ် ကပ်ထားနိုင်ပါသည်။
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-300 hover:bg-stone-400 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 rounded-lg font-bold transition-colors cursor-pointer"
          >
            ပိတ်မည်
          </button>
        </div>

      </div>
    </div>
  );
};
