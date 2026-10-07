import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'hero' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'hero',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA on the home screen, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Render variant styles
  if (isInstallable) {
    if (variant === 'navbar') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors shadow-xs cursor-pointer whitespace-nowrap ${className}`}
          title="ဖုန်း သို့မဟုတ် ကွန်ပျူတာ ပင်မမျက်နှာပြင်တွင် App အဖြစ် သွင်းယူရန်"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>App သွင်းမည်</span>
        </button>
      );
    }

    // Default Hero Variant
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-lg text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-300 ${className}`}
        title="ဖုန်းတွင် အင်တာနက်မရှိဘဲ သုံးနိုင်သော App အဖြစ် သွင်းယူရန်"
      >
        <Smartphone className="w-4 h-4 text-emerald-950 shrink-0" />
        <span>ဖုန်းတွင် App အဖြစ် သွင်းယူမည် (PWA Install)</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        {variant === 'navbar' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border border-emerald-700 transition-colors cursor-pointer ${className}`}
            title="iPhone / iPad တွင် App သွင်းနည်း ကြည့်ရန်"
          >
            <Apple className="w-3.5 h-3.5 shrink-0" />
            <span>iOS App သွင်းမည်</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-emerald-600 rounded-lg text-xs sm:text-sm font-bold shadow transition-colors flex items-center gap-2 cursor-pointer ${className}`}
          >
            <Apple className="w-4 h-4 shrink-0 text-amber-400" />
            <span>iPhone / iPad တွင် App အဖြစ် သွင်းယူမည်</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-900 dark:bg-emerald-950 text-amber-400 flex items-center justify-center font-bold">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">iPhone / iPad တွင် App သွင်းနည်း</h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">Safari Browser ဖြင့် အလွယ်တကူ သွင်းယူနိုင်ပါသည်</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-900 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">၁</span>
                  <div>
                    Safari ၏ အောက်ခြေရှိ <strong>Share (မျှဝေရန်)</strong> အိုင်ကွန်လေးကို နှိပ်ပါ။
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-900 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">၂</span>
                  <div>
                    အောက်သို့ အနည်းငယ်ဆွဲချပြီး <strong>"Add to Home Screen" (ပင်မမျက်နှာပြင်သို့ ထည့်မည်)</strong> ကို ရွေးချယ်ပါ။
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-900 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">၃</span>
                  <div>
                    ညာဘက်အပေါ်ရှိ <strong>"Add"</strong> ကို နှိပ်လိုက်ပါက သင့်ဖုန်းတွင် App အိုင်ကွန် ပေါ်လာပြီး အင်တာနက်မရှိဘဲ အော့ဖ်လိုင်းပါ သုံးနိုင်ပါပြီ။
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-950 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                နားလည်ပါပြီ
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
