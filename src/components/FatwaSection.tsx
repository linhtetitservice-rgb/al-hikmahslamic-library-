import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Send, 
  Share2, 
  Filter
} from 'lucide-react';
import { Fatwa } from '../types';
import { INITIAL_FATWAS } from '../data/initialFatwas';
import { AskFatwaModal } from './AskFatwaModal';
import { useAuth } from '../context/AuthContext';
import { toMyanmarDigits } from '../utils/hijriCalendar';

export const FatwaSection: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [fatwas] = useState<Fatwa[]>(INITIAL_FATWAS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFatwaId, setExpandedFatwaId] = useState<string | null>('fatwa-1');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'အားလုံး' },
    { id: 'namaz', label: 'နမားဇ်' },
    { id: 'fasting', label: 'ရမ်ဇာန်ဥပုသ်' },
    { id: 'zakat', label: 'ဇကားသ်' },
    { id: 'finance', label: 'အရောင်းအဝယ်' },
    { id: 'family', label: 'အိမ်ထောင်ရေး' },
  ];

  const filteredFatwas = fatwas.filter((f) => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.dalilMm.toLowerCase().includes(q) ||
      f.scholarName.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleShare = (f: Fatwa) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${f.question}\n\nအဖြေ- ${f.answer}\n\n${f.dalilMm}`);
      setCopiedId(f.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section className="space-y-6">
      
      {/* Section Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>ဒါရုလ်အိဖ်တာဟ် အသိအမှတ်ပြု ဓမ္မသတ်ဌာန (Darul Ifta)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            အစ္စလာမ့် ဓမ္မသတ် အမေးအဖြေများနှင့် ဖသ်ဝါပေါင်းချုပ်
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            နေ့စဉ်လူနေမှုဘဝ၊ ဝတ်ပြုမှုနှင့် စီးပွားရေးဆိုင်ရာ ပြဿနာများအတွက် ကုရ်အာန်နှင့် ဟဒီးဆ်တော်များကို အခြေခံထားသော ခိုင်လုံသည့် သာသနာ့ဓမ္မသတ် အဖြေများ။
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg text-xs sm:text-sm font-bold shadow transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ဓမ္မသတ် မေးခွန်းအသစ် မေးမြန်းရန်</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ဖသ်ဝါ အကြောင်းအရာ၊ သာသနာ့ပြဿနာ ရှာဖွေရန်..."
              className="w-full pl-9 pr-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Interactive Category Segmented Tabs (Clean buttons per constitution) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-xs text-stone-500 dark:text-stone-400">
          တွေ့ရှိသော ဖသ်ဝါ အရေအတွက်: {toMyanmarDigits(filteredFatwas.length)} ခု
        </div>
      </div>

      {/* Fatwa Accordion / List */}
      <div className="space-y-4">
        {filteredFatwas.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
            <HelpCircle className="w-10 h-10 text-stone-400 mx-auto" />
            <h4 className="font-bold text-stone-700 dark:text-stone-200 text-sm">ရှာဖွေမှုနှင့် ကိုက်ညီသော ဖသ်ဝါ မရှိသေးပါ</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              အခြား သော့ချက်စကားလုံးဖြင့် ရှာဖွေပါ သို့မဟုတ် မေးခွန်းအသစ် မေးမြန်းနိုင်ပါသည်။
            </p>
          </div>
        ) : (
          filteredFatwas.map((f) => {
            const isExpanded = expandedFatwaId === f.id;
            return (
              <div
                key={f.id}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all overflow-hidden"
              >
                {/* Header (Question Row) */}
                <div
                  onClick={() => setExpandedFatwaId(isExpanded ? null : f.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-stone-50/60 dark:hover:bg-stone-800/60"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                      <span className="font-semibold text-emerald-800 dark:text-emerald-400">{f.categoryMm}</span>
                      <span aria-hidden="true">·</span>
                      <span>{f.askedDate}</span>
                      {f.questionerName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>မေးမြန်းသူ: {f.questionerName}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug">
                      မေးခွန်း- {f.question}
                    </h3>
                  </div>

                  <div className="shrink-0 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded Answer Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-stone-100 dark:border-stone-800 space-y-4 text-xs sm:text-sm">
                    {/* Verdict Box */}
                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/80 rounded-lg space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span>ဓမ္မသတ် ဆုံးဖြတ်ချက် (ဖသ်ဝါ) -</span>
                      </div>
                      <p className="text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line font-myanmar">
                        {f.answer}
                      </p>
                    </div>

                    {/* Dalil / References (ကျမ်းကိုး) */}
                    <div className="p-3 bg-stone-50 dark:bg-stone-800/70 rounded-lg border border-stone-200/80 dark:border-stone-700 space-y-1 text-stone-700 dark:text-stone-300 text-xs">
                      <strong className="block text-[11px] text-stone-900 dark:text-stone-200 uppercase font-bold tracking-wider">
                        ခိုင်လုံသော အထောက်အထားနှင့် ကျမ်းကိုးများ (Dalil)
                      </strong>
                      <p className="font-myanmar leading-relaxed">
                        {f.dalilMm}
                      </p>
                    </div>

                    {/* Scholar credentials & Share */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>ဖြေကြားသူ: <strong className="text-stone-800 dark:text-stone-200">{f.scholarName}</strong> ({f.institution})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleShare(f)}
                          className="flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-400 font-medium transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{copiedId === f.id ? 'ကူးယူပြီးပါပြီ' : 'ကူးယူ / မျှဝေရန်'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AskFatwaModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </section>
  );
};
