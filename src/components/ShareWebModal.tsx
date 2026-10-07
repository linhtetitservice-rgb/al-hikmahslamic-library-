import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Smartphone, 
  Users, 
  QrCode, 
  Send, 
  ExternalLink,
  BookOpen,
  Headphones
} from 'lucide-react';

interface ShareWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUrl?: string;
}

export const ShareWebModal: React.FC<ShareWebModalProps> = ({
  isOpen,
  onClose,
  sharedUrl = 'https://ais-pre-qsoluk6opvhpow2jn6jefw-40259916469.asia-southeast1.run.app',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(true);

  if (!isOpen) return null;

  const appTitle = 'Al_HikMah (الحكمة) - မြန်မာမွတ်စလင်မ် အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်နှင့် တရားတော်များ';
  const shareMessage = `📖 ${appTitle}\n\nကုရ်အာန်၊ ဟဒီးဆ်၊ ဖိကာဟ် စာအုပ်များနှင့် အသံဖိုင် တရားဒေသနာတော်များကို မည်သူမဆို အခမဲ့ လွတ်လပ်စွာ ဖတ်ရှုနားဆင်နိုင်ပါသည်။\n\nတိုက်ရိုက်လင့်ခ်:\n${sharedUrl}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sharedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyFullMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appTitle,
          text: 'မြန်မာမွတ်စလင်မ် အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်နှင့် တရားတော်များကို အခမဲ့ လွတ်လပ်စွာ ဖတ်ရှုနားဆင်ပါ',
          url: sharedUrl,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopyLink();
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sharedUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 dark:border-stone-800 animate-in fade-in-50 duration-200 my-8 transition-colors">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                ဝဘ်ဆိုက်လင့်ခ် မျှဝေရန် (Share Library)
              </h2>
              <p className="text-xs text-emerald-300">
                မိတ်ဆွေများ၊ မိသားစုများနှင့် လူအများဆီသို့ လွတ်လပ်စွာ မျှဝေပေးပို့နိုင်ပါသည်
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Multi-user concurrency announcement badge */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
            <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="block font-bold text-emerald-900 dark:text-emerald-300 mb-0.5">
                လူအများအပြား တစ်ပြိုင်နက် သုံးစွဲနိုင်ပါသည်
              </strong>
              ဤဝဘ်ဆိုက်ကို မည်သူမဆို ဖုန်း၊ တက်ဘလက်၊ ကွန်ပျူတာတို့ဖြင့် အကောင့်ဖွင့်ရန် မလိုဘဲ အခမဲ့ လွတ်လပ်စွာ တစ်ပြိုင်နက်တည်း ဝင်ရောက်အသုံးပြုနိုင်ပါသည်။
            </div>
          </div>

          {/* Web URL display with Copy Button */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
              <span>တိုက်ရိုက်လင့်ခ် (Official Public URL):</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-normal">လူတိုင်း ဖွင့်ကြည့်နိုင်ပါသည်</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-800 dark:text-stone-200 truncate select-all">
                {sharedUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                    <span>ကူးယူပြီး</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>လင့်ခ်ကူးမည်</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick social share buttons */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              လူမှုကွန်ရက်များသို့ တိုက်ရိုက် ပေးပို့မျှဝေရန်:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharedUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium transition-colors"
              >
                <span>Facebook</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(sharedUrl)}&text=${encodeURIComponent(appTitle)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium transition-colors"
              >
                <span>Telegram</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium transition-colors"
              >
                <span>WhatsApp</span>
              </a>

              {/* Viber */}
              <a
                href={`viber://forward?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium transition-colors"
              >
                <span>Viber</span>
              </a>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-28 h-28 bg-white p-1 rounded-lg border border-stone-300 dark:border-stone-600 shadow-xs flex items-center justify-center shrink-0">
              <img 
                src={qrImageUrl} 
                alt="Al_HikMah QR Code" 
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs font-bold text-stone-900 dark:text-stone-100">
                <QrCode className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>ဖုန်းကင်မရာဖြင့် QR Code စကင်န်ဖတ်နိုင်သည်</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                စမတ်ဖုန်း ကင်မရာဖြင့် ဤ QR ကုဒ်ကို စကင်န်ဖတ်ရုံဖြင့် အပလီကေးရှင်းကို ချက်ချင်း ဖွင့်လှစ်ဖတ်ရှုနိုင်ပါသည်။
              </p>
              <button
                onClick={handleCopyFullMessage}
                className="inline-flex items-center gap-1 text-xs text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 font-semibold underline pt-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>မိတ်ဆက်စာသားနှင့်တကွ အားလုံးကူးယူမည်</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 dark:bg-stone-900 px-5 py-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-500 dark:text-stone-400">Al_HikMah ဒစ်ဂျစ်တယ် စာကြည့်တိုက်</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>
    </div>
  );
};
