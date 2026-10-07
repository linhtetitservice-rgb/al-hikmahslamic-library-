import React, { useState } from 'react';
import { X, Send, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AskFatwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskFatwaModal: React.FC<AskFatwaModalProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, openAuthModal, submitQuestion } = useAuth();

  const [category, setCategory] = useState('namaz');
  const [questionText, setQuestionText] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('ဖသ်ဝါမေးခွန်း ပေးပို့ရန် Login ဝင်ရောက်ပါ');
      return;
    }
    if (!questionText.trim()) {
      setError('မေးခွန်း အပြည့်အစုံ ရေးသားပေးပါ');
      return;
    }

    submitQuestion(category, questionText.trim());
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setQuestionText('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors">
        
        {/* Header */}
        <div className="bg-emerald-900 dark:bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg">သာသနာ့ဓမ္မသတ် (ဖသ်ဝါ) မေးမြန်းရန်</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="font-bold text-lg text-stone-900 dark:text-stone-100">မေးခွန်း ပေးပို့ပြီးပါပြီ</h4>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              ဓမ္မသတ်ပညာရှင်များ စိစစ်ပြီး သင့်အဖွဲ့ဝင်စာမျက်နှာတွင် အကြောင်းပြန်ကြားပေးပါမည်။
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                မေးခွန်းကဏ္ဍ ရွေးချယ်ပါ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
              >
                <option value="namaz">နမားဇ် ဝတ်ပြုမှုဆိုင်ရာ</option>
                <option value="fasting">ရမ်ဇာန်ဥပုသ်ဆိုင်ရာ</option>
                <option value="zakat">ဇကားသ်ဆိုင်ရာ</option>
                <option value="finance">စီးပွားရေးနှင့် အရောင်းအဝယ်</option>
                <option value="family">အိမ်ထောင်ရေးနှင့် မိသားစု</option>
                <option value="general">အထွေထွေ အစ္စလာမ့်ဓမ္မသတ်</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                မေးမြန်းလိုသော အကြောင်းအရာ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="ရှင်းလင်းစွာ မေးမြန်းလိုသော သာသနာ့ဓမ္မသတ် အကြောင်းအရာကို ရေးသားပါ..."
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500"
              />
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
              💡 မေးခွန်းများကို တရားဝင် ဒါရုလ်အိဖ်တာဟ် အသိအမှတ်ပြု မုဖ်သီ ဆရာတော်ကြီးများက ကုရ်အာန်၊ ဟဒီးဆ်နှင့် ဟနဖီ/ရှာဖိအီ ဓမ္မသတ်ကျမ်းများအရ စိစစ်ဖြေကြားပေးမည် ဖြစ်ပါသည်။
            </div>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg font-medium cursor-pointer"
              >
                ပိတ်မည်
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>မေးခွန်း ပေးပို့မည်</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
