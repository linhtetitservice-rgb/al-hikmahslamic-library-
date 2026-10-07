import React, { useState } from 'react';
import { 
  Calculator, 
  Coins, 
  HelpCircle, 
  Info, 
  RotateCcw, 
  CheckCircle2, 
  Copy, 
  Printer, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign 
} from 'lucide-react';
import { toMyanmarDigits } from '../utils/hijriCalendar';

export const ZakatCalculator: React.FC = () => {
  // Currency & Nisab configuration
  const [currency, setCurrency] = useState<'MMK' | 'USD'>('MMK');
  const [nisabStandard, setNisabStandard] = useState<'silver' | 'gold'>('silver');

  // Rates in MMK (editable)
  // 1 Gram Silver ~ 3,500 MMK | 1 Gram Gold ~ 280,000 MMK
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(3500);
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(280000);

  // Asset inputs
  const [cashInHand, setCashInHand] = useState<string>('');
  const [bankBalance, setBankBalance] = useState<string>('');
  const [goldValue, setGoldValue] = useState<string>('');
  const [silverValue, setSilverValue] = useState<string>('');
  const [businessInventory, setBusinessInventory] = useState<string>('');
  const [investments, setInvestments] = useState<string>('');
  const [receivableDebts, setReceivableDebts] = useState<string>('');

  // Deductions
  const [debtsOwed, setDebtsOwed] = useState<string>('');
  const [immediateBills, setImmediateBills] = useState<string>('');

  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Numerical parsing helper
  const parseVal = (val: string) => Math.max(0, parseFloat(val.replace(/,/g, '')) || 0);

  // Nisab threshold calculations
  // Silver Nisab: 52.5 Tola = 612.36 Grams
  // Gold Nisab: 7.5 Tola = 87.48 Grams
  const silverNisabThreshold = 612.36 * silverPricePerGram;
  const goldNisabThreshold = 87.48 * goldPricePerGram;
  const activeNisabThreshold = nisabStandard === 'silver' ? silverNisabThreshold : goldNisabThreshold;

  // Assets sum
  const totalAssets =
    parseVal(cashInHand) +
    parseVal(bankBalance) +
    parseVal(goldValue) +
    parseVal(silverValue) +
    parseVal(businessInventory) +
    parseVal(investments) +
    parseVal(receivableDebts);

  // Deductions sum
  const totalDeductions = parseVal(debtsOwed) + parseVal(immediateBills);

  // Net Zakatable Wealth
  const netZakatableWealth = Math.max(0, totalAssets - totalDeductions);

  // Check if meets Nisab
  const isEligibleForZakat = netZakatableWealth >= activeNisabThreshold;

  // 2.5% Zakat Due (40th part)
  const zakatDue = isEligibleForZakat ? netZakatableWealth * 0.025 : 0;

  const handleReset = () => {
    setCashInHand('');
    setBankBalance('');
    setGoldValue('');
    setSilverValue('');
    setBusinessInventory('');
    setInvestments('');
    setReceivableDebts('');
    setDebtsOwed('');
    setImmediateBills('');
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const handleCopySummary = () => {
    const text = `=== ဇကားသ် (Zakat) တွက်ချက်မှု အနှစ်ချုပ် ===
ငွေကြေးစနစ်: ${currency}
နိဆွာဗ်စံနှုန်း: ${nisabStandard === 'silver' ? 'ငွေ ၅၂.၅ တိုလာ (၆၁၂.၃၆ ဂရမ်)' : 'ရွှေ ၇.၅ တိုလာ (၈၇.၄၈ ဂရမ်)'}
နိဆွာဗ် သတ်မှတ်တန်ဖိုး: ${formatMoney(activeNisabThreshold)} ${currency}

စုစုပေါင်း စည်းစိမ်ပိုင်ဆိုင်မှု: ${formatMoney(totalAssets)} ${currency}
နှုတ်ပယ်ရမည့် အကြွေး/စရိတ်: ${formatMoney(totalDeductions)} ${currency}
အသားတင် ဇကားသ်အကျုံးဝင်ငွေ: ${formatMoney(netZakatableWealth)} ${currency}
နိဆွာဗ် ပြည့်မီမှု: ${isEligibleForZakat ? 'ပြည့်မီပါသည် (ဝါဂျိဗ်)' : 'နိဆွာဗ် မပြည့်မီသေးပါ'}

ပေးဆောင်ရမည့် ဇကားသ် (၂.၅%): ${formatMoney(zakatDue)} ${currency}
အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် ပေါ်တယ်လ်မှ တွက်ချက်ထားပါသည်။`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
    }
  };

  return (
    <section className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-arabic text-base">زكاة المال</span>
            <span className="text-emerald-500">·</span>
            <span>အစ္စလာမ်သာသနာ၏ တတိယမြောက် မဏ္ဍိုင်</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            တရားဝင် ဇကားသ် (Zakat) တွက်ချက်ခြင်း စနစ်
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            ရွှေ၊ ငွေ၊ စီးပွားရေးကုန်ပစ္စည်းနှင့် ဘဏ်အပ်ငွေများအပေါ် နိဆွာဗ် (Nisab) သတ်မှတ်ချက်အရ ၄၀ ပုံ ၁ ပုံ (၂.၅%) ကို တိကျစွာ တွက်ချက်ပေးပါသည်။
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs (7 Columns) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Nisab & Currency Setup Box */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>နိဆွာဗ် (Nisab) စံနှုန်း သတ်မှတ်ချက်</span>
              </h3>
              <button
                onClick={handleReset}
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ပြန်လည်စတင်ရန်</span>
              </button>
            </div>

            {/* Nisab Standard Toggle */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setNisabStandard('silver')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  nisabStandard === 'silver'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold'
                    : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="font-bold">ငွေ နိဆွာဗ် (အကြံပြုချက်)</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">၅၂.၅ တိုလာ (၆၁၂.၃၆ ဂရမ်)</div>
                <div className="text-xs font-mono text-emerald-800 dark:text-emerald-400 mt-1">
                  {formatMoney(silverNisabThreshold)} {currency}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNisabStandard('gold')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  nisabStandard === 'gold'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold'
                    : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="font-bold">ရွှေ နိဆွာဗ်</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">၇.၅ တိုလာ (၈၇.၄၈ ဂရမ်)</div>
                <div className="text-xs font-mono text-emerald-800 dark:text-emerald-400 mt-1">
                  {formatMoney(goldNisabThreshold)} {currency}
                </div>
              </button>
            </div>

            {/* Editable price per gram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-300 mb-1">
                  ငွေ ၁ ဂရမ် ဈေးနှုန်း ({currency})
                </label>
                <input
                  type="number"
                  value={silverPricePerGram}
                  onChange={(e) => setSilverPricePerGram(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-600 dark:text-stone-300 mb-1">
                  ရွှေ ၁ ဂရမ် ဈေးနှုန်း ({currency})
                </label>
                <input
                  type="number"
                  value={goldPricePerGram}
                  onChange={(e) => setGoldPricePerGram(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Section 1: Zakatable Assets */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center justify-between">
              <span>(က) ဇကားသ်အကျုံးဝင်သော စည်းစိမ်ဥစ္စာများ</span>
              <span className="text-xs font-mono text-emerald-800 dark:text-emerald-400 font-bold">
                {formatMoney(totalAssets)} {currency}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  လက်ဝယ်ရှိ ငွေသား (Cash in Hand)
                </label>
                <input
                  type="text"
                  value={cashInHand}
                  onChange={(e) => setCashInHand(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  ဘဏ်အပ်ငွေနှင့် စုဆောင်းငွေ (Bank Accounts)
                </label>
                <input
                  type="text"
                  value={bankBalance}
                  onChange={(e) => setBankBalance(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  ရွှေထည်နှင့် ရွှေတုံးတန်ဖိုး (Gold Value)
                </label>
                <input
                  type="text"
                  value={goldValue}
                  onChange={(e) => setGoldValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  ငွေထည်နှင့် ငွေဒင်္ဂါးတန်ဖိုး (Silver Value)
                </label>
                <input
                  type="text"
                  value={silverValue}
                  onChange={(e) => setSilverValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  ရောင်းချရန် ကုန်ပစ္စည်းလက်ကျန် (Business Stock)
                </label>
                <input
                  type="text"
                  value={businessInventory}
                  onChange={(e) => setBusinessInventory(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  စတော့ရှယ်ယာနှင့် ရင်းနှီးမြှုပ်နှံမှု (Investments)
                </label>
                <input
                  type="text"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  သူတစ်ပါးထံမှ ပြန်ရရန်သေချာသော အကြွေးများ (Receivables)
                </label>
                <input
                  type="text"
                  value={receivableDebts}
                  onChange={(e) => setReceivableDebts(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Section 2: Liabilities and Deductions */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center justify-between">
              <span>(ခ) နှုတ်ပယ်ရမည့် ပေးရန်တာဝန်နှင့် အကြွေးများ</span>
              <span className="text-xs font-mono text-rose-700 dark:text-rose-400 font-bold">
                -{formatMoney(totalDeductions)} {currency}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  ချက်ချင်းဆပ်ရန်ရှိသော အကြွေးများ (Debts Owed)
                </label>
                <input
                  type="text"
                  value={debtsOwed}
                  onChange={(e) => setDebtsOwed(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  ပေးရန်ကျန် လစာနှင့် ကုန်ကျစရိတ်များ (Bills Due)
                </label>
                <input
                  type="text"
                  value={immediateBills}
                  onChange={(e) => setImmediateBills(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Summary & Verdict (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Result Card */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5 sticky top-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
                <span>ဇကားသ် တွက်ချက်မှု အဖြေ</span>
              </h3>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex justify-between">
                <span>စုစုပေါင်း ပိုင်ဆိုင်မှု:</span>
                <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{formatMoney(totalAssets)} {currency}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>နှုတ်ပယ်ရမည့် အကြွေး/စရိတ်:</span>
                <span className="font-mono font-medium">-{formatMoney(totalDeductions)} {currency}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-100 dark:border-stone-800 font-semibold text-stone-900 dark:text-stone-100">
                <span>အသားတင် ဇကားသ်အကျုံးဝင်ငွေ:</span>
                <span className="font-mono text-emerald-800 dark:text-emerald-400">{formatMoney(netZakatableWealth)} {currency}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>နိဆွာဗ် စံနှုန်း သတ်မှတ်ချက်:</span>
                <span className="font-mono">{formatMoney(activeNisabThreshold)} {currency}</span>
              </div>
            </div>

            {/* Nisab Status Banner */}
            <div className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs leading-relaxed ${
              isEligibleForZakat
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
            }`}>
              {isEligibleForZakat ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">နိဆွာဗ် သတ်မှတ်ချက် ပြည့်မီပါသည်</strong>
                    <span>သင်၏ စည်းစိမ်သည် နိဆွာဗ် ပြည့်မီပြီး ၁ နှစ် ပြည့်ပါက ဇကားသ် ပေးဆောင်ရန် သာသနာအရ တာဝန် (ဖရဇ်/ဝါဂျိဗ်) ကျရောက်ပါသည်။</span>
                  </div>
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">နိဆွာဗ် မပြည့်မီသေးပါ</strong>
                    <span>အသားတင် စည်းစိမ်သည် သတ်မှတ် နိဆွာဗ်အောက် လျော့နည်းနေသဖြင့် ဇကားသ် ပေးဆောင်ရန် တာဝန် မကျရောက်သေးပါ။ သို့သော် ဆဒကဟ် (စေတနာအလှူ) ပြုခွင့်ရှိပါသည်။</span>
                  </div>
                </>
              )}
            </div>

            {/* Final 2.5% Payable Amount Display */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white text-center space-y-1">
              <div className="text-xs text-emerald-200 font-medium">
                ပေးဆောင်ရမည့် ဇကားသ် ပမာဏ (၂.၅% / ၄၀ ပုံ ၁ ပုံ)
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
                {formatMoney(zakatDue)} <span className="text-sm font-normal text-emerald-100">{currency}</span>
              </div>
              <div className="text-[11px] text-emerald-300/80">
                (အသားတင်ငွေ × ၀.၀၂၅)
              </div>
            </div>

            {/* Actions: Copy and Print */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleCopySummary}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedReceipt ? 'ကူးယူပြီးပါပြီ' : 'အနှစ်ချုပ် ကူးယူရန်'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>ပရင့်ထုတ်ရန်</span>
              </button>
            </div>

          </div>

          {/* Educational Guide: 8 Masarif (ဇကားသ်ခံယူထိုက်သူ ၈ မျိုး) */}
          <div className="bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3 text-xs text-stone-700 dark:text-stone-300">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>ဇကားသ် ခံယူထိုက်သူ (၈) မျိုး (ဆူရဟ် အသ်-သောင်ဗဟ် အာယသ် ၆၀)</span>
            </h4>
            <ol className="space-y-1.5 list-decimal pl-4 leading-relaxed text-stone-600 dark:text-stone-300">
              <li><strong>ဖုကရာ (ဆင်းရဲသားများ)</strong> - ဝင်ငွေမလုံလောက်သူများ။</li>
              <li><strong>မဆာကီးန် (အလွန်နွမ်းပါးသူများ)</strong> - လုံးဝစားဝတ်နေရေး အခက်အခဲရှိသူများ။</li>
              <li><strong>အာမီလီးန် (ဇကားသ် ကောက်ခံစီမံသူများ)</strong> - တရားဝင်တာဝန်ပေးခံရသူများ။</li>
              <li><strong>မုအလ္လဖသုလ် ကုလူဗ်</strong> - အစ္စလာမ်သို့ စိတ်နှလုံး ညွတ်လာသူများ။</li>
              <li><strong>ရိကားဗ်</strong> - ကျွန်ဘဝနှင့် အကျဉ်းအကျပ်မှ လွတ်မြောက်စေရန်။</li>
              <li><strong>ဂွာရိမီးန် (အကြွေးနွံနစ်နေသူများ)</strong> - အကြွေးမဆပ်နိုင်သူများ။</li>
              <li><strong>ဖီစဗီလီလ္လာဟ်</strong> - အလ္လာဟ်သာသနာ့လမ်းတော်၌ ကြိုးပမ်းသူများ။</li>
              <li><strong>ဣဗ်နုစ် စဗီးလ် (ခရီးသွားဒုက္ခသည်)</strong> - ခရီးလမ်း၌ ငွေပြတ်သွားသူများ။</li>
            </ol>
          </div>

        </div>

      </div>

    </section>
  );
};
