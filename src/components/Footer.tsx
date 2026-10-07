import React from 'react';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-950 dark:bg-stone-950 text-emerald-100 dark:text-stone-300 border-t border-emerald-900 dark:border-stone-800 mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs sm:text-sm">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-900 dark:bg-emerald-950 flex items-center justify-center text-amber-400 shrink-0 border border-transparent dark:border-emerald-800/60">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-base text-white block">
                  Al_HikMah (အလ်-ဟစ်က်မဟ်)
                </span>
                <span className="text-[11px] text-emerald-300 dark:text-emerald-400">
                  အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်နှင့် ပေါ်တယ်လ်
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-300 dark:text-stone-400 max-w-md leading-relaxed font-myanmar">
              မြန်မာမွတ်စလင်မ် ညီနောင်အပေါင်းတို့အတွက် ကုရ်အာန်၊ ဟဒီးဆ်တော်များ၊ ဖိကာဟ် ဓမ္မသတ်စာအုပ်များ၊ ဖသ်ဝါမေးမြန်းမှုများနှင့် နမားဇ်အချိန်ဇယားတို့ကို အခမဲ့ လေ့လာဖတ်ရှုနိုင်ရန် စီစဉ်တင်ဆက်ထားသော ဒစ်ဂျစ်တယ် ပလက်ဖောင်း ဖြစ်ပါသည်။
            </p>
            <div className="text-[11px] text-amber-400 font-arabic">
              رَّبِّ زِدْنِي عِلْمًا — "အို ကျွန်ုပ်၏ အရှင်သခင်၊ ကျွန်ုပ်အား ပညာဉာဏ် တိုးပွားစေတော်မူပါ"
            </div>
          </div>

          {/* Key Islamic Sections */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">အဓိက ကဏ္ဍများ</h4>
            <ul className="space-y-1.5 text-xs text-stone-300 dark:text-stone-400">
              <li>ကျမ်းမြတ်ကုရ်အာန်နှင့် တဖ်စီရ်</li>
              <li>တရားဒေသနာနှင့် ကုရ်အာန် အသံဖိုင်များ</li>
              <li>ဟဒီးဆ်တော် ၄၀ မြန်မာပြန်</li>
              <li>နမားဇ်နှင့် ဝူဇူ လက်စွဲ</li>
              <li>ဇကားသ် (Zakat) တွက်ချက်စနစ်</li>
              <li>ဖသ်ဝါဌာန အမေးအဖြေများ</li>
            </ul>
          </div>

          {/* Prayer Time Cities & Regions */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">တိုင်းနှင့်ပြည်နယ် (၁၄) ခုလုံး နမားဇ်အချိန်</h4>
            <div className="text-xs text-stone-300 dark:text-stone-400 space-y-1">
              <div><strong>ပြည်ထောင်စုနယ်မြေ:</strong> နေပြည်တော်</div>
              <div><strong>တိုင်း ၇ ခု:</strong> ရန်ကုန်၊ မန္တလေး၊ ဧရာဝတီ၊ ပဲခူး၊ မကွေး၊ စစ်ကိုင်း၊ တနင်္သာရီ</div>
              <div><strong>ပြည်နယ် ၇ ခု:</strong> ကချင်၊ ကယား၊ ကရင်၊ ချင်း၊ မွန်၊ ရခိုင်၊ ရှမ်း</div>
              <div className="text-[11px] text-amber-400 pt-0.5">
                ဟိဂျ်ရီပြက္ခဒိန် (السلامي تاریخ) နှင့် အစ္စလာမ့် နက္ခတ္တစနစ်
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-emerald-900/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div>
            © ၂၀၂၆ အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် ပေါ်တယ်လ်။ စာအုပ်များနှင့် သာသနာ့အသိပညာများကို အခမဲ့ မျှဝေခံစားနိုင်ပါသည်။
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>အစ္စလာမ် ဓမ္မသတ်မူဘောင်များနှင့်အညီ စီစဉ်ထားပါသည်</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};
