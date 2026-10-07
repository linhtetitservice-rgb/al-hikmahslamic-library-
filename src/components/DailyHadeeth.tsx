import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  BookOpen, 
  Quote, 
  Share2, 
  Bookmark,
  Heart
} from 'lucide-react';
import { DailyHadeethItem } from '../types';
import { getRandomDailyHadeeth, initializeDailyHadeeths } from '../services/dbService';
import { INITIAL_HADEETHS } from '../data/initialHadeeths';
import { DailyHadeethShareModal } from './DailyHadeethShareModal';

interface DailyHadeethProps {
  className?: string;
}

export const DailyHadeeth: React.FC<DailyHadeethProps> = ({ className = '' }) => {
  // Synchronously initialize with verified authentic Daily Hadeeth so it displays instantly on first frame
  const [item, setItem] = useState<DailyHadeethItem>(() => {
    const todayIndex = new Date().getDate() % INITIAL_HADEETHS.length;
    return INITIAL_HADEETHS[todayIndex] || INITIAL_HADEETHS[0];
  });
  const [allPool, setAllPool] = useState<DailyHadeethItem[]>(INITIAL_HADEETHS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Background sync with Firestore database
  useEffect(() => {
    let isMounted = true;
    async function syncFirestore() {
      try {
        const list = await initializeDailyHadeeths();
        if (isMounted && list && list.length > 0) {
          setAllPool(list);
          const todayIndex = new Date().getDate() % list.length;
          setItem(list[todayIndex] || list[0]);
        }
      } catch (err) {
        console.warn('Daily Hadeeth Firestore sync note:', err);
      }
    }
    syncFirestore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Shuffle / Pull random Hadeeth from the database
  const handleShuffle = async () => {
    setIsShuffling(true);
    try {
      const pool = allPool.length > 0 ? allPool : INITIAL_HADEETHS;
      if (pool.length > 1) {
        let nextItem: DailyHadeethItem;
        do {
          const rand = Math.floor(Math.random() * pool.length);
          nextItem = pool[rand];
        } while (item && nextItem.id === item.id && pool.length > 1);
        setItem(nextItem);
      } else {
        const randItem = await getRandomDailyHadeeth();
        setItem(randItem || INITIAL_HADEETHS[0]);
      }
      setIsSaved(false);
    } finally {
      setTimeout(() => setIsShuffling(false), 300);
    }
  };

  // Copy Hadeeth with reference to clipboard
  const handleCopy = () => {
    if (!item) return;
    const textToCopy = `« ${item.arabicText} »\n\n"${item.translationMm}"\n\nကျမ်းကိုး: ${item.reference}${item.narratorOrSurah ? ` (${item.narratorOrSurah})` : ''}\nအကြောင်းအရာ: #${item.themeMm}\n— Al_HikMah ဒစ်ဂျစ်တယ် စာကြည့်တိုက်`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !item) {
    return (
      <div className={`bg-emerald-950/70 backdrop-blur-xs border border-emerald-700/60 rounded-2xl p-6 text-white animate-pulse ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-32 bg-emerald-800 rounded"></div>
          <div className="h-4 w-16 bg-emerald-800 rounded"></div>
        </div>
        <div className="h-10 bg-emerald-900/60 rounded mb-4"></div>
        <div className="h-12 bg-emerald-900/60 rounded mb-3"></div>
        <div className="h-4 w-40 bg-emerald-800 rounded"></div>
      </div>
    );
  }

  const isVerse = item.type === 'quran';

  return (
    <div 
      className={`relative bg-gradient-to-br from-emerald-950/95 via-teal-950/90 to-stone-900/95 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl text-white overflow-hidden transition-all duration-300 hover:border-amber-400/50 ${className}`}
    >
      {/* Decorative background Islamic geometry motif watermark */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-amber-500/5 blur-2xl pointer-events-none"></div>
      <div className="absolute right-4 top-4 text-emerald-800/20 pointer-events-none">
        <Quote className="w-24 h-24 rotate-180" />
      </div>

      {/* Header bar: Badge, Theme & Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-emerald-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>နေ့စဉ် စိတ်ခွန်အား</span>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 font-medium">
            {isVerse ? '📖 ကုရ်အာန်အာယသ်တော်' : '📜 ဟဒီးဆ်တော်မြတ်'}
          </span>

          <span className="text-[11px] text-amber-200/90 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/70 hidden sm:inline">
            #{item.themeMm}
          </span>
        </div>

        {/* Interactive Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Share Button (Image preview & text) */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            title="ဟဒီးဆ်တော် မျှဝေရန် (စာသားကူးယူခြင်း သို့မဟုတ် ပုံရိပ်ထုတ်ယူခြင်း)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold hidden sm:inline">မျှဝေမည်</span>
          </button>

          {/* Shuffle / Random from Database */}
          <button
            onClick={handleShuffle}
            disabled={isShuffling}
            title="အခြား ဟဒီးဆ်တော်/အာယသ်တော် အသစ်လဲလှယ်ရန်"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-emerald-700/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">အသစ်လဲလှယ်</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            title="စာသားနှင့် ကျမ်းကိုး ကူးယူရန်"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              copied 
                ? 'bg-emerald-700 border-emerald-500 text-white' 
                : 'bg-emerald-900/70 hover:bg-emerald-800 border-emerald-700/80 text-stone-200 hover:text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Favorite heart */}
          <button
            onClick={() => setIsSaved(!isSaved)}
            title={isSaved ? 'မှတ်သားပြီး' : 'စိတ်ကြိုက်မှတ်သားမည်'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-rose-950/80 border-rose-700 text-rose-400'
                : 'bg-emerald-900/70 hover:bg-emerald-800 border-emerald-700/80 text-stone-300 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Body: Arabic Calligraphy & Myanmar Translation */}
      <div className="relative z-10 py-4 space-y-3">
        {/* Arabic Calligraphy with quotation symbols */}
        <div 
          dir="rtl" 
          className="text-right sm:text-center font-arabic text-lg sm:text-xl lg:text-2xl text-amber-300 font-bold leading-relaxed tracking-wide drop-shadow-sm select-all"
        >
          {isVerse ? `﴿ ${item.arabicText} ﴾` : `« ${item.arabicText} »`}
        </div>

        {/* Myanmar Translation */}
        <p className="text-xs sm:text-sm text-stone-100 leading-relaxed font-normal bg-black/20 p-3 sm:p-3.5 rounded-xl border border-emerald-800/40 select-all">
          "{item.translationMm}"
        </p>

        {/* Reflection / Lesson Note */}
        {item.explanationMm && (
          <div className="text-[11px] sm:text-xs text-emerald-200/90 flex items-start gap-2 bg-emerald-900/40 p-2.5 rounded-lg border border-emerald-800/50">
            <span className="text-amber-400 font-bold shrink-0">💡 သင်ခန်းစာ:</span>
            <span>{item.explanationMm}</span>
          </div>
        )}
      </div>

      {/* Footer bar: Source Reference & Narrator */}
      <div className="relative z-10 pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-300">
          <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-200">{item.reference}</span>
          {item.narratorOrSurah && (
            <>
              <span className="text-emerald-500">·</span>
              <span className="text-stone-400 text-[11px]">{item.narratorOrSurah}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {copied && (
            <span className="text-[11px] text-amber-300 flex items-center gap-1 animate-fade-in font-medium">
              <Check className="w-3 h-3" />
              ကူးယူပြီးပါပြီ
            </span>
          )}

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold underline cursor-pointer"
          >
            <Share2 className="w-3 h-3" />
            <span>ပုံရိပ်/စာသား မျှဝေမည်</span>
          </button>
        </div>
      </div>

      {/* Share & Image Card Generation Modal */}
      <DailyHadeethShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        item={item}
      />
    </div>
  );
};
