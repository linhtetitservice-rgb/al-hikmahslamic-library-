import React, { useState } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Printer, 
  Plus, 
  Trash2, 
  Heart, 
  Scale, 
  Share2, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { QurbaniShareholder } from '../types';
import { toMyanmarDigits } from '../utils/hijriCalendar';

export const QurbaniCalculator: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'calculator' | 'eligibility' | 'rules'>('calculator');

  // Currency
  const [currency, setCurrency] = useState<'MMK' | 'USD'>('MMK');

  // Animal Costs & Quantities
  const [goatCount, setGoatCount] = useState<number>(0);
  const [goatPrice, setGoatPrice] = useState<number>(350000); // 3.5 Lakhs MMK per goat

  const [cowCount, setCowCount] = useState<number>(1);
  const [cowPrice, setCowPrice] = useState<number>(2100000); // 21 Lakhs MMK per cow (3 Lakhs per share)
  const [userCowShares, setUserCowShares] = useState<number>(1); // out of 7 shares

  // Operational fees (butcher, transport, fodder)
  const [butcherFee, setButcherFee] = useState<number>(50000);
  const [extraFee, setExtraFee] = useState<number>(20000);

  // Meat yield estimation (in Viss / ပိဿာ - 1 Viss ≈ 1.63 kg)
  const [meatUnit, setMeatUnit] = useState<'viss' | 'kg'>('viss');
  const [estimatedMeatPerCow, setEstimatedMeatPerCow] = useState<number>(70); // 70 viss
  const [estimatedMeatPerGoat, setEstimatedMeatPerGoat] = useState<number>(12); // 12 viss

  // Share partners list
  const [shareholders, setShareholders] = useState<QurbaniShareholder[]>([
    { id: 'sh-1', name: 'ကိုကျော်သူရ (မိမိကိုယ်တိုင်)', shareCount: 1, niyyahFor: 'မိမိကိုယ်တိုင်၏ ဝါဂျိဗ် ကုရ်ဘာနီ', paidAmount: 300000 },
    { id: 'sh-2', name: 'ဒေါ်အေးအေး (မိခင်)', shareCount: 1, niyyahFor: 'မိခင်ကြီးအတွက် သဝါဗ် (ကုသိုလ်)', paidAmount: 300000 },
  ]);

  const [newShareholderName, setNewShareholderName] = useState('');
  const [newNiyyah, setNewNiyyah] = useState('မိမိကိုယ်တိုင်အတွက်');

  // Eligibility checking inputs
  const [extraWealth, setExtraWealth] = useState<number>(1500000);
  const [silverNisabThreshold, setSilverNisabThreshold] = useState<number>(2140000); // 612.36g * ~3500
  const [isEligibleResult, setIsEligibleResult] = useState<boolean | null>(null);

  const [copiedSummary, setCopiedSummary] = useState(false);

  // Calculations
  const cowSharePrice = Math.round(cowPrice / 7);
  const totalGoatCost = goatCount * goatPrice;
  const totalCowCost = cowCount * cowPrice;
  const userCowSharesCost = userCowShares * cowSharePrice;
  
  // Total overall cost based on selection
  const totalCost = (cowCount > 0 ? totalCowCost : userCowSharesCost) + totalGoatCost + butcherFee + extraFee;

  // Estimated Meat Calculations
  const totalMeatYield = (cowCount * estimatedMeatPerCow) + (goatCount * estimatedMeatPerGoat);
  const oneThirdMeat = (totalMeatYield / 3).toFixed(1);

  const handleAddShareholder = () => {
    if (!newShareholderName.trim()) return;
    const currentTotalShares = shareholders.reduce((acc, curr) => acc + curr.shareCount, 0);
    if (currentTotalShares >= 7) {
      alert('နွားတစ်ကောင်တွင် အများဆုံး ၇ စုသာ ပါဝင်ခွင့်ရှိပါသည်');
      return;
    }
    const newSh: QurbaniShareholder = {
      id: 'sh-' + Date.now(),
      name: newShareholderName.trim(),
      shareCount: 1,
      niyyahFor: newNiyyah,
      paidAmount: cowSharePrice,
    };
    setShareholders([...shareholders, newSh]);
    setNewShareholderName('');
  };

  const handleRemoveShareholder = (id: string) => {
    setShareholders(shareholders.filter((s) => s.id !== id));
  };

  const handleCheckEligibility = () => {
    setIsEligibleResult(extraWealth >= silverNisabThreshold);
  };

  const handleCopySummary = () => {
    const text = `=== ကုရ်ဘာနီ (Qurbani) တွက်ချက်မှု အနှစ်ချုပ် ===
နွား/ကျွဲ အကောင်ရေ: ${cowCount} ကောင် (${cowCount * 7} စု)
ဆိတ်/သိုး အကောင်ရေ: ${goatCount} ကောင်
တစ်စုပျမ်းမျှတန်ဖိုး: ${cowSharePrice.toLocaleString()} ${currency}
သားသတ်နှင့် စီမံစရိတ်: ${(butcherFee + extraFee).toLocaleString()} ${currency}
စုစုပေါင်း ကုန်ကျငွေ: ${totalCost.toLocaleString()} ${currency}

ခန့်မှန်း အသားထွက်ရှိမှု: ${totalMeatYield} ${meatUnit === 'viss' ? 'ပိဿာ' : 'kg'}
၃ ပုံ ၁ ပုံ (မိသားစု စားသုံးရန်): ${oneThirdMeat} ${meatUnit === 'viss' ? 'ပိဿာ' : 'kg'}
၃ ပုံ ၁ ပုံ (ဆွေမျိုး/မိတ်ဆွေများအား ဝေငှရန်): ${oneThirdMeat} ${meatUnit === 'viss' ? 'ပိဿာ' : 'kg'}
၃ ပုံ ၁ ပုံ (ဆင်းရဲနွမ်းပါးသူများအား လှူဒါန်းရန်): ${oneThirdMeat} ${meatUnit === 'viss' ? 'ပိဿာ' : 'kg'}

အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် ပေါ်တယ်လ်မှ တွက်ချက်ထားပါသည်။`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  return (
    <section className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="font-arabic text-base">الأضحية / قرباني</span>
            <span className="text-emerald-500">·</span>
            <span>တမန်တော် အိဗ်ရာဟီးမ် (အလိုင်ဟိစ္စလာမ်) ၏ စွန့်လွှတ်မှု သွန်းနသ်တော်</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ကုရ်ဘာနီ (Qurbani) တွက်ချက်စနစ်နှင့် သာသနာ့ဓမ္မသတ် လမ်းညွှန်
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            နွား ၇ စုခွဲဝေမှု၊ ဆိတ်/သိုး ကုန်ကျစရိတ်၊ အသား ၃ ပုံ ၁ ပုံ ခွဲဝေခြင်းနှင့် နိဆွာဗ် ပြည့်မီမှုတို့ကို အစ္စလာမ် ဓမ္မသတ်နှင့်အညီ ပြည့်စုံစွာ တွက်ချက်နိုင်ပါသည်။
          </p>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3 text-xs sm:text-sm">
        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'calculator'
              ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>အစုရှယ်ယာနှင့် ကုန်ကျစရိတ် တွက်စက်</span>
        </button>

        <button
          onClick={() => setActiveSubTab('eligibility')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'eligibility'
              ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>ဝါဂျိဗ်ဖြစ်မှု စစ်ဆေးခြင်း (Nisab)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'rules'
              ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>တိရစ္ဆာန်ရွေးချယ်မှုနှင့် ဓမ္မသတ်များ</span>
        </button>
      </div>

      {/* Tab 1: Comprehensive Calculator */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form (7 Columns) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Box 1: Cow / Buffalo (နွား/ကျွဲ - ၇ စု) */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2">
                    <span>နွား / ကျွဲ (၁ ကောင်လျှင် ၇ စု)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    လူ ၁ ဦးမှ ၇ ဦးအထိ စုပေါင်းပါဝင်နိုင်ပါသည်
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/80 px-2 py-1 rounded">
                  ၁ စု = {cowSharePrice.toLocaleString()} {currency}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    နွား အကောင်ရေ
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cowCount}
                    onChange={(e) => setCowCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
                    စုစုပေါင်း အစုရှယ်ယာ: {toMyanmarDigits(cowCount * 7)} စု
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    နွား ၁ ကောင် ပျမ်းမျှပေါက်စျေး ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={cowPrice}
                    onChange={(e) => setCowPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Sheep / Goat (ဆိတ်/သိုး - ၁ ကောင် ၁ စု) */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                    ဆိတ် / သိုး (၁ ကောင်လျှင် ၁ စုသာ)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    အစုခွဲဝေ၍မရပါ၊ လူတစ်ဦးအတွက်သာ ကုရ်ဘာနီမြောက်ပါသည်
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/80 px-2 py-1 rounded">
                  {totalGoatCost.toLocaleString()} {currency}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    ဆိတ် / သိုး အကောင်ရေ
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={goatCount}
                    onChange={(e) => setGoatCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    ဆိတ် ၁ ကောင် ပျမ်းမျှစျေးနှုန်း ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={goatPrice}
                    onChange={(e) => setGoatPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Box 3: Operational Fees & Meat Settings */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base border-b border-stone-100 dark:border-stone-800 pb-3">
                သားသတ်ခ၊ စီမံစရိတ်နှင့် ခန့်မှန်းအသားထွက်နှုန်း
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    သားသတ်ခ (Butcher Fee)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={butcherFee}
                    onChange={(e) => setButcherFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    သယ်ယူပို့ဆောင်ခနှင့် အထွေထွေ
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={extraFee}
                    onChange={(e) => setExtraFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    နွား ၁ ကောင် ခန့်မှန်းအသားထွက် ({meatUnit === 'viss' ? 'ပိဿာ' : 'ကီလို'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedMeatPerCow}
                    onChange={(e) => setEstimatedMeatPerCow(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    ဆိတ် ၁ ကောင် ခန့်မှန်းအသားထွက် ({meatUnit === 'viss' ? 'ပိဿာ' : 'ကီလို'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedMeatPerGoat}
                    onChange={(e) => setEstimatedMeatPerGoat(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Box 4: Shareholders Table & Niyyah Management */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                  နွားအစုဝင်များ စာရင်းနှင့် နိယသ် (၇ စု စာရင်း)
                </h3>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                  ထည့်သွင်းပြီး: {shareholders.length} / ၇ စု
                </span>
              </div>

              {/* Add Shareholder Form */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="အစုဝင် အမည် (ဥပမာ- ဦးလှမောင်)"
                  value={newShareholderName}
                  onChange={(e) => setNewShareholderName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <select
                  value={newNiyyah}
                  onChange={(e) => setNewNiyyah(e.target.value)}
                  className="px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="မိမိကိုယ်တိုင်အတွက် (ဝါဂျိဗ်)">မိမိကိုယ်တိုင်အတွက် (ဝါဂျိဗ်)</option>
                  <option value="မိဘအတွက် ကုသိုလ်">မိဘအတွက် ကုသိုလ်</option>
                  <option value="ဇနီး/ခင်ပွန်းအတွက်">ဇနီး/ခင်ပွန်းအတွက်</option>
                  <option value="သားသမီးအတွက်">သားသမီးအတွက်</option>
                  <option value="ကွယ်လွန်သူအတွက် သဝါဗ်">ကွယ်လွန်သူအတွက် သဝါဗ်</option>
                  <option value="တမန်တော်မြတ်(ဆွ)အတွက် သဝါဗ်">တမန်တော်မြတ်(ဆွ)အတွက် သဝါဗ်</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddShareholder}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ထည့်မည်</span>
                </button>
              </div>

              {/* Shareholders List Table */}
              <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden text-xs">
                {shareholders.map((sh, idx) => (
                  <div key={sh.id} className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors">
                    <div className="space-y-0.5">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{toMyanmarDigits(idx + 1)}. {sh.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-medium border border-emerald-200 dark:border-emerald-800">
                          {sh.shareCount} စု
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        နိယသ်: {sh.niyyahFor} · ကျသင့်ငွေ {cowSharePrice.toLocaleString()} {currency}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveShareholder(sh.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="စာရင်းမှ ဖျက်မည်"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Summary Card (5 Columns) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-5 sticky top-4">
              <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
                  <span>ကုရ်ဘာနီ ကုန်ကျစရိတ်နှင့် ဝေခြမ်းမှု အနှစ်ချုပ်</span>
                </h3>
              </div>

              {/* Costs Breakdown */}
              <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex justify-between">
                  <span>နွား {toMyanmarDigits(cowCount)} ကောင် ({toMyanmarDigits(cowCount * 7)} စု):</span>
                  <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{totalCowCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>ဆိတ်/သိုး {toMyanmarDigits(goatCount)} ကောင်:</span>
                  <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{totalGoatCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>သားသတ်ခနှင့် စီမံစရိတ်:</span>
                  <span className="font-mono font-medium text-stone-900 dark:text-stone-100">{(butcherFee + extraFee).toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-bold">
                  <span>စုစုပေါင်း ကုန်ကျစရိတ်:</span>
                  <span className="font-mono text-emerald-800 dark:text-emerald-400 text-sm">{totalCost.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span>နွားတစ်စုလျှင် ပျမ်းမျှကျသင့်ငွေ:</span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">{cowSharePrice.toLocaleString()} {currency}</span>
                </div>
              </div>

              {/* Meat 1/3 Distribution Card */}
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-950 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>ခန့်မှန်း အသားထွက်ရှိမှု</span>
                  </span>
                  <span className="font-mono text-sm text-emerald-900 dark:text-emerald-300">
                    {totalMeatYield} {meatUnit === 'viss' ? 'ပိဿာ' : 'kg'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px] text-stone-700 dark:text-stone-300">
                  <div className="flex justify-between bg-white/80 dark:bg-stone-900/80 p-2 rounded border border-emerald-100 dark:border-emerald-900/60">
                    <span>၁။ မိသားစုအတွက် (၃ ပုံ ၁ ပုံ):</span>
                    <strong className="font-mono text-emerald-900 dark:text-emerald-300">{oneThirdMeat} {meatUnit === 'viss' ? 'ပိဿာ' : 'kg'}</strong>
                  </div>
                  <div className="flex justify-between bg-white/80 dark:bg-stone-900/80 p-2 rounded border border-emerald-100 dark:border-emerald-900/60">
                    <span>၂။ ဆွေမျိုး/မိတ်ဆွေများအား လက်ဆောင် (၃ ပုံ ၁ ပုံ):</span>
                    <strong className="font-mono text-emerald-900 dark:text-emerald-300">{oneThirdMeat} {meatUnit === 'viss' ? 'ပိဿာ' : 'kg'}</strong>
                  </div>
                  <div className="flex justify-between bg-white/80 dark:bg-stone-900/80 p-2 rounded border border-emerald-100 dark:border-emerald-900/60">
                    <span>၃။ ဆင်းရဲနွမ်းပါးသူများအား ဒါနပြုရန် (၃ ပုံ ၁ ပုံ):</span>
                    <strong className="font-mono text-emerald-900 dark:text-emerald-300">{oneThirdMeat} {meatUnit === 'viss' ? 'ပိဿာ' : 'kg'}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleCopySummary}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSummary ? 'ကူးယူပြီးပါပြီ' : 'စာရင်း ကူးယူရန်'}</span>
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
          </div>

        </div>
      )}

      {/* Tab 2: Eligibility Check */}
      {activeSubTab === 'eligibility' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              ကုရ်ဘာနီ (ဝါဂျိဗ်) ဖြစ်ခြင်း ရှိ/မရှိ စစ်ဆေးခြင်း
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              ဇုလ်ဟိဂျ်ဂျဟ် ၁၀၊ ၁၁၊ ၁၂ (အိဒ်နေ့နှင့် တရှ်ရီးက်နေ့များ) တွင် အခြေခံ မရှိမဖြစ်လိုအပ်သော အသုံးစရိတ်များထက် ပိုလျှံသော စည်းစိမ်တန်ဖိုးသည် ငွေ ၅၂.၅ တိုလာ (၆၁၂.၃၆ ဂရမ် တန်ဖိုး) ပြည့်မီပါက ကုရ်ဘာနီ ပေးလှူရန် ဝါဂျိဗ် (မဖြစ်မနေ တာဝန်) ကျရောက်ပါသည်။
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                အခြေခံစရိတ်များထက် ပိုလျှံသော လက်ဝယ်ငွေနှင့် စည်းစိမ်တန်ဖိုး ({currency})
              </label>
              <input
                type="number"
                value={extraWealth}
                onChange={(e) => setExtraWealth(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                လက်ရှိ ငွေနိဆွာဗ် (၆၁၂.၃၆ ဂရမ်) တန်ဖိုး သတ်မှတ်ချက် ({currency})
              </label>
              <input
                type="number"
                value={silverNisabThreshold}
                onChange={(e) => setSilverNisabThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <button
              onClick={handleCheckEligibility}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              ဝါဂျိဗ် ဖြစ်မှု စစ်ဆေးမည်
            </button>

            {isEligibleResult !== null && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isEligibleResult 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
              }`}>
                {isEligibleResult ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="font-bold text-sm block">သင်၌ ကုရ်ဘာနီ ပေးလှူရန် ဝါဂျိဗ် (တာဝန်) ကျရောက်ပါသည်</strong>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        သင်၏ ပိုလျှံစည်းစိမ်သည် နိဆွာဗ် ပြည့်မီသဖြင့် အိဒ်နေ့တွင် မိမိအတွက် ဆိတ် ၁ ကောင် သို့မဟုတ် နွား ၁ စု မဖြစ်မနေ ကုရ်ဘာနီ ပြုလုပ်ပေးရပါမည်။ (ဇကားသ်ကဲ့သို့ ၁ နှစ်ပြည့်ရန် မလိုပါ)
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Info className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="font-bold text-sm block">ကုရ်ဘာနီ ဝါဂျိဗ် မကျရောက်သေးပါ</strong>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        နိဆွာဗ် မပြည့်မီသေးသဖြင့် ကုရ်ဘာနီ ပေးဆောင်ရန် မဖြစ်မနေ တာဝန်မရှိသော်လည်း မိမိစိတ်စေတနာဖြင့် နဖိလ် (ကုသိုလ်ပြု) ကုရ်ဘာနီ ပေးလှူခွင့် ရှိပါသည်။
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Sharia Rules, Duas, and Takbeer */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          
          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Age requirements */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>၁။ သားကောင်၏ အသက်အရွယ် သတ်မှတ်ချက်များ</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300 leading-relaxed list-disc pl-5">
                <li><strong>သိုး / ဆိတ်</strong>: အနည်းဆုံး အသက် (၁) နှစ် ပြည့်ရပါမည်။ (သို့သော် သိုးငယ်သည် ၆ လကျော်၍ ၁ နှစ်သားသိုးများကြားတွင် ထွားကြိုင်းမှု မကွဲပြားပါက ပိုင်သည်)</li>
                <li><strong>နွား / ကျွဲ</strong>: အနည်းဆုံး အသက် (၂) နှစ် ပြည့်ရပါမည်။ (ရှေ့သွား ၂ ချောင်း လဲပြီးဖြစ်ရမည်)</li>
                <li><strong>ကုလားအုတ်</strong>: အနည်းဆုံး အသက် (၅) နှစ် ပြည့်ရပါမည်။</li>
              </ul>
            </div>

            {/* Defects to avoid */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>၂။ ကုရ်ဘာနီ မပိုင်စေသော ချို့ယွင်းချက် (အိုက်ဗ်) များ</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300 leading-relaxed list-disc pl-5">
                <li>မျက်စိတစ်ဖက် သို့မဟုတ် နှစ်ဖက်စလုံး ကွယ်နေခြင်း။</li>
                <li>သားသတ်မည့်နေရာသို့ ကိုယ်တိုင်မလျှောက်နိုင်လောက်အောင် ခြေထောက် အလွန်ဆွံ့အခြင်း။</li>
                <li>ရိုးတွင်းခြင်ဆီပင် မကျန်တော့အောင် အလွန်အမင်း ပိန်လှီချည့်နဲ့နေခြင်း။</li>
                <li>နားရွက် သို့မဟုတ် အမြီး ၃ ပုံ ၁ ပုံထက်ပို၍ ပြတ်နေခြင်း။</li>
                <li>သွားအားလုံး ကျွတ်နေခြင်း (မြက်မစားနိုင်တော့ခြင်း)။</li>
              </ul>
            </div>

          </div>

          {/* Dua for Slaughter & Takbeer Tashreeq */}
          <div className="bg-gradient-to-br from-emerald-950 to-teal-950 text-white rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-amber-300">
                သားသတ်စဉ် ဖတ်ရွတ်ရမည့် ဒိုအာ (Dua for Slaughter)
              </h4>
              <p className="font-arabic text-xl sm:text-2xl text-white leading-loose">
                بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ، اللَّهُمَّ هَٰذَا مِنْكَ وَلَكَ، فَتَقَبَّلْ مِنِّي
              </p>
              <p className="text-xs text-stone-300">
                မြန်မာပြန်- "အလ္လာဟ်အရှင်မြတ်၏ နာမတော်ဖြင့် အစပြုပါ၏။ အလ္လာဟ်အရှင်မြတ်သည် အကြီးကျယ်ဆုံး ဖြစ်တော်မူ၏။ အို-အလ္လာဟ်၊ ဤကုရ်ဘာနီသည် အရှင်မြတ်ထံတော်မှ ကျေးဇူးတော်ဖြစ်ပြီး အရှင်မြတ်အတွက်သာ ဖြစ်ပါသည်၊ ကျွန်ုပ်ထံမှ လက်ခံတော်မူပါ။"
              </p>
            </div>

            <div className="pt-4 border-t border-emerald-800/80 space-y-2">
              <h4 className="text-sm font-bold text-amber-300">
                တရှ်ရီးက် သက္ကဗီရ် (Takbeer Tashreeq - ဇုလ်ဟိဂျ်ဂျဟ် ၉ ရက် ဖဂျရ်မှ ၁၃ ရက် အဆွရ်အထိ)
              </h4>
              <p className="font-arabic text-lg sm:text-xl text-emerald-100">
                اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّာ اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ
              </p>
              <p className="text-xs text-stone-300">
                ဖရဇ်နမားဇ်တိုင်း အပြီးတွင် အမျိုးသားရော အမျိုးသမီးပါ (အမျိုးသားများ ကျယ်လောင်စွာ) တစ်ကြိမ်စီ မဖြစ်မနေ ရွတ်ဆိုရမည့် ဝါဂျိဗ် သက္ကဗီရ် ဖြစ်ပါသည်။
              </p>
            </div>
          </div>

        </div>
      )}

    </section>
  );
};
