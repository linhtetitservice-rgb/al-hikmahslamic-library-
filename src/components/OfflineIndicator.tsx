import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // When back online
  if (showReconnected) {
    return (
      <aside
        aria-label="အင်တာနက် အခြေအနေ"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-800 text-white px-3.5 py-2.5 text-xs font-semibold shadow-xl border border-emerald-600 animate-bounce"
      >
        <Wifi className="w-4 h-4 text-emerald-300 shrink-0" />
        <span>အင်တာနက် ပြန်လည်ချိတ်ဆက်မိပါပြီ (Online)</span>
      </aside>
    );
  }

  // When offline
  if (!isOnline) {
    return (
      <aside
        aria-label="အင်တာနက် အခြေအနေ"
        className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between gap-3 rounded-xl bg-amber-600 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl border border-amber-400"
      >
        <div className="flex items-center gap-2.5">
          <WifiOff className="w-4 h-4 text-amber-200 shrink-0 animate-pulse" />
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>အော့ဖ်လိုင်းစနစ် (Offline Mode)</span>
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
            <div className="text-[11px] text-amber-100 font-normal mt-0.5">
              ကက်ရှ် (Cache) ပြုလုပ်ထားသော စာအုပ်များနှင့် နမားဇ်အချိန်များကို အော့ဖ်လိုင်း ဆက်လက်ဖတ်ရှုနိုင်ပါသည်
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};
